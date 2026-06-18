<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    public function __construct(private readonly NotificationService $notif) {}

    public function index(): JsonResponse
    {
        $teacherId = (int) Auth::id();

        $exams = Exam::where('teacher_id', $teacherId)
            ->with('course:id,title')
            ->withCount('questions')
            ->withCount('submissions')
            ->latest()
            ->get();

        return response()->json([
            'data' => $exams->map(fn ($e) => $this->format($e)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $teacherId = (int) Auth::id();

        $data = $request->validate([
            'course_id'   => 'required|integer|exists:courses,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'duration'    => 'nullable|integer|min:1',
            'starts_at'   => 'nullable|date',
            'questions'   => 'required|array|min:1',
            'questions.*.question'   => 'required|string',
            'questions.*.type'       => 'required|in:mcq,true_false,short',
            'questions.*.options'    => 'nullable|array',
            'questions.*.answer'     => 'nullable|string',
            'questions.*.points'     => 'nullable|integer|min:1',
        ]);

        $exam = Exam::create([
            'course_id'   => $data['course_id'],
            'teacher_id'  => $teacherId,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'duration'    => $data['duration'] ?? null,
            'starts_at'   => $data['starts_at'] ?? null,
            'status'      => 'pending',
        ]);

        foreach ($data['questions'] as $i => $q) {
            $exam->questions()->create([
                'question'   => $q['question'],
                'type'       => $q['type'],
                'options'    => $q['options'] ?? null,
                'answer'     => $q['answer'] ?? null,
                'points'     => $q['points'] ?? 1,
                'sort_order' => $i,
            ]);
        }

        return response()->json(['message' => 'تم إنشاء الامتحان — بانتظار الموافقة', 'data' => $this->format($exam->load('course:id,title'))], 201);
    }

    public function show(Exam $exam): JsonResponse
    {
        $this->authorizeExam($exam);

        $exam->load(['questions', 'course:id,title']);

        return response()->json([
            'data'      => $this->format($exam),
            'questions' => $exam->questions,
        ]);
    }

    public function submissions(Exam $exam): JsonResponse
    {
        $this->authorizeExam($exam);

        $subs = $exam->submissions()->with('student:id,name')->latest()->get();

        return response()->json([
            'data' => $subs->map(fn ($s) => [
                'id'           => $s->id,
                'student'      => ['id' => $s->student->id, 'name' => $s->student->name],
                'score'        => $s->score,
                'total_points' => $s->total_points,
                'submitted_at' => $s->submitted_at?->toISOString(),
                'graded_at'    => $s->graded_at?->toISOString(),
            ]),
        ]);
    }

    public function grade(Request $request, Exam $exam, ExamSubmission $submission): JsonResponse
    {
        $this->authorizeExam($exam);
        abort_if($submission->exam_id !== $exam->id, 404);

        $data = $request->validate(['score' => 'required|numeric|min:0']);

        $submission->update([
            'score'     => $data['score'],
            'graded_at' => now(),
        ]);

        $submission->refresh();
        $this->notif->notifyExamResult($submission);

        return response()->json(['message' => 'تم تصحيح الامتحان']);
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $this->authorizeExam($exam);
        $exam->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    private function authorizeExam(Exam $exam): void
    {
        abort_if((int) $exam->teacher_id !== (int) Auth::id(), 403);
    }

    private function format(Exam $e): array
    {
        return [
            'id'               => $e->id,
            'title'            => $e->title,
            'description'      => $e->description,
            'status'           => $e->status,
            'duration'         => $e->duration,
            'starts_at'        => $e->starts_at?->toISOString(),
            'course'           => $e->course ? ['id' => $e->course->id, 'title' => $e->course->title] : null,
            'questions_count'  => $e->questions_count ?? 0,
            'submissions_count'=> $e->submissions_count ?? 0,
            'created_at'       => $e->created_at?->toISOString(),
        ];
    }
}
