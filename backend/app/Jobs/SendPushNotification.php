<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\PushNotificationLog;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 5;

    public int $tries = 2;

    private const MAX_SYSTEM_PER_DAY = 1;

    private const MAX_CONTEXTUAL_PER_DAY = 3;

    public function __construct(
        private readonly string $userId,
        private readonly string $title,
        private readonly string $body,
        private readonly string $type,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        try {
            $user = User::find($this->userId);

            if (! $user || ! $user->device_token) {
                Log::info('SendPushNotification: Skipped (no user or device token)', [
                    'user_id' => $this->userId,
                ]);

                return;
            }

            $isSystem = $this->type === 'system';
            $todayStart = now()->startOfDay();

            $systemCount = PushNotificationLog::where('user_id', $this->userId)
                ->where('is_system', true)
                ->where('sent_at', '>=', $todayStart)
                ->count();

            $contextualCount = PushNotificationLog::where('user_id', $this->userId)
                ->where('is_system', false)
                ->where('sent_at', '>=', $todayStart)
                ->count();

            if ($isSystem && $systemCount >= self::MAX_SYSTEM_PER_DAY) {
                Log::info('SendPushNotification: System push limit reached', [
                    'user_id' => $this->userId,
                    'count' => $systemCount,
                ]);

                return;
            }

            if (! $isSystem && $contextualCount >= self::MAX_CONTEXTUAL_PER_DAY) {
                Log::info('SendPushNotification: Contextual push limit reached', [
                    'user_id' => $this->userId,
                    'count' => $contextualCount,
                ]);

                return;
            }

            // TODO: Send via FCM/APNs when device tokens are available
            // Example:
            // Firebase::messaging()->send([
            //     'token' => $user->device_token,
            //     'notification' => ['title' => $this->title, 'body' => $this->body],
            //     'data' => ['type' => $this->type],
            // ]);

            PushNotificationLog::create([
                'user_id' => $this->userId,
                'type' => $this->type,
                'is_system' => $isSystem,
                'sent_at' => now(),
            ]);

            Log::info('SendPushNotification: Push logged', [
                'user_id' => $this->userId,
                'type' => $this->type,
                'title' => $this->title,
                'body' => $this->body,
            ]);
        } catch (\Throwable $e) {
            Log::error('SendPushNotification: Failed', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
