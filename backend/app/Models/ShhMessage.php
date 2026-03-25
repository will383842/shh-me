<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

/**
 * @property string $content_encrypted
 */
class ShhMessage extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'content_encrypted',
        'sender_role',
        'moderation_status',
    ];

    protected function contentEncrypted(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => Crypt::decryptString($value),
            set: fn (string $value) => Crypt::encryptString($value),
        );
    }

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(ShhReaction::class, 'message_id');
    }
}
