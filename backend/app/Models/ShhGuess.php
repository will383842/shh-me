<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShhGuess extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'guessed_identifier',
        'attempt_number',
    ];

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }
}
