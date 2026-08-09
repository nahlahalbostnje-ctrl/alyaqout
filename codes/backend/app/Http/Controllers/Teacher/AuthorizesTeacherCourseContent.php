<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Support\Facades\Auth;

trait AuthorizesTeacherCourseContent
{
    protected function assertOwnsCourse(Course $course): void
    {
        abort_unless((int) $course->teacher_id === (int) Auth::id(), 403, 'هذه الدورة ليست لك.');
    }

    protected function assertOwnsUnit(Unit $unit): Course
    {
        $course = Course::findOrFail($unit->course_id);
        $this->assertOwnsCourse($course);

        return $course;
    }

    protected function assertOwnsLesson(Lesson $lesson): Course
    {
        $lesson->loadMissing('unit');
        abort_unless($lesson->unit, 404);

        return $this->assertOwnsUnit($lesson->unit);
    }
}
