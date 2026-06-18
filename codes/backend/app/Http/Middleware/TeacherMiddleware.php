<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TeacherMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Teacher access required.',
            ], 403);
        }

        return $next($request);
    }
}
