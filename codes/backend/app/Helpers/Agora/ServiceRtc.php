<?php

declare(strict_types=1);

namespace App\Helpers\Agora;

class ServiceRtc extends Service
{
    const SERVICE_TYPE = 1;

    const PRIVILEGE_JOIN_CHANNEL       = 1;
    const PRIVILEGE_PUBLISH_AUDIO      = 2;
    const PRIVILEGE_PUBLISH_VIDEO      = 3;
    const PRIVILEGE_PUBLISH_DATA       = 4;

    private string $channelName;
    private string $uid;

    public function __construct(string $channelName, string $uid)
    {
        parent::__construct(self::SERVICE_TYPE);
        $this->channelName = $channelName;
        $this->uid         = $uid;
    }

    public function pack(): string
    {
        return parent::pack()
            . pack('n', strlen($this->channelName)) . $this->channelName
            . pack('n', strlen($this->uid))         . $this->uid;
    }
}
