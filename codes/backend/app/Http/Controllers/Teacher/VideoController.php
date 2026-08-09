<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    use AuthorizesTeacherCourseContent;

    public function index(Lesson $lesson): JsonResponse
    {
        $this->assertOwnsLesson($lesson);

        $videos = $lesson->videos()->get();

        return response()->json([
            'data' => $videos->map(fn ($v) => $this->format($v)),
        ]);
    }

    public function store(Request $request, Lesson $lesson): JsonResponse
    {
        $this->assertOwnsLesson($lesson);

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
        $this->assertOwnsLesson($lesson);
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
        $this->assertOwnsLesson($lesson);
        abort_if($video->lesson_id !== $lesson->id, 404);

        $video->delete();

        return response()->json(['message' => 'تم الحذف']);
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
