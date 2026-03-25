<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    public function community(Request $request): JsonResponse
    {
        $ttl = (int) config('shhme.community_counter_cache_ttl', 60);

        $stats = Cache::remember('community_stats', $ttl, function () {
            $minThreshold = (int) config('shhme.community_counter_min_threshold', 10);
            $totalUsers = User::count();

            return [
                'active_users' => max($minThreshold, $totalUsers),
                'updated_at' => now()->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $stats,
        ]);
    }
}
