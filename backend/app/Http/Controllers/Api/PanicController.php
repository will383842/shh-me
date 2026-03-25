<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shh;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserContact;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PanicController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    public function trigger(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        DB::transaction(function () use ($user) {
            // Delete all active shh via vault
            $this->vaultService->deleteAllLinks((string) $user->id);

            // Block all contacts
            $contacts = UserContact::where('user_id', $user->id)->get();
            foreach ($contacts as $contact) {
                UserBlock::firstOrCreate([
                    'blocker_id' => $user->id,
                    'blocked_id' => $contact->contact_user_id ?? $contact->id,
                ]);
            }

            // Pause account for 24h
            $user->update([
                'paused_until' => now()->addHours(24),
            ]);
        });

        return response()->json([
            'message' => 'Mode panique active. Tout a ete efface. Respire.',
        ]);
    }
}
