<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Shh;
use App\Models\UserBlock;
use App\Services\ShhVaultService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExecutePanicExit implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 30;

    public int $tries = 2;

    public function __construct(
        private readonly string $userId,
    ) {
        $this->onQueue('default');
    }

    public function handle(ShhVaultService $vaultService): void
    {
        try {
            DB::beginTransaction();

            $activeShh = Shh::whereIn('status', ['pending', 'active'])->get();

            $contactUserIds = [];

            foreach ($activeShh as $shh) {
                $participants = $vaultService->getParticipantIds($shh->vault_ref);

                if (empty($participants)) {
                    continue;
                }

                $senderId = $participants['senderId'] ?? null;
                $receiverId = $participants['receiverId'] ?? null;

                $isParticipant = $senderId === $this->userId || $receiverId === $this->userId;

                if (! $isParticipant) {
                    continue;
                }

                $otherId = $senderId === $this->userId ? $receiverId : $senderId;

                if ($otherId) {
                    $contactUserIds[$otherId] = true;
                }

                $shh->update(['status' => 'expired']);

                $vaultService->deleteLink($shh->vault_ref);
            }

            foreach (array_keys($contactUserIds) as $blockedId) {
                $exists = UserBlock::where('blocker_id', $this->userId)
                    ->where('blocked_id', $blockedId)
                    ->exists();

                if (! $exists) {
                    UserBlock::create([
                        'blocker_id' => $this->userId,
                        'blocked_id' => $blockedId,
                    ]);
                }
            }

            DB::table('users')
                ->where('id', $this->userId)
                ->update(['paused_until' => now()->addDays(30)]);

            DB::commit();

            Log::info('ExecutePanicExit: Panic exit completed', [
                'user_id' => $this->userId,
                'shh_expired' => count($contactUserIds),
                'contacts_blocked' => count($contactUserIds),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('ExecutePanicExit: Failed', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
