<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use App\Services\CourseEnrollmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseEnrollmentController extends Controller
{
    public function __construct(
        private readonly CourseEnrollmentService $enrollments,
    ) {}

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function assertCourse(Course $course): void
    {
        abort_unless((int) $course->country_id === $this->countryId(), 404);
    }

    /** GET /admin/courses/{course}/enrollments */
    public function index(Course $course): JsonResponse
    {
        $this->assertCourse($course);

        $rows = CourseEnrollment::query()
            ->where('course_id', $course->id)
            ->with('student:id,name')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $rows->map(fn (CourseEnrollment $e) => $this->enrollments->format($e))->values(),
        ]);
    }

    /** POST /admin/courses/{course}/enrollments */
    public function store(Request $request, Course $course): JsonResponse
    {
        $this->assertCourse($course);

        $data = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'source'     => 'nullable|in:manual,purchase,package',
            'ends_at'    => 'nullable|date|after:today',
            'notes'      => 'nullable|string|max:1000',
        ]);

        $student = User::findOrFail($data['student_id']);
        abort_unless(
            $student->role === 'student' && (int) $student->country_id === $this->countryId(),
            422,
            'الطالب غير صالح لهذه الدولة.'
        );

        $enrollment = $this->enrollments->grant(
            student: $student,
            course: $course,
            source: $data['source'] ?? 'manual',
            actor: auth()->user(),
            endsAt: isset($data['ends_at']) ? Carbon::parse($data['ends_at'])->endOfDay() : null,
            notes: $data['notes'] ?? null,
        );

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الطالب في المساق.',
            'data'    => $this->enrollments->format($enrollment),
        ], 201);
    }

    /** PATCH /admin/enrollments/{enrollment}/revoke */
    public function revoke(Request $request, CourseEnrollment $enrollment): JsonResponse
    {
        $course = Course::findOrFail($enrollment->course_id);
        $this->assertCourse($course);

        $data = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $updated = $this->enrollments->revoke($enrollment, $data['notes'] ?? 'أُلغي بواسطة الإدارة');

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء تسجيل المساق.',
            'data'    => $this->enrollments->format($updated),
        ]);
    }
}
