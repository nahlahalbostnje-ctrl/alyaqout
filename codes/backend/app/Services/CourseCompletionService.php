<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * تقدّم إتمام محتوى المساق على مستوى الفيديوهات (VideoProgress.completed).
 */
class CourseCompletionService
{
    /**
     * @param  list<int>  $courseIds
     * @return array<int, array{total_videos:int, completed_videos:int, progress:int, is_complete:bool}>
     */
    public function progressByCourse(int $studentId, array $courseIds): array
    {
        $courseIds = array_values(array_unique(array_map('intval', $courseIds)));
        if ($courseIds === []) {
            return [];
        }

        $totals = DB::table('videos')
            ->join('lessons', 'lessons.id', '=', 'videos.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->whereIn('units.course_id', $courseIds)
            ->groupBy('units.course_id')
            ->selectRaw('units.course_id as course_id, COUNT(videos.id) as total')
            ->pluck('total', 'course_id');

        $completed = DB::table('video_progress')
            ->join('videos', 'videos.id', '=', 'video_progress.video_id')
            ->join('lessons', 'lessons.id', '=', 'videos.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->where('video_progress.student_id', $studentId)
            ->where('video_progress.completed', true)
            ->whereIn('units.course_id', $courseIds)
            ->groupBy('units.course_id')
            ->selectRaw('units.course_id as course_id, COUNT(DISTINCT videos.id) as done')
            ->pluck('done', 'course_id');

        $out = [];
        foreach ($courseIds as $id) {
            $total = (int) ($totals[$id] ?? 0);
            $done = min((int) ($completed[$id] ?? 0), $total);
            $percent = $total > 0 ? (int) round(($done / $total) * 100) : 0;
            $out[$id] = [
                'total_videos'     => $total,
                'completed_videos' => $done,
                'progress'         => $percent,
                'is_complete'      => $total > 0 && $done >= $total,
            ];
        }

        return $out;
    }

    /**
     * @return array{total_videos:int, completed_videos:int, progress:int, is_complete:bool}
     */
    public function progressForCourse(int $studentId, int $courseId): array
    {
        return $this->progressByCourse($studentId, [$courseId])[$courseId]
            ?? [
                'total_videos'     => 0,
                'completed_videos' => 0,
                'progress'         => 0,
                'is_complete'      => false,
            ];
    }

    /**
     * ألحق حقول التقدّم على مجموعة مساقات Eloquent/DTO.
     *
     * @param  Collection<int, object>  $courses
     * @return Collection<int, object>
     */
    public function appendToCourses(int $studentId, Collection $courses): Collection
    {
        $ids = $courses->pluck('id')->map(fn ($id) => (int) $id)->all();
        $map = $this->progressByCourse($studentId, $ids);

        return $courses->map(function ($course) use ($map) {
            $id = (int) $course->id;
            $p = $map[$id] ?? [
                'total_videos'     => 0,
                'completed_videos' => 0,
                'progress'         => 0,
                'is_complete'      => false,
            ];

            $course->setAttribute('total_videos', $p['total_videos']);
            $course->setAttribute('completed_videos', $p['completed_videos']);
            $course->setAttribute('progress', $p['progress']);
            $course->setAttribute('is_complete', $p['is_complete']);

            return $course;
        });
    }
}
