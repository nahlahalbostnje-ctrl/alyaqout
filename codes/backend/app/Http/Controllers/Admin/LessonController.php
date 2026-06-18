<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonController extends Controller
{
    public function index(Unit $unit): JsonResponse
    {
        $this->authorizeUnit($unit);

        $lessons = $unit->lessons()->withCount('videos')->get();

        return response()->json([
            'data' => $lessons->map(fn ($l) => $this->format($l)),
        ]);
    }

    public function store(Request $request, Unit $unit): JsonResponse
    {
        $this->authorizeUnit($unit);

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
        $this->authorizeUnit($unit);
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
        $this->authorizeUnit($unit);
        abort_if($lesson->unit_id !== $unit->id, 404);

        $lesson->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function authorizeUnit(Unit $unit): void
    {
        $countryId = $unit->course()->value('country_id');
        abort_if((int) $countryId !== (int) Auth::user()->country_id, 403);
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
