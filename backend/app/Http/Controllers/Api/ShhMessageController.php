<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShhMessageRequest;
use App\Http\Resources\ShhMessageResource;
use App\Jobs\ModerateText;
use App\Models\Shh;
use App\Models\ShhMessage;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShhMessageController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    public function store(StoreShhMessageRequest $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Tu ne fais pas partie de ce shh.',
                    'status' => 403,
                ],
            ], 403);
        }

        if ($shh->status !== 'active') {
            return response()->json([
                'error' => [
                    'code' => 'shh_inactive',
                    'message' => 'Ce shh ne respire plus.',
                    'status' => 422,
                ],
            ], 422);
        }

        $message = ShhMessage::create([
            'shh_id' => $shh->id,
            'content_encrypted' => $request->validated('content'),
            'sender_role' => $role,
            'moderation_status' => 'pending',
        ]);

        $shh->increment('exchange_count');

        ModerateText::dispatch($message->id);

        return response()->json([
            'data' => new ShhMessageResource($message),
        ], 201);
    }

    public function index(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Tu ne fais pas partie de ce shh.',
                    'status' => 403,
                ],
            ], 403);
        }

        $messages = $shh->messages()
            ->with('reactions')
            ->orderBy('created_at', 'asc')
            ->cursorPaginate(50);

        return response()->json(
            ShhMessageResource::collection($messages)->response()->getData(true)
        );
    }
}
