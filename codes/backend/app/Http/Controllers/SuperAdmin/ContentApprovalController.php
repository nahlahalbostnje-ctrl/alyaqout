<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LiveClass;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentApprovalController extends Controller
{
    /** GET /super-admin/approvals?status=&type=&country_id= */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'     => 'nullable|in:pending,approved,rejected,all',
            'type'       => 'nullable|in:exam,homework,live_class,course,all',
            'country_id' => 'nullable|exists:countries,id',
        ]);

        $status = $request->input('status', 'pending');
        $type   = $request->input('type', 'all');
        $countryId = $request->filled('country_id') ? (int) $request->country_id : null;

        $items = collect();

        if ($type === 'all' || $type === 'course') {
            $courseQuery = Course::query()
                ->with([
                    'country:id,name',
                    'teacher:id,name',
                    'subject:id,name',
                ])
                ->orderByDesc('created_at');

            if ($status !== 'all') {
                $courseQuery->where('approval_status', $status);
            }
            if ($countryId) {
                $courseQuery->where('country_id', $countryId);
            }

            foreach ($courseQuery->get() as $course) {
                $items->push($this->formatCourse($course));
            }
        }

        if ($type === 'all' || $type === 'exam') {
            $examQuery = Exam::query()
                ->with([
                    'course:id,title,country_id',
                    'course.country:id,name',
                    'teacher:id,name',
                ])
                ->orderByDesc('created_at');

            if ($status !== 'all') {
                $examQuery->where('status', $status);
            }
            if ($countryId) {
                $examQuery->whereHas('course', fn ($q) => $q->where('country_id', $countryId));
            }

            foreach ($examQuery->get() as $exam) {
                $items->push($this->formatExam($exam));
            }
        }

        if ($type === 'all' || $type === 'homework') {
            $hwQuery = Homework::query()
                ->with([
                    'course:id,title,country_id',
                    'course.country:id,name',
                    'teacher:id,name',
                ])
                ->orderByDesc('created_at');

            if ($status !== 'all') {
                $hwQuery->where('status', $status);
            }
            if ($countryId) {
                $hwQuery->whereHas('course', fn ($q) => $q->where('country_id', $countryId));
            }

            foreach ($hwQuery->get() as $hw) {
                $items->push($this->formatHomework($hw));
            }
        }

        if ($type === 'all' || $type === 'live_class') {
            $lcQuery = LiveClass::query()
                ->with([
                    'course:id,title',
                    'country:id,name',
                    'teacher:id,name',
                ])
                ->orderByDesc('created_at');

            if ($status !== 'all') {
                $lcQuery->where('approval_status', $status);
            }
            if ($countryId) {
                $lcQuery->where('country_id', $countryId);
            }

            foreach ($lcQuery->get() as $lc) {
                $items->push($this->formatLiveClass($lc));
            }
        }

        $sorted = $items->sortByDesc('created_at')->values();

        return response()->json([
            'success' => true,
            'data'    => $sorted,
            'meta'    => [
                'pending_exams'         => Exam::where('status', 'pending')->count(),
                'pending_homeworks'     => Homework::where('status', 'pending')->count(),
                'pending_live_classes'  => LiveClass::where('approval_status', 'pending')->count(),
                'pending_courses'       => Course::where('approval_status', 'pending')->count(),
                'approved_exams'        => Exam::where('status', 'approved')->count(),
                'approved_homeworks'    => Homework::where('status', 'approved')->count(),
                'approved_live_classes' => LiveClass::where('approval_status', 'approved')->count(),
                'approved_courses'      => Course::where('approval_status', 'approved')->count(),
                'rejected_exams'        => Exam::where('status', 'rejected')->count(),
                'rejected_homeworks'    => Homework::where('status', 'rejected')->count(),
                'rejected_live_classes' => LiveClass::where('approval_status', 'rejected')->count(),
                'rejected_courses'      => Course::where('approval_status', 'rejected')->count(),
            ],
        ]);
    }

    /** PATCH /super-admin/approvals/courses/{course} */
    public function decideCourse(Request $request, Course $course): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $approved = $request->status === 'approved';

        ActivityLogger::withoutLogging(function () use ($request, $course, $approved): void {
            $course->update([
                'approval_status' => $request->status,
                'is_active'       => $approved,
            ]);
        });
        $course->load(['country:id,name', 'teacher:id,name', 'subject:id,name']);

        AdminActionLog::record(
            $approved ? 'approve_course' : 'reject_course',
            'Course',
            $course->id,
            $course->title
        );

        return response()->json([
            'success' => true,
            'message' => $approved ? 'تم اعتماد الدورة.' : 'تم رفض الدورة.',
            'data'    => $this->formatCourse($course),
        ]);
    }

    /** PATCH /super-admin/approvals/exams/{exam} */
    public function decideExam(Request $request, Exam $exam): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        ActivityLogger::withoutLogging(function () use ($request, $exam): void {
            $exam->update(['status' => $request->status]);
        });
        $exam->load(['course:id,title,country_id', 'course.country:id,name', 'teacher:id,name']);

        AdminActionLog::record(
            $request->status === 'approved' ? 'approve_exam' : 'reject_exam',
            'Exam',
            $exam->id,
            $exam->title
        );

        return response()->json([
            'success' => true,
            'message' => $request->status === 'approved' ? 'تم اعتماد الامتحان.' : 'تم رفض الامتحان.',
            'data'    => $this->formatExam($exam),
        ]);
    }

    /** PATCH /super-admin/approvals/homeworks/{homework} */
    public function decideHomework(Request $request, Homework $homework): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        ActivityLogger::withoutLogging(function () use ($request, $homework): void {
            $homework->update(['status' => $request->status]);
        });
        $homework->load(['course:id,title,country_id', 'course.country:id,name', 'teacher:id,name']);

        AdminActionLog::record(
            $request->status === 'approved' ? 'approve_homework' : 'reject_homework',
            'Homework',
            $homework->id,
            $homework->title
        );

        return response()->json([
            'success' => true,
            'message' => $request->status === 'approved' ? 'تم اعتماد الواجب.' : 'تم رفض الواجب.',
            'data'    => $this->formatHomework($homework),
        ]);
    }

    /** PATCH /super-admin/approvals/live-classes/{liveClass} */
    public function decideLiveClass(Request $request, LiveClass $liveClass): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        ActivityLogger::withoutLogging(function () use ($request, $liveClass): void {
            $liveClass->update(['approval_status' => $request->status]);
        });
        $liveClass->load(['course:id,title', 'country:id,name', 'teacher:id,name']);

        AdminActionLog::record(
            $request->status === 'approved' ? 'approve_live_class' : 'reject_live_class',
            'LiveClass',
            $liveClass->id,
            $liveClass->title
        );

        return response()->json([
            'success' => true,
            'message' => $request->status === 'approved' ? 'تم اعتماد الحصة.' : 'تم رفض الحصة.',
            'data'    => $this->formatLiveClass($liveClass),
        ]);
    }

    private function formatCourse(Course $course): array
    {
        return [
            'id'           => $course->id,
            'kind'         => 'course',
            'title'        => $course->title,
            'course'       => $course->subject?->name,
            'country'      => $course->country?->name,
            'country_id'   => $course->country_id,
            'teacher'      => $course->teacher?->name,
            'status'       => $course->approval_status,
            'created_at'   => $course->created_at?->toIso8601String(),
        ];
    }

    private function formatExam(Exam $exam): array
    {
        return [
            'id'           => $exam->id,
            'kind'         => 'exam',
            'title'        => $exam->title,
            'course'       => $exam->course?->title,
            'country'      => $exam->course?->country?->name,
            'country_id'   => $exam->course?->country_id,
            'teacher'      => $exam->teacher?->name,
            'status'       => $exam->status,
            'created_at'   => $exam->created_at?->toIso8601String(),
        ];
    }

    private function formatHomework(Homework $hw): array
    {
        return [
            'id'           => $hw->id,
            'kind'         => 'homework',
            'title'        => $hw->title,
            'course'       => $hw->course?->title,
            'country'      => $hw->course?->country?->name,
            'country_id'   => $hw->course?->country_id,
            'teacher'      => $hw->teacher?->name,
            'status'       => $hw->status,
            'due_date'     => $hw->due_date?->toDateString(),
            'created_at'   => $hw->created_at?->toIso8601String(),
        ];
    }

    private function formatLiveClass(LiveClass $lc): array
    {
        return [
            'id'           => $lc->id,
            'kind'         => 'live_class',
            'title'        => $lc->title,
            'course'       => $lc->course?->title,
            'country'      => $lc->country?->name,
            'country_id'   => $lc->country_id,
            'teacher'      => $lc->teacher?->name,
            'status'       => $lc->approval_status,
            'scheduled_at' => $lc->scheduled_at?->toIso8601String(),
            'created_at'   => $lc->created_at?->toIso8601String(),
        ];
    }
}
