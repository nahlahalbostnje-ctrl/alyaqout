<?php

declare(strict_types=1);

namespace App\Helpers\Agora;

class AccessToken2
{
    const VERSION = '007';

    public string $appId;
    public string $appCertificate;
    public int    $expire;
    public int    $issueTs;
    public int    $salt;
    /** @var Service[] */
    public array  $services = [];

    public function __construct(string $appId, string $appCertificate, int $expire)
    {
        $this->appId          = $appId;
        $this->appCertificate = $appCertificate;
        $this->expire         = $expire;
        $this->issueTs        = time();
        $this->salt           = rand(1, 99999999);
    }

    public function addService(Service $service): void
    {
        $this->services[$service->getServiceType()] = $service;
    }

    public function build(): string
    {
        $truncatedSalt = $this->salt & 0xFFFFFFFF;
        $signing       = $this->getSigningKey($truncatedSalt);
        $msg           = $this->packMsg($truncatedSalt);
        $sig           = hash_hmac('sha256', $msg, $signing, true);

        return self::VERSION . base64_encode(
            zlib_encode($this->packContent($sig, $msg), ZLIB_ENCODING_DEFLATE)
        );
    }

    private function packMsg(int $truncatedSalt): string
    {
        $msg  = pack('N', $this->issueTs);
        $msg .= pack('N', $this->expire);
        $msg .= pack('N', $truncatedSalt);
        $msg .= pack('n', count($this->services));

        ksort($this->services);
        foreach ($this->services as $service) {
            $msg .= $service->pack();
        }

        return $msg;
    }

    private function getSigningKey(int $truncatedSalt): string
    {
        return hash_hmac(
            'sha256',
            $this->appId . $this->issueTs . $truncatedSalt,
            $this->appCertificate,
            true
        );
    }

    private function packContent(string $sig, string $msg): string
    {
        return pack('n', strlen($sig))          . $sig
             . pack('n', strlen($this->appId)) . $this->appId
             . pack('n', strlen($msg))          . $msg;
    }
}
