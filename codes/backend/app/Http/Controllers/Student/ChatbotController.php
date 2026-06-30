<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbot) {}

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'           => 'required|string|max:1000',
            'history'           => 'nullable|array|max:10',
            'history.*.role'    => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:2000',
        ]);

        $user      = Auth::user();
        $countryId = (int) $user->country_id;

        $context = $this->buildStudentContext($user->id);

        $reply = $this->chatbot->chat(
            $countryId,
            $validated['message'],
            $validated['history'] ?? [],
            'student',
            $context,
        );

        return response()->json(['reply' => $reply]);
    }

    private function buildStudentContext(int $studentId): array
    {
        try {
            $attendance = Attendance::where('student_id', $studentId)->get();
            $attendanceTotal   = $attendance->count();
            $attendancePresent = $attendance->where('status', 'present')->count();

            $examResults = ExamSubmission::with('exam:id,title,total_marks')
                ->where('student_id', $studentId)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($s) => [
                    'title' => $s->exam->title ?? 'اختبار',
                    'score' => $s->score ?? 0,
                    'total' => $s->exam->total_marks ?? 100,
                ])
                ->toArray();

            $hwTotal     = HomeworkSubmission::where('student_id', $studentId)->count();
            $hwSubmitted = HomeworkSubmission::where('student_id', $studentId)->whereNotNull('submitted_at')->count();

            return [
                'student_name'       => Auth::user()->name,
                'attendance_total'   => $attendanceTotal,
                'attendance_present' => $attendancePresent,
                'exam_results'       => $examResults,
                'homework_stats'     => ['total' => $hwTotal, 'submitted' => $hwSubmitted],
                'points'             => Auth::user()->points ?? 0,
            ];
        } catch (\Throwable) {
            return ['student_name' => Auth::user()->name ?? ''];
        }
    }
}
