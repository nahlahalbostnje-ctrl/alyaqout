<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WaSenderService
{
    private string $apiKey;

    private const BASE_URL = 'https://www.wasenderapi.com/api';

    public function __construct()
    {
        $this->apiKey = (string) (config('services.wasender.api_key') ?? '');
    }

    public function sendText(string $phone, string $text): bool
    {
        $recipient = $this->resolveRecipient($phone);
        if ($recipient === null) {
            return false;
        }

        return $this->postMessage([
            'to'   => $recipient,
            'text' => $text,
        ], 'sendText');
    }

    public function sendDocument(string $phone, string $documentUrl, string $fileName, string $caption = ''): bool
    {
        $recipient = $this->resolveRecipient($phone);
        if ($recipient === null) {
            return false;
        }

        return $this->postMessage([
            'to'          => $recipient,
            'text'        => $caption,
            'documentUrl' => $documentUrl,
            'fileName'    => $fileName,
        ], 'sendDocument');
    }

    public function sendOtp(string $phone, string $otp): bool
    {
        $recipient = $this->resolveOtpRecipient($phone);
        if ($recipient === null) {
            Log::warning('WaSender sendOtp: no WhatsApp recipient resolved', [
                'phone' => $phone,
            ]);

            return false;
        }

        return $this->postMessage([
            'to'   => $recipient,
            'text' => "🔐 رمز التحقق الخاص بك في منصة ياقوت:\n\n*{$otp}*\n\nصالح لمدة 10 دقائق. لا تشاركه مع أحد.",
        ], 'sendOtp');
    }

    /**
     * True when WASENDER_TEST_RECIPIENT is set — OTP is redirected to that single number.
     */
    public function hasOtpTestRecipient(): bool
    {
        return ! empty(config('services.wasender.test_recipient'));
    }

    /**
     * OTP recipient: test number (if configured) or real WhatsApp resolve (970/972).
     */
    public function resolveOtpRecipient(string $phone): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('WaSender: API key not configured');

            return null;
        }

        $testRecipient = config('services.wasender.test_recipient');
        if (! empty($testRecipient)) {
            $to = PhoneNormalizer::toE164((string) $testRecipient);
            Log::info('WaSender OTP test mode: redirecting to test recipient', [
                'user_phone'     => $phone,
                'test_recipient' => $to,
            ]);

            return $to;
        }

        return $this->resolveWhatsAppNumber($phone);
    }

    /**
     * Resolve the E.164 number that exists on WhatsApp.
     * Palestine: tries +970 then +972.
     *
     * @return string|null E.164 like +97059… or null if not on WhatsApp / unresolved
     */
    public function resolveWhatsAppNumber(string $phone): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('WaSender: API key not configured');

            // Without API key: still return best-guess E.164 for debug/local flows
            return PhoneNormalizer::toE164($phone);
        }

        $candidates = PhoneNormalizer::whatsappCandidates($phone);
        $sawFalse   = false;
        $sawUnknown = false;

        foreach ($candidates as $candidate) {
            $onWhatsApp = $this->isOnWhatsApp($candidate);

            if ($onWhatsApp === true) {
                Log::info('WaSender: number found on WhatsApp', [
                    'input'     => $phone,
                    'resolved'  => $candidate,
                    'palestine' => PhoneNormalizer::isPalestine($phone),
                ]);

                return $candidate;
            }

            if ($onWhatsApp === false) {
                $sawFalse = true;
                Log::info('WaSender: number not on WhatsApp', ['candidate' => $candidate]);
            } else {
                $sawUnknown = true;
            }
        }

        // Check API unavailable — fall back to primary E.164 so send can still be attempted
        if ($sawUnknown && ! $sawFalse) {
            Log::warning('WaSender: on-whatsapp check unavailable — using primary E.164', [
                'phone' => $phone,
            ]);

            return $candidates[0] ?? PhoneNormalizer::toE164($phone);
        }

        // Mixed unknown + false: prefer fallback only if no candidate was confirmed missing on all tries
        if ($sawUnknown) {
            return $candidates[0] ?? PhoneNormalizer::toE164($phone);
        }

        // All candidates confirmed not on WhatsApp
        return null;
    }

    /**
     * GET /api/on-whatsapp/{phone_number}
     *
     * @return bool|null true/false if known, null on API failure
     */
    public function isOnWhatsApp(string $e164Phone): ?bool
    {
        if (empty($this->apiKey)) {
            return null;
        }

        $phone = PhoneNormalizer::toE164($e164Phone);
        // Path segment: encode + as %2B
        $encoded = rawurlencode($phone);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Accept'        => 'application/json',
            ])->timeout(15)->get(self::BASE_URL.'/on-whatsapp/'.$encoded);

            if (! $response->successful()) {
                Log::warning('WaSender on-whatsapp: non-success', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                    'phone'  => $phone,
                ]);

                return null;
            }

            $json = $response->json();

            return $this->parseOnWhatsAppResponse($json);
        } catch (\Throwable $e) {
            Log::error('WaSender on-whatsapp failed: '.$e->getMessage(), ['phone' => $phone]);

            return null;
        }
    }

    /**
     * Whether the number (after Palestine resolve) is on WhatsApp.
     */
    public function numberExistsOnWhatsApp(string $phone): bool
    {
        return $this->resolveWhatsAppNumber($phone) !== null
            && ! empty($this->apiKey);
    }

    private function resolveRecipient(string $phone): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('WaSender: API key not configured');

            return null;
        }

        return $this->resolveWhatsAppNumber($phone);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function postMessage(array $payload, string $context): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post(self::BASE_URL.'/send-message', $payload);

            if (! $response->successful()) {
                Log::warning("WaSender {$context}: non-success", [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                    'to'     => $payload['to'] ?? null,
                ]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error("WaSender {$context} failed: ".$e->getMessage());

            return false;
        }
    }

    /**
     * @param  mixed  $json
     */
    private function parseOnWhatsAppResponse(mixed $json): ?bool
    {
        if (! is_array($json)) {
            return null;
        }

        // Common shapes: { data: { exists: true } }, { exists: true }, { data: true }, { onWhatsApp: true }
        $candidates = [
            data_get($json, 'data.exists'),
            data_get($json, 'data.onWhatsApp'),
            data_get($json, 'data.isOnWhatsApp'),
            data_get($json, 'exists'),
            data_get($json, 'onWhatsApp'),
            data_get($json, 'isOnWhatsApp'),
            data_get($json, 'data'),
        ];

        foreach ($candidates as $value) {
            if (is_bool($value)) {
                return $value;
            }
            if ($value === 1 || $value === '1' || $value === 'true') {
                return true;
            }
            if ($value === 0 || $value === '0' || $value === 'false') {
                return false;
            }
        }

        Log::warning('WaSender on-whatsapp: unrecognized response shape', ['json' => $json]);

        return null;
    }
}
