<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function loginAttempts(Request $request): JsonResponse
    {
        $query = LoginAttempt::with('user:id,name,role')
            ->orderByDesc('created_at');

        if ($request->filled('success')) {
            $query->where('success', (bool) $request->success);
        }

        $attempts = $query->paginate(50);

        $stats = [
            'total'   => LoginAttempt::count(),
            'success' => LoginAttempt::where('success', true)->count(),
            'failed'  => LoginAttempt::where('success', false)->count(),
            'today'   => LoginAttempt::whereDate('created_at', today())->count(),
        ];

        return response()->json(['data' => $attempts, 'stats' => $stats]);
    }
}
