<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\VideoProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function myReport(): JsonResponse
    {
        $studentId = (int) Auth::id();

        // Attendance
        $attendance = AttendanceRecord::where('student_id', $studentId)->get();
        $totalClasses  = $attendance->count();
        $presentCount  = $attendance->where('status', 'present')->count();
        $absentCount   = $attendance->where('status', 'absent')->count();
        $lateCount     = $attendance->where('status', 'late')->count();
        $attendanceRate = $totalClasses > 0
            ? round(($presentCount / $totalClasses) * 100, 1)
            : null;

        // Exams
        $exams = ExamSubmission::where('student_id', $studentId)
            ->with('exam:id,title')
            ->latest('submitted_at')
            ->get();

        $gradedExams = $exams->whereNotNull('score');
        $examAvg = $gradedExams->isNotEmpty()
            ? round($gradedExams->avg(fn ($e) => $e->total_points > 0 ? ($e->score / $e->total_points) * 100 : 0), 1)
            : null;

        // Homework
        $homework = HomeworkSubmission::where('student_id', $studentId)
            ->with('homework:id,title')
            ->latest('submitted_at')
            ->get();

        $gradedHw  = $homework->whereNotNull('grade');
        $hwAvg     = $gradedHw->isNotEmpty() ? round($gradedHw->avg('grade'), 1) : null;
        $lateCount_hw = $homework->where('status', 'late')->count();

        // Course progress (videos completed)
        $completedVideos = VideoProgress::where('student_id', $studentId)
            ->where('completed', true)
            ->count();

        return response()->json([
            'data' => [
                'attendance' => [
                    'total'   => $totalClasses,
                    'present' => $presentCount,
                    'absent'  => $absentCount,
                    'late'    => $lateCount,
                    'rate'    => $attendanceRate,
                ],
                'exams' => [
                    'count'   => $exams->count(),
                    'average' => $examAvg,
                    'recent'  => $gradedExams->take(5)->map(fn ($e) => [
                        'title'        => $e->exam?->title,
                        'score'        => $e->score,
                        'total_points' => $e->total_points,
                        'pct'          => $e->total_points > 0
                            ? round(($e->score / $e->total_points) * 100, 1) : 0,
                        'submitted_at' => $e->submitted_at,
                    ])->values(),
                ],
                'homework' => [
                    'submitted'  => $homework->count(),
                    'late'       => $lateCount_hw,
                    'average'    => $hwAvg,
                    'recent'     => $gradedHw->take(5)->map(fn ($h) => [
                        'title'        => $h->homework?->title,
                        'grade'        => $h->grade,
                        'submitted_at' => $h->submitted_at,
                    ])->values(),
                ],
                'progress' => [
                    'videos_completed' => $completedVideos,
                ],
            ],
        ]);
    }
}
