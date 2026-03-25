<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Shh;
use App\Services\PhotoBlurService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Shh
 */
class ShhResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $blurService = app(PhotoBlurService::class);
        $blurLevel = $blurService->getBlurLevelForExchangeCount($this->exchange_count);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'bpm_symbolic' => $this->bpm_symbolic,
            'exchange_count' => $this->exchange_count,
            'has_photo' => $this->has_photo,
            'sender_first_word' => $this->sender_first_word,
            'blur_level' => $blurLevel,
            'expires_at' => $this->expires_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'messages_count' => $this->whenCounted('messages'),
            'photo' => new ShhPhotoResource($this->whenLoaded('photo')),
        ];
    }
}
