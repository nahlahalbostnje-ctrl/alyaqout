<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseRating;
use App\Services\CourseCompletionService;
use App\Services\StudentEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseRatingController extends Controller
{
    public function __construct(
        private readonly CourseCompletionService $completion,
        private readonly StudentEntitlementService $entitlement,
    ) {}

    public function store(Request $request, Course $course): JsonResponse
    {
        $student = Auth::user();
        abort_unless((int) $course->country_id === (int) $student->country_id, 404);
        abort_unless($course->is_active && $course->isApproved(), 404);
        abort_unless($this->entitlement->canAccessCourse($student, $course), 403, 'غير مشترك في هذه الدورة.');

        $progress = $this->completion->progressForCourse((int) $student->id, (int) $course->id);
        abort_unless($progress['is_complete'], 422, 'قيّم المساق بعد إتمام كل المحتوى.');

        $data = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = CourseRating::updateOrCreate(
            ['user_id' => $student->id, 'course_id' => $course->id],
            [
                'rating'  => $data['rating'],
                'comment' => $data['comment'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ تقييمك',
            'data'    => [
                'id'      => $rating->id,
                'rating'  => $rating->rating,
                'comment' => $rating->comment,
            ],
        ]);
    }

    public function show(Course $course): JsonResponse
    {
        $student = Auth::user();
        abort_unless((int) $course->country_id === (int) $student->country_id, 404);

        $mine = CourseRating::query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        $avg = CourseRating::query()
            ->where('course_id', $course->id)
            ->avg('rating');

        $count = CourseRating::query()
            ->where('course_id', $course->id)
            ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'my_rating'     => $mine ? [
                    'rating'  => $mine->rating,
                    'comment' => $mine->comment,
                ] : null,
                'average'       => $avg !== null ? round((float) $avg, 1) : null,
                'ratings_count' => $count,
            ],
        ]);
    }
}
