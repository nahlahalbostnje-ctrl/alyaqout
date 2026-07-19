<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\CounselingRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CounselingController extends Controller
{
    private const AUTO_REPLY = 'شكراً لتواصلك. تم استلام طلب جلسة الإرشاد وسيتابع الفريق التربوي الحالة. نصيحة: خصّص 15 دقيقة يومياً لمراجعة تقدّم ابنك دون ضغط.';

    public function __construct(private readonly NotificationService $notifications) {}

    public function index(): JsonResponse
    {
        $items = CounselingRequest::where('user_id', Auth::id())
            ->where('role', 'parent')
            ->with('student:id,name')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn (CounselingRequest $r) => $this->format($r));

        return response()->json(['requests' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => 'nullable|integer|exists:users,id',
            'subject'    => 'required|string|max:255',
            'message'    => 'nullable|string|max:2000',
        ]);

        $parent = Auth::user();

        if (! empty($data['student_id'])) {
            $ok = User::where('id', $data['student_id'])
                ->where('parent_id', $parent->id)
                ->where('role', 'student')
                ->exists();
            abort_unless($ok, 403, 'الطالب غير مرتبط بحسابك.');
        }

        $item = CounselingRequest::create([
            'user_id'      => $parent->id,
            'country_id'   => (int) $parent->country_id,
            'role'         => 'parent',
            'student_id'   => $data['student_id'] ?? null,
            'subject'      => $data['subject'],
            'message'      => $data['message'] ?? null,
            'status'       => 'answered',
            'response'     => self::AUTO_REPLY,
            'responded_at' => now(),
        ]);

        $this->notifications->send(
            $parent,
            'رد على طلب الإرشاد',
            'وصل رد أولي على طلب جلسة الإرشاد.',
            'counseling',
            ['request_id' => $item->id]
        );

        return response()->json([
            'message' => 'تم إرسال الطلب',
            'request' => $this->format($item->load('student:id,name')),
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
            'student'      => $r->student ? ['id' => $r->student->id, 'name' => $r->student->name] : null,
            'responded_at' => $r->responded_at?->toISOString(),
            'created_at'   => $r->created_at?->toISOString(),
        ];
    }
}
