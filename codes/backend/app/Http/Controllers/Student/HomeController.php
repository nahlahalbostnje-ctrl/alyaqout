<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\LiveClass;
use App\Models\Subscription;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    public function dashboard(): JsonResponse
    {
        $student   = auth()->user();
        $studentId = (int) $student->id;
        $countryId = $this->countryId();

        $courses = Course::where('country_id', $countryId)
            ->where('is_active', true)
            ->with(['category:id,name,grade_id', 'category.grade:id,name', 'teacher:id,name'])
            ->orderBy('sort_order')
            ->get(['id', 'category_id', 'teacher_id', 'title', 'description', 'price', 'is_free', 'thumbnail']);

        $upcoming = LiveClass::where('country_id', $countryId)
            ->whereIn('status', ['scheduled', 'live'])
            ->with(['course:id,title', 'teacher:id,name'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        $activeSubscription = Subscription::where('student_id', $studentId)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->with(['package:id,name,duration_days,price'])
            ->latest()
            ->first();

        // Extra stats for dashboard
        $totalPoints = (new GamificationService())->totalPoints($studentId);

        $pendingHomework = Homework::where('country_id', $countryId)
            ->where('status', 'approved')
            ->where('due_date', '>=', now())
            ->whereNotIn('id', HomeworkSubmission::where('student_id', $studentId)->pluck('homework_id'))
            ->count();

        $upcomingExams = Exam::where('country_id', $countryId)
            ->where('status', 'approved')
            ->where('starts_at', '>=', now())
            ->count();

        $attendanceCount = AttendanceRecord::where('student_id', $studentId)->count();

        // Level calculation: every 500 pts = 1 level
        $level       = (int) floor($totalPoints / 500) + 1;
        $xpInLevel   = $totalPoints % 500;
        $xpForNext   = 500;

        return response()->json([
            'success' => true,
            'data'    => [
                'student'      => ['id' => $student->id, 'name' => $student->name],
                'courses'      => $courses,
                'upcoming'     => $upcoming,
                'subscription' => $activeSubscription ? [
                    'id'             => $activeSubscription->id,
                    'package_name'   => $activeSubscription->package->name,
                    'starts_at'      => $activeSubscription->starts_at->format('Y-m-d'),
                    'ends_at'        => $activeSubscription->ends_at->format('Y-m-d'),
                    'days_remaining' => max(0, (int) now()->diffInDays($activeSubscription->ends_at, false)),
                    'status'         => $activeSubscription->status,
                ] : null,
                'stats' => [
                    'total_points'    => $totalPoints,
                    'level'           => $level,
                    'xp_in_level'     => $xpInLevel,
                    'xp_for_next'     => $xpForNext,
                    'pending_homework'=> $pendingHomework,
                    'upcoming_exams'  => $upcomingExams,
                    'attendance_count'=> $attendanceCount,
                    'total_courses'   => $courses->count(),
                ],
            ],
        ]);
    }

    public function mySubscriptions(): JsonResponse
    {
        $studentId = (int) auth()->id();

        $subs = Subscription::where('student_id', $studentId)
            ->with(['package:id,name,duration_days'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $subs->map(fn (Subscription $s) => [
                'id'             => $s->id,
                'package_name'   => $s->package->name,
                'starts_at'      => $s->starts_at->format('Y-m-d'),
                'ends_at'        => $s->ends_at->format('Y-m-d'),
                'status'         => $s->status,
                'days_remaining' => max(0, (int) now()->diffInDays($s->ends_at, false)),
            ])->values(),
        ]);
    }

    public function courses(): JsonResponse
    {
        $courses = Course::where('country_id', $this->countryId())
            ->where('is_active', true)
            ->with(['category:id,name,grade_id', 'category.grade:id,name', 'teacher:id,name'])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $courses]);
    }

    public function liveClasses(): JsonResponse
    {
        $classes = LiveClass::where('country_id', $this->countryId())
            ->whereIn('status', ['scheduled', 'live'])
            ->with(['course:id,title', 'teacher:id,name'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['success' => true, 'data' => $classes]);
    }
}
