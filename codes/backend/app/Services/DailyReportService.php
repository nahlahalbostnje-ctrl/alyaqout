<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\User;

/**
 * Generates fixed-format daily WhatsApp reports.
 *
 * Templates
 * ---------
 * - parent_summary   : Overview of one child for a parent
 * - teacher_daily    : Teacher's class summary for a day
 * - admin_overview   : Platform-wide daily metrics for admin
 */
class DailyReportService
{
    public function parentSummary(int $parentId, string $childName, int $childId): string
    {
        $date = now()->format('Y-m-d');
        $dateAr = now()->locale('ar')->isoFormat('dddd، D MMMM YYYY');

        $attend = AttendanceRecord::where('student_id', $childId)->whereDate('date', $date)->first();
        $attendStatus = match($attend?->status) {
            'present' => '✅ حاضر',
            'absent'  => '❌ غائب',
            'late'    => '⏰ متأخر',
            default   => '— لم يُسجَّل بعد',
        };

        $hwCount    = HomeworkSubmission::where('student_id', $childId)->whereDate('submitted_at', $date)->count();
        $totalHw    = HomeworkSubmission::where('student_id', $childId)->count();
        $lastExam   = ExamSubmission::where('student_id', $childId)->latest('submitted_at')->first();
        $examLine   = $lastExam ? "آخر اختبار: *{$lastExam->score}%*" : 'لا توجد اختبارات حديثة';

        $totalPresent = AttendanceRecord::where('student_id', $childId)->where('status', 'present')->count();
        $totalDays    = AttendanceRecord::where('student_id', $childId)->count();
        $attendPct    = $totalDays > 0 ? round($totalPresent / $totalDays * 100) : 0;

        return <<<MSG
        ┌─────────────────────────┐
        │  📋 تقرير يومي — ياقوت  │
        └─────────────────────────┘

        👤 *{$childName}*
        📅 {$dateAr}

        ─────────────────────────
        🏫 *الحضور اليوم:* {$attendStatus}
        📚 *الواجبات المسلّمة:* {$hwCount} واجب
        📊 *{$examLine}*
        📈 *نسبة الحضور الإجمالية:* {$attendPct}%
        ─────────────────────────

        📱 تابع تقدم {$childName} من تطبيق ياقوت.
        MSG;
    }

    public function teacherDailyReport(int $teacherId, string $teacherName): string
    {
        $date    = now()->format('Y-m-d');
        $dateAr  = now()->locale('ar')->isoFormat('dddd، D MMMM YYYY');

        // Students linked to teacher's courses (simplified: all students)
        $totalStudents = User::where('role', 'student')->where('is_active', true)->count();
        $presentToday  = AttendanceRecord::whereDate('date', $date)->where('status', 'present')->count();
        $hwSubmitted   = HomeworkSubmission::whereDate('submitted_at', $date)->count();
        $examsToday    = ExamSubmission::whereDate('submitted_at', $date)->count();
        $avgScore      = ExamSubmission::whereDate('submitted_at', $date)->avg('score');
        $avgScoreStr   = $avgScore ? round($avgScore) . '%' : 'لا يوجد';

        return <<<MSG
        ┌──────────────────────────┐
        │  👨‍🏫 تقرير المعلم — ياقوت │
        └──────────────────────────┘

        🧑‍🏫 *{$teacherName}*
        📅 {$dateAr}

        ─────────────────────────
        👥 *الطلاب الكلي:*       {$totalStudents}
        ✅ *حضور اليوم:*         {$presentToday}
        📝 *واجبات مسلّمة:*      {$hwSubmitted}
        📋 *اختبارات أُجريت:*    {$examsToday}
        📊 *متوسط الدرجات:*      {$avgScoreStr}
        ─────────────────────────

        💡 استمر في رفع مستوى التفاعل!
        MSG;
    }

    public function adminOverview(): string
    {
        $date   = now()->format('Y-m-d');
        $dateAr = now()->locale('ar')->isoFormat('dddd، D MMMM YYYY');

        $students  = User::where('role', 'student')->where('is_active', true)->count();
        $teachers  = User::where('role', 'teacher')->where('is_active', true)->count();
        $parents   = User::where('role', 'parent')->where('is_active', true)->count();
        $newUsers  = User::whereDate('created_at', $date)->count();
        $present   = AttendanceRecord::whereDate('date', $date)->where('status', 'present')->count();
        $hwToday   = HomeworkSubmission::whereDate('submitted_at', $date)->count();
        $examsToday = ExamSubmission::whereDate('submitted_at', $date)->count();

        return <<<MSG
        ╔══════════════════════════╗
        ║  🏫 ملخص ياقوت اليومي  ║
        ╚══════════════════════════╝

        📅 {$dateAr}

        👥 *المستخدمون*
        ┣ طلاب: {$students}
        ┣ معلمون: {$teachers}
        ┣ أولياء أمور: {$parents}
        ┗ منضمون اليوم: +{$newUsers}

        📊 *نشاط اليوم*
        ┣ طلاب حاضرون: {$present}
        ┣ واجبات مسلّمة: {$hwToday}
        ┗ اختبارات أُجريت: {$examsToday}

        ─────────────────────────
        🔗 لوحة تحكم ياقوت — تقرير {$date}
        MSG;
    }
}
