<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SupervisorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'supervisor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Supervisor access required.',
            ], 403);
        }

        return $next($request);
    }
}
