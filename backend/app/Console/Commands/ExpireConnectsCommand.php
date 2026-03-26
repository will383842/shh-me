<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\ShhConnect;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireConnectsCommand extends Command
{
    protected $signature = 'connect:expire';

    protected $description = 'Expire one-sided connect requests older than 48 hours';

    public function handle(): int
    {
        $cutoff = now()->subHours(48);
        $expiredCount = 0;

        // Find connects where only one side has connected and it's been > 48h
        ShhConnect::where('status', 'pending')
            ->whereNull('mutual_at')
            ->where(function ($query) use ($cutoff) {
                $query->where(function ($q) use ($cutoff) {
                    // Sender connected but receiver did not, and it's been > 48h
                    $q->whereNotNull('sender_connected_at')
                        ->whereNull('receiver_connected_at')
                        ->where('sender_connected_at', '<', $cutoff);
                })->orWhere(function ($q) use ($cutoff) {
                    // Receiver connected but sender did not, and it's been > 48h
                    $q->whereNotNull('receiver_connected_at')
                        ->whereNull('sender_connected_at')
                        ->where('receiver_connected_at', '<', $cutoff);
                });
            })
            ->each(function (ShhConnect $connect) use (&$expiredCount): void {
                $connect->update(['status' => 'expired']);
                $expiredCount++;

                Log::info('ExpireConnectsCommand: Connect expired', [
                    'connect_id' => $connect->id,
                    'shh_id' => $connect->shh_id,
                ]);
            });

        $this->info("Expired {$expiredCount} one-sided connect requests.");

        return self::SUCCESS;
    }
}
