<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\CheckConnectMutual;
use App\Models\Shh;
use App\Models\ShhConnect;
use App\Models\User;
use App\Services\ConnectService;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConnectController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
        private readonly ConnectService $connectService,
    ) {}

    /**
     * User requests to connect / reveal identity.
     */
    public function store(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        if ($shh->status !== 'active') {
            return response()->json([
                'error' => ['code' => 'SHH_INACTIVE', 'message' => __('messages.shh.inactive'), 'status' => 422],
            ], 422);
        }

        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $connect = $this->connectService->requestConnect(
            shh: $shh,
            user: $user,
            phone: $request->input('phone'),
        );

        // Check for mutual connect
        CheckConnectMutual::dispatch($shh->id);

        return response()->json([
            'data' => [
                'status' => $connect->status,
                'message' => __('messages.connect.waiting'),
            ],
        ]);
    }

    /**
     * Cancel connect request within 5 seconds.
     */
    public function cancel(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        $cancelled = $this->connectService->cancelConnect(
            shh: $shh,
            user: $user,
        );

        if (! $cancelled) {
            return response()->json([
                'error' => ['code' => 'TOO_LATE', 'message' => __('messages.connect.too_late'), 'status' => 422],
            ], 422);
        }

        return response()->json([
            'data' => ['message' => __('messages.connect.cancelled')],
        ]);
    }

    /**
     * Polling endpoint. Return connect status.
     */
    public function status(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        $connect = ShhConnect::where('shh_id', $shh->id)->first();

        if (! $connect) {
            return response()->json([
                'data' => [
                    'status' => 'none',
                    'sender_connected' => false,
                    'receiver_connected' => false,
                    'mutual' => false,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'status' => $connect->status,
                'sender_connected' => $connect->sender_connected_at !== null,
                'receiver_connected' => $connect->receiver_connected_at !== null,
                'mutual' => $connect->mutual_at !== null,
                'mutual_at' => $connect->mutual_at?->toIso8601String(),
                'video_ready' => $connect->video_path !== null,
            ],
        ]);
    }

    /**
     * Return signed URL for reveal video. Only if mutual.
     */
    public function video(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        $connect = ShhConnect::where('shh_id', $shh->id)
            ->whereNotNull('mutual_at')
            ->first();

        if (! $connect) {
            return response()->json([
                'error' => ['code' => 'NOT_MUTUAL', 'message' => __('messages.error.forbidden'), 'status' => 403],
            ], 403);
        }

        if (! $connect->video_path) {
            return response()->json([
                'data' => [
                    'status' => 'generating',
                    'message' => __('messages.connect.video_generating'),
                    'video_url' => null,
                ],
            ]);
        }

        $url = Storage::disk('r2')->temporaryUrl($connect->video_path, now()->addMinutes(30));

        return response()->json([
            'data' => [
                'status' => 'ready',
                'video_url' => $url,
            ],
        ]);
    }
}
