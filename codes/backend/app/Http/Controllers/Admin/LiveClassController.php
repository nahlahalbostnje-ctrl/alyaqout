<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LiveClassController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorize(LiveClass $liveClass): void
    {
        if ($liveClass->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = LiveClass::where('country_id', $this->countryId())
            ->with([
                'course:id,title',
                'teacher:id,name',
                'student:id,name',
            ])
            ->orderBy('scheduled_at', 'desc');

        $scope = $request->input('scope', 'active');
        if ($scope === 'archived') {
            $query->whereNotNull('archived_at');
        } elseif ($scope !== 'all') {
            $query->whereNull('archived_at');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'course_id'        => 'required|integer|exists:courses,id',
            'teacher_id'       => 'required|integer|exists:users,id',
            'title'            => 'required|string|max:200',
            'description'      => 'nullable|string',
            'scheduled_at'     => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'meeting_link'     => 'nullable|url',
            'session_type'     => 'nullable|in:group,individual',
            'student_id'       => 'required_if:session_type,individual|nullable|integer|exists:users,id',
        ]);

        // Verify course belongs to this country
        $course = Course::findOrFail($request->course_id);
        if ($course->country_id !== $countryId) abort(403);

        // Verify teacher belongs to this country
        $teacher = User::findOrFail($request->teacher_id);
        if ($teacher->country_id !== $countryId || $teacher->role !== 'teacher') {
            abort(422, 'المعلم غير موجود في دولتك.');
        }

        $sessionType = $request->input('session_type', 'group');
        $studentId   = null;
        if ($sessionType === 'individual') {
            $student = User::findOrFail($request->student_id);
            if ($student->country_id !== $countryId || $student->role !== 'student') {
                abort(422, 'الطالب غير موجود في دولتك.');
            }
            $studentId = $student->id;
        }

        $liveClass = LiveClass::create([
            'country_id'       => $countryId,
            'course_id'        => $request->course_id,
            'teacher_id'       => $request->teacher_id,
            'session_type'     => $sessionType,
            'student_id'       => $studentId,
            'title'            => $request->title,
            'description'      => $request->description,
            'scheduled_at'     => $request->scheduled_at,
            'duration_minutes' => $request->duration_minutes ?? 60,
            'status'           => 'scheduled',
            'approval_status'  => 'approved',
            'meeting_link'     => $request->meeting_link,
            'agora_channel'    => 'ch' . bin2hex(random_bytes(8)),
        ]);

        $liveClass->load(['course:id,title', 'teacher:id,name', 'student:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'تم جدولة الحصة بنجاح.',
            'data'    => $liveClass,
        ], 201);
    }

    public function updateStatus(Request $request, LiveClass $liveClass): JsonResponse
    {
        $this->authorize($liveClass);

        $request->validate([
            'status' => 'required|in:scheduled,live,ended',
        ]);

        $liveClass->update(['status' => $request->status]);

        return response()->json(['success' => true, 'data' => $liveClass]);
    }

    public function update(Request $request, LiveClass $liveClass): JsonResponse
    {
        $this->authorize($liveClass);

        $request->validate([
            'title'            => 'sometimes|string|max:200',
            'description'      => 'nullable|string',
            'scheduled_at'     => 'sometimes|date',
            'duration_minutes' => 'sometimes|integer|min:15|max:480',
            'meeting_link'     => 'nullable|url',
        ]);

        $liveClass->update($request->only('title', 'description', 'scheduled_at', 'duration_minutes', 'meeting_link'));

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $liveClass]);
    }

    public function destroy(LiveClass $liveClass): JsonResponse
    {
        $this->authorize($liveClass);
        $liveClass->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الحصة.']);
    }

    public function archive(LiveClass $liveClass): JsonResponse
    {
        $this->authorize($liveClass);
        abort_if($liveClass->isArchived(), 422, 'الحصة مؤرشفة مسبقاً.');
        abort_if($liveClass->status === 'live', 422, 'أنهِ الحصة أولاً قبل الأرشفة.');

        $liveClass->update(['archived_at' => now()]);

        return response()->json(['success' => true, 'message' => 'تم أرشفة الحصة.', 'data' => $liveClass->fresh()]);
    }
}
