<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Challenge;
use App\Models\Country;
use App\Models\Course;
use App\Models\Faq;
use App\Models\GamificationPoint;
use App\Models\LiveClass;
use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function countries(): JsonResponse
    {
        $countries = Country::where('is_active', true)
            ->get(['id', 'name', 'code', 'phone_code']);

        return response()->json(['countries' => $countries]);
    }

    /** Real platform counts only — no marketing fabrications. */
    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'students'  => User::where('role', 'student')->where('is_active', true)->whereNull('deleted_at')->count(),
                'teachers'  => User::where('role', 'teacher')->where('is_active', true)->whereNull('deleted_at')->count(),
                'countries' => Country::where('is_active', true)->count(),
                'courses'   => Course::where('is_active', true)->where('approval_status', 'approved')->count(),
            ],
        ]);
    }

    public function banners(Request $request): JsonResponse
    {
        $query = Banner::where('is_active', true)->orderBy('sort_order');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        return response()->json([
            'banners' => $query->get(['id', 'title', 'image_url', 'link_url']),
        ]);
    }

    public function faqs(Request $request): JsonResponse
    {
        $faqs = Faq::query()
            ->platform()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'question', 'answer', 'sort_order']);

        return response()->json([
            'faqs' => $faqs,
        ]);
    }

    public function social(Request $request): JsonResponse
    {
        $query = SocialLink::where('is_active', true);

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        return response()->json([
            'links' => $query->get(['id', 'platform', 'url']),
        ]);
    }

    /** Public course cards for landing / visitor explore. */
    public function courses(Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->query('limit', 6)));

        $query = Course::query()
            ->where('is_active', true)
            ->where('approval_status', 'approved')
            ->with([
                'teacher:id,name',
                'grade:id,name',
                'subject:id,name',
            ])
            ->withCount('units')
            ->withAvg('ratings', 'rating')
            ->orderBy('sort_order')
            ->orderByDesc('id');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        $courses = $query->limit($limit)->get()->map(function (Course $c) {
            $hasLive = LiveClass::where('course_id', $c->id)
                ->whereNull('archived_at')
                ->whereIn('status', ['live', 'scheduled'])
                ->exists();

            $avg = $c->ratings_avg_rating;
            return [
                'id'            => $c->id,
                'title'         => $c->title,
                'thumbnail'     => $c->thumbnail,
                'teacher_name'  => $c->teacher?->name,
                'grade_name'    => $c->grade?->name,
                'subject_name'  => $c->subject?->name,
                'lessons_count' => (int) $c->units_count,
                'is_free'       => (bool) $c->is_free,
                'type'          => $hasLive ? 'live' : 'recorded',
                'rating'        => $avg !== null ? round((float) $avg, 1) : null,
            ];
        });

        return response()->json(['courses' => $courses]);
    }

    /** Public teacher cards. */
    public function teachers(Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->query('limit', 6)));

        $query = User::query()
            ->where('role', 'teacher')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->with(['subjects:id,name'])
            ->withCount([
                'taughtCourses as courses_count' => fn ($q) => $q
                    ->where('is_active', true)
                    ->where('approval_status', 'approved'),
            ])
            ->orderByDesc('id');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        $teachers = $query->limit($limit)->get()->map(fn (User $t) => [
            'id'            => $t->id,
            'name'          => $t->name,
            'subjects'      => $t->subjects->pluck('name')->values(),
            'courses_count' => (int) $t->courses_count,
        ]);

        return response()->json(['teachers' => $teachers]);
    }

    /** Upcoming / live public classes (no join tokens). */
    public function liveClasses(Request $request): JsonResponse
    {
        $limit = min(12, max(1, (int) $request->query('limit', 6)));

        $query = LiveClass::query()
            ->whereNull('archived_at')
            ->where('approval_status', 'approved')
            ->whereIn('status', ['live', 'scheduled'])
            ->where(function ($q) {
                $q->where('status', 'live')
                    ->orWhere('scheduled_at', '>=', now()->subHours(2));
            })
            ->with([
                'teacher:id,name',
                'course:id,title,subject_id',
                'course.subject:id,name',
            ])
            ->orderByRaw("CASE WHEN status = 'live' THEN 0 ELSE 1 END")
            ->orderBy('scheduled_at');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        $classes = $query->limit($limit)->get()->map(fn (LiveClass $lc) => [
            'id'            => $lc->id,
            'title'         => $lc->title,
            'status'        => $lc->status,
            'scheduled_at'  => optional($lc->scheduled_at)?->toIso8601String(),
            'teacher_name'  => $lc->teacher?->name,
            'subject_name'  => $lc->course?->subject?->name,
            'course_title'  => $lc->course?->title,
        ]);

        return response()->json(['live_classes' => $classes]);
    }

    /** Public leaderboard — first name + initial only. */
    public function leaderboard(Request $request): JsonResponse
    {
        $limit = min(10, max(1, (int) $request->query('limit', 10)));

        $studentQuery = User::where('role', 'student')
            ->where('is_active', true)
            ->whereNull('deleted_at');

        if ($request->filled('country_id')) {
            $studentQuery->where('country_id', (int) $request->country_id);
        }

        $studentIds = $studentQuery->pluck('id');

        if ($studentIds->isEmpty()) {
            return response()->json(['leaderboard' => []]);
        }

        $rankings = GamificationPoint::whereIn('student_id', $studentIds)
            ->selectRaw('student_id, SUM(points) as total')
            ->groupBy('student_id')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();

        $users = User::whereIn('id', $rankings->pluck('student_id'))
            ->get(['id', 'name'])
            ->keyBy('id');

        $list = $rankings->values()->map(function ($r, $index) use ($users) {
            $name = $users[$r->student_id]?->name ?? '—';
            $parts = preg_split('/\s+/u', trim($name)) ?: [];
            $display = $parts[0] ?? '—';
            if (isset($parts[1]) && $parts[1] !== '') {
                $display .= ' '.Str::substr($parts[1], 0, 1).'.';
            }
            $points = (int) $r->total;
            $level = (int) floor($points / 500) + 1;

            return [
                'rank'   => $index + 1,
                'name'   => $display,
                'points' => $points,
                'level'  => $level,
            ];
        });

        return response()->json(['leaderboard' => $list]);
    }

    /** Public challenges list (titles only). */
    public function challenges(Request $request): JsonResponse
    {
        $limit = min(8, max(1, (int) $request->query('limit', 6)));

        $query = Challenge::query()
            ->whereIn('status', ['active', 'pending'])
            ->latest('id');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        $items = $query->limit($limit)->get(['id', 'title', 'description', 'category', 'type', 'status']);

        if ($items->isEmpty()) {
            $fallback = Challenge::query()->latest('id');
            if ($request->filled('country_id')) {
                $fallback->where('country_id', (int) $request->country_id);
            }
            $items = $fallback->limit($limit)->get(['id', 'title', 'description', 'category', 'type', 'status']);
        }

        return response()->json([
            'challenges' => $items->map(fn (Challenge $c) => [
                'id'          => $c->id,
                'title'       => $c->title,
                'description' => $c->description,
                'category'    => $c->category,
                'type'        => $c->type,
                'status'      => $c->status,
            ]),
        ]);
    }
}
