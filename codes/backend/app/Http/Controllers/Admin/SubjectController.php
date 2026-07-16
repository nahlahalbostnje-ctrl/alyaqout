<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeSubject(Subject $subject): void
    {
        if ($subject->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Subject::where('country_id', $this->countryId())
            ->with('grades:id,name')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('grade_id')) {
            $gradeId = (int) $request->grade_id;
            $query->where(function ($q) use ($gradeId) {
                $q->whereHas('grades', fn ($g) => $g->where('grades.id', $gradeId))
                    ->orWhere(function ($q2) {
                        // Extracurricular with no grade links = all grades
                        $q2->where('type', 'extracurricular')
                            ->whereDoesntHave('grades');
                    });
            });
        }

        return response()->json([
            'success' => true,
            'data'    => $query->get(['id', 'country_id', 'name', 'type', 'sort_order', 'is_active']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'name'       => ['required', 'string', 'max:100',
                Rule::unique('subjects')->where('country_id', $countryId)],
            'type'       => 'required|in:curriculum,extracurricular',
            'grade_ids'  => 'nullable|array',
            'grade_ids.*'=> 'integer|exists:grades,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($request->type === 'curriculum') {
            $request->validate([
                'grade_ids'   => 'required|array|min:1',
                'grade_ids.*' => 'integer|exists:grades,id',
            ]);
        }

        $gradeIds = array_values(array_unique(array_map('intval', $request->grade_ids ?? [])));
        $this->assertGradesInCountry($gradeIds, $countryId);

        $subject = Subject::create([
            'country_id' => $countryId,
            'name'       => $request->name,
            'type'       => $request->type,
            'sort_order' => $request->sort_order ?? 0,
            'is_active'  => true,
        ]);

        $subject->grades()->sync($gradeIds);
        $subject->load('grades:id,name');

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المادة بنجاح.',
            'data'    => $subject,
        ], 201);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $this->authorizeSubject($subject);
        $countryId = $this->countryId();

        $request->validate([
            'name'       => ['sometimes', 'string', 'max:100',
                Rule::unique('subjects')->where('country_id', $countryId)->ignore($subject->id)],
            'type'       => 'sometimes|in:curriculum,extracurricular',
            'sort_order' => 'nullable|integer|min:0',
            'grade_ids'  => 'nullable|array',
            'grade_ids.*'=> 'integer|exists:grades,id',
        ]);

        $data = $request->only('name', 'type', 'sort_order');
        if ($data !== []) {
            $subject->update($data);
        }

        if ($request->has('grade_ids')) {
            $type = $request->input('type', $subject->type);
            $gradeIds = array_values(array_unique(array_map('intval', $request->grade_ids ?? [])));
            if ($type === 'curriculum' && $gradeIds === []) {
                return response()->json([
                    'success' => false,
                    'message' => 'المواد المنهجية تتطلب صفاً واحداً على الأقل.',
                ], 422);
            }
            $this->assertGradesInCountry($gradeIds, $countryId);
            $subject->grades()->sync($gradeIds);
        }

        $subject->load('grades:id,name');

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $subject]);
    }

    public function syncGrades(Request $request, Subject $subject): JsonResponse
    {
        $this->authorizeSubject($subject);

        $request->validate([
            'grade_ids'   => 'present|array',
            'grade_ids.*' => 'integer|exists:grades,id',
        ]);

        $gradeIds = array_values(array_unique(array_map('intval', $request->grade_ids)));
        if ($subject->type === 'curriculum' && $gradeIds === []) {
            return response()->json([
                'success' => false,
                'message' => 'المواد المنهجية تتطلب صفاً واحداً على الأقل.',
            ], 422);
        }

        $this->assertGradesInCountry($gradeIds, $this->countryId());
        $subject->grades()->sync($gradeIds);
        $subject->load('grades:id,name');

        return response()->json(['success' => true, 'message' => 'تم تحديث صفوف المادة.', 'data' => $subject]);
    }

    public function toggle(Subject $subject): JsonResponse
    {
        $this->authorizeSubject($subject);
        $subject->update(['is_active' => ! $subject->is_active]);

        return response()->json(['success' => true, 'data' => $subject->load('grades:id,name')]);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorizeSubject($subject);
        $subject->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف المادة.']);
    }

    /** @param list<int> $gradeIds */
    private function assertGradesInCountry(array $gradeIds, int $countryId): void
    {
        if ($gradeIds === []) {
            return;
        }

        $count = Grade::where('country_id', $countryId)->whereIn('id', $gradeIds)->count();
        if ($count !== count($gradeIds)) {
            abort(403, 'أحد الصفوف غير تابع لدولتك.');
        }
    }
}
