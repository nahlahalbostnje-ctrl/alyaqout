<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\EmergencyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EmergencyController extends Controller
{
    public function index(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $requests = EmergencyRequest::where('country_id', $countryId)
            ->whereIn('status', ['pending', 'accepted'])
            ->with('student:id,name,phone')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (EmergencyRequest $r) => [
                'id'          => $r->id,
                'subject'     => $r->subject,
                'message'     => $r->message,
                'status'      => $r->status,
                'student'     => ['id' => $r->student->id, 'name' => $r->student->name, 'phone' => $r->student->phone],
                'teacher_id'  => $r->teacher_id,
                'accepted_at' => $r->accepted_at?->toISOString(),
                'created_at'  => $r->created_at->toISOString(),
            ]);

        return response()->json(['requests' => $requests]);
    }

    public function accept(int $id): JsonResponse
    {
        $teacherId = (int) Auth::id();
        $countryId = (int) Auth::user()->country_id;

        $emergency = EmergencyRequest::where('country_id', $countryId)
            ->where('status', 'pending')
            ->findOrFail($id);

        $emergency->update([
            'teacher_id'  => $teacherId,
            'status'      => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json(['message' => 'تم قبول الطلب']);
    }

    public function resolve(int $id): JsonResponse
    {
        $teacherId = (int) Auth::id();
        $countryId = (int) Auth::user()->country_id;

        $emergency = EmergencyRequest::where('country_id', $countryId)
            ->where('teacher_id', $teacherId)
            ->where('status', 'accepted')
            ->findOrFail($id);

        $emergency->update([
            'status'      => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'تم إنهاء الطلب']);
    }
}
