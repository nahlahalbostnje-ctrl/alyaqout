<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class TeacherSubjectService
{
    /**
     * Ensure teacher is assigned to subject (+ grade when required).
     * No-op when teacherId is null (unassign allowed).
     */
    public function assertCanTeach(?int $teacherId, int $subjectId, ?int $gradeId): void
    {
        if ($teacherId === null) {
            return;
        }

        $teacher = User::find($teacherId);
        if (! $teacher || $teacher->role !== 'teacher') {
            throw ValidationException::withMessages([
                'teacher_id' => ['المعلم غير صالح.'],
            ]);
        }

        $ts = TeacherSubject::where('teacher_id', $teacherId)
            ->where('subject_id', $subjectId)
            ->first();

        if (! $ts) {
            throw ValidationException::withMessages([
                'teacher_id' => ['هذا المعلم غير مسند لهذه المادة.'],
            ]);
        }

        $subject = Subject::find($subjectId);
        if (! $subject) {
            throw ValidationException::withMessages([
                'subject_id' => ['المادة غير موجودة.'],
            ]);
        }

        // Curriculum always needs grade match; extracurricular only if grade set
        if ($gradeId === null) {
            if ($subject->type === 'curriculum') {
                throw ValidationException::withMessages([
                    'grade_id' => ['الصف مطلوب للمواد المنهجية.'],
                ]);
            }

            return;
        }

        $assignedGrades = $ts->grades()->pluck('grades.id');
        if ($assignedGrades->isEmpty()) {
            // No grade restriction on assignment = all subject grades OK if subject allows
            $subjectAllows = $subject->grades()->where('grades.id', $gradeId)->exists()
                || ($subject->type === 'extracurricular' && ! $subject->grades()->exists());

            if (! $subjectAllows) {
                throw ValidationException::withMessages([
                    'grade_id' => ['هذا الصف غير مرتبط بالمادة.'],
                ]);
            }

            return;
        }

        if (! $assignedGrades->contains($gradeId)) {
            throw ValidationException::withMessages([
                'teacher_id' => ['هذا المعلم غير مسند لهذا الصف ضمن المادة.'],
            ]);
        }
    }

    public function syncAssignments(User $teacher, array $assignments): void
    {
        $keepIds = [];

        foreach ($assignments as $row) {
            $subjectId = (int) $row['subject_id'];
            $gradeIds  = array_values(array_unique(array_map('intval', $row['grade_ids'] ?? [])));

            $subject = Subject::where('id', $subjectId)
                ->where('country_id', $teacher->country_id)
                ->firstOrFail();

            $allowedGradeIds = $subject->grades()->pluck('grades.id')->all();
            if ($subject->type === 'curriculum' && $allowedGradeIds === []) {
                throw ValidationException::withMessages([
                    'subjects' => ["المادة «{$subject->name}» لا تملك صفوفاً مرتبطة."],
                ]);
            }

            if ($allowedGradeIds !== []) {
                foreach ($gradeIds as $gid) {
                    if (! in_array($gid, $allowedGradeIds, true)) {
                        throw ValidationException::withMessages([
                            'subjects' => ["صف غير مسموح لمادة «{$subject->name}»."],
                        ]);
                    }
                }
            }

            $ts = TeacherSubject::firstOrCreate([
                'teacher_id' => $teacher->id,
                'subject_id' => $subjectId,
            ]);
            $ts->grades()->sync($gradeIds);
            $keepIds[] = $ts->id;
        }

        TeacherSubject::where('teacher_id', $teacher->id)
            ->whereNotIn('id', $keepIds)
            ->delete();
    }
}
