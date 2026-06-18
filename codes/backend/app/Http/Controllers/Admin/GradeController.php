<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    public function index(): JsonResponse
    {
        $grades = Grade::where('country_id', $this->countryId())
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'sort_order', 'is_active']);

        return response()->json(['success' => true, 'data' => $grades]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'name'       => ['required', 'string', 'max:100',
                Rule::unique('grades')->where('country_id', $countryId)],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $grade = Grade::create([
            'country_id' => $countryId,
            'name'       => $request->name,
            'sort_order' => $request->sort_order ?? 0,
            'is_active'  => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الصف بنجاح.',
            'data'    => $grade,
        ], 201);
    }

    public function update(Request $request, Grade $grade): JsonResponse
    {
        $this->authorizeGrade($grade);

        $request->validate([
            'name'       => ['sometimes', 'string', 'max:100',
                Rule::unique('grades')->where('country_id', $this->countryId())->ignore($grade->id)],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $grade->update($request->only('name', 'sort_order'));

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $grade]);
    }

    public function toggle(Grade $grade): JsonResponse
    {
        $this->authorizeGrade($grade);

        $grade->update(['is_active' => ! $grade->is_active]);

        return response()->json(['success' => true, 'data' => $grade]);
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $this->authorizeGrade($grade);

        $grade->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الصف.']);
    }

    private function authorizeGrade(Grade $grade): void
    {
        if ($grade->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }
}
