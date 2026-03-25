<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\ExpireShh;
use App\Models\Shh;
use Illuminate\Console\Command;

class ExpireShhCommand extends Command
{
    protected $signature = 'shh:expire';

    protected $description = 'Expire pending shh past their expiration date and inactive shh with no messages in 7 days';

    public function handle(): int
    {
        $expiredCount = 0;

        // Pending shh past expiration
        Shh::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->each(function (Shh $shh) use (&$expiredCount): void {
                ExpireShh::dispatch($shh->id);
                $expiredCount++;
            });

        // Active shh with no messages in 7 days
        $staleDate = now()->subDays(7);

        Shh::where('status', 'active')
            ->whereDoesntHave('messages', function ($query) use ($staleDate): void {
                $query->where('created_at', '>=', $staleDate);
            })
            ->each(function (Shh $shh) use (&$expiredCount): void {
                ExpireShh::dispatch($shh->id);
                $expiredCount++;
            });

        $this->info("Dispatched {$expiredCount} ExpireShh jobs.");

        return self::SUCCESS;
    }
}
