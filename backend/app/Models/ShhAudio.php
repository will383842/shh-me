<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $shh_id
 * @property string|null $original_path
 * @property string|null $filtered_path
 * @property string|null $teaser_path
 * @property int|null $duration_seconds
 * @property string|null $sender_role
 * @property string $moderation_status
 * @property bool $validated_by_sender
 * @property Carbon|null $created_at
 */
class ShhAudio extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'shh_audio';

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'original_path',
        'filtered_path',
        'teaser_path',
        'duration_seconds',
        'sender_role',
        'moderation_status',
        'validated_by_sender',
    ];

    protected function casts(): array
    {
        return [
            'validated_by_sender' => 'boolean',
            'duration_seconds' => 'integer',
        ];
    }

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }
}
