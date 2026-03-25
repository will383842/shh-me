<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\User;
use App\Models\UserFeedback;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        UserFeedback::create([
            'user_id' => $user->id,
            'category' => $request->validated('category'),
            'message' => $request->validated('message'),
            'happiness_score' => $request->validated('happiness_score'),
            'device' => $request->validated('device'),
            'app_version' => $request->validated('app_version'),
        ]);

        return response()->json([
            'message' => 'Merci pour ton retour.',
        ], 201);
    }
}
