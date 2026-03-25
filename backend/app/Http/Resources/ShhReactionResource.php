<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ShhReaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShhReaction
 */
class ShhReactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emoji' => $this->emoji,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
