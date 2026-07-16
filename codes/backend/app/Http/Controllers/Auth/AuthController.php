<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\PhoneNormalizer;
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
        $this->logUserLogin($user, $request);

        return $this->respondWithToken($token, $user);
    }

    /**
     * Send a 6-digit OTP to the user's WhatsApp.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['phone' => 'required|string|max:20']);

        $phone = PhoneNormalizer::toStorage($request->phone);
        $key   = 'otp-send:'.$phone.':'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => "تجاوزت الحد المسموح. حاول بعد {$seconds} ثانية.",
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        $user = $this->findUserByPhone($phone);

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

        // Use the phone stored on the user for OTP + WaSender resolve
        $phone = (string) $user->phone;

        $hasWaKey      = ! empty(config('services.wasender.api_key'));
        $otpTestMode   = $this->waSender->hasOtpTestRecipient();
        $fixedCode     = (string) (config('services.otp.fixed_code') ?? '');
        $showInResponse = filter_var(config('services.otp.show_in_response'), FILTER_VALIDATE_BOOLEAN)
            || $fixedCode !== '';
        $stagingMode   = $otpTestMode || $showInResponse || $fixedCode !== '';

        // In staging/test we skip "is user phone on WhatsApp"
        if ($hasWaKey && ! $stagingMode) {
            $resolved = $this->waSender->resolveWhatsAppNumber($phone);
            if ($resolved === null) {
                $hint = PhoneNormalizer::isPalestine($phone)
                    ? ' تم فحص مقدّمتي 970 و 972.'
                    : '';

                return response()->json([
                    'success' => false,
                    'message' => 'هذا الرقم غير مسجّل على واتساب.'.$hint.' تأكد من الرقم ثم أعد المحاولة.',
                ], 422);
            }
        }

        $otp = ($fixedCode !== '' && preg_match('/^\d{6}$/', $fixedCode))
            ? $fixedCode
            : (string) random_int(100000, 999999);

        $user->update([
            'otp_code'       => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $sent = false;
        if ($hasWaKey) {
            $sent = $this->waSender->sendOtp($phone, $otp);
        }

        $payload = [
            'success'    => true,
            'message'    => $this->otpSendMessage($sent, $hasWaKey, $otpTestMode, $fixedCode !== ''),
            'expires_in' => 600,
        ];

        if ($stagingMode) {
            $payload['otp_test_mode'] = true;
        }

        if (PhoneNormalizer::isPalestine($phone) && $hasWaKey && ! $stagingMode) {
            $payload['whatsapp_prefix_checked'] = ['970', '972'];
        }

        // المرحلة الحالية: إظهار الرمز في الواجهة عند غياب واتساب أو تفعيل OTP_SHOW_IN_RESPONSE / OTP_FIXED_CODE
        if ($showInResponse || (! $sent && (config('app.debug') || ! $hasWaKey))) {
            $payload['debug_otp'] = $otp;
            if (! $sent) {
                $payload['message'] = $fixedCode !== ''
                    ? 'وضع الاختبار: استخدم الرمز الثابت الظاهر أدناه.'
                    : 'وضع الاختبار: رمز التحقق ظاهر أدناه (واتساب غير مفعّل).';
            }
        }

        // الإنتاج الحقيقي فقط: فشل الإرسال = خطأ (ليس وضع الاختبار)
        if (! $sent && $hasWaKey && ! $stagingMode && ! config('app.debug')) {
            return response()->json([
                'success' => false,
                'message' => 'تعذّر إرسال رمز التحقق عبر واتساب. حاول لاحقاً.',
            ], 503);
        }

        return response()->json($payload);
    }

    private function otpSendMessage(bool $sent, bool $hasWaKey, bool $otpTestMode, bool $fixed): string
    {
        if ($sent && $otpTestMode) {
            return 'وضع الاختبار: تم إرسال رمز التحقق إلى رقم واتساب الاختبار فقط.';
        }
        if ($sent) {
            return 'تم إرسال رمز التحقق عبر واتساب.';
        }
        if ($fixed) {
            return 'وضع الاختبار: رمز تحقق ثابت مفعّل (المرحلة الحالية).';
        }
        if (! $hasWaKey) {
            return 'وضع الاختبار: رمز التحقق ظاهر أدناه (واتساب غير مفعّل).';
        }

        return 'تم إنشاء رمز التحقق. تعذّر الإرسال عبر واتساب — تحقق من إعدادات WaSender.';
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

        $phone = PhoneNormalizer::toStorage($request->phone);
        $key   = 'otp-verify:'.$phone;

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'success' => false,
                'message' => 'محاولات كثيرة خاطئة. حاول لاحقاً.',
            ], 429);
        }

        $user = $this->findUserByPhone($phone);

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

        $phone = (string) $user->phone;

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
        $this->logUserLogin($user, $request);

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

    /** Write successful login into activity log for every role. */
    private function logUserLogin(User $user, Request $request): void
    {
        ActivityLogger::recordLogin($user, $request->ip());
    }

    private function userPayload(User $user): array
    {
        $country = $user->relationLoaded('country')
            ? $user->country
            : $user->country()->first();

        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'phone'      => $user->phone,
            'email'      => $user->email,
            'role'       => $user->role,
            'country_id' => $user->country_id,
            'country'    => $country ? [
                'id'       => $country->id,
                'name'     => $country->name,
                'code'     => $country->code,
                'currency' => $country->currency,
            ] : null,
            'is_active'  => $user->is_active,
        ];
    }

    /**
     * Find active user by phone; for Palestine also try 970↔972 alternate storage form.
     */
    private function findUserByPhone(string $phone): ?User
    {
        $variants = [$phone];

        if (PhoneNormalizer::isPalestine($phone)) {
            $national = PhoneNormalizer::palestineNational($phone);
            if ($national) {
                $variants[] = '00970'.$national;
                $variants[] = '00972'.$national;
            }
        }

        return User::whereIn('phone', array_unique($variants))
            ->where('is_active', true)
            ->first();
    }
}
