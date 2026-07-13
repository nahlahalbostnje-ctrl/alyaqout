<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Subscription;
use App\Models\SubscriptionInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    /** GET /super-admin/billing */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'country_id'     => 'nullable|exists:countries,id',
            'currency'       => 'nullable|string|max:10',
            'date_from'      => 'nullable|date',
            'date_to'        => 'nullable|date',
            'payment_status' => 'nullable|in:paid,pending,refunded,overdue',
            'q'              => 'nullable|string|max:100',
            'per_page'       => 'nullable|integer|min:1|max:200',
        ]);

        $query = Subscription::query()
            ->with([
                'student:id,name,phone',
                'package:id,name',
                'country:id,name,code,currency',
                'installments',
            ])
            ->orderByDesc('created_at');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        if ($request->filled('currency')) {
            $currency = strtoupper(trim((string) $request->currency));
            $query->whereHas('country', fn ($q) => $q->where('currency', $currency));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('q')) {
            $q = '%'.$request->q.'%';
            $query->where(function ($builder) use ($q, $request) {
                if (ctype_digit((string) $request->q)) {
                    $builder->orWhere('id', (int) $request->q);
                }
                $builder->orWhereHas('student', fn ($sq) => $sq->where('name', 'like', $q)->orWhere('phone', 'like', $q))
                    ->orWhereHas('package', fn ($pq) => $pq->where('name', 'like', $q));
            });
        }

        // Base collection before payment_status filter (needed for overdue which is derived)
        $all = $query->get();

        $mapped = $all->map(fn (Subscription $sub) => $this->formatInvoice($sub));

        if ($request->filled('payment_status')) {
            $status = (string) $request->payment_status;
            $mapped = $mapped->filter(fn (array $row) => $row['invoice_status'] === $status)->values();
        } else {
            $mapped = $mapped->values();
        }

        $summary = $this->buildSummary($mapped, $request);

        $countries = Country::query()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'code', 'currency', 'is_active'])
            ->map(fn (Country $c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'code'     => $c->code,
                'currency' => $c->currency,
                'is_active'=> (bool) $c->is_active,
            ])
            ->values();

        $currencies = $countries
            ->pluck('currency')
            ->filter()
            ->map(fn ($c) => strtoupper((string) $c))
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'invoices'   => $mapped,
                'summary'    => $summary,
                'countries'  => $countries,
                'currencies' => $currencies,
                'total'      => $mapped->count(),
            ],
        ]);
    }

    private function formatInvoice(Subscription $sub): array
    {
        $currency = strtoupper((string) ($sub->country?->currency ?? ''));
        $invoiceStatus = $this->resolveInvoiceStatus($sub);

        return [
            'id'              => $sub->id,
            'invoice_no'      => 'INV-'.str_pad((string) $sub->id, 6, '0', STR_PAD_LEFT),
            'student'         => $sub->student?->name,
            'student_phone'   => $sub->student?->phone,
            'package'         => $sub->package?->name,
            'country_id'      => $sub->country_id,
            'country'         => $sub->country?->name,
            'currency'        => $currency !== '' ? $currency : '—',
            'payment_method'  => $sub->payment_method,
            'payment_status'  => $sub->payment_status,
            'invoice_status'  => $invoiceStatus,
            'amount'          => (float) $sub->amount_paid,
            'created_at'      => $sub->created_at?->toDateString(),
            'starts_at'       => $sub->starts_at?->toDateString(),
            'ends_at'         => $sub->ends_at?->toDateString(),
            'subscription_status' => $sub->status,
        ];
    }

    private function resolveInvoiceStatus(Subscription $sub): string
    {
        if ($sub->payment_status === 'paid') {
            return 'paid';
        }

        if ($sub->payment_status === 'refunded') {
            return 'refunded';
        }

        $hasOverdueInstallment = $sub->installments
            ->contains(fn (SubscriptionInstallment $i) => $i->status === 'overdue'
                || ($i->status === 'pending' && $i->due_date && $i->due_date->isPast()));

        if ($hasOverdueInstallment) {
            return 'overdue';
        }

        if ($sub->payment_status === 'pending' && $sub->ends_at && $sub->ends_at->isPast()) {
            return 'overdue';
        }

        return 'pending';
    }

    /**
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $invoices
     * @return array<string, mixed>
     */
    private function buildSummary($invoices, Request $request): array
    {
        $paid = $invoices->where('invoice_status', 'paid');
        $pending = $invoices->where('invoice_status', 'pending');
        $overdue = $invoices->where('invoice_status', 'overdue');

        $monthFrom = now()->startOfMonth()->toDateString();
        $monthTo = now()->endOfMonth()->toDateString();
        $thisMonthPaid = $paid->filter(function (array $row) use ($monthFrom, $monthTo) {
            $d = (string) ($row['created_at'] ?? '');

            return $d >= $monthFrom && $d <= $monthTo;
        });

        // Group totals by currency for display when no single currency filter
        $byCurrency = [];
        foreach ($invoices as $row) {
            $cur = (string) ($row['currency'] ?? '—');
            if (! isset($byCurrency[$cur])) {
                $byCurrency[$cur] = [
                    'currency'       => $cur,
                    'paid_total'     => 0.0,
                    'pending_total'  => 0.0,
                    'overdue_total'  => 0.0,
                    'month_total'    => 0.0,
                ];
            }
            $amount = (float) ($row['amount'] ?? 0);
            if ($row['invoice_status'] === 'paid') {
                $byCurrency[$cur]['paid_total'] += $amount;
                $d = (string) ($row['created_at'] ?? '');
                if ($d >= $monthFrom && $d <= $monthTo) {
                    $byCurrency[$cur]['month_total'] += $amount;
                }
            } elseif ($row['invoice_status'] === 'pending') {
                $byCurrency[$cur]['pending_total'] += $amount;
            } elseif ($row['invoice_status'] === 'overdue') {
                $byCurrency[$cur]['overdue_total'] += $amount;
            }
        }

        $primaryCurrency = null;
        if ($request->filled('currency')) {
            $primaryCurrency = strtoupper(trim((string) $request->currency));
        } elseif ($request->filled('country_id')) {
            $primaryCurrency = optional(Country::find((int) $request->country_id))->currency;
            $primaryCurrency = $primaryCurrency ? strtoupper((string) $primaryCurrency) : null;
        } elseif (count($byCurrency) === 1) {
            $primaryCurrency = array_key_first($byCurrency);
        }

        $pick = $primaryCurrency && isset($byCurrency[$primaryCurrency])
            ? $byCurrency[$primaryCurrency]
            : null;

        return [
            'currency'           => $pick['currency'] ?? $primaryCurrency,
            'paid_total'         => $pick ? round($pick['paid_total'], 2) : round((float) $paid->sum('amount'), 2),
            'month_paid_total'   => $pick ? round($pick['month_total'], 2) : round((float) $thisMonthPaid->sum('amount'), 2),
            'pending_total'      => $pick ? round($pick['pending_total'], 2) : round((float) $pending->sum('amount'), 2),
            'overdue_total'      => $pick ? round($pick['overdue_total'], 2) : round((float) $overdue->sum('amount'), 2),
            'paid_count'         => $paid->count(),
            'pending_count'      => $pending->count(),
            'overdue_count'      => $overdue->count(),
            'by_currency'        => array_values($byCurrency),
            'mixed_currencies'   => $pick === null && count($byCurrency) > 1,
        ];
    }
}
