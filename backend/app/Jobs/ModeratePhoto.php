<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhPhoto;
use App\Services\ModerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModeratePhoto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 15;

    public int $tries = 3;

    public function __construct(
        private readonly string $photoId,
        private readonly string $imagePath,
    ) {
        $this->onQueue('moderation');
    }

    public function handle(ModerationService $moderationService): void
    {
        try {
            $photo = ShhPhoto::find($this->photoId);

            if (! $photo) {
                Log::warning('ModeratePhoto: Photo not found', ['photo_id' => $this->photoId]);

                return;
            }

            $imageUrl = Storage::disk('r2')->url($this->imagePath);

            $verdict = $moderationService->moderatePhoto($imageUrl);

            if ($verdict === 'blocked') {
                Storage::disk('r2')->delete($this->imagePath);

                /** @var array<string> $blurPaths */
                $blurPaths = $photo->blur_paths;
                foreach ($blurPaths as $blurPath) {
                    Storage::disk('r2')->delete($blurPath);
                }

                $photo->update([
                    'moderation_status' => 'blocked',
                ]);

                Log::warning('ModeratePhoto: Photo blocked and deleted from R2', [
                    'photo_id' => $this->photoId,
                    'shh_id' => $photo->shh_id,
                ]);

                return;
            }

            $photo->update([
                'moderation_status' => $verdict,
            ]);

            Log::info('ModeratePhoto: Moderation complete', [
                'photo_id' => $this->photoId,
                'verdict' => $verdict,
            ]);
        } catch (\Throwable $e) {
            Log::error('ModeratePhoto: Failed', [
                'photo_id' => $this->photoId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
