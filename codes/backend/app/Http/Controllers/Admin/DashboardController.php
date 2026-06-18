<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Grade;
use App\Models\LiveClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $admin     = auth()->user();
        $countryId = $admin->country_id;

        return response()->json([
            'success' => true,
            'data'    => [
                'country' => [
                    'id'   => $admin->country->id,
                    'name' => $admin->country->name,
                    'code' => $admin->country->code,
                ],
                'stats' => [
                    'teachers'        => User::where('country_id', $countryId)->where('role', 'teacher')->whereNull('deleted_at')->count(),
                    'students'        => User::where('country_id', $countryId)->where('role', 'student')->whereNull('deleted_at')->count(),
                    'parents'         => User::where('country_id', $countryId)->where('role', 'parent')->whereNull('deleted_at')->count(),
                    'grades'          => Grade::where('country_id', $countryId)->where('is_active', true)->count(),
                    'courses'         => Course::where('country_id', $countryId)->where('is_active', true)->count(),
                    'live_scheduled'  => LiveClass::where('country_id', $countryId)->where('status', 'scheduled')->count(),
                    'live_active'     => LiveClass::where('country_id', $countryId)->where('status', 'live')->count(),
                ],
            ],
        ]);
    }
}
