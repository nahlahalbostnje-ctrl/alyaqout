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

    // ─── FAQs ────────────────────────────────────────────

    public function faqIndex(): JsonResponse
    {
        $faqs = Faq::where('country_id', Auth::user()->country_id)->orderBy('sort_order')->get();
        return response()->json(['faqs' => $faqs]);
    }

    public function faqStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question'   => 'required|string',
            'answer'     => 'required|string',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $faq = Faq::create([...$validated, 'country_id' => Auth::user()->country_id]);

        return response()->json(['message' => 'تمت الإضافة', 'faq' => $faq], 201);
    }

    public function faqUpdate(Request $request, Faq $faq): JsonResponse
    {
        abort_if($faq->country_id !== Auth::user()->country_id, 403);

        $validated = $request->validate([
            'question'   => 'sometimes|string',
            'answer'     => 'sometimes|string',
            'sort_order' => 'nullable|integer|min:0',
            'is_active'  => 'sometimes|boolean',
        ]);

        $faq->update($validated);

        return response()->json(['message' => 'تم التحديث', 'faq' => $faq]);
    }

    public function faqDestroy(Faq $faq): JsonResponse
    {
        abort_if($faq->country_id !== Auth::user()->country_id, 403);
        $faq->delete();
        return response()->json(['message' => 'تم الحذف']);
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
