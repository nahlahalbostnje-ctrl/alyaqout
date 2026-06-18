<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\ParentMiddleware;
use App\Http\Middleware\StudentMiddleware;
use App\Http\Middleware\SupervisorMiddleware;
use App\Http\Middleware\TeacherMiddleware;
use App\Http\Middleware\CountryScopeMiddleware;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'super_admin'   => SuperAdminMiddleware::class,
            'admin'         => AdminMiddleware::class,
            'student'       => StudentMiddleware::class,
            'teacher'       => TeacherMiddleware::class,
            'parent'        => ParentMiddleware::class,
            'supervisor'    => SupervisorMiddleware::class,
            'country.scope' => CountryScopeMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
