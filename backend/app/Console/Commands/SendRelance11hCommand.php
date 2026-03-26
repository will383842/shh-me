<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendPushNotification;
use App\Models\Shh;
use App\Models\ShhClue;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendRelance11hCommand extends Command
{
    protected $signature = 'clue:send-relance-11h';

    protected $description = 'Nudge senders who received a clue question today but have not answered (runs hourly, targets ~11h local time)';

    public function handle(ShhVaultService $vaultService): int
    {
        $currentUtcHour = (int) now()->format('G');

        // Calculate which timezone offset has ~11h right now
        $targetOffset = 11 - $currentUtcHour;

        // Normalize offset to valid range
        if ($targetOffset < -12) { /** @phpstan-ignore smaller.alwaysFalse */
            $targetOffset += 24;
        }

        $targetTimezones = $this->getTimezonesForOffset($targetOffset);

        if (empty($targetTimezones)) {
            $this->info("No timezones matched for offset {$targetOffset}.");

            return self::SUCCESS;
        }

        $dispatched = 0;
        $todayStart = now()->startOfDay();

        Shh::where('status', 'active')
            ->each(function (Shh $shh) use ($vaultService, $targetTimezones, $todayStart, &$dispatched): void {
                $participants = $vaultService->getParticipantIds($shh->vault_ref);
                $senderId = $participants['senderId'] ?? null;

                if (! $senderId) {
                    return;
                }

                // Check if sender's timezone matches target
                $senderUser = User::find($senderId);
                if (! $senderUser || ! in_array($senderUser->timezone, $targetTimezones, true)) {
                    return;
                }

                // Find clue question sent today with no answer
                $unansweredClue = ShhClue::where('shh_id', $shh->id)
                    ->where('question_sent_at', '>=', $todayStart)
                    ->whereNull('answer_received_at')
                    ->exists();

                if (! $unansweredClue) {
                    return;
                }

                SendPushNotification::dispatch(
                    $senderId,
                    'Shh Me',
                    __('messages.relance.morning_11h', [], $senderUser->preferred_locale ?? 'en'),
                    'contextual',
                );
                $dispatched++;
            });

        $this->info("Dispatched {$dispatched} relance pushes (offset: {$targetOffset}).");

        Log::info('SendRelance11hCommand: Complete', [
            'dispatched' => $dispatched,
            'target_offset' => $targetOffset,
        ]);

        return self::SUCCESS;
    }

    /**
     * Map a UTC offset to common timezone identifiers.
     *
     * @return string[]
     */
    private function getTimezonesForOffset(int $offset): array
    {
        $map = [
            -12 => ['Pacific/Baker'],
            -11 => ['Pacific/Pago_Pago', 'Pacific/Midway'],
            -10 => ['Pacific/Honolulu', 'US/Hawaii'],
            -9 => ['America/Anchorage', 'US/Alaska'],
            -8 => ['America/Los_Angeles', 'US/Pacific'],
            -7 => ['America/Denver', 'US/Mountain'],
            -6 => ['America/Chicago', 'US/Central', 'America/Mexico_City'],
            -5 => ['America/New_York', 'US/Eastern', 'America/Toronto', 'America/Bogota'],
            -4 => ['America/Caracas', 'America/Santiago', 'America/Halifax'],
            -3 => ['America/Sao_Paulo', 'America/Argentina/Buenos_Aires'],
            -2 => ['Atlantic/South_Georgia'],
            -1 => ['Atlantic/Azores', 'Atlantic/Cape_Verde'],
            0 => ['UTC', 'Europe/London', 'Africa/Casablanca'],
            1 => ['Europe/Paris', 'Europe/Berlin', 'Africa/Lagos', 'Europe/Brussels'],
            2 => ['Europe/Bucharest', 'Africa/Cairo', 'Africa/Johannesburg', 'Europe/Helsinki'],
            3 => ['Europe/Moscow', 'Asia/Riyadh', 'Africa/Nairobi'],
            4 => ['Asia/Dubai', 'Asia/Baku'],
            5 => ['Asia/Karachi', 'Asia/Tashkent'],
            6 => ['Asia/Dhaka', 'Asia/Almaty'],
            7 => ['Asia/Bangkok', 'Asia/Jakarta'],
            8 => ['Asia/Shanghai', 'Asia/Singapore', 'Asia/Hong_Kong', 'Australia/Perth'],
            9 => ['Asia/Tokyo', 'Asia/Seoul'],
            10 => ['Australia/Sydney', 'Pacific/Guam'],
            11 => ['Pacific/Noumea', 'Asia/Magadan'],
            12 => ['Pacific/Auckland', 'Pacific/Fiji'],
            13 => ['Pacific/Tongatapu'],
            14 => ['Pacific/Kiritimati'],
        ];

        return $map[$offset] ?? [];
    }
}
