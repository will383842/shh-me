<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ShhMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShhMessage
 */
class ShhMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content_encrypted,
            'sender_role' => $this->sender_role,
            'moderation_status' => $this->moderation_status,
            'created_at' => $this->created_at->toIso8601String(),
            'reactions' => ShhReactionResource::collection($this->whenLoaded('reactions')),
        ];
    }
}
