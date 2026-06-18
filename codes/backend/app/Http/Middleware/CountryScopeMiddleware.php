<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CountryScopeMiddleware
{
    /**
     * Stores the authenticated user's country_id in the app container
     * so repositories and services can apply automatic country filtering.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if ($user && ! $user->isSuperAdmin() && $user->country_id) {
            app()->instance('current_country_id', $user->country_id);
        }

        return $next($request);
    }
}
