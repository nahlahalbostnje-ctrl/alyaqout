<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CounselingRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CounselorController extends Controller
{
    private const AUTO_REPLY = 'شكراً لتواصلك مع مرشد الياقوت. تم استلام طلبك وسيتم الرد قريباً. نصيحة سريعة: قسّم هدفك الدراسي لخطوات يومية صغيرة وابدأ بأصعب مهمة أولاً.';

    public function __construct(private readonly NotificationService $notifications) {}

    public function index(): JsonResponse
    {
        $items = CounselingRequest::where('user_id', Auth::id())
            ->where('role', 'student')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn (CounselingRequest $r) => $this->format($r));

        return response()->json(['requests' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string|max:2000',
        ]);

        $user = Auth::user();

        $pending = CounselingRequest::where('user_id', $user->id)
            ->where('role', 'student')
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return response()->json(['message' => 'لديك طلب إرشاد قيد الانتظار بالفعل.'], 422);
        }

        $item = CounselingRequest::create([
            'user_id'    => $user->id,
            'country_id' => (int) $user->country_id,
            'role'       => 'student',
            'student_id' => $user->id,
            'subject'    => $data['subject'],
            'message'    => $data['message'] ?? null,
            'status'     => 'answered',
            'response'   => self::AUTO_REPLY,
            'responded_at' => now(),
        ]);

        $this->notifications->send(
            $user,
            'رد مرشد الياقوت',
            'وصل رد أولي على طلب الإرشاد الخاص بك.',
            'counseling',
            ['request_id' => $item->id]
        );

        return response()->json([
            'message' => 'تم إرسال الطلب مع رد أولي',
            'request' => $this->format($item),
        ], 201);
    }

    private function format(CounselingRequest $r): array
    {
        return [
            'id'           => $r->id,
            'subject'      => $r->subject,
            'message'      => $r->message,
            'status'       => $r->status,
            'response'     => $r->response,
            'responded_at' => $r->responded_at?->toISOString(),
            'created_at'   => $r->created_at?->toISOString(),
        ];
    }
}
