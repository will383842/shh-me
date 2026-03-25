<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function apple(Request $request): JsonResponse
    {
        $request->validate([
            'apple_token' => ['required', 'string'],
            'apple_id' => ['required', 'string'],
            'birth_year' => ['required', 'integer'],
            'email' => ['nullable', 'email'],
        ]);

        $minimumAge = (int) config('shhme.minimum_age', 18);
        $age = (int) date('Y') - (int) $request->input('birth_year');

        if ($age < $minimumAge) {
            return response()->json([
                'error' => [
                    'code' => 'age_restricted',
                    'message' => 'Tu dois avoir au moins '.$minimumAge.' ans pour utiliser Shh Me.',
                    'status' => 403,
                ],
            ], 403);
        }

        // TODO: Validate apple_token with Apple's servers
        // For now, find or create user by apple_id

        $user = User::where('apple_id', $request->input('apple_id'))->first();

        if (! $user) {
            $user = User::create([
                'apple_id' => $request->input('apple_id'),
                'email' => $request->input('email'),
                'birth_year' => $request->input('birth_year'),
                'referrer_code' => Str::random(8),
                'accepted_terms_at' => now(),
            ]);
        }

        $token = $user->createToken('shh-me-mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function google(Request $request): JsonResponse
    {
        $request->validate([
            'google_token' => ['required', 'string'],
            'google_id' => ['required', 'string'],
            'birth_year' => ['required', 'integer'],
            'email' => ['nullable', 'email'],
        ]);

        $minimumAge = (int) config('shhme.minimum_age', 18);
        $age = (int) date('Y') - (int) $request->input('birth_year');

        if ($age < $minimumAge) {
            return response()->json([
                'error' => [
                    'code' => 'age_restricted',
                    'message' => 'Tu dois avoir au moins '.$minimumAge.' ans pour utiliser Shh Me.',
                    'status' => 403,
                ],
            ], 403);
        }

        // TODO: Validate google_token with Google's servers
        // For now, find or create user by google_id

        $user = User::where('google_id', $request->input('google_id'))->first();

        if (! $user) {
            $user = User::create([
                'google_id' => $request->input('google_id'),
                'email' => $request->input('email'),
                'birth_year' => $request->input('birth_year'),
                'referrer_code' => Str::random(8),
                'accepted_terms_at' => now(),
            ]);
        }

        $token = $user->createToken('shh-me-mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Shh... tu es parti(e) en silence.'], 200);
    }
}
