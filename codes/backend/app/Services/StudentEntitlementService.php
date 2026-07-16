<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Course;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Resolves which courses a student may access from active package subscriptions.
 * Free courses in the student's country/grade remain available without a paid plan.
 */
class StudentEntitlementService
{
    /** @return list<int> */
    public function courseIdsFor(User $student): array
    {
        return $this->entitledCoursesQuery($student)->pluck('id')->map(fn ($id) => (int) $id)->all();
    }

    public function canAccessCourse(User $student, Course|int $course): bool
    {
        $courseId = $course instanceof Course ? (int) $course->id : (int) $course;

        return in_array($courseId, $this->courseIdsFor($student), true);
    }

    public function entitledCoursesQuery(User $student): Builder
    {
        $countryId = (int) $student->country_id;
        $gradeId   = $student->grade_id ? (int) $student->grade_id : null;

        $base = Course::query()
            ->where('country_id', $countryId)
            ->where('is_active', true)
            ->where('approval_status', 'approved');

        $freeIds = (clone $base)
            ->where('is_free', true)
            ->where(function ($q) use ($gradeId) {
                $this->applyGradeVisibility($q, $gradeId);
            })
            ->pluck('id');

        $packageIds = $this->activePackageIds($student);
        if ($packageIds->isEmpty()) {
            return Course::query()->whereIn('id', $freeIds);
        }

        $directCourseIds = Course::query()
            ->whereIn('id', function ($q) use ($packageIds) {
                $q->select('course_id')
                    ->from('package_course')
                    ->whereIn('package_id', $packageIds);
            })
            ->where('country_id', $countryId)
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->pluck('id');

        $subjectIds = DB::table('package_subject')
            ->whereIn('package_id', $packageIds)
            ->pluck('subject_id');

        $subjectCourseIds = collect();
        if ($subjectIds->isNotEmpty()) {
            $subjectCourseIds = (clone $base)
                ->whereIn('subject_id', $subjectIds)
                ->where(function ($q) use ($gradeId) {
                    $this->applyGradeVisibility($q, $gradeId);
                })
                ->pluck('id');
        }

        $allIds = $freeIds
            ->merge($directCourseIds)
            ->merge($subjectCourseIds)
            ->unique()
            ->values();

        return Course::query()->whereIn('id', $allIds);
    }

    /** Active subscriptions for the student (status + not expired). */
    public function activeSubscriptions(User $student): Collection
    {
        return Subscription::where('student_id', $student->id)
            ->where('status', 'active')
            ->whereDate('ends_at', '>=', now()->toDateString())
            ->with(['package:id,name,duration_days,price'])
            ->latest()
            ->get();
    }

    /** @return Collection<int, int> */
    private function activePackageIds(User $student): Collection
    {
        return $this->activeSubscriptions($student)->pluck('package_id')->unique()->values();
    }

    private function applyGradeVisibility($q, ?int $gradeId): void
    {
        $q->where(function ($inner) use ($gradeId) {
            $inner->where(function ($extra) use ($gradeId) {
                $extra->whereHas('subject', fn ($s) => $s->where('type', 'extracurricular')->where('is_active', true))
                    ->where(function ($g) use ($gradeId) {
                        $g->whereNull('grade_id');
                        if ($gradeId) {
                            $g->orWhere('grade_id', $gradeId);
                        }
                    });
            });

            if ($gradeId) {
                $inner->orWhere(function ($curr) use ($gradeId) {
                    $curr->where('grade_id', $gradeId)
                        ->where(function ($s) {
                            $s->whereHas('subject', fn ($sub) => $sub->where('type', 'curriculum')->where('is_active', true))
                                ->orWhereNull('subject_id');
                        });
                })->orWhere(function ($legacy) use ($gradeId) {
                    $legacy->whereNull('subject_id')
                        ->whereNull('grade_id')
                        ->whereHas('category', fn ($c) => $c->where('grade_id', $gradeId));
                });
            }
        });
    }
}
