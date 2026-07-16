<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    private function parentId(): int
    {
        return (int) auth()->id();
    }

    private function myChildren(): Collection
    {
        return User::where('parent_id', $this->parentId())
            ->where('role', 'student')
            ->where('is_active', true)
            ->get(['id', 'name', 'phone', 'country_id']);
    }

    private function mapChild(User $child): array
    {
        $countryId = (int) $child->getAttribute('country_id');

        $coursesCount = Course::where('is_active', true)
            ->where('country_id', $countryId)
            ->count();

        $childId = (int) $child->getAttribute('id');

        $upcoming = LiveClass::whereIn('status', ['scheduled', 'live'])
            ->where('approval_status', 'approved')
            ->where('country_id', $countryId)
            ->where(function ($q) use ($childId) {
                $q->where('session_type', 'group')->orWhere('student_id', $childId);
            })
            ->with(['course:id,title'])
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get(['id', 'title', 'scheduled_at', 'duration_minutes', 'status', 'meeting_link', 'course_id', 'session_type', 'student_id']);

        return [
            'id'             => $child->getAttribute('id'),
            'name'           => $child->getAttribute('name'),
            'phone'          => $child->getAttribute('phone'),
            'courses_count'  => $coursesCount,
            'upcoming_count' => $upcoming->count(),
            'upcoming'       => $upcoming,
        ];
    }

    public function dashboard(): JsonResponse
    {
        $parent   = auth()->user();
        $children = $this->myChildren();

        return response()->json([
            'success' => true,
            'data'    => [
                'parent'   => [
                    'id'   => $parent->getAttribute('id'),
                    'name' => $parent->getAttribute('name'),
                ],
                'children' => $children->map(fn (User $c) => $this->mapChild($c))->values(),
                'stats'    => ['total_children' => $children->count()],
            ],
        ]);
    }

    public function listChildren(): JsonResponse
    {
        $children = $this->myChildren();

        $data = $children->map(function (User $child) {
            $countryId = (int) $child->getAttribute('country_id');

            $courses = Course::where('is_active', true)
                ->where('country_id', $countryId)
                ->with(['category:id,name,grade_id', 'category.grade:id,name'])
                ->orderBy('sort_order')
                ->get(['id', 'category_id', 'title', 'price', 'is_free', 'thumbnail', 'is_active', 'country_id']);

            $childId = (int) $child->getAttribute('id');

            $liveClasses = LiveClass::whereIn('status', ['scheduled', 'live'])
                ->where('approval_status', 'approved')
                ->where('country_id', $countryId)
                ->where(function ($q) use ($childId) {
                    $q->where('session_type', 'group')->orWhere('student_id', $childId);
                })
                ->with(['course:id,title'])
                ->orderBy('scheduled_at')
                ->get();

            return [
                'id'          => $child->getAttribute('id'),
                'name'        => $child->getAttribute('name'),
                'phone'       => $child->getAttribute('phone'),
                'courses'     => $courses,
                'live_classes' => $liveClasses,
            ];
        })->values();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function childLiveClasses(User $student): JsonResponse
    {
        if ((int) $student->getAttribute('parent_id') !== $this->parentId()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح.'], 403);
        }

        $countryId = (int) $student->getAttribute('country_id');
        $studentId = (int) $student->getAttribute('id');

        $classes = LiveClass::whereIn('status', ['scheduled', 'live'])
            ->where('approval_status', 'approved')
            ->where('country_id', $countryId)
            ->where(function ($q) use ($studentId) {
                $q->where('session_type', 'group')->orWhere('student_id', $studentId);
            })
            ->with(['course:id,title'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['success' => true, 'data' => $classes]);
    }
}
