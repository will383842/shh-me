<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PurgeGpsDataCommand extends Command
{
    protected $signature = 'purge:gps-data';

    protected $description = 'Purge expired GPS location data for privacy compliance';

    public function handle(): int
    {
        // TODO: Implement when GPS tables are created
        // Expected behavior:
        // - Delete GPS records older than retention period
        // - Anonymize location data past threshold
        // - Log purge statistics

        Log::info('PurgeGpsDataCommand: Placeholder executed, GPS tables not yet created.');

        $this->info('GPS data purge: no tables to process yet.');

        return self::SUCCESS;
    }
}
