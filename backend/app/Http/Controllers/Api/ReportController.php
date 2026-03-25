<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Report::create([
            'reporter_id' => $user->id,
            'target_type' => $request->validated('target_type'),
            'target_id' => $request->validated('target_id'),
            'reason' => $request->validated('reason'),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Signalement pris en compte. Merci.',
        ], 201);
    }
}
