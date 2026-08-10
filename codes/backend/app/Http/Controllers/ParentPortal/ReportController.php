<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\User;
use App\Models\VideoProgress;
use App\Services\StudentEntitlementService;
use App\Services\WaSenderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function __construct(
        private readonly WaSenderService $waSender,
        private readonly StudentEntitlementService $entitlement,
    ) {
    }

    private function buildReport(int $studentId): array
    {
        $parent = Auth::user();

        $student = User::where('id', $studentId)
            ->where('parent_id', $parent->id)
            ->firstOrFail();

        // Attendance
        $attendance = AttendanceRecord::where('student_id', $studentId)->get();
        $total     = $attendance->count();
        $present   = $attendance->where('status', 'present')->count();
        $absent    = $attendance->where('status', 'absent')->count();
        $late      = $attendance->where('status', 'late')->count();

        // Exams
        $exams      = ExamSubmission::where('student_id', $studentId)
            ->with('exam:id,title')->latest('submitted_at')->get();
        $graded     = $exams->whereNotNull('score');
        $examAvg    = $graded->isNotEmpty()
            ? round($graded->avg(fn ($e) => $e->total_points > 0 ? ($e->score / $e->total_points) * 100 : 0), 1)
            : null;

        // Homework
        $homework   = HomeworkSubmission::where('student_id', $studentId)
            ->with('homework:id,title')->latest('submitted_at')->get();
        $hwGraded   = $homework->whereNotNull('grade');
        $hwAvg      = $hwGraded->isNotEmpty() ? round($hwGraded->avg('grade'), 1) : null;

        // Progress
        $completedVideos = VideoProgress::where('student_id', $studentId)->where('completed', true)->count();

        return [
            'student' => ['id' => $student->id, 'name' => $student->name, 'phone' => $student->phone],
            'attendance' => [
                'total'   => $total,
                'present' => $present,
                'absent'  => $absent,
                'late'    => $late,
                'rate'    => $total > 0 ? round(($present / $total) * 100, 1) : null,
            ],
            'exams' => [
                'count'   => $exams->count(),
                'average' => $examAvg,
                'recent'  => $graded->take(5)->map(fn ($e) => [
                    'title'  => $e->exam?->title,
                    'score'  => $e->score,
                    'total'  => $e->total_points,
                    'pct'    => $e->total_points > 0 ? round(($e->score / $e->total_points) * 100, 1) : 0,
                    'date'   => $e->submitted_at,
                ])->values()->all(),
            ],
            'homework' => [
                'submitted' => $homework->count(),
                'late'      => $homework->where('status', 'late')->count(),
                'average'   => $hwAvg,
            ],
            'progress' => ['videos_completed' => $completedVideos],
        ];
    }

    public function childReport(int $studentId): JsonResponse
    {
        return response()->json(['data' => $this->buildReport($studentId)]);
    }

    /**
     * Dashboard insight boxes for one child: attendance, upcoming work, notes, improvement.
     */
    public function childInsights(int $studentId): JsonResponse
    {
        $parent = Auth::user();
        $student = User::where('id', $studentId)
            ->where('parent_id', $parent->id)
            ->firstOrFail();

        $report = $this->buildReport($studentId);

        $courseIds = $this->entitlement->entitledCoursesQuery($student)->pluck('id')->all();

        $upcomingExams = [];
        $upcomingHomework = [];
        if ($courseIds !== []) {
            $upcomingExams = Exam::query()
                ->whereIn('course_id', $courseIds)
                ->whereNull('archived_at')
                ->where('status', 'approved')
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '>=', now()->subDay());
                })
                ->with(['course:id,title'])
                ->orderBy('starts_at')
                ->limit(8)
                ->get(['id', 'course_id', 'title', 'starts_at', 'status'])
                ->map(fn (Exam $e) => [
                    'type'  => 'exam',
                    'id'    => $e->id,
                    'title' => $e->title,
                    'course'=> $e->course?->title,
                    'at'    => $e->starts_at?->toIso8601String(),
                ])
                ->values()
                ->all();

            $upcomingHomework = Homework::query()
                ->whereIn('course_id', $courseIds)
                ->whereNull('archived_at')
                ->where('status', 'approved')
                ->where(function ($q) {
                    $q->whereNull('due_date')->orWhere('due_date', '>=', now()->toDateString());
                })
                ->with(['course:id,title'])
                ->orderBy('due_date')
                ->limit(8)
                ->get(['id', 'course_id', 'title', 'due_date', 'status'])
                ->map(fn (Homework $h) => [
                    'type'  => 'homework',
                    'id'    => $h->id,
                    'title' => $h->title,
                    'course'=> $h->course?->title,
                    'at'    => $h->due_date?->toDateString(),
                ])
                ->values()
                ->all();
        }

        $upcoming = collect([...$upcomingExams, ...$upcomingHomework])
            ->sortBy(fn ($row) => $row['at'] ?? '9999')
            ->take(10)
            ->values()
            ->all();

        $notes = HomeworkSubmission::query()
            ->where('student_id', $studentId)
            ->whereNotNull('teacher_feedback')
            ->where('teacher_feedback', '!=', '')
            ->with(['homework:id,title,course_id', 'homework.course:id,title'])
            ->latest('submitted_at')
            ->limit(8)
            ->get()
            ->map(fn (HomeworkSubmission $s) => [
                'id'      => $s->id,
                'note'    => $s->teacher_feedback,
                'source'  => 'واجب: '.($s->homework?->title ?? '—'),
                'course'  => $s->homework?->course?->title,
                'at'      => $s->submitted_at,
            ])
            ->values()
            ->all();

        $examAvg = $report['exams']['average'];
        $hwAvg = $report['homework']['average'];
        $attRate = $report['attendance']['rate'];
        $videos = $report['progress']['videos_completed'];

        $scoreParts = array_values(array_filter([
            is_numeric($examAvg) ? (float) $examAvg : null,
            is_numeric($hwAvg) ? (float) $hwAvg : null,
            is_numeric($attRate) ? (float) $attRate : null,
        ], fn ($v) => $v !== null));
        $overall = $scoreParts !== [] ? round(array_sum($scoreParts) / count($scoreParts), 1) : null;

        $improvementLabel = 'لا توجد بيانات كافية بعد';
        $improvementTone = 'neutral';
        if ($overall !== null) {
            if ($overall >= 75) {
                $improvementLabel = 'أداء جيد ومستقر';
                $improvementTone = 'good';
            } elseif ($overall >= 50) {
                $improvementLabel = 'يحتاج متابعة خفيفة';
                $improvementTone = 'warn';
            } else {
                $improvementLabel = 'يحتاج تدخلاً ومتابعة';
                $improvementTone = 'alert';
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'student' => $report['student'],
                'attendance' => $report['attendance'],
                'upcoming' => $upcoming,
                'teacher_notes' => $notes,
                'improvement' => [
                    'overall' => $overall,
                    'label'   => $improvementLabel,
                    'tone'    => $improvementTone,
                    'exam_avg'=> $examAvg,
                    'hw_avg'  => $hwAvg,
                    'attendance_rate' => $attRate,
                    'videos_completed' => $videos,
                ],
            ],
        ]);
    }

    private function renderPdf(int $studentId)
    {
        $data = $this->buildReport($studentId);

        return Pdf::loadView('reports.child-report', [
            ...$data,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ])->setPaper('a4');
    }

    public function downloadPdf(int $studentId): Response
    {
        $pdf = $this->renderPdf($studentId);

        return $pdf->download("report-{$studentId}-" . now()->format('Ymd') . '.pdf');
    }

    public function sendPdfViaWhatsapp(int $studentId): JsonResponse
    {
        $parent = Auth::user();

        if (empty($parent->phone)) {
            return response()->json(['success' => false, 'message' => 'لا يوجد رقم واتساب مسجل لحسابك.'], 422);
        }

        $data     = $this->buildReport($studentId);
        $fileName = "report-{$studentId}-" . now()->format('Ymd') . '.pdf';
        $path     = "reports/{$fileName}";

        $pdf = $this->renderPdf($studentId);
        Storage::disk('public')->put($path, $pdf->output());

        $publicUrl = Storage::disk('public')->url($path);

        $caption = "📋 التقرير الأكاديمي لـ {$data['student']['name']} — منصة الياقوت التعليمية";
        $sent    = $this->waSender->sendDocument($parent->phone, $publicUrl, $fileName, $caption);

        if (!$sent) {
            return response()->json(['success' => false, 'message' => 'تعذّر إرسال التقرير عبر واتساب حالياً.'], 502);
        }

        return response()->json(['success' => true, 'message' => 'تم إرسال التقرير عبر واتساب بنجاح.']);
    }
}
