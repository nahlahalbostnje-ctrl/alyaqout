<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string|max:20']);

        $user = User::where('phone', $request->phone)
            ->where('is_active', true)
            ->first();

        if (! $user) {
            LoginAttempt::create([
                'user_id'     => null,
                'phone'       => $request->phone,
                'ip_address'  => $request->ip(),
                'device_info' => $request->userAgent(),
                'success'     => false,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'رقم الهاتف غير مسجل أو الحساب غير نشط.',
            ], 401);
        }

        LoginAttempt::create([
            'user_id'     => $user->id,
            'phone'       => $request->phone,
            'ip_address'  => $request->ip(),
            'device_info' => $request->userAgent(),
            'success'     => true,
        ]);

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    /**
     * Return the currently authenticated user's data.
     */
    public function me(): JsonResponse
    {
        $user = auth('api')->user();

        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'country_id' => $user->country_id,
                'country'    => $user->country,
                'is_active'  => $user->is_active,
            ],
        ]);
    }

    /**
     * Update the authenticated user's own profile (name, phone, password).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
        ]);

        $user->update($request->only(['name', 'phone']));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بياناتك بنجاح.',
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'phone' => $user->phone,
                'role'  => $user->role,
            ],
        ]);
    }

    /**
     * Invalidate the current token and log out.
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج بنجاح.']);
    }

    /**
     * Refresh an expired token.
     */
    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();

        return $this->respondWithToken($token, auth('api')->user());
    }

    private function respondWithToken(string $token, User $user): JsonResponse
    {
        return response()->json([
            'success'    => true,
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user'       => [
                'id'         => $user->id,
                'name'       => $user->name,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'country_id' => $user->country_id,
            ],
        ]);
    }
}
