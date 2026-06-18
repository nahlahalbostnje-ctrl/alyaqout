<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::where('country_id', Auth::user()->country_id)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['banners' => $banners]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'      => 'nullable|string|max:255',
            'image_url'  => 'required|string|max:500',
            'link_url'   => 'nullable|url|max:500',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date|after_or_equal:starts_at',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $banner = Banner::create([...$validated, 'country_id' => Auth::user()->country_id]);

        return response()->json(['message' => 'تم إضافة البانر', 'banner' => $banner], 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        abort_if($banner->country_id !== Auth::user()->country_id, 403);

        $validated = $request->validate([
            'title'      => 'nullable|string|max:255',
            'image_url'  => 'sometimes|string|max:500',
            'link_url'   => 'nullable|url|max:500',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $banner->update($validated);

        return response()->json(['message' => 'تم التحديث', 'banner' => $banner]);
    }

    public function toggle(Banner $banner): JsonResponse
    {
        abort_if($banner->country_id !== Auth::user()->country_id, 403);

        $banner->update(['is_active' => ! $banner->is_active]);

        return response()->json(['message' => $banner->is_active ? 'تم التفعيل' : 'تم التعطيل']);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        abort_if($banner->country_id !== Auth::user()->country_id, 403);

        $banner->delete();

        return response()->json(['message' => 'تم الحذف']);
    }
}
