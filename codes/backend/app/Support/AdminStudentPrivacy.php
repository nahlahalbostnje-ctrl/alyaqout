<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Region-admin visibility for students: name + registered courses only.
 * Contact PII (phone, email, address) is Super Admin-only.
 */
final class AdminStudentPrivacy
{
    /** @return array{id: int, name: string} */
    public static function brief(?User $student): ?array
    {
        if (! $student) {
            return null;
        }

        return [
            'id'   => (int) $student->id,
            'name' => (string) $student->name,
        ];
    }

    /**
     * @return list<array{id: int, title: string}>
     */
    public static function activeCourses(User $student): array
    {
        $enrollments = $student->relationLoaded('courseEnrollments')
            ? $student->courseEnrollments
            : CourseEnrollment::query()
                ->active()
                ->where('student_id', $student->id)
                ->with('course:id,title')
                ->get();

        return $enrollments
            ->filter(fn (CourseEnrollment $e) => $e->isCurrentlyActive() && $e->course)
            ->map(fn (CourseEnrollment $e) => [
                'id'    => (int) $e->course->id,
                'title' => (string) $e->course->title,
            ])
            ->unique('id')
            ->values()
            ->all();
    }

    /**
     * Safe payload for region-admin student lists.
     *
     * @return array<string, mixed>
     */
    public static function listItem(User $student): array
    {
        return [
            'id'        => (int) $student->id,
            'name'      => (string) $student->name,
            'role'      => 'student',
            'is_active' => (bool) $student->is_active,
            'created_at'=> $student->created_at,
            'courses'   => self::activeCourses($student),
        ];
    }

    /**
     * Strip contact fields from an arbitrary student array (defense in depth).
     *
     * @param  array<string, mixed>|null  $student
     * @return array<string, mixed>|null
     */
    public static function scrubArray(?array $student): ?array
    {
        if ($student === null) {
            return null;
        }

        unset($student['phone'], $student['email'], $student['address'], $student['parent_phone'], $student['city_id']);

        return $student;
    }

    /**
     * @param  Collection<int, User>  $users
     * @return Collection<int, array<string, mixed>>
     */
    public static function mapList(Collection $users): Collection
    {
        return $users->map(function (User $u) {
            if ($u->role === 'student') {
                return self::listItem($u);
            }

            return [
                'id'         => $u->id,
                'name'       => $u->name,
                'phone'      => $u->phone,
                'email'      => $u->email,
                'role'       => $u->role,
                'address'    => $u->address,
                'city_id'    => $u->city_id,
                'is_active'  => $u->is_active,
                'created_at' => $u->created_at,
            ];
        });
    }
}
