<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\LiveClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    private function teacherId(): int
    {
        return (int) auth()->user()->id;
    }

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    public function dashboard(): JsonResponse
    {
        $teacher   = auth()->user();
        $teacherId = $this->teacherId();

        $courseIds = Course::where('teacher_id', $teacherId)->pluck('id');

        $courses = Course::where('teacher_id', $teacherId)
            ->where('is_active', true)
            ->with(['category:id,name,grade_id', 'category.grade:id,name'])
            ->orderBy('sort_order')
            ->get(['id', 'category_id', 'title', 'price', 'is_free', 'thumbnail', 'is_active']);

        $upcoming = LiveClass::where('teacher_id', $teacherId)
            ->whereIn('status', ['scheduled', 'live'])
            ->with(['course:id,title'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        $totalLiveClasses = LiveClass::where('teacher_id', $teacherId)->count();
        $liveNow = LiveClass::where('teacher_id', $teacherId)->where('status', 'live')->first(['id', 'title', 'agora_channel', 'course_id']);

        // Pending homework submissions needing grading
        $pendingHomeworkSubs = HomeworkSubmission::whereHas('homework', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->whereNull('grade')
            ->count();

        // Pending exam submissions needing grading
        $pendingExamSubs = ExamSubmission::whereHas('exam', fn ($q) => $q->where('teacher_id', $teacherId))
            ->whereNull('score')
            ->count();

        // Active homeworks count
        $activeHomeworks = Homework::whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->count();

        // Active exams count
        $activeExams = Exam::where('teacher_id', $teacherId)
            ->where('status', 'approved')
            ->count();

        // Today's attendance
        $todayAttendance = AttendanceRecord::whereHas('liveClass', fn ($q) => $q->where('teacher_id', $teacherId))
            ->whereDate('recorded_at', today())
            ->count();

        // Recent 5 homework submissions for alerts
        $recentSubmissions = HomeworkSubmission::whereHas('homework', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->with(['student:id,name', 'homework:id,title'])
            ->whereNull('grade')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'student_name' => $s->student?->name ?? '—',
                'homework'     => $s->homework?->title ?? '—',
                'submitted_at' => $s->created_at?->diffForHumans() ?? '',
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'teacher'  => ['id' => $teacher->id, 'name' => $teacher->name],
                'courses'  => $courses,
                'upcoming' => $upcoming,
                'stats'    => [
                    'total_courses'         => $courses->count(),
                    'total_live_classes'    => $totalLiveClasses,
                    'pending_homework_subs' => $pendingHomeworkSubs,
                    'pending_exam_subs'     => $pendingExamSubs,
                    'active_homeworks'      => $activeHomeworks,
                    'active_exams'          => $activeExams,
                    'today_attendance'      => $todayAttendance,
                ],
                'live_now'           => $liveNow,
                'recent_submissions' => $recentSubmissions,
            ],
        ]);
    }

    public function courses(): JsonResponse
    {
        $courses = Course::where('teacher_id', $this->teacherId())
            ->with(['category:id,name,grade_id', 'category.grade:id,name'])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $courses]);
    }

    public function liveClasses(): JsonResponse
    {
        $classes = LiveClass::where('teacher_id', $this->teacherId())
            ->with(['course:id,title'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $classes]);
    }

    public function updateStatus(Request $request, LiveClass $liveClass): JsonResponse
    {
        if ($liveClass->teacher_id !== $this->teacherId()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح.'], 403);
        }

        $transitions = ['scheduled' => 'live', 'live' => 'ended'];
        $next = $transitions[$liveClass->status] ?? null;

        if (!$next) {
            return response()->json(['success' => false, 'message' => 'لا يمكن تغيير حالة هذه الحصة.'], 422);
        }

        $liveClass->update(['status' => $next]);

        return response()->json(['success' => true, 'data' => $liveClass->fresh(['course:id,title'])]);
    }
}
