<?php

declare(strict_types=1);

namespace App\Helpers\Agora;

abstract class Service
{
    private int $serviceType;
    protected array $privileges = [];

    public function __construct(int $serviceType)
    {
        $this->serviceType = $serviceType;
    }

    public function getServiceType(): int
    {
        return $this->serviceType;
    }

    public function addPrivilegeWithExpire(int $privilege, int $expire): void
    {
        $this->privileges[$privilege] = $expire;
    }

    public function pack(): string
    {
        $msg  = pack('n', $this->serviceType);
        $msg .= pack('n', count($this->privileges));

        ksort($this->privileges);
        foreach ($this->privileges as $k => $v) {
            $msg .= pack('n', $k);
            $msg .= pack('N', $v);
        }

        return $msg;
    }
}
