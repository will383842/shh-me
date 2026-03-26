<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shh;
use App\Models\ShhClue;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClueController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    /**
     * List all delivered clues for this shh. Only receiver sees clues.
     */
    public function index(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role !== 'receiver') {
            return response()->json([
                'error' => ['code' => 'RECEIVER_ONLY', 'message' => __('messages.error.forbidden'), 'status' => 403],
            ], 403);
        }

        $clues = ShhClue::where('shh_id', $shh->id)
            ->whereNotNull('clue_delivered_at')
            ->orderBy('day_number', 'asc')
            ->get()
            ->map(fn (ShhClue $clue): array => [
                'id' => $clue->id,
                'day_number' => $clue->day_number,
                'clue_text' => $clue->clue_text,
                'clue_source' => $clue->clue_source,
                'clue_delivered_at' => $clue->clue_delivered_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $clues]);
    }

    /**
     * Return today's question for the sender. Only sender sees questions.
     */
    public function todayQuestion(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role !== 'sender') {
            return response()->json([
                'error' => ['code' => 'SENDER_ONLY', 'message' => __('messages.error.forbidden'), 'status' => 403],
            ], 403);
        }

        $todayClue = ShhClue::where('shh_id', $shh->id)
            ->whereNotNull('question_sent_at')
            ->whereNull('answer_received_at')
            ->orderBy('day_number', 'desc')
            ->first();

        if (! $todayClue) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id' => $todayClue->id,
                'day_number' => $todayClue->day_number,
                'question_text' => $todayClue->question_text,
                'question_sent_at' => $todayClue->question_sent_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Sender answers today's question. Update ShhClue with sender_answer + answer_received_at.
     */
    public function answerQuestion(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role !== 'sender') {
            return response()->json([
                'error' => ['code' => 'SENDER_ONLY', 'message' => __('messages.error.forbidden'), 'status' => 403],
            ], 403);
        }

        $request->validate([
            'clue_id' => ['required', 'string'],
            'answer' => ['required', 'string', 'max:500'],
        ]);

        $clue = ShhClue::where('id', $request->input('clue_id'))
            ->where('shh_id', $shh->id)
            ->whereNotNull('question_sent_at')
            ->whereNull('answer_received_at')
            ->first();

        if (! $clue) {
            return response()->json([
                'error' => ['code' => 'CLUE_NOT_FOUND', 'message' => __('messages.error.not_found'), 'status' => 404],
            ], 404);
        }

        $clue->update([
            'sender_answer' => $request->input('answer'),
            'answer_received_at' => now(),
        ]);

        return response()->json([
            'data' => ['message' => __('messages.clue.answered')],
        ]);
    }
}
