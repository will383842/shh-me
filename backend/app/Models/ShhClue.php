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
 * @property int $day_number
 * @property string|null $question_text
 * @property string|null $sender_answer
 * @property string|null $clue_text
 * @property string|null $clue_source
 * @property Carbon|null $question_sent_at
 * @property Carbon|null $answer_received_at
 * @property Carbon|null $clue_delivered_at
 * @property Carbon|null $created_at
 */
class ShhClue extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $fillable = [
        'shh_id',
        'day_number',
        'question_text',
        'sender_answer',
        'clue_text',
        'clue_source',
        'question_sent_at',
        'answer_received_at',
        'clue_delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'question_sent_at' => 'datetime',
            'answer_received_at' => 'datetime',
            'clue_delivered_at' => 'datetime',
            'day_number' => 'integer',
        ];
    }

    public function shh(): BelongsTo
    {
        return $this->belongsTo(Shh::class, 'shh_id');
    }
}
