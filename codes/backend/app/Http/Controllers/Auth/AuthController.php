<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\WaSenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function __construct(
        private readonly WaSenderService $waSender,
    ) {}

    /**
     * Login with email + password (staff / any user with credentials).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|min:6|max:100',
        ]);

        $user = User::where('email', strtolower(trim($request->email)))
            ->where('is_active', true)
            ->first();

        $ok = $user && $user->password && Hash::check($request->password, $user->password);

        LoginAttempt::create([
            'user_id'     => $user?->id,
            'phone'       => $user?->phone ?? $request->email,
            'ip_address'  => $request->ip(),
            'device_info' => $request->userAgent(),
            'success'     => $ok,
        ]);

        if (! $ok) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
            ], 401);
        }

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    /**
     * Send a 6-digit OTP to the user's WhatsApp.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string|max:20']);

        $phone = $this->normalizePhone($request->phone);
        $key   = 'otp-send:'.$phone.':'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => "تجاوزت الحد المسموح. حاول بعد {$seconds} ثانية.",
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        $user = User::where('phone', $phone)
            ->where('is_active', true)
            ->first();

        if (! $user) {
            LoginAttempt::create([
                'user_id'     => null,
                'phone'       => $phone,
                'ip_address'  => $request->ip(),
                'device_info' => $request->userAgent(),
                'success'     => false,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'رقم الجوال غير مسجل أو الحساب غير نشط.',
            ], 404);
        }

        $otp = (string) random_int(100000, 999999);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $sent = $this->waSender->sendOtp($phone, $otp);

        $payload = [
            'success' => true,
            'message' => $sent
                ? 'تم إرسال رمز التحقق عبر واتساب.'
                : 'تم إنشاء رمز التحقق. تعذّر الإرسال عبر واتساب — تحقق من إعدادات WaSender.',
            'expires_in' => 600,
        ];

        // للاختبار فقط عند تعطل واتساب أو غياب المفتاح
        if (! $sent && (config('app.debug') || empty(config('services.wasender.api_key')))) {
            $payload['debug_otp'] = $otp;
            $payload['message']   = 'وضع الاختبار: رمز التحقق ظاهر أدناه (واتساب غير مفعّل).';
        }

        if (! $sent && ! config('app.debug') && ! empty(config('services.wasender.api_key'))) {
            return response()->json([
                'success' => false,
                'message' => 'تعذّر إرسال رمز التحقق عبر واتساب. حاول لاحقاً.',
            ], 503);
        }

        return response()->json($payload);
    }

    /**
     * Verify OTP and issue JWT.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'otp'   => 'required|string|size:6',
        ]);

        $phone = $this->normalizePhone($request->phone);
        $key   = 'otp-verify:'.$phone;

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'success' => false,
                'message' => 'محاولات كثيرة خاطئة. حاول لاحقاً.',
            ], 429);
        }

        $user = User::where('phone', $phone)
            ->where('is_active', true)
            ->first();

        $valid = $user
            && $user->otp_code
            && hash_equals((string) $user->otp_code, $request->otp)
            && $user->otp_expires_at
            && $user->otp_expires_at->isFuture();

        if (! $valid) {
            RateLimiter::hit($key, 600);
            LoginAttempt::create([
                'user_id'     => $user?->id,
                'phone'       => $phone,
                'ip_address'  => $request->ip(),
                'device_info' => $request->userAgent(),
                'success'     => false,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.',
            ], 401);
        }

        RateLimiter::clear($key);

        $user->update([
            'otp_code'       => null,
            'otp_expires_at' => null,
        ]);

        LoginAttempt::create([
            'user_id'     => $user->id,
            'phone'       => $phone,
            'ip_address'  => $request->ip(),
            'device_info' => $request->userAgent(),
            'success'     => true,
        ]);

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return response()->json([
            'success' => true,
            'data'    => $this->userPayload($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone'    => 'sometimes|string|max:20|unique:users,phone,'.$user->id,
            'email'    => 'sometimes|nullable|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:6|max:100|confirmed',
        ]);

        $data = $request->only(['name', 'phone', 'email']);
        if ($request->filled('email')) {
            $data['email'] = strtolower(trim($request->email));
        }
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بياناتك بنجاح.',
            'data'    => $this->userPayload($user->fresh()),
        ]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج بنجاح.']);
    }

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
            'user'       => $this->userPayload($user),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'phone'      => $user->phone,
            'email'      => $user->email,
            'role'       => $user->role,
            'country_id' => $user->country_id,
            'country'    => $user->relationLoaded('country') ? $user->country : $user->country()->first(),
            'is_active'  => $user->is_active,
        ];
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', trim($phone)) ?? '';

        // Allow demo keywords → phone (server-side, for OTP path)
        $map = [
            'super'         => '00962100000000',
            'admin'         => '00962200000000',
            'teacher'       => '00962300000000',
            'student'       => '00962400000000',
            'parent'        => '00962500000000',
            'supervisor'    => '00962600000000',
            'ps_admin'      => '00970444444444',
            'ps_teacher'    => '00970111111111',
            'ps_student'    => '00970222222221',
            'ps_parent'     => '00970333333331',
            'ps_supervisor' => '00970555555551',
        ];

        $key = strtolower($phone);
        if (isset($map[$key])) {
            return $map[$key];
        }

        // Convert +962... or 962... to 00962...
        if (str_starts_with($phone, '+')) {
            $phone = '00'.substr($phone, 1);
        } elseif (preg_match('/^[1-9]/', $phone) && ! str_starts_with($phone, '00')) {
            $phone = '00'.$phone;
        }

        return $phone;
    }
}
