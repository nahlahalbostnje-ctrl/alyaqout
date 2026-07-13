<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /** GET /super-admin/faqs */
    public function index(): JsonResponse
    {
        $faqs = Faq::query()
            ->whereNull('country_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'question', 'answer', 'sort_order', 'is_active', 'created_at']);

        return response()->json([
            'success' => true,
            'data'    => $faqs,
            'meta'    => [
                'total'  => $faqs->count(),
                'active' => $faqs->where('is_active', true)->count(),
            ],
        ]);
    }

    /** POST /super-admin/faqs */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question'   => 'required|string|max:2000',
            'answer'     => 'required|string|max:10000',
            'sort_order' => 'nullable|integer|min:0|max:255',
            'is_active'  => 'nullable|boolean',
        ]);

        $faq = Faq::create([
            'country_id' => null,
            'question'   => $validated['question'],
            'answer'     => $validated['answer'],
            'sort_order' => $validated['sort_order'] ?? ((int) Faq::whereNull('country_id')->max('sort_order') + 1),
            'is_active'  => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة السؤال بنجاح.',
            'data'    => $faq,
        ], 201);
    }

    /** PUT /super-admin/faqs/{faq} */
    public function update(Request $request, Faq $faq): JsonResponse
    {
        $this->assertPlatformFaq($faq);

        $validated = $request->validate([
            'question'   => 'sometimes|required|string|max:2000',
            'answer'     => 'sometimes|required|string|max:10000',
            'sort_order' => 'nullable|integer|min:0|max:255',
            'is_active'  => 'sometimes|boolean',
        ]);

        $faq->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث السؤال.',
            'data'    => $faq->fresh(),
        ]);
    }

    /** PATCH /super-admin/faqs/{faq}/toggle */
    public function toggle(Faq $faq): JsonResponse
    {
        $this->assertPlatformFaq($faq);

        $faq->update(['is_active' => ! $faq->is_active]);

        return response()->json([
            'success' => true,
            'data'    => $faq->fresh(),
        ]);
    }

    /** DELETE /super-admin/faqs/{faq} */
    public function destroy(Faq $faq): JsonResponse
    {
        $this->assertPlatformFaq($faq);
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف السؤال.',
        ]);
    }

    private function assertPlatformFaq(Faq $faq): void
    {
        if ($faq->country_id !== null) {
            abort(404, 'السؤال غير موجود.');
        }
    }
}
