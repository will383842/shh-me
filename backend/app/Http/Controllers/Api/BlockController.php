<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function store(Request $request, User $user): JsonResponse
    {
        /** @var User $blocker */
        $blocker = $request->user();

        if ($blocker->id === $user->id) {
            return response()->json([
                'error' => [
                    'code' => 'self_block',
                    'message' => 'Tu ne peux pas te bloquer toi-meme.',
                    'status' => 422,
                ],
            ], 422);
        }

        $existing = UserBlock::where('blocker_id', $blocker->id)
            ->where('blocked_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'error' => [
                    'code' => 'already_blocked',
                    'message' => 'Cette personne est deja bloquee.',
                    'status' => 409,
                ],
            ], 409);
        }

        UserBlock::create([
            'blocker_id' => $blocker->id,
            'blocked_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Utilisateur bloque.',
        ], 201);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        /** @var User $blocker */
        $blocker = $request->user();

        $deleted = UserBlock::where('blocker_id', $blocker->id)
            ->where('blocked_id', $user->id)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'error' => [
                    'code' => 'not_blocked',
                    'message' => 'Cette personne n\'est pas bloquee.',
                    'status' => 404,
                ],
            ], 404);
        }

        return response()->json([
            'message' => 'Utilisateur debloque.',
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $blocks = $user->blocks()
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(20);

        $data = $blocks->through(function (mixed $block) {
            /** @var UserBlock $block */
            return [
                'id' => $block->id,
                'blocked_id' => $block->blocked_id,
                'created_at' => $block->created_at->toIso8601String(),
            ];
        });

        return response()->json($data);
    }
}
