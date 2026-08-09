<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(
        private readonly CourseCompletionService $completion,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * يصدر شهادة عند اكتمال المساق — مرة واحدة لكل طالب/مساق.
     */
    public function issueIfEligible(User $student, Course $course): ?Certificate
    {
        $existing = Certificate::query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        $progress = $this->completion->progressForCourse((int) $student->id, (int) $course->id);
        if (! $progress['is_complete']) {
            return null;
        }

        $certificate = Certificate::create([
            'user_id'       => $student->id,
            'course_id'     => $course->id,
            'code'          => $this->uniqueCode(),
            'student_name'  => $student->name,
            'course_title'  => $course->title,
            'issued_at'     => now(),
            'meta'          => [
                'total_videos'     => $progress['total_videos'],
                'completed_videos' => $progress['completed_videos'],
                'progress'         => $progress['progress'],
            ],
        ]);

        $this->notifications->send(
            $student,
            'شهادة إتمام مساق',
            "أحسنت! حصلت على شهادة إتمام مساق «{$course->title}».",
            'certificate',
            [
                'certificate_id' => $certificate->id,
                'code'           => $certificate->code,
                'course_id'      => $course->id,
            ]
        );

        return $certificate;
    }

    public function findByCode(string $code): ?Certificate
    {
        return Certificate::query()
            ->where('code', strtoupper(trim($code)))
            ->first();
    }

    private function uniqueCode(): string
    {
        do {
            $code = 'YG-'.strtoupper(Str::random(10));
        } while (Certificate::where('code', $code)->exists());

        return $code;
    }
}
