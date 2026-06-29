<?php

declare(strict_types=1);

namespace App\Services;

use Yasser\Agora\RtcTokenBuilder;

class AgoraService
{
    const ROLE_PUBLISHER  = 1;
    const ROLE_SUBSCRIBER = 2;

    public function generateToken(string $channel, int $uid, int $role): string
    {
        $expireSeconds = (int) config('agora.token_expire', 3600);
        $privilegeExpireTs = time() + $expireSeconds;

        $rtcRole = $role === self::ROLE_PUBLISHER
            ? RtcTokenBuilder::RolePublisher
            : RtcTokenBuilder::RoleSubscriber;

        return RtcTokenBuilder::buildTokenWithUid(
            config('agora.app_id'),
            config('agora.app_certificate'),
            $channel,
            $uid,
            $rtcRole,
            $privilegeExpireTs,
        );
    }

    public function buildChannel(): string
    {
        return 'ch' . bin2hex(random_bytes(8));
    }
}
