<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ShhPhoto;
use App\Services\PhotoBlurService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin ShhPhoto
 */
class ShhPhotoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $shh = $this->shh;
        $blurService = app(PhotoBlurService::class);
        $blurLevel = $blurService->getBlurLevelForExchangeCount($shh->exchange_count ?? 0);

        $blurPaths = $this->blur_paths ?? [];
        $path = $blurPaths[$blurLevel] ?? $this->original_path;

        $url = $path ? Storage::disk('r2')->temporaryUrl($path, now()->addMinutes(15)) : null;

        return [
            'id' => $this->id,
            'blur_level' => $blurLevel,
            'url' => $url,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
