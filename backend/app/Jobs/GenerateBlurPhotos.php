<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhPhoto;
use App\Services\PhotoBlurService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateBlurPhotos implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 30;

    public int $tries = 3;

    public function __construct(
        private readonly string $shhId,
        private readonly string $originalPath,
    ) {
        $this->onQueue('default');
    }

    public function handle(PhotoBlurService $blurService): void
    {
        try {
            $photo = ShhPhoto::where('shh_id', $this->shhId)->first();

            if (! $photo) {
                Log::warning('GenerateBlurPhotos: ShhPhoto not found', ['shh_id' => $this->shhId]);

                return;
            }

            if ($photo->blur_levels_generated) {
                return;
            }

            $tempPath = tempnam(sys_get_temp_dir(), 'blur_src_');
            $contents = Storage::disk('r2')->get($this->originalPath);

            if (! $contents) {
                Log::warning('GenerateBlurPhotos: Original photo not found in R2', [
                    'path' => $this->originalPath,
                ]);

                return;
            }

            file_put_contents($tempPath, $contents);

            $blurPaths = $blurService->generateBlurLevels($tempPath, $this->shhId);

            @unlink($tempPath);

            $photo->update([
                'blur_paths' => $blurPaths,
                'blur_levels_generated' => true,
            ]);

            Log::info('GenerateBlurPhotos: Blur levels generated', [
                'shh_id' => $this->shhId,
                'levels' => count($blurPaths),
            ]);
        } catch (\Throwable $e) {
            Log::error('GenerateBlurPhotos: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
