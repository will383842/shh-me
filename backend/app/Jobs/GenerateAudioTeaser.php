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

class GenerateAudioTeaser implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 5;

    public int $tries = 2;

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
                Log::warning('GenerateAudioTeaser: Audio not found', ['audio_id' => $this->audioId]);

                return;
            }

            if (! $audio->filtered_path) {
                Log::warning('GenerateAudioTeaser: No filtered path available', ['audio_id' => $this->audioId]);

                return;
            }

            // Generate 3-second teaser from the filtered audio
            $teaserPath = $audioFilterService->generateTeaser(
                filteredPath: $audio->filtered_path,
            );

            $audio->update(['teaser_path' => $teaserPath]);

            Log::info('GenerateAudioTeaser: Teaser generated', [
                'audio_id' => $this->audioId,
                'teaser_path' => $teaserPath,
            ]);
        } catch (\Throwable $e) {
            Log::error('GenerateAudioTeaser: Failed', [
                'audio_id' => $this->audioId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
