<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShhGuessRequest;
use App\Models\Shh;
use App\Models\ShhGuess;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShhGuessController extends Controller
{
    private const MAX_ATTEMPTS = 3;

    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    public function store(StoreShhGuessRequest $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role !== 'receiver') {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Seul le destinataire peut deviner.',
                    'status' => 403,
                ],
            ], 403);
        }

        $attemptCount = $shh->guesses()->count();

        if ($attemptCount >= self::MAX_ATTEMPTS) {
            return response()->json([
                'error' => [
                    'code' => 'max_attempts_reached',
                    'message' => 'Tu as utilise tes 3 tentatives.',
                    'status' => 422,
                ],
            ], 422);
        }

        ShhGuess::create([
            'shh_id' => $shh->id,
            'guessed_identifier' => $request->validated('guessed_identifier'),
            'attempt_number' => $attemptCount + 1,
        ]);

        $remaining = self::MAX_ATTEMPTS - ($attemptCount + 1);

        return response()->json([
            'data' => [
                'result' => 'Pas cette fois',
                'attempts_remaining' => $remaining,
            ],
        ]);
    }

    public function index(Request $request, Shh $shh): JsonResponse
    {
        $attemptCount = $shh->guesses()->count();

        return response()->json([
            'data' => [
                'attempts_used' => $attemptCount,
                'attempts_remaining' => max(0, self::MAX_ATTEMPTS - $attemptCount),
            ],
        ]);
    }
}
