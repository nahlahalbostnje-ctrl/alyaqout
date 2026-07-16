<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TeacherSubjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherSubjectController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeTeacher(User $teacher): void
    {
        if ($teacher->country_id !== $this->countryId() || $teacher->role !== 'teacher') {
            abort(403, 'غير مصرح.');
        }
    }

    public function show(User $teacher): JsonResponse
    {
        $this->authorizeTeacher($teacher);

        $rows = $teacher->teacherSubjects()
            ->with(['subject:id,name,type', 'grades:id,name'])
            ->get()
            ->map(fn ($ts) => [
                'id'         => $ts->id,
                'subject_id' => $ts->subject_id,
                'subject'    => $ts->subject,
                'grade_ids'  => $ts->grades->pluck('id')->values(),
                'grades'     => $ts->grades,
            ]);

        return response()->json(['success' => true, 'data' => $rows]);
    }

    public function sync(Request $request, User $teacher, TeacherSubjectService $service): JsonResponse
    {
        $this->authorizeTeacher($teacher);

        $request->validate([
            'subjects'              => 'present|array',
            'subjects.*.subject_id' => 'required|integer|exists:subjects,id',
            'subjects.*.grade_ids'  => 'nullable|array',
            'subjects.*.grade_ids.*'=> 'integer|exists:grades,id',
        ]);

        $service->syncAssignments($teacher, $request->subjects);

        return $this->show($teacher);
    }
}
