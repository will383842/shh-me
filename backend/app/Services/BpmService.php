<?php

declare(strict_types=1);

namespace App\Services;

class BpmService
{
    public function generate(?int $hour = null): int
    {
        $hour = $hour ?? (int) now()->format('G');

        $range = $this->getRangeForHour($hour);
        $baseBpm = random_int($range['min'], $range['max']);

        $variation = random_int(-5, 5);
        $bpm = $baseBpm + $variation;

        $min = (int) config('shhme.bpm_min', 72);
        $max = (int) config('shhme.bpm_max', 110);

        return max($min, min($max, $bpm));
    }

    private function getRangeForHour(int $hour): array
    {
        $ranges = config('shhme.bpm_ranges');

        return match (true) {
            $hour >= 6 && $hour < 9 => $ranges['morning'],
            $hour >= 9 && $hour < 18 => $ranges['daytime'],
            $hour >= 18 && $hour < 22 => $ranges['evening'],
            $hour >= 22 || $hour < 2 => $ranges['night'],
            default => $ranges['deep_night'],
        };
    }
}
