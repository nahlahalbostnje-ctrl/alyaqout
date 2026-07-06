<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\ExamSubmission;
use App\Models\LiveClass;
use App\Models\Notification;
use App\Models\NotificationBroadcast;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    public function __construct(
        private readonly WaSenderService $waSender,
    ) {}

    public function send(
        User $user,
        string $title,
        string $body,
        string $type = 'general',
        ?array $data = null
    ): Notification {
        // Deduplicate: skip if identical notification was sent within last 30 minutes
        $existing = Notification::where('user_id', $user->id)
            ->where('type', $type)
            ->where('body', $body)
            ->where('created_at', '>=', now()->subMinutes(30))
            ->first();

        if ($existing) {
            return $existing;
        }

        $notification = Notification::create([
            'user_id'    => $user->id,
            'country_id' => $user->country_id,
            'title'      => $title,
            'body'       => $body,
            'type'       => $type,
            'data'       => $data,
            'is_read'    => false,
        ]);

        $this->sendFcmStub($user, $title, $body);

        return $notification;
    }

    public function broadcast(
        int $countryId,
        int $sentBy,
        string $title,
        string $body,
        string $targetType,
        ?string $targetValue = null
    ): NotificationBroadcast {
        $users = $this->resolveTargets($countryId, $targetType, $targetValue);

        foreach ($users as $user) {
            Notification::create([
                'user_id'    => $user->id,
                'country_id' => $countryId,
                'title'      => $title,
                'body'       => $body,
                'type'       => 'broadcast',
                'is_read'    => false,
            ]);

            $this->sendFcmStub($user, $title, $body);
        }

        return NotificationBroadcast::create([
            'sent_by'          => $sentBy,
            'country_id'       => $countryId,
            'title'            => $title,
            'body'             => $body,
            'target_type'      => $targetType,
            'target_value'     => $targetValue,
            'recipients_count' => $users->count(),
        ]);
    }

    private function resolveTargets(int $countryId, string $targetType, ?string $targetValue): Collection
    {
        $query = User::where('country_id', $countryId)
            ->where('is_active', true)
            ->whereNull('deleted_at');

        return match ($targetType) {
            'all'    => $query->whereIn('role', ['student', 'teacher', 'parent'])->get(['id', 'country_id']),
            'role'   => $query->where('role', $targetValue)->get(['id', 'country_id']),
            'grade'  => $query->where('role', 'student')->get(['id', 'country_id']),
            default  => collect(),
        };
    }

    /**
     * Notify absent students after a live class ends.
     * Called by a scheduled job or manually after class completion.
     */
    public function notifyAbsentStudents(LiveClass $liveClass): int
    {
        $absentRecords = AttendanceRecord::where('live_class_id', $liveClass->id)
            ->where('status', 'absent')
            ->with('student')
            ->get();

        foreach ($absentRecords as $record) {
            $student = $record->student;
            if (!$student) continue;

            $this->send(
                $student,
                'غياب عن الحصة',
                "غبت عن حصة: {$liveClass->title}. تواصل مع معلمك للاطلاع على ما فاتك.",
                'absence',
                ['live_class_id' => $liveClass->id]
            );

            // Also notify parent if linked
            if ($student->parent_id) {
                $parent = User::find($student->parent_id);
                if ($parent) {
                    $this->send(
                        $parent,
                        'غياب ابنك عن الحصة',
                        "ابنك {$student->name} غاب عن حصة: {$liveClass->title}.",
                        'absence',
                        ['live_class_id' => $liveClass->id, 'student_id' => $student->id]
                    );
                }
            }
        }

        return $absentRecords->count();
    }

    /**
     * Notify student (and parent) when an exam is graded.
     */
    public function notifyExamResult(ExamSubmission $submission): void
    {
        $student = User::find($submission->student_id);
        if (!$student) return;

        $pct = $submission->total_points > 0
            ? round(($submission->score / $submission->total_points) * 100, 1)
            : 0;

        $this->send(
            $student,
            'نتيجة الامتحان',
            "حصلت على {$submission->score} من {$submission->total_points} ({$pct}%) في الامتحان.",
            'exam_result',
            ['submission_id' => $submission->id, 'score' => $submission->score, 'pct' => $pct]
        );

        if ($student->parent_id) {
            $parent = User::find($student->parent_id);
            if ($parent) {
                $this->send(
                    $parent,
                    'نتيجة امتحان ابنك',
                    "حصل {$student->name} على {$submission->score}/{$submission->total_points} ({$pct}%) في الامتحان.",
                    'exam_result',
                    ['submission_id' => $submission->id, 'student_id' => $student->id]
                );
            }
        }
    }

    /**
     * FCM stub — wire up Firebase when keys are available.
     */
    private function sendFcmStub(User $user, string $title, string $body): void
    {
        // TODO: integrate Firebase Cloud Messaging
        // FcmService::send($user->fcm_token, $title, $body);
    }

    /**
     * Send a WhatsApp text message via WaSenderService.
     */
    public function sendWhatsApp(string $phone, string $message): void
    {
        $this->waSender->sendText($phone, $message);
    }
}
