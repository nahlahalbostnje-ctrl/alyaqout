<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CourseEnrollmentService
{
    /**
     * Grant (or re-activate) a per-course enrollment for a student.
     * Coexists with package entitlement — does not remove package access.
     */
    public function grant(
        User $student,
        Course $course,
        string $source = 'manual',
        ?User $actor = null,
        ?Carbon $endsAt = null,
        ?string $notes = null,
        ?int $subscriptionId = null,
    ): CourseEnrollment {
        if ($student->role !== 'student') {
            throw ValidationException::withMessages([
                'student_id' => ['يمكن تسجيل طلاب فقط.'],
            ]);
        }

        if ((int) $student->country_id !== (int) $course->country_id) {
            throw ValidationException::withMessages([
                'student_id' => ['الطالب والمساق ليسا في نفس الدولة.'],
            ]);
        }

        $enrollment = CourseEnrollment::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        $payload = [
            'source'          => $source,
            'subscription_id' => $subscriptionId,
            'status'          => 'active',
            'starts_at'       => now(),
            'ends_at'         => $endsAt,
            'created_by'      => $actor?->id,
            'notes'           => $notes,
        ];

        if ($enrollment) {
            $enrollment->fill($payload)->save();

            return $enrollment->fresh(['student:id,name', 'course:id,title']);
        }

        return CourseEnrollment::create([
            'student_id' => $student->id,
            'course_id'  => $course->id,
            ...$payload,
        ])->load(['student:id,name', 'course:id,title']);
    }

    public function revoke(CourseEnrollment $enrollment, ?string $notes = null): CourseEnrollment
    {
        $enrollment->status = 'revoked';
        if ($notes !== null) {
            $enrollment->notes = trim(($enrollment->notes ? $enrollment->notes."\n" : '').$notes);
        }
        $enrollment->save();

        return $enrollment->fresh(['student:id,name', 'course:id,title']);
    }

    /** @return Collection<int, int> active enrolled course IDs for student */
    public function activeCourseIdsFor(User $student): Collection
    {
        return CourseEnrollment::query()
            ->active()
            ->where('student_id', $student->id)
            ->pluck('course_id')
            ->map(fn ($id) => (int) $id)
            ->values();
    }

    public function format(CourseEnrollment $e): array
    {
        return [
            'id'              => $e->id,
            'student'         => $e->student
                ? ['id' => $e->student->id, 'name' => $e->student->name]
                : null,
            'course_id'       => $e->course_id,
            'source'          => $e->source,
            'status'          => $e->status,
            'subscription_id' => $e->subscription_id,
            'starts_at'       => $e->starts_at?->toIso8601String(),
            'ends_at'         => $e->ends_at?->toIso8601String(),
            'notes'           => $e->notes,
            'created_at'      => $e->created_at?->toIso8601String(),
        ];
    }
}
