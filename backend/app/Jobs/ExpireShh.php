<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Shh;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireShh implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 5;

    public int $tries = 3;

    public function __construct(
        private readonly string $shhId,
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        try {
            $shh = Shh::find($this->shhId);

            if (! $shh) {
                Log::warning('ExpireShh: Shh not found', ['shh_id' => $this->shhId]);

                return;
            }

            if ($shh->status === 'expired') {
                return;
            }

            $shh->update(['status' => 'expired']);

            Log::info('ExpireShh: Shh expired', ['shh_id' => $this->shhId]);
        } catch (\Throwable $e) {
            Log::error('ExpireShh: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
