<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\Agora\AccessToken2;
use App\Helpers\Agora\ServiceRtc;

class AgoraService
{
    const ROLE_PUBLISHER  = 1;
    const ROLE_SUBSCRIBER = 2;

    public function generateToken(string $channel, int $uid, int $role): string
    {
        $expire = (int) config('agora.token_expire', 3600);

        $token = new AccessToken2(
            config('agora.app_id'),
            config('agora.app_certificate'),
            $expire
        );

        $service = new ServiceRtc($channel, (string) $uid);
        $service->addPrivilegeWithExpire(ServiceRtc::PRIVILEGE_JOIN_CHANNEL, $expire);

        if ($role === self::ROLE_PUBLISHER) {
            $service->addPrivilegeWithExpire(ServiceRtc::PRIVILEGE_PUBLISH_AUDIO, $expire);
            $service->addPrivilegeWithExpire(ServiceRtc::PRIVILEGE_PUBLISH_VIDEO, $expire);
        }

        $token->addService($service);

        return $token->build();
    }

    public function buildChannel(): string
    {
        return 'ch' . bin2hex(random_bytes(8));
    }
}
