<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhConnect;
use App\Services\ConnectService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckConnectMutual implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 5;

    public int $tries = 3;

    public function __construct(
        private readonly string $shhId,
    ) {
        $this->onQueue('default');
    }

    public function handle(ConnectService $connectService): void
    {
        try {
            $connect = ShhConnect::where('shh_id', $this->shhId)->first();

            if (! $connect) {
                Log::info('CheckConnectMutual: No connect record found', ['shh_id' => $this->shhId]);

                return;
            }

            if ($connect->mutual_at) {
                Log::info('CheckConnectMutual: Already mutual', ['shh_id' => $this->shhId]);

                return;
            }

            $isMutual = $connectService->checkMutual($connect);

            if ($isMutual) {
                Log::info('CheckConnectMutual: Mutual connect detected, dispatching video generation', [
                    'shh_id' => $this->shhId,
                ]);

                GenerateConnectVideo::dispatch($this->shhId);
            }
        } catch (\Throwable $e) {
            Log::error('CheckConnectMutual: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
