<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LiveClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherContentController extends Controller
{
    private function countryId(): int
    {
        return (int) Auth::user()->country_id;
    }

    /** GET /admin/teacher-content/homeworks */
    public function homeworks(Request $request): JsonResponse
    {
        $scope = $request->input('scope', 'active');
        $query = Homework::whereHas('course', fn ($q) => $q->where('country_id', $this->countryId()))
            ->with(['course:id,title', 'teacher:id,name'])
            ->withCount('submissions')
            ->latest();

        if ($scope === 'archived') {
            $query->whereNotNull('archived_at');
        } elseif ($scope !== 'all') {
            $query->whereNull('archived_at');
        }

        return response()->json([
            'data' => $query->get()->map(fn (Homework $h) => [
                'id'                => $h->id,
                'title'             => $h->title,
                'status'            => $h->status,
                'due_date'          => $h->due_date?->toDateString(),
                'archived_at'       => $h->archived_at?->toIso8601String(),
                'course'            => $h->course ? ['id' => $h->course->id, 'title' => $h->course->title] : null,
                'teacher'           => $h->teacher ? ['id' => $h->teacher->id, 'name' => $h->teacher->name] : null,
                'submissions_count' => $h->submissions_count ?? 0,
                'created_at'        => $h->created_at?->toIso8601String(),
            ]),
        ]);
    }

    /** PATCH /admin/teacher-content/homeworks/{homework}/archive */
    public function archiveHomework(Homework $homework): JsonResponse
    {
        $this->assertHomeworkCountry($homework);
        abort_if($homework->isArchived(), 422, 'الواجب مؤرشف مسبقاً.');
        $homework->update(['archived_at' => now()]);

        return response()->json(['message' => 'تم أرشفة الواجب']);
    }

    /** DELETE /admin/teacher-content/homeworks/{homework} */
    public function destroyHomework(Homework $homework): JsonResponse
    {
        $this->assertHomeworkCountry($homework);
        $homework->delete();

        return response()->json(['message' => 'تم حذف الواجب نهائياً']);
    }

    /** GET /admin/teacher-content/exams */
    public function exams(Request $request): JsonResponse
    {
        $scope = $request->input('scope', 'active');
        $query = Exam::whereHas('course', fn ($q) => $q->where('country_id', $this->countryId()))
            ->with(['course:id,title', 'teacher:id,name'])
            ->withCount(['questions', 'submissions'])
            ->latest();

        if ($scope === 'archived') {
            $query->whereNotNull('archived_at');
        } elseif ($scope !== 'all') {
            $query->whereNull('archived_at');
        }

        return response()->json([
            'data' => $query->get()->map(fn (Exam $e) => [
                'id'                => $e->id,
                'title'             => $e->title,
                'status'            => $e->status,
                'duration'          => $e->duration,
                'archived_at'       => $e->archived_at?->toIso8601String(),
                'course'            => $e->course ? ['id' => $e->course->id, 'title' => $e->course->title] : null,
                'teacher'           => $e->teacher ? ['id' => $e->teacher->id, 'name' => $e->teacher->name] : null,
                'questions_count'   => $e->questions_count ?? 0,
                'submissions_count' => $e->submissions_count ?? 0,
                'created_at'        => $e->created_at?->toIso8601String(),
            ]),
        ]);
    }

    /** PATCH /admin/teacher-content/exams/{exam}/archive */
    public function archiveExam(Exam $exam): JsonResponse
    {
        $this->assertExamCountry($exam);
        abort_if($exam->isArchived(), 422, 'الامتحان مؤرشف مسبقاً.');
        $exam->update(['archived_at' => now()]);

        return response()->json(['message' => 'تم أرشفة الامتحان']);
    }

    /** DELETE /admin/teacher-content/exams/{exam} */
    public function destroyExam(Exam $exam): JsonResponse
    {
        $this->assertExamCountry($exam);
        $exam->delete();

        return response()->json(['message' => 'تم حذف الامتحان نهائياً']);
    }

    private function assertHomeworkCountry(Homework $homework): void
    {
        $homework->loadMissing('course:id,country_id');
        abort_if((int) $homework->course?->country_id !== $this->countryId(), 403);
    }

    private function assertExamCountry(Exam $exam): void
    {
        $exam->loadMissing('course:id,country_id');
        abort_if((int) $exam->course?->country_id !== $this->countryId(), 403);
    }
}
