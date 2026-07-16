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

class TeacherApprovalController extends Controller
{
    public function pendingExams(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $exams = Exam::whereHas('course', fn ($q) => $q->where('country_id', $countryId))
            ->where('status', 'pending')
            ->with([
                'course:id,title',
                'teacher:id,name',
            ])
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'course_id', 'teacher_id', 'duration', 'created_at']);

        return response()->json(['exams' => $exams]);
    }

    public function approveExam(Request $request, Exam $exam): JsonResponse
    {
        $this->authorizeExam($exam);

        $request->validate(['status' => 'required|in:approved,rejected']);

        $exam->update(['status' => $request->status]);

        return response()->json([
            'message' => $request->status === 'approved' ? 'تم قبول الامتحان ونشره للطلاب' : 'تم رفض الامتحان',
        ]);
    }

    public function pendingHomeworks(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $homeworks = Homework::whereHas('course', fn ($q) => $q->where('country_id', $countryId))
            ->where('status', 'pending')
            ->with([
                'course:id,title',
                'teacher:id,name',
            ])
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'course_id', 'teacher_id', 'due_date', 'created_at']);

        return response()->json(['homeworks' => $homeworks]);
    }

    public function approveHomework(Request $request, Homework $homework): JsonResponse
    {
        $this->authorizeHomework($homework);

        $request->validate(['status' => 'required|in:approved,rejected']);

        $homework->update(['status' => $request->status]);

        return response()->json([
            'message' => $request->status === 'approved' ? 'تم قبول الواجب ونشره للطلاب' : 'تم رفض الواجب',
        ]);
    }

    public function pendingLiveClasses(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $classes = LiveClass::where('country_id', $countryId)
            ->where('approval_status', 'pending')
            ->with([
                'course:id,title',
                'teacher:id,name',
            ])
            ->orderByDesc('created_at')
            ->get([
                'id', 'title', 'course_id', 'teacher_id',
                'scheduled_at', 'duration_minutes', 'created_at',
            ]);

        return response()->json(['live_classes' => $classes]);
    }

    public function approveLiveClass(Request $request, LiveClass $liveClass): JsonResponse
    {
        abort_if((int) $liveClass->country_id !== (int) Auth::user()->country_id, 403);

        $request->validate(['status' => 'required|in:approved,rejected']);

        $liveClass->update(['approval_status' => $request->status]);

        return response()->json([
            'message' => $request->status === 'approved'
                ? 'تم قبول الحصة ونشرها للطلاب'
                : 'تم رفض الحصة',
        ]);
    }

    private function authorizeExam(Exam $exam): void
    {
        $countryId = Auth::user()->country_id;
        abort_if($exam->course->country_id !== $countryId, 403);
    }

    private function authorizeHomework(Homework $homework): void
    {
        $countryId = Auth::user()->country_id;
        abort_if($homework->course->country_id !== $countryId, 403);
    }
}
