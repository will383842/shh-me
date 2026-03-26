<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhAudio;
use App\Services\ModerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModerateAudio implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 30;

    public int $tries = 3;

    /** @var int[] */
    public array $backoff = [10, 30];

    public function __construct(
        private readonly string $audioId,
    ) {
        $this->onQueue('moderation');
    }

    public function handle(ModerationService $moderationService): void
    {
        try {
            $audio = ShhAudio::find($this->audioId);

            if (! $audio) {
                Log::warning('ModerateAudio: Audio not found', ['audio_id' => $this->audioId]);

                return;
            }

            $audioPath = $audio->filtered_path ?? $audio->original_path;

            if (! $audioPath) {
                Log::warning('ModerateAudio: No audio path available', ['audio_id' => $this->audioId]);

                return;
            }

            // Placeholder: Whisper transcription + GPT-4 moderation
            // In production this will:
            // 1. Download audio from R2
            // 2. Transcribe via Whisper API
            // 3. Moderate transcription via GPT-4 / OpenAI Moderation API
            $audioUrl = Storage::disk('r2')->url($audioPath);
            $verdict = $moderationService->moderateText(''); // Placeholder — will use Whisper transcript

            if ($verdict === 'blocked') {
                // Delete audio files from R2
                if ($audio->original_path) {
                    Storage::disk('r2')->delete($audio->original_path);
                }
                if ($audio->filtered_path) {
                    Storage::disk('r2')->delete($audio->filtered_path);
                }

                $audio->update(['moderation_status' => 'blocked']);

                Log::warning('ModerateAudio: Audio blocked and deleted', [
                    'audio_id' => $this->audioId,
                    'shh_id' => $audio->shh_id,
                ]);

                return;
            }

            $audio->update(['moderation_status' => $verdict]);

            Log::info('ModerateAudio: Moderation complete', [
                'audio_id' => $this->audioId,
                'verdict' => $verdict,
            ]);
        } catch (\Throwable $e) {
            Log::error('ModerateAudio: Failed', [
                'audio_id' => $this->audioId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
