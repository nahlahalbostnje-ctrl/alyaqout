<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\League;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeagueController extends Controller
{
    public function index(): JsonResponse
    {
        $leagues = League::where('country_id', Auth::user()->country_id)
            ->withCount('participants')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['leagues' => $leagues]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'type'             => 'required|in:1v1,group',
            'max_participants' => 'nullable|integer|min:2|max:1000',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after:starts_at',
        ]);

        $league = League::create([
            ...$validated,
            'country_id' => Auth::user()->country_id,
            'status'     => 'pending',
        ]);

        return response()->json(['league' => $league->load('participants')], 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $league = League::where('country_id', Auth::user()->country_id)->findOrFail($id);

        $request->validate(['status' => 'required|in:active,ended']);

        $league->update(['status' => $request->status]);

        return response()->json(['league' => $league]);
    }

    public function destroy(int $id): JsonResponse
    {
        $league = League::where('country_id', Auth::user()->country_id)->findOrFail($id);

        if ($league->status !== 'pending') {
            return response()->json(['message' => 'لا يمكن حذف دوري بدأ أو انتهى'], 422);
        }

        $league->delete();

        return response()->json(['message' => 'تم حذف الدوري']);
    }
}
