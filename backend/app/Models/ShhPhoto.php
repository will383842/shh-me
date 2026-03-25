<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShhPhoto extends Model
{
    use HasFactory, HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'original_path',
        'blur_paths',
        'blur_levels_generated',
    ];

    protected function casts(): array
    {
        return [
            'blur_paths' => 'array',
            'blur_levels_generated' => 'boolean',
        ];
    }

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }
}
