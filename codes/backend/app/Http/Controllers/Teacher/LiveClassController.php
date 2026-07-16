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
}
