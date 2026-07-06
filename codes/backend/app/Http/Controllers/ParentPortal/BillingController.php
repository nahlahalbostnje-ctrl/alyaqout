<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    public function installments(): JsonResponse
    {
        $parent = Auth::user();

        $subscriptions = Subscription::whereHas('student', function ($q) use ($parent) {
                $q->where('parent_id', $parent->id);
            })
            ->with(['student:id,name', 'package:id,name', 'installments' => function ($q) {
                $q->orderBy('installment_no');
            }])
            ->get();

        $data = $subscriptions->flatMap(function (Subscription $sub) {
            return $sub->installments->map(fn (SubscriptionInstallment $i) => [
                'id'             => $i->id,
                'child'          => $sub->student->name,
                'package'        => $sub->package->name,
                'installment_no' => $i->installment_no,
                'amount'         => $i->amount,
                'due_date'       => $i->due_date->format('Y-m-d'),
                'status'         => $i->isOverdue() ? 'overdue' : $i->status,
                'paid_at'        => $i->paid_at?->format('Y-m-d H:i'),
            ]);
        })->values();

        return response()->json(['success' => true, 'data' => $data]);
    }
}
