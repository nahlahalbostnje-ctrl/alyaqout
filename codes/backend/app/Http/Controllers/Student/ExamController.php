<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    public function __construct(
        private readonly NotificationService $notif,
        private readonly GamificationService $gamification,
    ) {}

    public function index(): JsonResponse
    {
        $student   = Auth::user();
        $countryId = (int) $student->country_id;

        $exams = Exam::where('status', 'approved')
            ->whereNull('archived_at')
            ->whereHas('course', fn ($q) => $q->where('country_id', $countryId)->where('is_active', true))
            ->with('course:id,title')
            ->withCount('questions')
            ->get();

        $submittedIds = ExamSubmission::where('student_id', Auth::id())
            ->pluck('submitted_at', 'exam_id');

        return response()->json([
            'data' => $exams->map(fn ($e) => array_merge($this->format($e), [
                'submitted'    => isset($submittedIds[$e->id]),
                'submitted_at' => $submittedIds[$e->id] ?? null,
            ])),
        ]);
    }

    public function show(Exam $exam): JsonResponse
    {
        abort_if($exam->status !== 'approved', 403);

        $exam->load('questions');

        // Hide answers from student
        $questions = $exam->questions->map(fn ($q) => [
            'id'         => $q->id,
            'question'   => $q->question,
            'type'       => $q->type,
            'options'    => $q->options,
            'points'     => $q->points,
            'sort_order' => $q->sort_order,
        ]);

        return response()->json([
            'id'          => $exam->id,
            'title'       => $exam->title,
            'description' => $exam->description,
            'duration'    => $exam->duration,
            'questions'   => $questions,
        ]);
    }

    public function submit(Request $request, Exam $exam): JsonResponse
    {
        $studentId = (int) Auth::id();

        abort_if($exam->status !== 'approved', 403);
        abort_if(
            ExamSubmission::where('exam_id', $exam->id)->where('student_id', $studentId)->exists(),
            422,
            'لقد سبق لك تسليم هذا الامتحان'
        );

        $data = $request->validate([
            'answers' => 'required|array',
        ]);

        $exam->load('questions');

        // Auto-grade MCQ and true_false
        $score       = 0.0;
        $totalPoints = $exam->questions->sum('points');

        foreach ($exam->questions as $q) {
            if (in_array($q->type, ['mcq', 'true_false'], true)) {
                $studentAnswer = $data['answers'][$q->id] ?? null;
                if ($studentAnswer !== null && strtolower((string) $studentAnswer) === strtolower((string) $q->answer)) {
                    $score += $q->points;
                }
            }
        }

        $submission = ExamSubmission::create([
            'exam_id'      => $exam->id,
            'student_id'   => $studentId,
            'answers'      => $data['answers'],
            'score'        => $score,
            'total_points' => $totalPoints,
            'submitted_at' => now(),
            'graded_at'    => now(),
        ]);

        // Auto-graded exams notify immediately; short-answer exams with score=0 skip until manual grading
        $hasShortAnswer = $exam->questions->contains('type', 'short');
        if (!$hasShortAnswer) {
            $this->notif->notifyExamResult($submission);
        }

        $this->gamification->award($studentId, 'submit_exam', $exam->title);

        return response()->json([
            'message'      => 'تم تسليم الامتحان',
            'score'        => $submission->score,
            'total_points' => $submission->total_points,
        ], 201);
    }

    private function format(Exam $e): array
    {
        return [
            'id'              => $e->id,
            'title'           => $e->title,
            'duration'        => $e->duration,
            'starts_at'       => $e->starts_at?->toISOString(),
            'course'          => $e->course ? ['id' => $e->course->id, 'title' => $e->course->title] : null,
            'questions_count' => $e->questions_count ?? 0,
        ];
    }
}
