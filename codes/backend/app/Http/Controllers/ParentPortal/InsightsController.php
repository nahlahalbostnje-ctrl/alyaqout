<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\GamificationPoint;
use App\Models\ParentAcademyItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InsightsController extends Controller
{
    public function academy(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $items = ParentAcademyItem::where('country_id', $countryId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ParentAcademyItem $i) => [
                'id'          => $i->id,
                'title'       => $i->title,
                'description' => $i->description,
                'category'    => $i->category,
                'file_url'    => $i->file_url,
            ]);

        return response()->json(['items' => $items]);
    }

    public function achievements(): JsonResponse
    {
        $parentId = (int) Auth::id();
        $children = User::where('parent_id', $parentId)->where('role', 'student')->get(['id', 'name']);

        $rows = $children->map(function (User $child) {
            $total = (int) GamificationPoint::where('student_id', $child->id)->sum('points');
            $recent = GamificationPoint::where('student_id', $child->id)
                ->orderByDesc('earned_at')
                ->limit(5)
                ->get(['action', 'points', 'description', 'earned_at'])
                ->map(fn ($p) => [
                    'action'      => $p->action,
                    'points'      => $p->points,
                    'description' => $p->description,
                    'earned_at'   => $p->earned_at?->toISOString(),
                ]);

            return [
                'student'       => ['id' => $child->id, 'name' => $child->name],
                'total_points'  => $total,
                'recent'        => $recent,
            ];
        })->sortByDesc('total_points')->values();

        return response()->json(['children' => $rows]);
    }

    public function league(): JsonResponse
    {
        $parentId = (int) Auth::id();
        $children = User::where('parent_id', $parentId)->where('role', 'student')->get(['id', 'name']);

        $board = $children->map(function (User $child) {
            $points = (int) GamificationPoint::where('student_id', $child->id)->sum('points');

            return [
                'student_id' => $child->id,
                'name'       => $child->name,
                'points'     => $points,
            ];
        })->sortByDesc('points')->values();

        $ranked = $board->values()->map(function ($row, $i) {
            $row['rank'] = $i + 1;

            return $row;
        });

        $countryId = (int) Auth::user()->country_id;
        $countryTop = DB::table('gamification_points')
            ->join('users', 'users.id', '=', 'gamification_points.student_id')
            ->where('users.country_id', $countryId)
            ->where('users.role', 'student')
            ->select('users.id', 'users.name', DB::raw('SUM(gamification_points.points) as points'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('points')
            ->limit(10)
            ->get()
            ->values()
            ->map(fn ($r, $i) => [
                'rank'       => $i + 1,
                'student_id' => $r->id,
                'name'       => $r->name,
                'points'     => (int) $r->points,
            ]);

        return response()->json([
            'family_board'  => $ranked,
            'country_top10' => $countryTop,
        ]);
    }
}
