<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendAfternoonClue;
use App\Models\Shh;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAfternoonCluesCommand extends Command
{
    protected $signature = 'clue:send-afternoon-clues';

    protected $description = 'Send afternoon clues to receivers for active shh (runs every 30min, targets 12h-15h local time)';

    public function handle(ShhVaultService $vaultService): int
    {
        $currentUtcHour = (int) now()->format('G');

        // Find timezones where local time is between 12h and 15h
        $targetOffsets = [];
        for ($localHour = 12; $localHour <= 15; $localHour++) {
            $offset = $localHour - $currentUtcHour;
            // Normalize to valid UTC offset range (-12 to +14)
            if ($offset > 14) {
                $offset -= 24;
            }
            $targetOffsets[] = $offset;
        }

        // Collect all matching timezone names
        $targetTimezones = [];
        foreach ($targetOffsets as $offset) {
            $targetTimezones = array_merge($targetTimezones, $this->getTimezonesForOffset($offset));
        }

        if (empty($targetTimezones)) {
            $this->info('No timezones in 12h-15h window.');

            return self::SUCCESS;
        }

        $dispatched = 0;

        Shh::where('status', 'active')
            ->each(function (Shh $shh) use ($vaultService, $targetTimezones, &$dispatched): void {
                $participants = $vaultService->getParticipantIds($shh->vault_ref);
                $receiverId = $participants['receiverId'] ?? null;

                if (! $receiverId) {
                    return;
                }

                // Check if receiver's timezone is in the afternoon window
                $receiverUser = User::find($receiverId);
                if (! $receiverUser || ! in_array($receiverUser->timezone, $targetTimezones, true)) {
                    return;
                }

                // Random delay 0-10800 seconds (0-3 hours) for organic feel
                $delaySec = random_int(0, 10800);

                SendAfternoonClue::dispatch($shh->id)->delay(now()->addSeconds($delaySec));
                $dispatched++;
            });

        $this->info("Dispatched {$dispatched} afternoon clues with random delays.");

        Log::info('SendAfternoonCluesCommand: Complete', [
            'dispatched' => $dispatched,
            'target_offsets' => $targetOffsets,
        ]);

        return self::SUCCESS;
    }

    /**
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
