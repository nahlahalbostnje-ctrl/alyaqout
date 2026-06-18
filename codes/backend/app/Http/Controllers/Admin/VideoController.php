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

    public function store(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorizeLesson($lesson);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'video_url'  => 'required|string|max:2048',
            'duration'   => 'nullable|integer|min:0',
            'type'       => 'nullable|in:video,pdf,attachment',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $video = $lesson->videos()->create([
            'title'      => $data['title'],
            'video_url'  => $data['video_url'],
            'duration'   => $data['duration'] ?? 0,
            'type'       => $data['type'] ?? 'video',
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
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $video->update($data);

        return response()->json(['message' => 'تم التحديث', 'data' => $this->format($video)]);
    }

    public function destroy(Lesson $lesson, Video $video): JsonResponse
    {
        $this->authorizeLesson($lesson);
        abort_if($video->lesson_id !== $lesson->id, 404);

        $video->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function authorizeLesson(Lesson $lesson): void
    {
        $countryId = $lesson->unit()->with('course:id,country_id')->first()?->course?->country_id;
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
            'sort_order' => $v->sort_order,
        ];
    }
}
