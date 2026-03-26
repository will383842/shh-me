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

class SendAfternoonClue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 10;

    public int $tries = 3;

    /** @var int[] */
    public array $backoff = [10, 30];

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
                Log::info('SendAfternoonClue: Shh not active', ['shh_id' => $this->shhId]);

                return;
            }

            $dayNumber = (int) $shh->created_at->diffInDays(now()) + 1;

            $clue = ShhClue::where('shh_id', $shh->id)
                ->where('day_number', $dayNumber)
                ->first();

            if (! $clue) {
                Log::info('SendAfternoonClue: No question sent today, skipping', [
                    'shh_id' => $this->shhId,
                    'day_number' => $dayNumber,
                ]);

                return;
            }

            if ($clue->clue_delivered_at) {
                Log::info('SendAfternoonClue: Clue already delivered today', [
                    'shh_id' => $this->shhId,
                    'day_number' => $dayNumber,
                ]);

                return;
            }

            if ($clue->sender_answer && $clue->answer_received_at && $clue->question_text) {
                // Sender answered: generate clue from answer (AI -> template fallback)
                $clueText = $clueService->generateClueWithAI($clue->question_text, $clue->sender_answer);
                if ($clueText === null) {
                    $clueText = $clueService->generateClueFromTemplate($clue);
                }
                $clueSource = 'answer';
            } else {
                // Sender did not answer: auto clue (layer 3 — generic/template)
                $clueText = $clueService->generateAutoClue($shh);
                $clueSource = 'auto';
            }

            $clue->update([
                'clue_text' => $clueText,
                'clue_source' => $clueSource,
                'clue_delivered_at' => now(),
            ]);

            // Push notification to receiver
            $participants = $vaultService->getParticipantIds($shh->vault_ref);
            $receiverId = $participants['receiverId'] ?? null;

            if ($receiverId) {
                SendPushNotification::dispatch(
                    $receiverId,
                    'Shh Me',
                    __('messages.notification.afternoon_clue'),
                    'afternoon_clue',
                );
            }

            Log::info('SendAfternoonClue: Clue delivered', [
                'shh_id' => $this->shhId,
                'clue_id' => $clue->id,
                'clue_source' => $clueSource,
            ]);
        } catch (\Throwable $e) {
            Log::error('SendAfternoonClue: Failed', [
                'shh_id' => $this->shhId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
