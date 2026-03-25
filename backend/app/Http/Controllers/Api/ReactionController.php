<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShhMessage;
use App\Models\ShhReaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    private const ALLOWED_EMOJIS = ['shh', 'heart'];

    public function store(Request $request, ShhMessage $message): JsonResponse
    {
        $request->validate([
            'emoji' => ['required', 'string', 'in:'.implode(',', self::ALLOWED_EMOJIS)],
        ]);

        /** @var User $user */
        $user = $request->user();

        $existing = ShhReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->update(['emoji' => $request->input('emoji')]);

            return response()->json([
                'data' => [
                    'id' => $existing->id,
                    'emoji' => $existing->emoji,
                ],
            ]);
        }

        $reaction = ShhReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => $request->input('emoji'),
        ]);

        return response()->json([
            'data' => [
                'id' => $reaction->id,
                'emoji' => $reaction->emoji,
            ],
        ], 201);
    }

    public function destroy(Request $request, ShhMessage $message): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $deleted = ShhReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'error' => [
                    'code' => 'no_reaction',
                    'message' => 'Aucune reaction a supprimer.',
                    'status' => 404,
                ],
            ], 404);
        }

        return response()->json([
            'message' => 'Reaction retiree.',
        ]);
    }
}
