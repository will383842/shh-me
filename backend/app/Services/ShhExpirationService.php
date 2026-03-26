<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Shh;

class ShhExpirationService
{
    /**
     * Get the translation key for humanized expiration microcopy.
     * Never shows a cold countdown timer — always poetic/emotional phrasing.
     */
    public function getMicrocopyKey(Shh $shh): string
    {
        $hoursRemaining = $this->getHoursRemaining($shh);

        /** @var array<int, string> $microcopy */
        $microcopy = config('shhme.expiration_microcopy', []);

        // Walk thresholds from highest to lowest
        foreach ($microcopy as $threshold => $key) {
            if ($hoursRemaining > $threshold && $threshold > 0) {
                return $key;
            }
        }

        // Check specific thresholds in order
        if ($hoursRemaining > 48) {
            return $microcopy[48] ?? 'shh.expiration.breathing';
        }

        if ($hoursRemaining > 24) {
            return $microcopy[24] ?? 'shh.expiration.weakening';
        }

        if ($hoursRemaining > 6) {
            return $microcopy[6] ?? 'shh.expiration.last_moments';
        }

        return $microcopy[0] ?? 'shh.expiration.existed';
    }

    /**
     * Calculate hours remaining until expiration.
     * Returns negative values if already expired.
     */
    public function getHoursRemaining(Shh $shh): float
    {
        if (! $shh->expires_at) {
            return 0.0;
        }

        return (float) now()->diffInMinutes($shh->expires_at, false) / 60;
    }

    /**
     * Determine if an expiration push notification should be sent.
     * Returns the push type string if a threshold is being crossed, null otherwise.
     *
     * Intended to be called by a cron job that checks active shh records.
     * Push types: '24h' when crossing the 24-hour mark, '6h' when crossing the 6-hour mark.
     */
    public function shouldSendExpirationPush(Shh $shh): ?string
    {
        $hoursRemaining = $this->getHoursRemaining($shh);

        // Already expired
        if ($hoursRemaining <= 0) {
            return null;
        }

        // Crossing the 24h threshold (between 23h and 24h window for cron granularity)
        if ($hoursRemaining <= 24 && $hoursRemaining > 23) {
            return '24h';
        }

        // Crossing the 6h threshold (between 5h and 6h window for cron granularity)
        if ($hoursRemaining <= 6 && $hoursRemaining > 5) {
            return '6h';
        }

        return null;
    }
}
