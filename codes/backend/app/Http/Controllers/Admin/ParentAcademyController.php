<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParentAcademyItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParentAcademyController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ParentAcademyItem::where('country_id', Auth::user()->country_id)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category'    => 'nullable|string|max:50',
            'file_url'    => 'nullable|string|max:2048',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $item = ParentAcademyItem::create([
            ...$data,
            'country_id' => (int) Auth::user()->country_id,
            'created_by' => Auth::id(),
            'category'   => $data['category'] ?? 'general',
            'is_active'  => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json(['message' => 'تمت الإضافة', 'item' => $item], 201);
    }

    public function update(Request $request, ParentAcademyItem $parentAcademyItem): JsonResponse
    {
        abort_if((int) $parentAcademyItem->country_id !== (int) Auth::user()->country_id, 403);

        $data = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category'    => 'nullable|string|max:50',
            'file_url'    => 'nullable|string|max:2048',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $parentAcademyItem->update($data);

        return response()->json(['message' => 'تم التحديث', 'item' => $parentAcademyItem]);
    }

    public function destroy(ParentAcademyItem $parentAcademyItem): JsonResponse
    {
        abort_if((int) $parentAcademyItem->country_id !== (int) Auth::user()->country_id, 403);
        $parentAcademyItem->delete();

        return response()->json(['message' => 'تم الحذف']);
    }
}
