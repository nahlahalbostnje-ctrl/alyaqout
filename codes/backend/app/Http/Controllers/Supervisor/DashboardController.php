<?php

declare(strict_types=1);

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\LiveClass;
use App\Models\SupervisorStudent;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(
        private readonly NotificationService $notif,
        private readonly GamificationService $gamification,
    ) {}

    public function students(): JsonResponse
    {
        $supervisorId = (int) Auth::id();

        $studentIds = SupervisorStudent::where('supervisor_id', $supervisorId)
            ->pluck('student_id');

        $students = User::whereIn('id', $studentIds)
            ->select('id', 'name', 'phone', 'grade_id', 'is_active')
            ->with('grade:id,name')
            ->get()
            ->map(fn (User $s) => [
                'id'        => $s->id,
                'name'      => $s->name,
                'phone'     => $s->phone,
                'grade'     => $s->grade?->name,
                'is_active' => $s->is_active,
            ]);

        return response()->json(['data' => $students]);
    }

    public function studentPerformance(int $studentId): JsonResponse
    {
        $supervisorId = (int) Auth::id();

        $assigned = SupervisorStudent::where('supervisor_id', $supervisorId)
            ->where('student_id', $studentId)
            ->exists();

        if (!$assigned) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = User::select('id', 'name', 'phone', 'grade_id')
            ->with('grade:id,name')
            ->findOrFail($studentId);

        // Attendance summary
        $attendance = AttendanceRecord::where('student_id', $studentId)->get();
        $totalClasses  = $attendance->count();
        $presentCount  = $attendance->where('status', 'present')->count();
        $absentCount   = $attendance->where('status', 'absent')->count();
        $lateCount     = $attendance->where('status', 'late')->count();

        // Exam performance
        $exams = ExamSubmission::where('student_id', $studentId)
            ->whereNotNull('score')
            ->get(['score', 'total_points', 'submitted_at']);

        $examAvg = $exams->isNotEmpty()
            ? round($exams->avg(fn ($e) => $e->total_points > 0 ? ($e->score / $e->total_points) * 100 : 0), 1)
            : null;

        // Homework performance
        $hw = HomeworkSubmission::where('student_id', $studentId)->get(['status', 'grade', 'submitted_at']);
        $hwSubmitted = $hw->count();
        $hwGraded    = $hw->whereNotNull('grade');
        $hwAvg       = $hwGraded->isNotEmpty() ? round($hwGraded->avg('grade'), 1) : null;

        return response()->json([
            'data' => [
                'student' => [
                    'id'    => $student->id,
                    'name'  => $student->name,
                    'phone' => $student->phone,
                    'grade' => $student->grade?->name,
                ],
                'attendance' => [
                    'total'   => $totalClasses,
                    'present' => $presentCount,
                    'absent'  => $absentCount,
                    'late'    => $lateCount,
                    'rate'    => $totalClasses > 0 ? round(($presentCount / $totalClasses) * 100, 1) : null,
                ],
                'exams' => [
                    'count'   => $exams->count(),
                    'average' => $examAvg,
                ],
                'homework' => [
                    'submitted' => $hwSubmitted,
                    'average'   => $hwAvg,
                ],
            ],
        ]);
    }

    public function assignStudent(Request $request): JsonResponse
    {
        $request->validate(['student_id' => 'required|exists:users,id']);

        $supervisorId = (int) Auth::id();

        SupervisorStudent::firstOrCreate([
            'supervisor_id' => $supervisorId,
            'student_id'    => (int) $request->student_id,
        ]);

        return response()->json(['message' => 'تم إضافة الطالب للمشرف']);
    }

    public function removeStudent(int $studentId): JsonResponse
    {
        SupervisorStudent::where('supervisor_id', (int) Auth::id())
            ->where('student_id', $studentId)
            ->delete();

        return response()->json(['message' => 'تم إزالة الطالب']);
    }

    public function recordAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'live_class_id' => 'required|exists:live_classes,id',
            'records'       => 'required|array',
            'records.*.student_id' => 'required|exists:users,id',
            'records.*.status'     => 'required|in:present,absent,late',
        ]);

        $liveClass = LiveClass::find($request->live_class_id);

        foreach ($request->records as $rec) {
            $existing = AttendanceRecord::where('student_id', $rec['student_id'])
                ->where('live_class_id', $request->live_class_id)
                ->first();

            AttendanceRecord::updateOrCreate(
                ['student_id' => $rec['student_id'], 'live_class_id' => $request->live_class_id],
                ['status' => $rec['status'], 'recorded_at' => now()]
            );

            // Award points only once per class attendance
            if ($rec['status'] === 'present' && !$existing) {
                $this->gamification->award(
                    (int) $rec['student_id'],
                    'attend_class',
                    $liveClass?->title ?? 'حصة مباشرة'
                );
            }
        }

        if ($liveClass) {
            $this->notif->notifyAbsentStudents($liveClass);
        }

        return response()->json(['message' => 'تم تسجيل الحضور']);
    }
}
