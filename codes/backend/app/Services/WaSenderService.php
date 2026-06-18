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
        $this->apiKey = config('services.wasender.api_key', '');
    }

    public function sendOtp(string $phone, string $otp): bool
    {
        if (empty($this->apiKey)) {
            Log::warning('WaSender: API key not configured');
            return false;
        }

        // In dev/test, override recipient to a fixed number
        $testRecipient = config('services.wasender.test_recipient');
        $recipient     = $testRecipient ?: $phone;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type'  => 'application/json',
            ])->post(self::BASE_URL . '/send-message', [
                'to'   => $recipient,
                'text' => "🔐 رمز التحقق الخاص بك في منصة ياقوت:\n\n*{$otp}*\n\nصالح لمدة 10 دقائق. لا تشاركه مع أحد.",
            ]);

            if (!$response->successful()) {
                Log::warning('WaSender: non-success response', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('WaSender: request failed — ' . $e->getMessage());
            return false;
        }
    }
}
