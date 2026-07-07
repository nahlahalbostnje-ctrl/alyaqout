<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\Facades\JWTAuth;

class ImpersonationController extends Controller
{
    public function impersonate(User $user): JsonResponse
    {
        AdminActionLog::record(
            action: 'impersonate',
            targetType: 'User',
            targetId: $user->id,
            targetLabel: $user->name . ' (' . $user->role . ')',
        );

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message'       => 'تسجيل الدخول كـ ' . $user->name,
            'token'         => $token,
            'user'          => $user->only(['id', 'name', 'phone', 'role', 'country_id']),
            'redirect_to'   => $this->redirectFor($user->role),
        ]);
    }

    private function redirectFor(string $role): string
    {
        return match($role) {
            'admin'      => '/admin/dashboard',
            'teacher'    => '/teacher/dashboard',
            'student'    => '/student/dashboard',
            'parent'     => '/parent/dashboard',
            'supervisor' => '/supervisor/students',
            default      => '/dashboard',
        };
    }
}
