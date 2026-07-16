<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function format(Subscription $sub): array
    {
        return [
            'id'             => $sub->id,
            'student'        => ['id' => $sub->student->id, 'name' => $sub->student->name, 'phone' => $sub->student->phone],
            'package'        => ['id' => $sub->package->id, 'name' => $sub->package->name, 'duration_days' => $sub->package->duration_days],
            'starts_at'      => $sub->starts_at->format('Y-m-d'),
            'ends_at'        => $sub->ends_at->format('Y-m-d'),
            'status'         => $sub->status,
            'payment_method' => $sub->payment_method,
            'payment_status' => $sub->payment_status,
            'amount_paid'    => $sub->amount_paid,
            'notes'          => $sub->notes,
            'days_remaining' => max(0, (int) now()->diffInDays($sub->ends_at, false)),
            'created_at'     => $sub->created_at->format('Y-m-d'),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'     => 'nullable|in:active,expired,cancelled,pending',
            'student_id' => 'nullable|integer',
        ]);

        $query = Subscription::where('country_id', $this->countryId())
            ->with(['student:id,name,phone', 'package:id,name,duration_days'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        $subs = $query->get();

        $stats = [
            'total'     => $subs->count(),
            'active'    => $subs->where('status', 'active')->count(),
            'expired'   => $subs->where('status', 'expired')->count(),
            'cancelled' => $subs->where('status', 'cancelled')->count(),
            'pending'   => $subs->where('status', 'pending')->count(),
        ];

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $subs->map(fn (Subscription $s) => $this->format($s))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'student_id'     => 'required|integer|exists:users,id',
            'package_id'     => 'required|integer|exists:packages,id',
            'starts_at'      => 'required|date',
            'payment_method' => 'nullable|in:manual,online',
            'payment_status' => 'nullable|in:paid,pending,refunded',
            'amount_paid'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        $countryId = $this->countryId();

        $student = User::where('id', $request->student_id)
            ->where('country_id', $countryId)
            ->where('role', 'student')
            ->firstOrFail();

        $package = Package::where('id', $request->package_id)
            ->where('country_id', $countryId)
            ->where('is_active', true)
            ->firstOrFail();

        $startsAt = Carbon::parse($request->starts_at);
        $endsAt   = $startsAt->copy()->addDays((int) $package->duration_days);

        $sub = Subscription::create([
            'country_id'     => $countryId,
            'student_id'     => $student->id,
            'package_id'     => $package->id,
            'created_by'     => auth()->id(),
            'starts_at'      => $startsAt,
            'ends_at'        => $endsAt,
            'status'         => 'active',
            'payment_method' => $request->payment_method ?? 'manual',
            'payment_status' => $request->payment_status ?? 'paid',
            'amount_paid'    => $request->amount_paid ?? $package->price,
            'notes'          => $request->notes,
        ]);

        $sub->load(['student:id,name,phone', 'package:id,name,duration_days']);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل الاشتراك بنجاح.',
            'data'    => $this->format($sub),
        ], 201);
    }

    public function cancel(Subscription $subscription): JsonResponse
    {
        if ((int) $subscription->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }

        if ($subscription->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'الاشتراك ملغى مسبقاً.'], 422);
        }

        $subscription->update(['status' => 'cancelled']);
        $subscription->load(['student:id,name,phone', 'package:id,name,duration_days']);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الاشتراك.',
            'data'    => $this->format($subscription),
        ]);
    }

    /** PATCH /admin/subscriptions/{subscription}/activate — تفعيل طلب معلّق (مثلاً من ولي الأمر) */
    public function activate(Subscription $subscription): JsonResponse
    {
        if ((int) $subscription->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }

        if ($subscription->status === 'active' && $subscription->ends_at->gte(now()->startOfDay())) {
            return response()->json(['success' => false, 'message' => 'الاشتراك مفعّل مسبقاً.'], 422);
        }

        $package = Package::where('id', $subscription->package_id)
            ->where('country_id', $this->countryId())
            ->firstOrFail();

        $startsAt = Carbon::today();
        $subscription->update([
            'status'         => 'active',
            'payment_status' => $subscription->payment_status === 'refunded' ? 'paid' : ($subscription->payment_status ?: 'paid'),
            'amount_paid'    => $subscription->amount_paid > 0 ? $subscription->amount_paid : $package->price,
            'starts_at'      => $startsAt,
            'ends_at'        => $startsAt->copy()->addDays((int) $package->duration_days),
            'notes'          => trim(($subscription->notes ? $subscription->notes.' | ' : '').'فعّله الأدمن '.now()->toDateTimeString()),
        ]);

        $subscription->load(['student:id,name,phone', 'package:id,name,duration_days']);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل الاشتراك — يفتح محتوى الباقة للطالب فوراً.',
            'data'    => $this->format($subscription),
        ]);
    }

    public function studentSubscriptions(User $student): JsonResponse
    {
        if ((int) $student->country_id !== $this->countryId() || $student->role !== 'student') {
            abort(403, 'غير مصرح.');
        }

        $subs = Subscription::where('student_id', $student->id)
            ->with(['package:id,name,duration_days'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $subs->map(fn (Subscription $s) => [
                'id'             => $s->id,
                'package'        => ['id' => $s->package->id, 'name' => $s->package->name],
                'starts_at'      => $s->starts_at->format('Y-m-d'),
                'ends_at'        => $s->ends_at->format('Y-m-d'),
                'status'         => $s->status,
                'payment_status' => $s->payment_status,
                'amount_paid'    => $s->amount_paid,
                'days_remaining' => max(0, (int) now()->diffInDays($s->ends_at, false)),
            ])->values(),
        ]);
    }
}
