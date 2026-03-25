<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'city' => $this->city,
            'country_code' => $this->country_code,
            'preferred_locale' => $this->preferred_locale,
            'total_shh_received' => $this->total_shh_received ?? 0,
            'total_reveals' => $this->total_reveals ?? 0,
            'onboarding_completed' => $this->onboarding_completed,
            'shh_ghost_enabled' => $this->shh_ghost_enabled,
            'referrer_code' => $this->referrer_code,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
