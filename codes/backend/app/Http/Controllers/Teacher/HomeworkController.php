<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeworkController extends Controller
{
    public function __construct(private readonly NotificationService $notif) {}

    public function index(Request $request): JsonResponse
    {
        $teacherId = (int) Auth::id();
        $scope = $request->input('scope', 'active'); // active|archived|all

        $query = Homework::where('teacher_id', $teacherId)
            ->with('course:id,title')
            ->withCount('submissions');

        if ($scope === 'archived') {
            $query->whereNotNull('archived_at');
        } elseif ($scope !== 'all') {
            $query->whereNull('archived_at');
        }

        $homeworks = $query->latest()->get();

        return response()->json([
            'data' => $homeworks->map(fn ($h) => $this->format($h)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $teacherId = (int) Auth::id();

        $data = $request->validate([
            'course_id'   => 'required|integer|exists:courses,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:3000',
            'due_date'    => 'required|date|after_or_equal:today',
        ]);

        $this->assertOwnCourse((int) $data['course_id'], $teacherId);

        $homework = Homework::create([
            'course_id'   => $data['course_id'],
            'teacher_id'  => $teacherId,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'due_date'    => $data['due_date'],
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'تم إنشاء الواجب — بانتظار الموافقة',
            'data'    => $this->format($homework->load('course:id,title')),
        ], 201);
    }

    public function update(Request $request, Homework $homework): JsonResponse
    {
        $this->authorizeHomework($homework);
        abort_if($homework->isArchived(), 422, 'لا يمكن تعديل واجب مؤرشف.');

        $data = $request->validate([
            'course_id'   => 'sometimes|integer|exists:courses,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:3000',
            'due_date'    => 'sometimes|date|after_or_equal:today',
        ]);

        if (isset($data['course_id'])) {
            $this->assertOwnCourse((int) $data['course_id'], (int) Auth::id());
        }

        $payload = collect($data)->only(['course_id', 'title', 'description', 'due_date'])->all();
        if ($homework->status === 'approved') {
            $payload['status'] = 'pending';
        }

        $homework->update($payload);

        return response()->json([
            'message' => $homework->status === 'pending'
                ? 'تم التعديل — بانتظار إعادة الموافقة'
                : 'تم التعديل',
            'data' => $this->format($homework->fresh()->load('course:id,title')->loadCount('submissions')),
        ]);
    }

    public function archive(Homework $homework): JsonResponse
    {
        $this->authorizeHomework($homework);
        abort_if($homework->isArchived(), 422, 'الواجب مؤرشف مسبقاً.');

        $homework->update(['archived_at' => now()]);

        return response()->json([
            'message' => 'تم أرشفة الواجب',
            'data'    => $this->format($homework->fresh()->load('course:id,title')->loadCount('submissions')),
        ]);
    }

    public function submissions(Homework $homework): JsonResponse
    {
        $this->authorizeHomework($homework);

        $subs = $homework->submissions()
            ->with('student:id,name')
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json([
            'data' => $subs->map(fn ($s) => [
                'id'               => $s->id,
                'student'          => ['id' => $s->student->id, 'name' => $s->student->name],
                'file_url'         => $s->file_url,
                'notes'            => $s->notes,
                'grade'            => $s->grade,
                'teacher_feedback' => $s->teacher_feedback,
                'status'           => $s->status,
                'submitted_at'     => $s->submitted_at?->toISOString(),
            ]),
        ]);
    }

    public function grade(Request $request, Homework $homework, HomeworkSubmission $submission): JsonResponse
    {
        $this->authorizeHomework($homework);
        abort_if($submission->homework_id !== $homework->id, 404);

        $data = $request->validate([
            'grade'            => 'required|numeric|min:0|max:100',
            'teacher_feedback' => 'nullable|string|max:1000',
        ]);

        $submission->update([
            'grade'            => $data['grade'],
            'teacher_feedback' => $data['teacher_feedback'] ?? null,
            'status'           => 'graded',
        ]);

        $student = $submission->student()->first();
        if ($student) {
            $this->notif->send(
                $student,
                'تم تصحيح واجبك',
                "حصلت على {$data['grade']} في واجب: {$homework->title}",
                'homework_graded'
            );
        }

        return response()->json(['message' => 'تم التصحيح']);
    }

    private function assertOwnCourse(int $courseId, int $teacherId): void
    {
        $course = Course::findOrFail($courseId);
        abort_if((int) $course->teacher_id !== $teacherId, 403, 'هذه الدورة غير مسندة لك.');
    }

    private function authorizeHomework(Homework $homework): void
    {
        abort_if((int) $homework->teacher_id !== (int) Auth::id(), 403);
    }

    private function format(Homework $h): array
    {
        return [
            'id'                => $h->id,
            'title'             => $h->title,
            'description'       => $h->description,
            'status'            => $h->status,
            'due_date'          => $h->due_date?->toDateString(),
            'archived_at'       => $h->archived_at?->toISOString(),
            'course'            => $h->course ? ['id' => $h->course->id, 'title' => $h->course->title] : null,
            'submissions_count' => $h->submissions_count ?? 0,
            'created_at'        => $h->created_at?->toISOString(),
        ];
    }
}
