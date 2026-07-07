<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\LiveClass;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendClassReminders extends Command
{
    protected $signature   = 'yaqoot:class-reminders';
    protected $description = 'إرسال تذكير (إشعار + واتساب) قبل 15 دقيقة من بدء كل حصة مباشرة';

    public function __construct(private NotificationService $notif)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        // نافذة 10-20 دقيقة قبل الموعد — تلتقط كل حصة مرة واحدة تقريباً عند تشغيل الأمر كل 5 دقائق
        $windowStart = now()->addMinutes(10);
        $windowEnd   = now()->addMinutes(20);

        $classes = LiveClass::where('status', 'scheduled')
            ->whereBetween('scheduled_at', [$windowStart, $windowEnd])
            ->with(['course:id,title', 'teacher:id,name,phone'])
            ->get();

        $sent = 0;

        foreach ($classes as $class) {
            $when = $class->scheduled_at->format('h:i A');
            $courseTitle = $class->course->title ?? $class->title;

            $students = $class->session_type === 'individual'
                ? User::where('id', $class->student_id)->get()
                : User::where('country_id', $class->country_id)->where('role', 'student')->where('is_active', true)->get();

            foreach ($students as $student) {
                $body = "حصتك «{$courseTitle}» تبدأ الساعة {$when} — لا تفوّتها!";

                $this->notif->send($student, 'تذكير: حصتك تبدأ بعد 15 دقيقة ⏰', $body, 'class_reminder', ['live_class_id' => $class->id]);

                if (!empty($student->phone)) {
                    $this->notif->sendWhatsApp($student->phone, "⏰ *تذكير ياقوت*\n{$body}");
                }

                if ($student->parent_id) {
                    $parent = User::find($student->parent_id);
                    if ($parent) {
                        $this->notif->send(
                            $parent,
                            'تذكير: حصة ابنك بعد 15 دقيقة ⏰',
                            "حصة {$student->name} «{$courseTitle}» تبدأ الساعة {$when}.",
                            'class_reminder',
                            ['live_class_id' => $class->id, 'student_id' => $student->id]
                        );
                    }
                }

                $sent++;
            }
        }

        $this->info("Class reminders sent: {$sent} (across " . $classes->count() . ' classes).');
    }
}
