<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\EmergencyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmergencyController extends Controller
{
    public function request(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        $pending = EmergencyRequest::where('student_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return response()->json(['message' => 'لديك طلب طوارئ قيد الانتظار بالفعل'], 422);
        }

        $emergency = EmergencyRequest::create([
            'student_id' => $user->id,
            'country_id' => $user->country_id,
            'subject'    => $validated['subject'],
            'message'    => $validated['message'] ?? null,
            'status'     => 'pending',
        ]);

        return response()->json([
            'message'   => 'تم إرسال طلب الطوارئ، سيتواصل معك معلم قريباً',
            'request_id' => $emergency->id,
        ], 201);
    }

    public function myRequests(): JsonResponse
    {
        $requests = EmergencyRequest::where('student_id', Auth::id())
            ->with('teacher:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (EmergencyRequest $r) => [
                'id'          => $r->id,
                'subject'     => $r->subject,
                'message'     => $r->message,
                'status'      => $r->status,
                'teacher'     => $r->teacher ? ['id' => $r->teacher->id, 'name' => $r->teacher->name] : null,
                'accepted_at' => $r->accepted_at?->toISOString(),
                'created_at'  => $r->created_at->toISOString(),
            ]);

        return response()->json(['requests' => $requests]);
    }
}
