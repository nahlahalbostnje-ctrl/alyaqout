<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Course;
use App\Models\Video;
use Illuminate\Http\Exceptions\HttpResponseException;

class CoursePublishGate
{
    /**
     * يمنع اعتماد مساق بلا وحدة واحدة على الأقل وعنصر محتوى (فيديو/pdf) واحد.
     */
    public function assertReadyForApproval(Course $course): void
    {
        $unitsCount = $course->units()->count();
        $videosCount = Video::query()
            ->whereHas('lesson.unit', fn ($q) => $q->where('course_id', $course->id))
            ->count();

        if ($unitsCount < 1 || $videosCount < 1) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'لا يمكن اعتماد المساق قبل إضافة وحدة واحدة على الأقل ومحتوى واحد (فيديو أو ملف) داخل درس.',
                'errors'  => [
                    'units_count'  => $unitsCount,
                    'videos_count' => $videosCount,
                ],
            ], 422));
        }
    }

    /** @return array{units_count:int, videos_count:int, ready:bool} */
    public function summary(Course $course): array
    {
        $unitsCount = $course->units()->count();
        $videosCount = Video::query()
            ->whereHas('lesson.unit', fn ($q) => $q->where('course_id', $course->id))
            ->count();

        return [
            'units_count'  => $unitsCount,
            'videos_count' => $videosCount,
            'ready'        => $unitsCount >= 1 && $videosCount >= 1,
        ];
    }
}
