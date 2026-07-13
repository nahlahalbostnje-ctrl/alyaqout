<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Country;
use App\Models\Course;
use App\Models\Faq;
use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                'courses'   => Course::where('is_active', true)->count(),
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
        $query = Faq::where('is_active', true)->orderBy('sort_order');

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        return response()->json([
            'faqs' => $query->get(['id', 'question', 'answer']),
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
}
