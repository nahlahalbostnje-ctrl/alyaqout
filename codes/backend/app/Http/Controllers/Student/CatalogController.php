<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePurchaseRequest;
use App\Services\CourseCompletionService;
use App\Services\StudentEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CatalogController extends Controller
{
    public function __construct(
        private readonly StudentEntitlementService $entitlement,
        private readonly CourseCompletionService $completion,
    ) {}

    public function index(): JsonResponse
    {
        $student = Auth::user();
        $entitledIds = array_fill_keys($this->entitlement->courseIdsFor($student), true);

        $courses = Course::query()
            ->where('country_id', (int) $student->country_id)
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->with([
                'subject:id,name,type',
                'grade:id,name',
                'category:id,name',
                'teacher:id,name',
            ])
            ->withCount(['units'])
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get([
                'id', 'category_id', 'subject_id', 'grade_id', 'teacher_id',
                'title', 'description', 'thumbnail', 'price', 'is_free', 'sort_order',
            ]);

        $progressMap = $this->completion->progressByCourse(
            (int) $student->id,
            $courses->pluck('id')->map(fn ($id) => (int) $id)->all()
        );

        $data = $courses->map(function (Course $course) use ($entitledIds, $progressMap) {
            $id = (int) $course->id;
            $entitled = isset($entitledIds[$id]);
            $progress = $progressMap[$id] ?? null;

            return [
                'id'          => $course->id,
                'title'       => $course->title,
                'description' => $course->description,
                'thumbnail'   => $course->thumbnail,
                'price'       => $course->price,
                'is_free'     => (bool) $course->is_free,
                'units_count' => (int) $course->units_count,
                'category'    => $course->category,
                'subject'     => $course->subject,
                'grade'       => $course->grade,
                'teacher'     => $course->teacher,
                'is_entitled' => $entitled,
                'progress'    => $entitled ? ($progress['progress'] ?? 0) : null,
                'is_complete' => $entitled ? (bool) ($progress['is_complete'] ?? false) : false,
            ];
        })->values();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show(Course $course): JsonResponse
    {
        $student = Auth::user();
        abort_unless((int) $course->country_id === (int) $student->country_id, 404);
        abort_unless($course->is_active && $course->isApproved(), 404);

        $course->load([
            'subject:id,name,type',
            'grade:id,name',
            'category:id,name',
            'teacher:id,name',
            'units' => fn ($q) => $q->orderBy('sort_order')->with([
                'lessons' => fn ($lq) => $lq->orderBy('sort_order')->withCount('videos'),
            ]),
        ]);

        $entitled = $this->entitlement->canAccessCourse($student, $course);
        $progress = $entitled
            ? $this->completion->progressForCourse((int) $student->id, (int) $course->id)
            : null;

        $purchasePending = ! $entitled && CoursePurchaseRequest::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->exists();

        $canRequestPurchase = ! $entitled
            && ! $course->is_free
            && ! $purchasePending;

        $units = $course->units->map(function ($unit) use ($entitled) {
            $lessons = $unit->lessons->map(fn ($lesson) => [
                'id'           => $lesson->id,
                'title'        => $lesson->title,
                'videos_count' => (int) $lesson->videos_count,
            ]);

            return [
                'id'            => $unit->id,
                'title'         => $unit->title,
                'lessons_count' => $lessons->count(),
                'lessons'       => $lessons,
                // لا نكشف روابط التشغيل لغير المخوّلين
                'locked'        => ! $entitled,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $course->id,
                'title'       => $course->title,
                'description' => $course->description,
                'thumbnail'   => $course->thumbnail,
                'price'       => $course->price,
                'is_free'     => (bool) $course->is_free,
                'category'    => $course->category,
                'subject'     => $course->subject,
                'grade'       => $course->grade,
                'teacher'     => $course->teacher,
                'is_entitled' => $entitled,
                'progress'    => $progress['progress'] ?? null,
                'is_complete' => $progress['is_complete'] ?? false,
                'total_videos'=> $progress['total_videos'] ?? null,
                'units'       => $units,
                'content_path'=> $entitled ? '/student/courses/'.$course->id.'/content' : null,
                'packages_hint'=> $entitled ? null : 'هذا المساق متاح ضمن الباقات أو بشراء منفرد بعد موافقة الإدارة.',
                'purchase_pending' => $purchasePending,
                'can_request_purchase' => $canRequestPurchase,
            ],
        ]);
    }
}
