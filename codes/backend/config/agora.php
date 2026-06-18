<?php

declare(strict_types=1);

return [
    'app_id'          => env('AGORA_APP_ID', ''),
    'app_certificate' => env('AGORA_APP_CERTIFICATE', ''),
    'token_expire'    => (int) env('AGORA_TOKEN_EXPIRE', 3600),
];
