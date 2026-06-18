<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\GamificationPoint;
use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class GamificationController extends Controller
{
    public function __construct(private readonly GamificationService $gamification) {}

    public function myPoints(): JsonResponse
    {
        $studentId = (int) Auth::id();

        $total = $this->gamification->totalPoints($studentId);

        $history = GamificationPoint::where('student_id', $studentId)
            ->orderByDesc('earned_at')
            ->limit(50)
            ->get()
            ->map(fn ($p) => [
                'action'      => $p->action,
                'points'      => $p->points,
                'description' => $p->description,
                'earned_at'   => $p->earned_at->toISOString(),
            ]);

        $actionLabels = [
            'attend_class'    => 'حضور حصة مباشرة',
            'submit_homework' => 'تسليم واجب',
            'submit_exam'     => 'تسليم امتحان',
            'complete_video'  => 'إتمام فيديو',
        ];

        return response()->json([
            'total_points' => $total,
            'points_table' => GamificationService::POINTS,
            'history'      => $history->map(fn ($p) => array_merge($p, [
                'label' => $actionLabels[$p['action']] ?? $p['action'],
            ])),
        ]);
    }

    public function leaderboard(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $studentIds = User::where('role', 'student')
            ->where('country_id', $countryId)
            ->where('is_active', true)
            ->pluck('id');

        $rankings = GamificationPoint::whereIn('student_id', $studentIds)
            ->selectRaw('student_id, SUM(points) as total')
            ->groupBy('student_id')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        $users = User::whereIn('id', $rankings->pluck('student_id'))
            ->get(['id', 'name'])
            ->keyBy('id');

        $myId    = (int) Auth::id();
        $myTotal = $this->gamification->totalPoints($myId);
        $myRank  = null;

        $list = $rankings->values()->map(function ($r, $index) use ($users, $myId, &$myRank) {
            if ($r->student_id === $myId) {
                $myRank = $index + 1;
            }
            return [
                'rank'   => $index + 1,
                'name'   => $users[$r->student_id]?->name ?? '—',
                'points' => (int) $r->total,
                'is_me'  => $r->student_id === $myId,
            ];
        });

        return response()->json([
            'leaderboard'   => $list,
            'my_rank'       => $myRank,
            'my_points'     => $myTotal,
        ]);
    }
}
