<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudyBuddySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudyBuddyController extends Controller
{
    public function index(): JsonResponse
    {
        $sessions = StudyBuddySession::where('student_id', Auth::id())
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn (StudyBuddySession $s) => $this->format($s));

        return response()->json(['sessions' => $sessions]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'duration_seconds' => 'required|integer|min:60|max:28800',
            'break_seconds'    => 'nullable|integer|min:0|max:7200',
            'notes'            => 'nullable|string|max:2000',
            'smart_mode'       => 'nullable|boolean',
            'started_at'       => 'nullable|date',
            'ended_at'         => 'nullable|date',
        ]);

        $session = StudyBuddySession::create([
            ...$data,
            'student_id'    => Auth::id(),
            'break_seconds' => $data['break_seconds'] ?? 0,
            'smart_mode'    => (bool) ($data['smart_mode'] ?? false),
            'ended_at'      => $data['ended_at'] ?? now(),
        ]);

        return response()->json([
            'message' => 'تم حفظ جلسة الدراسة',
            'session' => $this->format($session),
        ], 201);
    }

    private function format(StudyBuddySession $s): array
    {
        return [
            'id'               => $s->id,
            'duration_seconds' => $s->duration_seconds,
            'break_seconds'    => $s->break_seconds,
            'notes'            => $s->notes,
            'smart_mode'       => $s->smart_mode,
            'started_at'       => $s->started_at?->toISOString(),
            'ended_at'         => $s->ended_at?->toISOString(),
            'created_at'       => $s->created_at?->toISOString(),
        ];
    }
}
