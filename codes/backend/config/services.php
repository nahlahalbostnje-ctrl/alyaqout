<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'wasender' => [
        'api_key'        => env('WASENDER_API_KEY'),
        // When set: ALL OTP WhatsApp messages go to this number (test only). Leave empty in production.
        'test_recipient' => env('WASENDER_TEST_RECIPIENT'),
    ],

    'otp' => [
        // Temporary fixed 6-digit code for staging/test (e.g. 123456). Empty = random OTP in production.
        'fixed_code' => env('OTP_FIXED_CODE'),
        // When true: always return debug_otp in API so login UI can show the code (current phase only).
        'show_in_response' => env('OTP_SHOW_IN_RESPONSE', false),
    ],

    'phone' => [
        // Platform default today: Palestine. Change when multi-country signup/login is enabled.
        'default_country' => env('PHONE_DEFAULT_COUNTRY', 'PS'),
    ],

];
