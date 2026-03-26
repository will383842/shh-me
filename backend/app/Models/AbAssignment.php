<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbAssignment extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'test_name',
        'variant',
        'converted',
    ];

    protected function casts(): array
    {
        return [
            'converted' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
