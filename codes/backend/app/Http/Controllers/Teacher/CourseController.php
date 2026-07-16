<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Subject;
use App\Services\TeacherSubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    private function teacherId(): int
    {
        return (int) auth()->user()->id;
    }

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    /** POST /teacher/courses — طلب إنشاء دورة بانتظار موافقة الإدارة */
    public function store(Request $request, TeacherSubjectService $teacherSubjects): JsonResponse
    {
        $teacherId = $this->teacherId();
        $countryId = $this->countryId();

        $data = $request->validate([
            'subject_id'  => 'required|integer|exists:subjects,id',
            'grade_id'    => 'nullable|integer|exists:grades,id',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:3000',
            'price'       => 'nullable|numeric|min:0',
            'is_free'     => 'nullable|boolean',
        ]);

        $subject = Subject::findOrFail($data['subject_id']);
        if ((int) $subject->country_id !== $countryId) {
            return response()->json(['success' => false, 'message' => 'المادة غير صالحة.'], 403);
        }

        $gradeId = isset($data['grade_id']) ? (int) $data['grade_id'] : null;
        if ($subject->type === 'curriculum') {
            if (! $gradeId) {
                return response()->json(['success' => false, 'message' => 'الصف مطلوب للمواد المنهجية.'], 422);
            }
            if (! $subject->grades()->where('grades.id', $gradeId)->exists()) {
                return response()->json(['success' => false, 'message' => 'هذا الصف غير مرتبط بالمادة.'], 422);
            }
        } elseif ($gradeId && $subject->grades()->exists()
            && ! $subject->grades()->where('grades.id', $gradeId)->exists()) {
            return response()->json(['success' => false, 'message' => 'هذا الصف غير مرتبط بالمادة.'], 422);
        }

        try {
            $teacherSubjects->assertCanTeach($teacherId, $subject->id, $gradeId);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?? 'غير مصرح لهذه المادة/الصف.',
            ], 422);
        }

        $categoryId = $this->legacyCategoryId($subject, $gradeId, $countryId);

        $isFree = (bool) ($data['is_free'] ?? false);

        $course = Course::create([
            'country_id'      => $countryId,
            'subject_id'      => $subject->id,
            'grade_id'        => $gradeId,
            'category_id'     => $categoryId,
            'teacher_id'      => $teacherId,
            'title'           => $data['title'],
            'description'     => $data['description'] ?? null,
            'price'           => $isFree ? 0 : ($data['price'] ?? 0),
            'is_free'         => $isFree,
            'is_active'       => false,
            'approval_status' => 'pending',
            'sort_order'      => 0,
        ]);

        $course->load([
            'subject:id,name,type',
            'grade:id,name',
            'category:id,name,grade_id',
            'category.grade:id,name',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال الدورة بانتظار موافقة الإدارة.',
            'data'    => $course,
        ], 201);
    }

    private function legacyCategoryId(Subject $subject, ?int $gradeId, int $countryId): ?int
    {
        if (! $gradeId) {
            return null;
        }

        $cat = Category::where('country_id', $countryId)
            ->where('grade_id', $gradeId)
            ->where('name', $subject->name)
            ->first();

        if ($cat) {
            return $cat->id;
        }

        return Category::create([
            'country_id' => $countryId,
            'grade_id'   => $gradeId,
            'name'       => $subject->name,
            'sort_order' => $subject->sort_order,
            'is_active'  => $subject->is_active,
        ])->id;
    }
}
