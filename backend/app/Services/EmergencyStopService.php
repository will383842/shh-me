<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Redis\Connections\Connection;
use Illuminate\Support\Facades\Redis;

final class EmergencyStopService
{
    private const KEYS = [
        'audio',
        'reveal',
        'mur',
        'radar',
        'all',
    ];

    private function redis(): Connection
    {
        return Redis::connection('persistent');
    }

    private function redisKey(string $feature): string
    {
        return "emergency:stop:{$feature}";
    }

    /**
     * @return array<string, bool>
     */
    public function getStatus(): array
    {
        $status = [];

        foreach (self::KEYS as $key) {
            $status[$key] = $this->isActive($key);
        }

        return $status;
    }

    public function toggle(string $key): bool
    {
        $this->validateKey($key);

        $current = $this->isActive($key);
        $new = ! $current;

        $this->redis()->set($this->redisKey($key), $new ? '1' : '0');

        return $new;
    }

    public function isActive(string $key): bool
    {
        $this->validateKey($key);

        return $this->redis()->get($this->redisKey($key)) === '1';
    }

    private function validateKey(string $key): void
    {
        if (! in_array($key, self::KEYS, true)) {
            throw new \InvalidArgumentException("Invalid emergency stop key: {$key}");
        }
    }
}
