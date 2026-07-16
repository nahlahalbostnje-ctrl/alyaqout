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

        $courses = $this->visibleCoursesQuery($student)
            ->with([
                'subject:id,name,type',
                'grade:id,name',
                'category:id,name,grade_id',
                'category.grade:id,name',
                'teacher:id,name',
            ])
            ->orderBy('sort_order')
            ->get(['id', 'category_id', 'subject_id', 'grade_id', 'teacher_id', 'title', 'description', 'price', 'is_free', 'thumbnail']);

        $upcoming = LiveClass::where('country_id', $countryId)
            ->where('approval_status', 'approved')
            ->whereNull('archived_at')
            ->whereIn('status', ['scheduled', 'live'])
            ->where(function ($q) use ($studentId) {
                $q->where('session_type', 'group')->orWhere('student_id', $studentId);
            })
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

        $pendingHomework = Homework::whereHas('course', fn ($q) => $q->where('country_id', $countryId))
            ->where('status', 'approved')
            ->whereNull('archived_at')
            ->where('due_date', '>=', now())
            ->whereNotIn('id', HomeworkSubmission::where('student_id', $studentId)->pluck('homework_id'))
            ->count();

        $upcomingExams = Exam::whereHas('course', fn ($q) => $q->where('country_id', $countryId))
            ->where('status', 'approved')
            ->whereNull('archived_at')
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
        $student = auth()->user();

        $courses = $this->visibleCoursesQuery($student)
            ->with([
                'subject:id,name,type',
                'grade:id,name',
                'category:id,name,grade_id',
                'category.grade:id,name',
                'teacher:id,name',
            ])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $courses]);
    }

    /**
     * Curriculum: student's grade only.
     * Extracurricular: country-wide; grade null (all) or matching student grade.
     */
    private function visibleCoursesQuery($student)
    {
        $countryId = (int) $student->country_id;
        $gradeId   = $student->grade_id ? (int) $student->grade_id : null;

        return Course::where('country_id', $countryId)
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->where(function ($q) use ($gradeId) {
                $q->where(function ($extra) use ($gradeId) {
                    $extra->whereHas('subject', fn ($s) => $s->where('type', 'extracurricular')->where('is_active', true))
                        ->where(function ($g) use ($gradeId) {
                            $g->whereNull('grade_id');
                            if ($gradeId) {
                                $g->orWhere('grade_id', $gradeId);
                            }
                        });
                });

                if ($gradeId) {
                    $q->orWhere(function ($curr) use ($gradeId) {
                        $curr->where('grade_id', $gradeId)
                            ->where(function ($inner) {
                                $inner->whereHas('subject', fn ($s) => $s->where('type', 'curriculum')->where('is_active', true))
                                    ->orWhereNull('subject_id');
                            });
                    })->orWhere(function ($legacy) use ($gradeId) {
                        $legacy->whereNull('subject_id')
                            ->whereNull('grade_id')
                            ->whereHas('category', fn ($c) => $c->where('grade_id', $gradeId));
                    });
                }
            });
    }

    public function liveClasses(): JsonResponse
    {
        $studentId = (int) auth()->user()->id;

        $classes = LiveClass::where('country_id', $this->countryId())
            ->where('approval_status', 'approved')
            ->whereNull('archived_at')
            ->whereIn('status', ['scheduled', 'live'])
            ->where(function ($q) use ($studentId) {
                $q->where('session_type', 'group')->orWhere('student_id', $studentId);
            })
            ->with(['course:id,title', 'teacher:id,name'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['success' => true, 'data' => $classes]);
    }
}
