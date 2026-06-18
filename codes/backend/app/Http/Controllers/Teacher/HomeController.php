<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    private function teacherId(): int
    {
        return (int) auth()->user()->id;
    }

    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    public function dashboard(): JsonResponse
    {
        $teacher   = auth()->user();
        $teacherId = $this->teacherId();

        $courses = Course::where('teacher_id', $teacherId)
            ->where('is_active', true)
            ->with(['category:id,name,grade_id', 'category.grade:id,name'])
            ->orderBy('sort_order')
            ->get(['id', 'category_id', 'title', 'price', 'is_free', 'thumbnail']);

        $upcoming = LiveClass::where('teacher_id', $teacherId)
            ->whereIn('status', ['scheduled', 'live'])
            ->with(['course:id,title'])
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'teacher'  => ['id' => $teacher->id, 'name' => $teacher->name],
                'courses'  => $courses,
                'upcoming' => $upcoming,
            ],
        ]);
    }

    public function courses(): JsonResponse
    {
        $courses = Course::where('teacher_id', $this->teacherId())
            ->with(['category:id,name,grade_id', 'category.grade:id,name'])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $courses]);
    }

    public function liveClasses(): JsonResponse
    {
        $classes = LiveClass::where('teacher_id', $this->teacherId())
            ->with(['course:id,title'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $classes]);
    }

    public function updateStatus(Request $request, LiveClass $liveClass): JsonResponse
    {
        if ($liveClass->teacher_id !== $this->teacherId()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح.'], 403);
        }

        $transitions = ['scheduled' => 'live', 'live' => 'ended'];
        $next = $transitions[$liveClass->status] ?? null;

        if (!$next) {
            return response()->json(['success' => false, 'message' => 'لا يمكن تغيير حالة هذه الحصة.'], 422);
        }

        $liveClass->update(['status' => $next]);

        return response()->json(['success' => true, 'data' => $liveClass->fresh(['course:id,title'])]);
    }
}
