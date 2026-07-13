<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Page;
use App\Models\SocialLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CMSController extends Controller
{
    // ─── Pages ───────────────────────────────────────────

    public function pageIndex(): JsonResponse
    {
        $pages = Page::where('country_id', Auth::user()->country_id)->get(['id', 'slug', 'title', 'updated_at']);
        return response()->json(['pages' => $pages]);
    }

    public function pageShow(string $slug): JsonResponse
    {
        $page = Page::where('country_id', Auth::user()->country_id)->where('slug', $slug)->firstOrFail();
        return response()->json(['page' => $page]);
    }

    public function pageUpsert(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $page = Page::updateOrCreate(
            ['country_id' => Auth::user()->country_id, 'slug' => $slug],
            [...$validated, 'updated_at' => now()]
        );

        return response()->json(['message' => 'تم الحفظ', 'page' => $page]);
    }

    // ─── FAQs (managed by Super Admin only) ───────────────

    public function faqIndex(): JsonResponse
    {
        return response()->json([
            'faqs'    => [],
            'message' => 'إدارة الأسئلة الشائعة متاحة لسوبر أدمن المنصة فقط.',
        ], 403);
    }

    public function faqStore(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'إدارة الأسئلة الشائعة متاحة لسوبر أدمن المنصة فقط.',
        ], 403);
    }

    public function faqUpdate(Request $request, Faq $faq): JsonResponse
    {
        return response()->json([
            'message' => 'إدارة الأسئلة الشائعة متاحة لسوبر أدمن المنصة فقط.',
        ], 403);
    }

    public function faqDestroy(Faq $faq): JsonResponse
    {
        return response()->json([
            'message' => 'إدارة الأسئلة الشائعة متاحة لسوبر أدمن المنصة فقط.',
        ], 403);
    }

    // ─── Social Links ─────────────────────────────────────

    public function socialIndex(): JsonResponse
    {
        $links = SocialLink::where('country_id', Auth::user()->country_id)->get();
        return response()->json(['links' => $links]);
    }

    public function socialUpsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform'  => 'required|string|max:50',
            'url'       => 'required|url|max:500',
            'icon'      => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $link = SocialLink::updateOrCreate(
            ['country_id' => Auth::user()->country_id, 'platform' => $validated['platform']],
            $validated
        );

        return response()->json(['message' => 'تم الحفظ', 'link' => $link]);
    }

    public function socialDestroy(SocialLink $socialLink): JsonResponse
    {
        abort_if($socialLink->country_id !== Auth::user()->country_id, 403);
        $socialLink->delete();
        return response()->json(['message' => 'تم الحذف']);
    }
}
