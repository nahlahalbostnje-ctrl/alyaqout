<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use App\Models\Exam;
use App\Models\Homework;
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
            'type'       => 'nullable|in:exam,homework,all',
            'country_id' => 'nullable|exists:countries,id',
        ]);

        $status = $request->input('status', 'pending');
        $type   = $request->input('type', 'all');
        $countryId = $request->filled('country_id') ? (int) $request->country_id : null;

        $items = collect();

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

        $sorted = $items->sortByDesc('created_at')->values();

        return response()->json([
            'success' => true,
            'data'    => $sorted,
            'meta'    => [
                'pending_exams'      => Exam::where('status', 'pending')->count(),
                'pending_homeworks'  => Homework::where('status', 'pending')->count(),
                'approved_exams'     => Exam::where('status', 'approved')->count(),
                'approved_homeworks' => Homework::where('status', 'approved')->count(),
                'rejected_exams'     => Exam::where('status', 'rejected')->count(),
                'rejected_homeworks' => Homework::where('status', 'rejected')->count(),
            ],
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
}
