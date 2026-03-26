<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $shh_id
 * @property Carbon|null $sender_connected_at
 * @property Carbon|null $receiver_connected_at
 * @property Carbon|null $mutual_at
 * @property string|null $sender_phone
 * @property string|null $receiver_phone
 * @property string|null $video_path
 * @property string $status
 * @property Carbon|null $created_at
 */
class ShhConnect extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'sender_connected_at',
        'receiver_connected_at',
        'mutual_at',
        'sender_phone',
        'receiver_phone',
        'video_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'sender_connected_at' => 'datetime',
            'receiver_connected_at' => 'datetime',
            'mutual_at' => 'datetime',
        ];
    }

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }
}
