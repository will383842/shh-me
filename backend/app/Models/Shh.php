<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $expires_at
 */
class Shh extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'shh';

    protected $fillable = [
        'vault_ref',
        'status',
        'bpm_symbolic',
        'bpm_hour',
        'exchange_count',
        'audio_unlocked',
        'has_photo',
        'sender_first_word',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'exchange_count' => 'integer',
            'audio_unlocked' => 'boolean',
            'has_photo' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ShhMessage::class, 'shh_id');
    }

    public function photo(): HasOne
    {
        return $this->hasOne(ShhPhoto::class, 'shh_id');
    }

    public function guesses(): HasMany
    {
        return $this->hasMany(ShhGuess::class, 'shh_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'expired');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }
}
