<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClueTemplate extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'question_id',
        'template_text',
        'locale',
    ];

    public function clueQuestion(): BelongsTo
    {
        return $this->belongsTo(ClueQuestion::class, 'question_id');
    }
}
