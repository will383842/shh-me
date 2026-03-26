<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property Carbon|null $paused_until
 * @property Carbon|null $last_active_at
 * @property Carbon|null $accepted_terms_at
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'apple_id',
        'google_id',
        'email',
        'birth_year',
        'city',
        'country_code',
        'preferred_locale',
        'timezone',
        'device_token',
        'onboarding_completed',
        'referrer_code',
        'referred_by',
        'last_active_at',
        'shh_ghost_enabled',
        'accepted_terms_at',
        'paused_until',
    ];

    protected $hidden = [
        'apple_id',
        'google_id',
        'device_token',
    ];

    protected function casts(): array
    {
        return [
            'birth_year' => 'integer',
            'onboarding_completed' => 'boolean',
            'shh_ghost_enabled' => 'boolean',
            'is_premium' => 'boolean',
            'last_active_at' => 'datetime',
            'accepted_terms_at' => 'datetime',
            'paused_until' => 'datetime',
        ];
    }

    public function shh(): HasMany
    {
        return $this->hasMany(Shh::class, 'id')
            ->whereIn('vault_ref', function ($query) {
                $query->select('id')
                    ->from('vault_shh_links')
                    ->whereRaw('sender_encrypted = ? OR receiver_encrypted = ?', [$this->id, $this->id]);
            });
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(UserBlock::class, 'blocker_id');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(UserContact::class, 'user_id');
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(UserFeedback::class, 'user_id');
    }
}
