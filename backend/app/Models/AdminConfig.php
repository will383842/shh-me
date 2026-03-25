<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminConfig extends Model
{
    const CREATED_AT = null;

    protected $fillable = [
        'key',
        'value',
        'description',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }
}
