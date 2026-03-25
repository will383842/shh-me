<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->update($request->validated());

        return response()->json([
            'data' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->vaultService->deleteAllLinks((string) $user->id);

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Ton compte a disparu, comme un souffle.',
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'blocks_count' => $user->blocks()->count(),
                'feedbacks_count' => $user->feedbacks()->count(),
                'exported_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
