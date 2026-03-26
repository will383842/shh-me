<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClueQuestion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'level',
        'day_range',
        'question_text',
        'locale',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function templates(): HasMany
    {
        return $this->hasMany(ClueTemplate::class, 'question_id');
    }
}
