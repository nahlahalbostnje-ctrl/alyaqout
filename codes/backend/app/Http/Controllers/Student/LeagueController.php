<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\GamificationPoint;
use App\Models\League;
use App\Models\LeagueParticipant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LeagueController extends Controller
{
    public function index(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;
        $myId      = (int) Auth::id();

        $leagues = League::where('country_id', $countryId)
            ->where('status', '!=', 'ended')
            ->withCount('participants')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (League $l) => [
                'id'                 => $l->id,
                'name'               => $l->name,
                'type'               => $l->type,
                'status'             => $l->status,
                'participants_count' => $l->participants_count,
                'max_participants'   => $l->max_participants,
                'starts_at'          => $l->starts_at?->toISOString(),
                'ends_at'            => $l->ends_at?->toISOString(),
                'i_joined'           => $l->participants()->where('student_id', $myId)->exists(),
            ]);

        return response()->json(['leagues' => $leagues]);
    }

    public function join(int $leagueId): JsonResponse
    {
        $myId   = (int) Auth::id();
        $league = League::where('country_id', Auth::user()->country_id)->findOrFail($leagueId);

        if ($league->status === 'ended') {
            return response()->json(['message' => 'الدوري منتهٍ'], 422);
        }

        if (LeagueParticipant::where('league_id', $leagueId)->where('student_id', $myId)->exists()) {
            return response()->json(['message' => 'أنت مشترك في هذا الدوري بالفعل'], 422);
        }

        if ($league->max_participants && $league->participants()->count() >= $league->max_participants) {
            return response()->json(['message' => 'وصل الدوري لأقصى عدد من المشاركين'], 422);
        }

        LeagueParticipant::create([
            'league_id'  => $leagueId,
            'student_id' => $myId,
            'joined_at'  => now(),
        ]);

        return response()->json(['message' => 'انضممت للدوري بنجاح']);
    }

    public function show(int $leagueId): JsonResponse
    {
        $myId   = (int) Auth::id();
        $league = League::where('country_id', Auth::user()->country_id)->findOrFail($leagueId);

        $participants = LeagueParticipant::where('league_id', $leagueId)->get();
        $studentIds   = $participants->pluck('student_id');

        $scoresQuery = GamificationPoint::whereIn('student_id', $studentIds);
        if ($league->starts_at) {
            $scoresQuery->where('earned_at', '>=', $league->starts_at);
        }
        if ($league->ends_at) {
            $scoresQuery->where('earned_at', '<=', $league->ends_at);
        }
        $scores = $scoresQuery
            ->selectRaw('student_id, SUM(points) as total')
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $users = User::whereIn('id', $studentIds)->get(['id', 'name'])->keyBy('id');

        $leaderboard = $participants
            ->map(fn (LeagueParticipant $p) => [
                'student_id' => $p->student_id,
                'name'       => $users[$p->student_id]?->name ?? '—',
                'score'      => (int) ($scores[$p->student_id]?->total ?? 0),
                'is_me'      => $p->student_id === $myId,
            ])
            ->sortByDesc('score')
            ->values()
            ->map(fn (array $e, int $i) => array_merge($e, ['rank' => $i + 1]));

        return response()->json([
            'league' => [
                'id'                 => $league->id,
                'name'               => $league->name,
                'type'               => $league->type,
                'status'             => $league->status,
                'participants_count' => $participants->count(),
                'max_participants'   => $league->max_participants,
                'starts_at'          => $league->starts_at?->toISOString(),
                'ends_at'            => $league->ends_at?->toISOString(),
                'i_joined'           => $participants->where('student_id', $myId)->isNotEmpty(),
            ],
            'leaderboard' => $leaderboard->values(),
        ]);
    }
}
