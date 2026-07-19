<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VideoController extends Controller
{
    public function index(Lesson $lesson): JsonResponse
    {
        $this->authorizeLesson($lesson);

        $videos = $lesson->videos()->get();

        return response()->json([
            'data' => $videos->map(fn ($v) => $this->format($v)),
        ]);
    }

    /** كل فيديوهات المراجعة في دولة الأدمن. */
    public function reviewIndex(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $videos = Video::query()
            ->where('is_review', true)
            ->with([
                'lesson:id,unit_id,title',
                'lesson.unit:id,course_id,title',
                'lesson.unit.course:id,title,country_id',
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->filter(fn (Video $v) => (int) ($v->lesson?->unit?->course?->country_id) === $countryId)
            ->values();

        return response()->json([
            'data' => $videos->map(fn (Video $v) => [
                ...$this->format($v),
                'course_id'    => $v->lesson?->unit?->course?->id,
                'course_title' => $v->lesson?->unit?->course?->title,
                'lesson_id'    => $v->lesson_id,
                'lesson_title' => $v->lesson?->title,
                'unit_title'   => $v->lesson?->unit?->title,
            ]),
        ]);
    }

    public function store(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorizeLesson($lesson);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'video_url'  => 'required|string|max:2048',
            'duration'   => 'nullable|integer|min:0',
            'type'       => 'nullable|in:video,pdf,attachment',
            'is_review'  => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $video = $lesson->videos()->create([
            'title'      => $data['title'],
            'video_url'  => $data['video_url'],
            'duration'   => $data['duration'] ?? 0,
            'type'       => $data['type'] ?? 'video',
            'is_review'  => (bool) ($data['is_review'] ?? false),
            'sort_order' => $data['sort_order'] ?? ($lesson->videos()->max('sort_order') + 1),
        ]);

        return response()->json(['message' => 'تم إضافة المحتوى', 'data' => $this->format($video)], 201);
    }

    public function update(Request $request, Lesson $lesson, Video $video): JsonResponse
    {
        $this->authorizeLesson($lesson);
        abort_if($video->lesson_id !== $lesson->id, 404);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'video_url'  => 'required|string|max:2048',
            'duration'   => 'nullable|integer|min:0',
            'type'       => 'nullable|in:video,pdf,attachment',
            'is_review'  => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $video->update([
            'title'      => $data['title'],
            'video_url'  => $data['video_url'],
            'duration'   => $data['duration'] ?? $video->duration,
            'type'       => $data['type'] ?? $video->type,
            'is_review'  => array_key_exists('is_review', $data)
                ? (bool) $data['is_review']
                : $video->is_review,
            'sort_order' => $data['sort_order'] ?? $video->sort_order,
        ]);

        return response()->json(['message' => 'تم التحديث', 'data' => $this->format($video->fresh())]);
    }

    public function destroy(Lesson $lesson, Video $video): JsonResponse
    {
        $this->authorizeLesson($lesson);
        abort_if($video->lesson_id !== $lesson->id, 404);

        $video->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    public function setReviewFlag(Request $request, Video $video): JsonResponse
    {
        $this->authorizeVideoCountry($video);

        $data = $request->validate([
            'is_review' => 'required|boolean',
        ]);

        $video->update(['is_review' => (bool) $data['is_review']]);

        return response()->json([
            'message' => $video->is_review ? 'أُضيف لقسم المراجعة' : 'أُزيل من قسم المراجعة',
            'data'    => $this->format($video->fresh()),
        ]);
    }

    private function authorizeLesson(Lesson $lesson): void
    {
        $countryId = $lesson->unit()->with('course:id,country_id')->first()?->course?->country_id;
        abort_if((int) $countryId !== (int) Auth::user()->country_id, 403);
    }

    private function authorizeVideoCountry(Video $video): void
    {
        $video->loadMissing('lesson.unit.course:id,country_id');
        $countryId = $video->lesson?->unit?->course?->country_id;
        abort_if((int) $countryId !== (int) Auth::user()->country_id, 403);
    }

    private function format(Video $v): array
    {
        return [
            'id'         => $v->id,
            'title'      => $v->title,
            'video_url'  => $v->video_url,
            'duration'   => $v->duration,
            'type'       => $v->type,
            'is_review'  => (bool) $v->is_review,
            'sort_order' => $v->sort_order,
        ];
    }
}
