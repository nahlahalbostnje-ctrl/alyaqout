<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    use AuthorizesTeacherCourseContent;

    public function index(Unit $unit): JsonResponse
    {
        $this->assertOwnsUnit($unit);

        $lessons = $unit->lessons()->withCount('videos')->get();

        return response()->json([
            'data' => $lessons->map(fn ($l) => $this->format($l)),
        ]);
    }

    public function store(Request $request, Unit $unit): JsonResponse
    {
        $this->assertOwnsUnit($unit);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $lesson = $unit->lessons()->create([
            'title'      => $data['title'],
            'sort_order' => $data['sort_order'] ?? ($unit->lessons()->max('sort_order') + 1),
        ]);

        return response()->json(['message' => 'تم إنشاء الدرس', 'data' => $this->format($lesson)], 201);
    }

    public function update(Request $request, Unit $unit, Lesson $lesson): JsonResponse
    {
        $this->assertOwnsUnit($unit);
        abort_if($lesson->unit_id !== $unit->id, 404);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $lesson->update($data);

        return response()->json(['message' => 'تم التحديث', 'data' => $this->format($lesson)]);
    }

    public function destroy(Unit $unit, Lesson $lesson): JsonResponse
    {
        $this->assertOwnsUnit($unit);
        abort_if($lesson->unit_id !== $unit->id, 404);

        $lesson->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function format(Lesson $l): array
    {
        return [
            'id'           => $l->id,
            'title'        => $l->title,
            'sort_order'   => $l->sort_order,
            'videos_count' => $l->videos_count ?? 0,
        ];
    }
}
