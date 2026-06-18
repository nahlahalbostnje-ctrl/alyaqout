<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeGrade(Grade $grade): void
    {
        if ($grade->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    private function authorizeCategory(Category $category): void
    {
        if ($category->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Category::where('country_id', $this->countryId())
            ->with('grade:id,name')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->filled('grade_id')) {
            $query->where('grade_id', $request->grade_id);
        }

        return response()->json([
            'success' => true,
            'data'    => $query->get(['id', 'grade_id', 'name', 'sort_order', 'is_active']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'grade_id'   => 'required|integer|exists:grades,id',
            'name'       => ['required', 'string', 'max:100',
                Rule::unique('categories')->where('grade_id', $request->grade_id)],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $grade = Grade::findOrFail($request->grade_id);
        $this->authorizeGrade($grade);

        $category = Category::create([
            'country_id' => $countryId,
            'grade_id'   => $request->grade_id,
            'name'       => $request->name,
            'sort_order' => $request->sort_order ?? 0,
            'is_active'  => true,
        ]);

        $category->load('grade:id,name');

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المادة بنجاح.',
            'data'    => $category,
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $this->authorizeCategory($category);

        $request->validate([
            'name'       => ['sometimes', 'string', 'max:100',
                Rule::unique('categories')->where('grade_id', $category->grade_id)->ignore($category->id)],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $category->update($request->only('name', 'sort_order'));

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $category]);
    }

    public function toggle(Category $category): JsonResponse
    {
        $this->authorizeCategory($category);

        $category->update(['is_active' => ! $category->is_active]);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorizeCategory($category);

        $category->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف المادة.']);
    }
}
