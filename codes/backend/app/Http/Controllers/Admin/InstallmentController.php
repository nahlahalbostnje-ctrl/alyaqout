<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionInstallment;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstallmentController extends Controller
{
    public function __construct(private readonly NotificationService $notifications)
    {
    }

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function format(SubscriptionInstallment $i): array
    {
        return [
            'id'             => $i->id,
            'installment_no' => $i->installment_no,
            'amount'         => $i->amount,
            'due_date'       => $i->due_date->format('Y-m-d'),
            'status'         => $i->isOverdue() ? 'overdue' : $i->status,
            'paid_at'        => $i->paid_at?->format('Y-m-d H:i'),
            'notes'          => $i->notes,
        ];
    }

    private function findSubscription(int $subscriptionId): Subscription
    {
        $sub = Subscription::where('id', $subscriptionId)
            ->where('country_id', $this->countryId())
            ->firstOrFail();

        return $sub;
    }

    public function index(int $subscription): JsonResponse
    {
        $sub = $this->findSubscription($subscription);

        return response()->json([
            'success' => true,
            'data'    => $sub->installments()->orderBy('installment_no')->get()
                ->map(fn (SubscriptionInstallment $i) => $this->format($i))->values(),
        ]);
    }

    /**
     * Split a subscription's amount into N equal monthly installments,
     * or accept an explicit list of {amount, due_date} pairs.
     */
    public function store(Request $request, int $subscription): JsonResponse
    {
        $sub = $this->findSubscription($subscription);

        if ($sub->installments()->exists()) {
            return response()->json(['success' => false, 'message' => 'يوجد بالفعل خطة تقسيط لهذا الاشتراك.'], 422);
        }

        $request->validate([
            'count'                    => 'nullable|integer|min:2|max:24',
            'first_due_date'           => 'nullable|date',
            'installments'             => 'nullable|array|min:2',
            'installments.*.amount'    => 'required_with:installments|numeric|min:0.01',
            'installments.*.due_date'  => 'required_with:installments|date',
        ]);

        $rows = [];

        if ($request->filled('installments')) {
            foreach ($request->installments as $idx => $row) {
                $rows[] = [
                    'subscription_id' => $sub->id,
                    'installment_no'  => $idx + 1,
                    'amount'          => $row['amount'],
                    'due_date'        => Carbon::parse($row['due_date']),
                    'status'          => 'pending',
                ];
            }
        } else {
            $count    = (int) ($request->count ?? 3);
            $start    = $request->filled('first_due_date') ? Carbon::parse($request->first_due_date) : now()->addMonth();
            $total    = (float) $sub->amount_paid;
            $each     = round($total / $count, 2);
            $running  = 0.0;

            for ($n = 1; $n <= $count; $n++) {
                $amount = $n === $count ? round($total - $running, 2) : $each;
                $running += $amount;

                $rows[] = [
                    'subscription_id' => $sub->id,
                    'installment_no'  => $n,
                    'amount'          => $amount,
                    'due_date'        => $start->copy()->addMonthsNoOverflow($n - 1),
                    'status'          => 'pending',
                ];
            }
        }

        foreach ($rows as $row) {
            $row['created_at'] = now();
            $row['updated_at'] = now();
            SubscriptionInstallment::create($row);
        }

        $sub->update(['payment_status' => 'pending']);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء خطة التقسيط بنجاح.',
            'data'    => $sub->installments()->orderBy('installment_no')->get()
                ->map(fn (SubscriptionInstallment $i) => $this->format($i))->values(),
        ], 201);
    }

    public function markPaid(int $subscription, int $installment): JsonResponse
    {
        $sub = $this->findSubscription($subscription);

        $installmentModel = $sub->installments()->where('id', $installment)->firstOrFail();

        if ($installmentModel->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'هذا القسط مدفوع بالفعل.'], 422);
        }

        $installmentModel->update(['status' => 'paid', 'paid_at' => now()]);

        $remaining = $sub->installments()->where('status', '!=', 'paid')->count();
        if ($remaining === 0) {
            $sub->update(['payment_status' => 'paid']);
        }

        $sub->loadMissing('student');
        $message = "تم تسجيل دفعة القسط رقم {$installmentModel->installment_no} بمبلغ {$installmentModel->amount} لصالح {$sub->student?->name} بنجاح. شكراً لالتزامكم.";

        if ($sub->student) {
            $this->notifications->send($sub->student, 'تم تسجيل دفعة قسط', $message, 'installment_paid', ['subscription_id' => $sub->id]);

            if ($sub->student->parent_id) {
                $parent = \App\Models\User::find($sub->student->parent_id);
                if ($parent) {
                    $this->notifications->send($parent, 'تم تسجيل دفعة قسط', $message, 'installment_paid', ['subscription_id' => $sub->id]);
                    if ($parent->phone) {
                        $this->notifications->sendWhatsApp($parent->phone, $message);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدفعة.',
            'data'    => $this->format($installmentModel->refresh()),
        ]);
    }
}
