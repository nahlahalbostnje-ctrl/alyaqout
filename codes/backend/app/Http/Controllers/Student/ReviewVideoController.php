<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\VideoProgress;
use App\Services\StudentEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReviewVideoController extends Controller
{
    public function __construct(
        private readonly StudentEntitlementService $entitlement,
    ) {}

    /** فيديوهات الدورات المعلّمة كمراجعة والموصولة باشتراك الطالب. */
    public function index(): JsonResponse
    {
        $user      = Auth::user();
        $countryId = (int) $user->country_id;
        $studentId = (int) $user->id;

        $videos = Video::query()
            ->where('is_review', true)
            ->where('type', 'video')
            ->with([
                'lesson:id,unit_id,title',
                'lesson.unit:id,course_id,title',
                'lesson.unit.course:id,title,country_id,is_active,is_free,approval_status',
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->filter(function (Video $video) use ($user, $countryId) {
                $course = $video->lesson?->unit?->course;
                if (! $course) {
                    return false;
                }
                if ((int) $course->country_id !== $countryId) {
                    return false;
                }
                if (! $course->is_active) {
                    return false;
                }

                return $this->entitlement->canAccessCourse($user, $course);
            })
            ->values();

        $completed = VideoProgress::where('student_id', $studentId)
            ->where('completed', true)
            ->whereIn('video_id', $videos->pluck('id'))
            ->pluck('video_id')
            ->flip();

        return response()->json([
            'videos' => $videos->map(fn (Video $v) => [
                'id'          => $v->id,
                'title'       => $v->title,
                'duration'    => $v->duration,
                'completed'   => isset($completed[$v->id]),
                'course_id'   => $v->lesson?->unit?->course?->id,
                'course_title'=> $v->lesson?->unit?->course?->title,
                'lesson_title'=> $v->lesson?->title,
                'unit_title'  => $v->lesson?->unit?->title,
            ]),
        ]);
    }
}
