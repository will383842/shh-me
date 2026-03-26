<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\GenerateConnectVideo;
use App\Models\Shh;
use App\Models\ShhConnect;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ConnectService
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    /**
     * Create or update a connect request for the given user on this shh.
     * Sets the appropriate timestamp and phone based on whether the user is sender or receiver.
     */
    public function requestConnect(Shh $shh, User $user, string $phone): ShhConnect
    {
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            throw new \InvalidArgumentException('User is not a participant in this shh.');
        }

        $connect = ShhConnect::firstOrCreate(
            ['shh_id' => $shh->id],
            ['status' => 'pending', 'created_at' => now()]
        );

        if ($role === 'sender') {
            $connect->sender_connected_at = now();
            $connect->sender_phone = $phone;
        } else {
            $connect->receiver_connected_at = now();
            $connect->receiver_phone = $phone;
        }

        $connect->save();

        $this->checkMutual($connect);

        return $connect->fresh();
    }

    /**
     * Cancel a connect request if within the allowed cancellation window.
     * Returns true if successfully cancelled, false if the window has passed.
     */
    public function cancelConnect(Shh $shh, User $user): bool
    {
        $connect = ShhConnect::where('shh_id', $shh->id)->first();

        if (! $connect) {
            return false;
        }

        $role = $this->vaultService->getRole($shh->vault_ref, $user);
        $cancelWindow = (int) config('shhme.connect_cancel_seconds', 5);

        if ($role === 'sender' && $connect->sender_connected_at) {
            if ($connect->sender_connected_at->diffInSeconds(now()) > $cancelWindow) {
                return false;
            }

            $connect->sender_connected_at = null;
            $connect->sender_phone = null;
        } elseif ($role === 'receiver' && $connect->receiver_connected_at) {
            if ($connect->receiver_connected_at->diffInSeconds(now()) > $cancelWindow) {
                return false;
            }

            $connect->receiver_connected_at = null;
            $connect->receiver_phone = null;
        } else {
            return false;
        }

        // If neither side is connected anymore, remove the record
        if (! $connect->sender_connected_at && ! $connect->receiver_connected_at) {
            $connect->delete();

            return true;
        }

        $connect->save();

        return true;
    }

    /**
     * Check if both sides have connected. If mutual:
     * - Set mutual_at timestamp
     * - Update shh status to 'connected'
     * - Dispatch video generation job
     *
     * Returns true if the connect is now mutual.
     */
    public function checkMutual(ShhConnect $connect): bool
    {
        if ($connect->mutual_at) {
            return true;
        }

        if (! $connect->sender_connected_at || ! $connect->receiver_connected_at) {
            return false;
        }

        $connect->mutual_at = now();
        $connect->status = 'mutual';
        $connect->save();

        // Update the parent shh status
        $shh = Shh::find($connect->shh_id);
        if ($shh) {
            $shh->status = 'connected';
            $shh->save();
        }

        // Dispatch video generation job if the class exists
        if (class_exists(GenerateConnectVideo::class)) {
            GenerateConnectVideo::dispatch($connect->shh_id);
        }

        Log::info('ConnectService: Mutual connect achieved', [
            'shh_id' => $connect->shh_id,
            'connect_id' => $connect->id,
        ]);

        return true;
    }

    /**
     * Return the current connect status for polling.
     *
     * @return array{status: string, sender_connected: bool, receiver_connected: bool, mutual: bool, mutual_at: ?string, video_path: ?string}
     */
    public function getStatus(Shh $shh): array
    {
        $connect = ShhConnect::where('shh_id', $shh->id)->first();

        if (! $connect) {
            return [
                'status' => 'none',
                'sender_connected' => false,
                'receiver_connected' => false,
                'mutual' => false,
                'mutual_at' => null,
                'video_path' => null,
            ];
        }

        return [
            'status' => $connect->status,
            'sender_connected' => $connect->sender_connected_at !== null,
            'receiver_connected' => $connect->receiver_connected_at !== null,
            'mutual' => $connect->mutual_at !== null,
            'mutual_at' => $connect->mutual_at?->toIso8601String(),
            'video_path' => $connect->video_path,
        ];
    }
}
