<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbTest extends Model
{
    protected $fillable = [
        'name',
        'variants',
        'weights',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'weights' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
