<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoursePurchaseRequest;
use App\Services\CoursePurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoursePurchaseController extends Controller
{
    public function __construct(
        private readonly CoursePurchaseService $purchases,
    ) {}

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    /** GET /admin/course-purchases */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $query = CoursePurchaseRequest::query()
            ->where('country_id', $this->countryId())
            ->with(['student:id,name', 'course:id,title,price', 'requester:id,name,role'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $rows = $query->limit(200)->get();

        return response()->json([
            'success' => true,
            'data'    => $rows->map(fn (CoursePurchaseRequest $r) => $this->purchases->format($r))->values(),
        ]);
    }

    /** PATCH /admin/course-purchases/{purchase}/approve */
    public function approve(Request $request, CoursePurchaseRequest $purchase): JsonResponse
    {
        abort_unless((int) $purchase->country_id === $this->countryId(), 404);

        $data = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $updated = $this->purchases->approve($purchase, auth()->user(), $data['notes'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'تم اعتماد الشراء وتفعيل الوصول للمساق.',
            'data'    => $this->purchases->format($updated),
        ]);
    }

    /** PATCH /admin/course-purchases/{purchase}/reject */
    public function reject(Request $request, CoursePurchaseRequest $purchase): JsonResponse
    {
        abort_unless((int) $purchase->country_id === $this->countryId(), 404);

        $data = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $updated = $this->purchases->reject($purchase, auth()->user(), $data['notes'] ?? 'مرفوض من الإدارة');

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب الشراء.',
            'data'    => $this->purchases->format($updated),
        ]);
    }
}
