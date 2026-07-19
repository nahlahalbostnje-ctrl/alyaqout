<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Video;
use App\Models\VideoProgress;
use App\Services\GamificationService;
use App\Services\StudentEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseContentController extends Controller
{
    public function __construct(
        private readonly GamificationService $gamification,
        private readonly StudentEntitlementService $entitlement,
    ) {}

    public function courseUnits(Course $course): JsonResponse
    {
        abort_if((int) $course->country_id !== (int) Auth::user()->country_id, 403);
        abort_if(! $course->is_active, 403);
        abort_unless($this->entitlement->canAccessCourse(Auth::user(), $course), 403, 'غير مشترك في هذه الدورة.');

        $studentId = (int) Auth::id();

        $units = $course->units()
            ->with(['lessons.videos'])
            ->get();

        $completedVideoIds = VideoProgress::where('student_id', $studentId)
            ->where('completed', true)
            ->pluck('video_id')
            ->flip();

        $data = $units->map(function ($unit) use ($completedVideoIds) {
            $lessons = $unit->lessons->map(function ($lesson) use ($completedVideoIds) {
                $videos = $lesson->videos->map(fn ($v) => [
                    'id'        => $v->id,
                    'title'     => $v->title,
                    'duration'  => $v->duration,
                    'type'      => $v->type,
                    'is_review' => (bool) $v->is_review,
                    'completed' => isset($completedVideoIds[$v->id]),
                ]);

                return [
                    'id'       => $lesson->id,
                    'title'    => $lesson->title,
                    'videos'   => $videos,
                    'progress' => $lesson->videos->count() > 0
                        ? round($videos->where('completed', true)->count() / $lesson->videos->count() * 100)
                        : 0,
                ];
            });

            $totalVideos    = $unit->lessons->sum(fn ($l) => $l->videos->count());
            $completedCount = $unit->lessons->sum(
                fn ($l) => $l->videos->filter(fn ($v) => isset($completedVideoIds[$v->id]))->count()
            );

            return [
                'id'       => $unit->id,
                'title'    => $unit->title,
                'lessons'  => $lessons,
                'progress' => $totalVideos > 0 ? round($completedCount / $totalVideos * 100) : 0,
            ];
        });

        $totalVideos    = $units->sum(fn ($u) => $u->lessons->sum(fn ($l) => $l->videos->count()));
        $completedCount = $completedVideoIds->count();

        return response()->json([
            'course'    => [
                'id'       => $course->id,
                'title'    => $course->title,
                'progress' => $totalVideos > 0 ? round($completedCount / $totalVideos * 100) : 0,
            ],
            'units'     => $data,
        ]);
    }

    private function assertVideoAccess(Video $video): void
    {
        $course = $video->lesson?->unit?->course
            ?? Course::query()
                ->whereHas('units.lessons.videos', fn ($q) => $q->where('videos.id', $video->id))
                ->first();

        abort_unless($course, 404);
        abort_unless($this->entitlement->canAccessCourse(Auth::user(), $course), 403, 'غير مشترك في هذه الدورة.');
    }

    public function watchVideo(Video $video): JsonResponse
    {
        $video->loadMissing('lesson.unit.course');
        $this->assertVideoAccess($video);

        $studentId = (int) Auth::id();

        $progress = VideoProgress::firstOrNew([
            'student_id' => $studentId,
            'video_id'   => $video->id,
        ]);

        $progress->watched_at = now();
        $progress->save();

        return response()->json([
            'video_url' => $video->video_url,
            'title'     => $video->title,
            'type'      => $video->type,
            'duration'  => $video->duration,
        ]);
    }

    public function markComplete(Request $request, Video $video): JsonResponse
    {
        $video->loadMissing('lesson.unit.course');
        $this->assertVideoAccess($video);

        $studentId = (int) Auth::id();

        $data = $request->validate([
            'watch_duration' => 'nullable|integer|min:0',
        ]);

        $alreadyCompleted = VideoProgress::where('student_id', $studentId)
            ->where('video_id', $video->id)
            ->where('completed', true)
            ->exists();

        VideoProgress::updateOrCreate(
            ['student_id' => $studentId, 'video_id' => $video->id],
            [
                'completed'      => true,
                'watch_duration' => $data['watch_duration'] ?? $video->duration,
                'watched_at'     => now(),
            ]
        );

        if (! $alreadyCompleted) {
            $this->gamification->award($studentId, 'complete_video', $video->title);
        }

        return response()->json(['message' => 'تم تسجيل الإتمام']);
    }
}
