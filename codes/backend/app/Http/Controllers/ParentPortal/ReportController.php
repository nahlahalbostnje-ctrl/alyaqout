<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\User;
use App\Models\VideoProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function childReport(int $studentId): JsonResponse
    {
        $parent = Auth::user();

        $student = User::where('id', $studentId)
            ->where('parent_id', $parent->id)
            ->firstOrFail();

        // Attendance
        $attendance = AttendanceRecord::where('student_id', $studentId)->get();
        $total     = $attendance->count();
        $present   = $attendance->where('status', 'present')->count();
        $absent    = $attendance->where('status', 'absent')->count();
        $late      = $attendance->where('status', 'late')->count();

        // Exams
        $exams      = ExamSubmission::where('student_id', $studentId)
            ->with('exam:id,title')->latest('submitted_at')->get();
        $graded     = $exams->whereNotNull('score');
        $examAvg    = $graded->isNotEmpty()
            ? round($graded->avg(fn ($e) => $e->total_points > 0 ? ($e->score / $e->total_points) * 100 : 0), 1)
            : null;

        // Homework
        $homework   = HomeworkSubmission::where('student_id', $studentId)
            ->with('homework:id,title')->latest('submitted_at')->get();
        $hwGraded   = $homework->whereNotNull('grade');
        $hwAvg      = $hwGraded->isNotEmpty() ? round($hwGraded->avg('grade'), 1) : null;

        // Progress
        $completedVideos = VideoProgress::where('student_id', $studentId)->where('completed', true)->count();

        return response()->json([
            'data' => [
                'student' => ['id' => $student->id, 'name' => $student->name, 'phone' => $student->phone],
                'attendance' => [
                    'total'   => $total,
                    'present' => $present,
                    'absent'  => $absent,
                    'late'    => $late,
                    'rate'    => $total > 0 ? round(($present / $total) * 100, 1) : null,
                ],
                'exams' => [
                    'count'   => $exams->count(),
                    'average' => $examAvg,
                    'recent'  => $graded->take(5)->map(fn ($e) => [
                        'title'  => $e->exam?->title,
                        'score'  => $e->score,
                        'total'  => $e->total_points,
                        'pct'    => $e->total_points > 0 ? round(($e->score / $e->total_points) * 100, 1) : 0,
                        'date'   => $e->submitted_at,
                    ])->values(),
                ],
                'homework' => [
                    'submitted' => $homework->count(),
                    'late'      => $homework->where('status', 'late')->count(),
                    'average'   => $hwAvg,
                ],
                'progress' => ['videos_completed' => $completedVideos],
            ],
        ]);
    }
}
