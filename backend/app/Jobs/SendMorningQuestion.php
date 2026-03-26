<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Shh;
use App\Models\ShhClue;
use App\Services\ClueService;
use App\Services\ShhVaultService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMorningQuestion implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 10;

    public int $tries = 2;

    public function __construct(
        private readonly string $shhId,
    ) {
        $this->onQueue('clues');
    }

    public function handle(ClueService $clueService, ShhVaultService $vaultService): void
    {
        try {
            $shh = Shh::find($this->shhId);

            if (! $shh || $shh->status !== 'active') {
                Log::info('SendMorningQuestion: Shh not active', ['shh_id' => $this->shhId]);

                return;
            }

            // Calculate day number (days since shh creation)
            $dayNumber = (int) $shh->created_at->diffInDays(now()) + 1;

            // Check if question already sent today
            $existingClue = ShhClue::where('shh_id', $shh->id)
                ->where('day_number', $dayNumber)
                ->first();

            if ($existingClue) {
                Log::info('SendMorningQuestion: Question already sent for today', [
                    'shh_id' => $this->shhId,
                    'day_number' => $dayNumber,
                ]);

                return;
            }

            // Generate question: layer 1 AI, layer 2 DB fallback
            $question = $clueService->generateQuestionWithAI($shh) ?? $clueService->pickFallbackQuestion($shh);

            $clue = ShhClue::create([
                'shh_id' => $shh->id,
                'day_number' => $dayNumber,
                'question_text' => $question,
                'question_sent_at' => now(),
            ]);

            // Push notification to sender
            $participants = $vaultService->getParticipantIds($shh->vault_ref);
            $senderId = $participants['senderId'] ?? null;

            if ($senderId) {
                SendPushNotification::dispatch(
                    $senderId,
                    'Shh Me',
                    __('messages.notification.morning_question'),
                    'morning_question',
                );
            }

            Log::info('SendMorningQuestion: Question sent', [
                'shh_id' => $this->shhId,
                'clue_id' => $clue->id,
                'day_number' => $dayNumber,
            ]);
        } catch (\Throwable $e) {
            Log::error('SendMorningQuestion: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
