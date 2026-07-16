<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveClassController extends Controller
{
    private function teacherId(): int
    {
        return (int) auth()->user()->id;
    }

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeOwn(LiveClass $liveClass): void
    {
        abort_if((int) $liveClass->teacher_id !== $this->teacherId(), 403, 'غير مصرح.');
    }

    /** POST /teacher/live-classes — طلب جدولة حصة (بانتظار موافقة الإدارة) */
    public function store(Request $request): JsonResponse
    {
        $teacherId = $this->teacherId();
        $countryId = $this->countryId();

        $request->validate([
            'course_id'        => 'required|integer|exists:courses,id',
            'title'            => 'required|string|max:200',
            'description'      => 'nullable|string',
            'scheduled_at'     => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'session_type'     => 'nullable|in:group,individual',
            'student_id'       => 'required_if:session_type,individual|nullable|integer|exists:users,id',
        ]);

        $course = Course::findOrFail($request->course_id);
        if ($course->country_id !== $countryId || (int) $course->teacher_id !== $teacherId) {
            return response()->json([
                'success' => false,
                'message' => 'هذه الدورة غير مسندة لك.',
            ], 403);
        }

        $sessionType = $request->input('session_type', 'group');
        $studentId   = null;
        if ($sessionType === 'individual') {
            $student = \App\Models\User::findOrFail($request->student_id);
            if ($student->country_id !== $countryId || $student->role !== 'student') {
                return response()->json(['success' => false, 'message' => 'الطالب غير صالح.'], 422);
            }
            $studentId = $student->id;
        }

        $liveClass = LiveClass::create([
            'country_id'       => $countryId,
            'course_id'        => $course->id,
            'teacher_id'       => $teacherId,
            'session_type'     => $sessionType,
            'student_id'       => $studentId,
            'title'            => $request->title,
            'description'      => $request->description,
            'scheduled_at'     => $request->scheduled_at,
            'duration_minutes' => $request->duration_minutes ?? 60,
            'status'           => 'scheduled',
            'approval_status'  => 'pending',
            'agora_channel'    => 'ch'.bin2hex(random_bytes(8)),
        ]);

        $liveClass->load('course:id,title');

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال الحصة بانتظار موافقة الإدارة.',
            'data'    => $liveClass,
        ], 201);
    }

    /** PUT /teacher/live-classes/{liveClass} */
    public function update(Request $request, LiveClass $liveClass): JsonResponse
    {
        $this->authorizeOwn($liveClass);
        abort_if($liveClass->isArchived(), 422, 'لا يمكن تعديل حصة مؤرشفة.');
        abort_if($liveClass->status === 'live', 422, 'لا يمكن تعديل حصة جارية.');

        $data = $request->validate([
            'title'            => 'sometimes|string|max:200',
            'description'      => 'nullable|string',
            'scheduled_at'     => 'sometimes|date|after:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:480',
        ]);

        $payload = collect($data)->only(['title', 'description', 'scheduled_at', 'duration_minutes'])->all();
        if ($liveClass->approval_status === 'approved') {
            $payload['approval_status'] = 'pending';
        }

        $liveClass->update($payload);

        return response()->json([
            'success' => true,
            'message' => $liveClass->fresh()->approval_status === 'pending'
                ? 'تم التعديل — بانتظار إعادة الموافقة'
                : 'تم التعديل',
            'data'    => $liveClass->fresh(['course:id,title']),
        ]);
    }

    /** PATCH /teacher/live-classes/{liveClass}/archive */
    public function archive(LiveClass $liveClass): JsonResponse
    {
        $this->authorizeOwn($liveClass);
        abort_if($liveClass->isArchived(), 422, 'الحصة مؤرشفة مسبقاً.');
        abort_if($liveClass->status === 'live', 422, 'أنهِ الحصة أولاً قبل الأرشفة.');

        $liveClass->update(['archived_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'تم أرشفة الحصة',
            'data'    => $liveClass->fresh(['course:id,title']),
        ]);
    }
}
