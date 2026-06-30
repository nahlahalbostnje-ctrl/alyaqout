<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\User;
use App\Services\DailyReportService;
use App\Services\NotificationService;
use App\Services\WaSenderService;
use Illuminate\Console\Command;

class SendDailyReports extends Command
{
    protected $signature   = 'yaqoot:daily-reports';
    protected $description = 'إرسال تقارير يومية لأولياء الأمور عبر الإشعارات والواتساب';

    public function __construct(
        private NotificationService $notif,
        private WaSenderService     $wa,
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $today = now()->toDateString();
        $parents = User::where('role', 'parent')->where('is_active', true)->get();
        $sent = 0;

        foreach ($parents as $parent) {
            $children = User::where('parent_id', $parent->id)
                            ->where('role', 'student')
                            ->get(['id', 'name']);

            if ($children->isEmpty()) continue;

            $waLines = ["📋 *تقرير ياقوت اليومي — {$today}*\n"];

            foreach ($children as $child) {
                $attendToday = AttendanceRecord::where('student_id', $child->id)
                    ->whereDate('date', $today)->first();
                $attendStatus = match($attendToday?->status) {
                    'present' => '✅ حاضر',
                    'absent'  => '❌ غائب',
                    'late'    => '⏰ متأخر',
                    default   => '—',
                };

                $hwDone = HomeworkSubmission::where('student_id', $child->id)
                    ->whereDate('submitted_at', $today)->count();

                $lastExam = ExamSubmission::where('student_id', $child->id)
                    ->latest('submitted_at')->first();
                $examLine = $lastExam
                    ? "آخر اختبار: {$lastExam->score}%"
                    : 'لا يوجد اختبار حديث';

                $waLines[] = "👤 *{$child->name}*";
                $waLines[] = "  الحضور: {$attendStatus}";
                $waLines[] = "  الواجبات المسلّمة اليوم: {$hwDone}";
                $waLines[] = "  {$examLine}";
                $waLines[] = '';
            }

            $waLines[] = "🔗 تابع تفاصيل أكثر عبر تطبيق ياقوت";
            $body = implode("\n", $waLines);

            // In-app notification
            $this->notif->send(
                $parent,
                'تقريرك اليومي من ياقوت 📋',
                $body,
                'daily_report',
            );

            // WhatsApp if phone exists
            if (!empty($parent->phone)) {
                $this->wa->sendText($parent->phone, $body);
            }

            $sent++;
        }

        $this->info("Daily reports sent to {$sent} parents.");
    }
}
