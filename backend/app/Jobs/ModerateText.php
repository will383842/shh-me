<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ShhMessage;
use App\Services\ModerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ModerateText implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 10;

    public int $tries = 3;

    public function __construct(
        private readonly string $messageId,
    ) {
        $this->onQueue('moderation');
    }

    public function handle(ModerationService $moderationService): void
    {
        try {
            $message = ShhMessage::find($this->messageId);

            if (! $message) {
                Log::warning('ModerateText: Message not found', ['message_id' => $this->messageId]);

                return;
            }

            if ($message->moderation_status !== 'pending') {
                return;
            }

            $verdict = $moderationService->moderateText($message->content_encrypted);

            $message->update(['moderation_status' => $verdict]);

            Log::info('ModerateText: Moderation complete', [
                'message_id' => $this->messageId,
                'verdict' => $verdict,
            ]);
        } catch (\Throwable $e) {
            Log::error('ModerateText: Failed', [
                'message_id' => $this->messageId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
