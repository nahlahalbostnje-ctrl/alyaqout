<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Course;
use App\Models\CoursePurchaseRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CoursePurchaseService
{
    public function __construct(
        private readonly StudentEntitlementService $entitlement,
        private readonly CourseEnrollmentService $enrollments,
    ) {}

    public function request(Course $course, User $student, User $requester, ?string $notes = null): CoursePurchaseRequest
    {
        if ($student->role !== 'student') {
            throw ValidationException::withMessages(['student_id' => ['الطالب غير صالح.']]);
        }

        if ((int) $student->country_id !== (int) $course->country_id) {
            throw ValidationException::withMessages(['course_id' => ['المساق غير متاح في دولة الطالب.']]);
        }

        if (! $course->is_active || $course->approval_status !== 'approved') {
            throw ValidationException::withMessages(['course_id' => ['المساق غير متاح للشراء حالياً.']]);
        }

        if ($course->is_free) {
            throw ValidationException::withMessages(['course_id' => ['هذا المساق مجاني ولا يحتاج شراء.']]);
        }

        if ($this->entitlement->canAccessCourse($student, $course)) {
            throw ValidationException::withMessages(['course_id' => ['الطالب لديه وصول لهذا المساق مسبقاً.']]);
        }

        $pending = CoursePurchaseRequest::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            throw ValidationException::withMessages(['course_id' => ['يوجد طلب شراء معلّق لهذا المساق.']]);
        }

        return CoursePurchaseRequest::create([
            'country_id'   => (int) $course->country_id,
            'student_id'   => $student->id,
            'course_id'    => $course->id,
            'requested_by' => $requester->id,
            'amount'       => $course->price,
            'status'       => 'pending',
            'notes'        => $notes,
        ])->load(['student:id,name,phone', 'course:id,title,price', 'requester:id,name,role']);
    }

    public function approve(CoursePurchaseRequest $request, User $admin, ?string $notes = null): CoursePurchaseRequest
    {
        if ($request->status !== 'pending') {
            throw ValidationException::withMessages(['status' => ['الطلب ليس معلّقاً.']]);
        }

        return DB::transaction(function () use ($request, $admin, $notes) {
            $student = User::findOrFail($request->student_id);
            $course = Course::findOrFail($request->course_id);

            $enrollment = $this->enrollments->grant(
                student: $student,
                course: $course,
                source: 'purchase',
                actor: $admin,
                notes: 'شراء مساق #'.$request->id.($notes ? ' — '.$notes : ''),
            );

            $request->status = 'approved';
            $request->reviewed_by = $admin->id;
            $request->reviewed_at = now();
            $request->enrollment_id = $enrollment->id;
            if ($notes) {
                $request->notes = trim(($request->notes ? $request->notes."\n" : '').$notes);
            }
            $request->save();

            return $request->fresh(['student:id,name,phone', 'course:id,title,price', 'requester:id,name,role']);
        });
    }

    public function reject(CoursePurchaseRequest $request, User $admin, ?string $notes = null): CoursePurchaseRequest
    {
        if ($request->status !== 'pending') {
            throw ValidationException::withMessages(['status' => ['الطلب ليس معلّقاً.']]);
        }

        $request->status = 'rejected';
        $request->reviewed_by = $admin->id;
        $request->reviewed_at = now();
        if ($notes) {
            $request->notes = trim(($request->notes ? $request->notes."\n" : '').$notes);
        }
        $request->save();

        return $request->fresh(['student:id,name,phone', 'course:id,title,price', 'requester:id,name,role']);
    }

    public function format(CoursePurchaseRequest $r): array
    {
        return [
            'id'           => $r->id,
            'status'       => $r->status,
            'amount'       => $r->amount,
            'notes'        => $r->notes,
            'student'      => $r->student
                ? ['id' => $r->student->id, 'name' => $r->student->name, 'phone' => $r->student->phone]
                : null,
            'course'       => $r->course
                ? ['id' => $r->course->id, 'title' => $r->course->title, 'price' => $r->course->price]
                : null,
            'requester'    => $r->requester
                ? ['id' => $r->requester->id, 'name' => $r->requester->name, 'role' => $r->requester->role]
                : null,
            'enrollment_id'=> $r->enrollment_id,
            'reviewed_at'  => $r->reviewed_at?->toIso8601String(),
            'created_at'   => $r->created_at?->toIso8601String(),
        ];
    }
}
