<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CounselingRequest;
use App\Models\ParentAcademyItem;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CounselingController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function index(): JsonResponse
    {
        $items = CounselingRequest::where('country_id', Auth::user()->country_id)
            ->with(['user:id,name,role', 'student:id,name'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (CounselingRequest $r) => [
                'id'           => $r->id,
                'role'         => $r->role,
                'subject'      => $r->subject,
                'message'      => $r->message,
                'status'       => $r->status,
                'response'     => $r->response,
                'user'         => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name, 'role' => $r->user->role] : null,
                'student'      => $r->student ? ['id' => $r->student->id, 'name' => $r->student->name] : null,
                'responded_at' => $r->responded_at?->toISOString(),
                'created_at'   => $r->created_at?->toISOString(),
            ]);

        return response()->json(['requests' => $items]);
    }

    public function respond(Request $request, CounselingRequest $counselingRequest): JsonResponse
    {
        abort_if((int) $counselingRequest->country_id !== (int) Auth::user()->country_id, 403);

        $data = $request->validate([
            'response' => 'required|string|max:3000',
        ]);

        $counselingRequest->update([
            'response'     => $data['response'],
            'status'       => 'answered',
            'responded_by' => Auth::id(),
            'responded_at' => now(),
        ]);

        if ($counselingRequest->user) {
            $this->notifications->send(
                $counselingRequest->user,
                'رد جديد على طلب الإرشاد',
                'تم تحديث الرد على طلبك من إدارة المنصة.',
                'counseling',
                ['request_id' => $counselingRequest->id]
            );
        }

        return response()->json(['message' => 'تم إرسال الرد']);
    }
}
