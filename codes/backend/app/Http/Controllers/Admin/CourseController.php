<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Subject;
use App\Models\User;
use App\Services\TeacherSubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeCourse(Course $course): void
    {
        if ($course->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Course::where('country_id', $this->countryId())
            ->with([
                'subject:id,name,type',
                'grade:id,name',
                'category:id,name,grade_id',
                'category.grade:id,name',
                'teacher:id,name',
            ])
            ->orderBy('sort_order')
            ->orderBy('title');

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('grade_id')) {
            $query->where('grade_id', $request->grade_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request, TeacherSubjectService $teacherSubjects): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'subject_id'  => 'required|integer|exists:subjects,id',
            'grade_id'    => 'nullable|integer|exists:grades,id',
            'teacher_id'  => 'nullable|integer|exists:users,id',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_free'     => 'nullable|boolean',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $subject = Subject::findOrFail($request->subject_id);
        if ($subject->country_id !== $countryId) {
            abort(403);
        }

        $gradeId = $request->filled('grade_id') ? (int) $request->grade_id : null;
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

        $teacherId = $request->filled('teacher_id') ? (int) $request->teacher_id : null;
        if ($teacherId) {
            $teacher = User::findOrFail($teacherId);
            if ($teacher->country_id !== $countryId || $teacher->role !== 'teacher') {
                abort(403, 'المعلم غير موجود في دولتك.');
            }
            $teacherSubjects->assertCanTeach($teacherId, $subject->id, $gradeId);
        }

        $categoryId = $this->legacyCategoryId($subject, $gradeId, $countryId);

        $course = Course::create([
            'country_id'       => $countryId,
            'subject_id'       => $subject->id,
            'grade_id'         => $gradeId,
            'category_id'      => $categoryId,
            'teacher_id'       => $teacherId,
            'title'            => $request->title,
            'description'      => $request->description,
            'price'            => $request->boolean('is_free') ? 0 : ($request->price ?? 0),
            'is_free'          => $request->boolean('is_free'),
            'is_active'        => true,
            'approval_status'  => 'approved',
            'sort_order'       => $request->sort_order ?? 0,
        ]);

        $course->load([
            'subject:id,name,type',
            'grade:id,name',
            'category:id,name,grade_id',
            'category.grade:id,name',
            'teacher:id,name',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الدورة بنجاح.',
            'data'    => $course,
        ], 201);
    }

    public function update(Request $request, Course $course, TeacherSubjectService $teacherSubjects): JsonResponse
    {
        $this->authorizeCourse($course);
        $countryId = $this->countryId();

        $request->validate([
            'subject_id'  => 'sometimes|integer|exists:subjects,id',
            'grade_id'    => 'nullable|integer|exists:grades,id',
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_free'     => 'nullable|boolean',
            'sort_order'  => 'nullable|integer|min:0',
            'teacher_id'  => 'nullable|integer|exists:users,id',
        ]);

        $data = $request->only('title', 'description', 'sort_order');

        $subjectId = $request->filled('subject_id') ? (int) $request->subject_id : (int) $course->subject_id;
        $gradeId   = $request->has('grade_id')
            ? ($request->filled('grade_id') ? (int) $request->grade_id : null)
            : $course->grade_id;

        if ($request->filled('subject_id') || $request->has('grade_id')) {
            $subject = Subject::findOrFail($subjectId);
            if ($subject->country_id !== $countryId) {
                abort(403);
            }
            if ($subject->type === 'curriculum' && ! $gradeId) {
                return response()->json(['success' => false, 'message' => 'الصف مطلوب للمواد المنهجية.'], 422);
            }
            if ($gradeId && $subject->grades()->exists()
                && ! $subject->grades()->where('grades.id', $gradeId)->exists()) {
                return response()->json(['success' => false, 'message' => 'هذا الصف غير مرتبط بالمادة.'], 422);
            }
            $data['subject_id']  = $subjectId;
            $data['grade_id']    = $gradeId;
            $data['category_id'] = $this->legacyCategoryId($subject, $gradeId, $countryId);
        }

        if ($request->has('teacher_id')) {
            $teacherId = $request->filled('teacher_id') ? (int) $request->teacher_id : null;
            if ($teacherId) {
                $teacher = User::findOrFail($teacherId);
                if ($teacher->country_id !== $countryId || $teacher->role !== 'teacher') {
                    abort(403, 'المعلم غير موجود في دولتك.');
                }
                $sid = (int) ($data['subject_id'] ?? $course->subject_id);
                $gid = array_key_exists('grade_id', $data) ? $data['grade_id'] : $course->grade_id;
                if (! $sid) {
                    return response()->json(['success' => false, 'message' => 'حدد المادة قبل تعيين المعلم.'], 422);
                }
                $teacherSubjects->assertCanTeach($teacherId, $sid, $gid ? (int) $gid : null);
            }
            $data['teacher_id'] = $teacherId;
        }

        if ($request->has('is_free')) {
            $data['is_free'] = $request->boolean('is_free');
            $data['price']   = $data['is_free'] ? 0 : ($request->price ?? $course->price);
        } elseif ($request->has('price')) {
            $data['price'] = $request->price;
        }

        $course->update($data);
        $course->load([
            'subject:id,name,type',
            'grade:id,name',
            'category:id,name,grade_id',
            'category.grade:id,name',
            'teacher:id,name',
        ]);

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $course]);
    }

    public function toggle(Course $course): JsonResponse
    {
        $this->authorizeCourse($course);
        $course->update(['is_active' => ! $course->is_active]);

        return response()->json(['success' => true, 'data' => $course]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $this->authorizeCourse($course);
        $course->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الدورة.']);
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
