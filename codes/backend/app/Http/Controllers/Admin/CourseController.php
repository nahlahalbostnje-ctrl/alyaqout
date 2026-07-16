<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LiveClass;
use App\Models\Subject;
use App\Models\Subscription;
use App\Models\User;
use App\Services\StudentEntitlementService;
use App\Services\TeacherSubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    /** GET /admin/courses/{course}/dossier — ملف الدورة الكامل */
    public function dossier(Course $course, StudentEntitlementService $entitlement): JsonResponse
    {
        $this->authorizeCourse($course);

        $course->load([
            'subject:id,name,type',
            'grade:id,name',
            'category:id,name,grade_id',
            'category.grade:id,name',
            'teacher:id,name,phone',
            'units' => fn ($q) => $q->orderBy('sort_order')->withCount('lessons'),
        ]);

        $units = $course->units->map(fn ($u) => [
            'id'            => $u->id,
            'title'         => $u->title,
            'lessons_count' => (int) $u->lessons_count,
            'sort_order'    => $u->sort_order,
        ])->values();

        $lessonsCount = (int) DB::table('lessons')
            ->whereIn('unit_id', $course->units->pluck('id'))
            ->count();

        $videosCount = (int) DB::table('videos')
            ->whereIn('lesson_id', function ($q) use ($course) {
                $q->select('lessons.id')
                    ->from('lessons')
                    ->join('units', 'units.id', '=', 'lessons.unit_id')
                    ->where('units.course_id', $course->id);
            })
            ->count();

        $homeworks = Homework::where('course_id', $course->id)
            ->with('teacher:id,name')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'status', 'due_date', 'teacher_id', 'archived_at', 'created_at'])
            ->map(fn (Homework $h) => [
                'id'          => $h->id,
                'title'       => $h->title,
                'status'      => $h->status,
                'due_date'    => $h->due_date?->toDateString(),
                'archived'    => $h->archived_at !== null,
                'teacher'     => $h->teacher?->name,
                'created_at'  => $h->created_at?->toDateString(),
            ])->values();

        $exams = Exam::where('course_id', $course->id)
            ->with('teacher:id,name')
            ->withCount('questions')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Exam $e) => [
                'id'               => $e->id,
                'title'            => $e->title,
                'status'           => $e->status,
                'duration'         => $e->duration,
                'starts_at'        => $e->starts_at?->toIso8601String(),
                'archived'         => $e->archived_at !== null,
                'questions_count'  => (int) $e->questions_count,
                'teacher'          => $e->teacher?->name,
                'created_at'       => $e->created_at?->toDateString(),
            ])->values();

        $liveClasses = LiveClass::where('course_id', $course->id)
            ->whereNull('archived_at')
            ->with('teacher:id,name')
            ->orderByDesc('scheduled_at')
            ->limit(50)
            ->get(['id', 'title', 'scheduled_at', 'duration_minutes', 'status', 'approval_status', 'session_type', 'teacher_id'])
            ->map(fn (LiveClass $lc) => [
                'id'               => $lc->id,
                'title'            => $lc->title,
                'scheduled_at'     => $lc->scheduled_at?->toIso8601String(),
                'duration_minutes' => $lc->duration_minutes,
                'status'           => $lc->status,
                'approval_status'  => $lc->approval_status,
                'session_type'     => $lc->session_type,
                'teacher'          => $lc->teacher?->name,
            ])->values();

        $students = $this->studentsForCourse($course, $entitlement);

        return response()->json([
            'success' => true,
            'data'    => [
                'course' => [
                    'id'              => $course->id,
                    'title'           => $course->title,
                    'description'     => $course->description,
                    'price'           => $course->price,
                    'is_free'         => $course->is_free,
                    'is_active'       => $course->is_active,
                    'approval_status' => $course->approval_status,
                    'subject'         => $course->subject,
                    'grade'           => $course->grade,
                    'category'        => $course->category,
                    'teacher'         => $course->teacher,
                ],
                'content' => [
                    'units_count'   => $units->count(),
                    'lessons_count' => $lessonsCount,
                    'videos_count'  => $videosCount,
                    'units'         => $units,
                ],
                'homeworks'    => $homeworks,
                'exams'        => $exams,
                'live_classes' => $liveClasses,
                'students'     => $students,
                'counts'       => [
                    'students'     => count($students),
                    'homeworks'    => $homeworks->count(),
                    'exams'        => $exams->count(),
                    'live_classes' => $liveClasses->count(),
                    'units'        => $units->count(),
                ],
            ],
        ]);
    }

    /** @return list<array<string, mixed>> */
    private function studentsForCourse(Course $course, StudentEntitlementService $entitlement): array
    {
        $countryId = $this->countryId();
        $courseId  = (int) $course->id;

        $packageIds = DB::table('package_course')
            ->where('course_id', $courseId)
            ->pluck('package_id');

        if ($course->subject_id) {
            $packageIds = $packageIds->merge(
                DB::table('package_subject')
                    ->where('subject_id', $course->subject_id)
                    ->pluck('package_id')
            );
        }

        $packageIds = $packageIds->unique()->values();

        $candidateIds = collect();

        if ($packageIds->isNotEmpty()) {
            $candidateIds = Subscription::where('country_id', $countryId)
                ->where('status', 'active')
                ->whereDate('ends_at', '>=', now()->toDateString())
                ->whereIn('package_id', $packageIds)
                ->pluck('student_id');
        }

        if ($course->is_free) {
            $gradeId = $course->grade_id ? (int) $course->grade_id : null;
            $freeQuery = User::where('country_id', $countryId)
                ->where('role', 'student')
                ->where('is_active', true);
            if ($gradeId) {
                $freeQuery->where(function ($q) use ($gradeId) {
                    $q->where('grade_id', $gradeId)->orWhereNull('grade_id');
                });
            }
            $candidateIds = $candidateIds->merge($freeQuery->limit(300)->pluck('id'));
        }

        $candidateIds = $candidateIds->unique()->values();
        if ($candidateIds->isEmpty()) {
            return [];
        }

        $users = User::whereIn('id', $candidateIds)
            ->where('role', 'student')
            ->with('grade:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'grade_id', 'is_active']);

        $rows = [];
        foreach ($users as $user) {
            if (! $entitlement->canAccessCourse($user, $course)) {
                continue;
            }
            $activeSub = Subscription::where('student_id', $user->id)
                ->where('status', 'active')
                ->whereDate('ends_at', '>=', now()->toDateString())
                ->with('package:id,name')
                ->latest()
                ->first();

            $rows[] = [
                'id'         => $user->id,
                'name'       => $user->name,
                'phone'      => $user->phone,
                'grade'      => $user->grade?->name,
                'is_active'  => $user->is_active,
                'access_via' => $course->is_free && ! $activeSub ? 'free' : 'subscription',
                'package'    => $activeSub?->package?->name,
                'ends_at'    => $activeSub?->ends_at?->format('Y-m-d'),
            ];
        }

        return $rows;
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
