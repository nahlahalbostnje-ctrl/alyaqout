<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Country;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LiveClass;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalStudents  = User::where('role', 'student')->whereNull('deleted_at')->count();
        $totalTeachers  = User::where('role', 'teacher')->whereNull('deleted_at')->count();
        $totalParents   = User::where('role', 'parent')->whereNull('deleted_at')->count();
        $totalCountries = Country::where('is_active', true)->count();
        $totalCourses   = Course::where('is_active', true)->count();

        $totalSubscriptions = Subscription::where('status', 'active')
            ->where('ends_at', '>=', now())
            ->count();

        $pendingExams     = Exam::where('status', 'pending')->count();
        $pendingHomeworks = Homework::where('status', 'pending')->count();

        $liveNow = LiveClass::where('status', 'live')->count();

        $revenueThisMonth = Subscription::query()
            ->join('packages', 'subscriptions.package_id', '=', 'packages.id')
            ->whereMonth('subscriptions.created_at', now()->month)
            ->whereYear('subscriptions.created_at', now()->year)
            ->sum('packages.price');

        $revenueLastMonth = Subscription::query()
            ->join('packages', 'subscriptions.package_id', '=', 'packages.id')
            ->whereMonth('subscriptions.created_at', now()->subMonth()->month)
            ->whereYear('subscriptions.created_at', now()->subMonth()->year)
            ->sum('packages.price');

        $revenueChange = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        // Student growth (this month vs last month)
        $studentsThisMonth = User::where('role', 'student')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $studentsLastMonth = User::where('role', 'student')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        // Per-country breakdown
        $countries = Country::where('is_active', true)->get(['id', 'name', 'code']);
        $countryStats = $countries->map(fn (Country $c) => [
            'id'       => $c->id,
            'name'     => $c->name,
            'code'     => $c->code,
            'students' => User::where('role', 'student')->where('country_id', $c->id)->count(),
            'teachers' => User::where('role', 'teacher')->where('country_id', $c->id)->count(),
        ]);

        // Monthly student growth for chart (last 6 months)
        $growth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $total = User::where('role', 'student')
                ->where('created_at', '<=', $date->endOfMonth())
                ->count();
            $growth[] = [
                'month' => $date->translatedFormat('F Y'),
                'total' => $total,
            ];
        }

        // Approvals counts
        $approvals = [
            'exams'     => $pendingExams,
            'homeworks' => $pendingHomeworks,
        ];

        $badges = [
            'approvals'     => $pendingExams + $pendingHomeworks,
            'messages'      => Conversation::count(),
            'notifications' => Notification::where('user_id', Auth::id())
                ->where('is_read', false)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total_students'       => $totalStudents,
                    'total_teachers'       => $totalTeachers,
                    'total_parents'        => $totalParents,
                    'total_countries'      => $totalCountries,
                    'total_courses'        => $totalCourses,
                    'total_subscriptions'  => $totalSubscriptions,
                    'live_now'             => $liveNow,
                    'revenue_this_month'   => (float) $revenueThisMonth,
                    'revenue_last_month'   => (float) $revenueLastMonth,
                    'revenue_change_pct'   => $revenueChange,
                    'students_this_month'  => $studentsThisMonth,
                    'students_last_month'  => $studentsLastMonth,
                ],
                'approvals'      => $approvals,
                'badges'         => $badges,
                'country_stats'  => $countryStats,
                'growth_chart'   => $growth,
            ],
        ]);
    }
}
