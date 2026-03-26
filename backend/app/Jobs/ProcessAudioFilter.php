<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhAudio;
use App\Services\AudioFilterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAudioFilter implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 15;

    public int $tries = 3;

    /** @var int[] */
    public array $backoff = [5, 15];

    public function __construct(
        private readonly string $audioId,
    ) {
        $this->onQueue('audio');
    }

    public function handle(AudioFilterService $audioFilterService): void
    {
        try {
            $audio = ShhAudio::find($this->audioId);

            if (! $audio) {
                Log::warning('ProcessAudioFilter: Audio not found', ['audio_id' => $this->audioId]);

                return;
            }

            if (! $audio->original_path) {
                Log::warning('ProcessAudioFilter: No original path', ['audio_id' => $this->audioId]);

                return;
            }

            $filteredPath = $audioFilterService->applyFilter(
                inputPath: $audio->original_path,
            );

            $audio->update(['filtered_path' => $filteredPath]);

            Log::info('ProcessAudioFilter: Filter applied', [
                'audio_id' => $this->audioId,
                'filtered_path' => $filteredPath,
            ]);

            // Dispatch moderation after filtering
            ModerateAudio::dispatch($audio->id);
        } catch (\Throwable $e) {
            Log::error('ProcessAudioFilter: Failed', [
                'audio_id' => $this->audioId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
