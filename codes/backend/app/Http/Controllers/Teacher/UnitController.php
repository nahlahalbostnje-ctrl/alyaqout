<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    use AuthorizesTeacherCourseContent;

    public function index(Course $course): JsonResponse
    {
        $this->assertOwnsCourse($course);

        $units = $course->units()->withCount('lessons')->get();

        return response()->json([
            'data' => $units->map(fn ($u) => $this->format($u)),
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->assertOwnsCourse($course);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $unit = $course->units()->create([
            'title'      => $data['title'],
            'sort_order' => $data['sort_order'] ?? ($course->units()->max('sort_order') + 1),
        ]);

        return response()->json(['message' => 'تم إنشاء الوحدة', 'data' => $this->format($unit)], 201);
    }

    public function update(Request $request, Course $course, Unit $unit): JsonResponse
    {
        $this->assertOwnsCourse($course);
        abort_if($unit->course_id !== $course->id, 404);

        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $unit->update($data);

        return response()->json(['message' => 'تم التحديث', 'data' => $this->format($unit)]);
    }

    public function destroy(Course $course, Unit $unit): JsonResponse
    {
        $this->assertOwnsCourse($course);
        abort_if($unit->course_id !== $course->id, 404);

        $unit->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function format(Unit $u): array
    {
        return [
            'id'            => $u->id,
            'title'         => $u->title,
            'sort_order'    => $u->sort_order,
            'lessons_count' => $u->lessons_count ?? 0,
        ];
    }
}
