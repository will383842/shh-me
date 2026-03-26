<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhConnect;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateConnectVideo implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;

    public int $tries = 2;

    public function __construct(
        private readonly string $shhId,
    ) {
        $this->onQueue('video');
    }

    /**
     * Unique ID for ShouldBeUnique — one video generation per shh at a time.
     */
    public function uniqueId(): string
    {
        return $this->shhId;
    }

    public function handle(): void
    {
        try {
            $connect = ShhConnect::where('shh_id', $this->shhId)
                ->whereNotNull('mutual_at')
                ->first();

            if (! $connect) {
                Log::warning('GenerateConnectVideo: No mutual connect found', ['shh_id' => $this->shhId]);

                return;
            }

            if ($connect->video_path) {
                Log::info('GenerateConnectVideo: Video already generated', ['shh_id' => $this->shhId]);

                return;
            }

            // TODO: FFmpeg video generation
            // This is a placeholder for the complex reveal video generation.
            // The video will combine:
            // - ECG heartbeat animation
            // - Both users' profile elements
            // - Dramatic reveal transition
            // Implementation will use FFmpeg via PHP-FFMpeg or shell exec.

            $videoPath = "shh/{$this->shhId}/connect/reveal.mp4";

            // Placeholder: mark as generated with placeholder path
            // In production, actual video file will be generated and uploaded to R2
            $connect->update(['video_path' => $videoPath]);

            Log::info('GenerateConnectVideo: Video generation complete (placeholder)', [
                'shh_id' => $this->shhId,
                'video_path' => $videoPath,
            ]);
        } catch (\Throwable $e) {
            Log::error('GenerateConnectVideo: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
