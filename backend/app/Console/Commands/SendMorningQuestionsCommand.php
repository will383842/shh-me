<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendMorningQuestion;
use App\Jobs\SendPushNotification;
use App\Models\Shh;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendMorningQuestionsCommand extends Command
{
    protected $signature = 'clue:send-morning-questions';

    protected $description = 'Send morning questions to senders for active shh (runs hourly, targets ~9h local time)';

    /**
     * Timezones grouped by UTC offset where it is approximately 9:00 AM.
     * Runs hourly — each run targets a band of timezones where current UTC hour maps to ~9h local.
     */
    public function handle(ShhVaultService $vaultService): int
    {
        $currentUtcHour = (int) now()->format('G');

        // Calculate which timezone offset has ~9h right now
        // If UTC is 7 → offset +2 has 9h, if UTC is 0 → offset +9 has 9h, etc.
        $targetOffset = 9 - $currentUtcHour;

        // Normalize offset to valid range (-12 to +14)
        if ($targetOffset < -12) {
            $targetOffset += 24;
        }

        // Common timezone names for each offset
        $targetTimezones = $this->getTimezonesForOffset($targetOffset);

        if (empty($targetTimezones)) {
            $this->info("No timezones matched for offset {$targetOffset}.");

            return self::SUCCESS;
        }

        $dispatched = 0;
        $anticipation = 0;

        Shh::where('status', 'active')
            ->each(function (Shh $shh) use ($vaultService, $targetTimezones, &$dispatched, &$anticipation): void {
                $participants = $vaultService->getParticipantIds($shh->vault_ref);
                $senderId = $participants['senderId'] ?? null;
                $receiverId = $participants['receiverId'] ?? null;

                if (! $senderId) {
                    return;
                }

                // Check if sender's timezone matches target
                $senderUser = User::find($senderId);
                if (! $senderUser || ! in_array($senderUser->timezone, $targetTimezones, true)) {
                    return;
                }

                SendMorningQuestion::dispatch($shh->id);
                $dispatched++;

                // Also dispatch anticipation push to receiver
                if ($receiverId) {
                    SendPushNotification::dispatch(
                        $receiverId,
                        'Shh Me',
                        __('messages.notification.morning_anticipation'),
                        'morning_anticipation',
                    );
                    $anticipation++;
                }
            });

        $this->info("Dispatched {$dispatched} morning questions + {$anticipation} anticipation pushes (offset: {$targetOffset}).");

        Log::info('SendMorningQuestionsCommand: Complete', [
            'dispatched' => $dispatched,
            'anticipation' => $anticipation,
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
