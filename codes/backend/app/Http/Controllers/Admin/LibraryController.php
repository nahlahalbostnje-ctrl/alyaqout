<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\LibraryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $query = LibraryItem::where('country_id', $countryId)
            ->with('grade:id,name')
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $request->validate(['type' => 'in:book,dedication,past_exam,summary']);
            $query->where('type', $request->type);
        }

        return response()->json([
            'items' => $query->get()->map(fn (LibraryItem $i) => $this->format($i)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $this->assertGradeBelongsToCountry(
            array_key_exists('grade_id', $data) ? ($data['grade_id'] !== null ? (int) $data['grade_id'] : null) : null
        );

        $item = LibraryItem::create([
            ...$data,
            'country_id' => (int) Auth::user()->country_id,
            'created_by' => (int) Auth::id(),
            'is_active'  => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
            'grade_id'   => $data['grade_id'] ?? null,
        ]);

        $item->load('grade:id,name');

        return response()->json([
            'message' => 'تم إضافة عنصر المكتبة',
            'item'    => $this->format($item),
        ], 201);
    }

    public function update(Request $request, LibraryItem $libraryItem): JsonResponse
    {
        $this->authorizeItem($libraryItem);
        $data = $this->validated($request, true);
        if (array_key_exists('grade_id', $data)) {
            $this->assertGradeBelongsToCountry($data['grade_id'] !== null ? (int) $data['grade_id'] : null);
        }

        $libraryItem->update($data);
        $libraryItem->load('grade:id,name');

        return response()->json([
            'message' => 'تم التحديث',
            'item'    => $this->format($libraryItem),
        ]);
    }

    public function toggle(LibraryItem $libraryItem): JsonResponse
    {
        $this->authorizeItem($libraryItem);
        $libraryItem->update(['is_active' => ! $libraryItem->is_active]);

        return response()->json([
            'message' => $libraryItem->is_active ? 'تم التفعيل' : 'تم التعطيل',
            'item'    => $this->format($libraryItem->load('grade:id,name')),
        ]);
    }

    public function destroy(LibraryItem $libraryItem): JsonResponse
    {
        $this->authorizeItem($libraryItem);
        $libraryItem->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'type'        => ($partial ? 'sometimes|' : 'required|').'in:book,dedication,past_exam,summary',
            'title'       => ($partial ? 'sometimes|' : 'required|').'string|max:255',
            'description' => 'nullable|string|max:2000',
            'file_url'    => 'nullable|string|max:2048',
            'cover_url'   => 'nullable|string|max:2048',
            'author'      => 'nullable|string|max:255',
            'grade_id'    => 'nullable|integer|exists:grades,id',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer|min:0',
        ];

        return $request->validate($rules);
    }

    private function authorizeItem(LibraryItem $item): void
    {
        abort_if((int) $item->country_id !== (int) Auth::user()->country_id, 403);
    }

    private function assertGradeBelongsToCountry(?int $gradeId): void
    {
        if ($gradeId === null) {
            return;
        }
        $ok = Grade::where('id', $gradeId)
            ->where('country_id', Auth::user()->country_id)
            ->exists();
        abort_unless($ok, 422, 'الصف لا ينتمي لدولتك.');
    }

    private function format(LibraryItem $i): array
    {
        return [
            'id'          => $i->id,
            'type'        => $i->type,
            'title'       => $i->title,
            'description' => $i->description,
            'file_url'    => $i->file_url,
            'cover_url'   => $i->cover_url,
            'author'      => $i->author,
            'grade_id'    => $i->grade_id,
            'grade'       => $i->grade ? ['id' => $i->grade->id, 'name' => $i->grade->name] : null,
            'is_active'   => (bool) $i->is_active,
            'sort_order'  => $i->sort_order,
            'created_at'  => $i->created_at?->toISOString(),
        ];
    }
}
