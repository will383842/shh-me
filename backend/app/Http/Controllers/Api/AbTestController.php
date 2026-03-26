<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbAssignment;
use App\Models\AbTest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbTestController extends Controller
{
    public function linkVariant(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $test = AbTest::where('name', 'link_text')
            ->where('is_active', true)
            ->first();

        if (! $test) {
            return response()->json([
                'variant' => 'someone_has_a_secret',
                'test_name' => 'link_text',
            ]);
        }

        $assignment = AbAssignment::where('user_id', $user->id)
            ->where('test_name', 'link_text')
            ->first();

        if (! $assignment) {
            $variant = $this->pickVariant((array) $test->variants, (array) $test->weights);

            $assignment = AbAssignment::create([
                'user_id' => $user->id,
                'test_name' => 'link_text',
                'variant' => $variant,
            ]);
        }

        return response()->json([
            'variant' => $assignment->variant,
            'test_name' => 'link_text',
        ]);
    }

    /**
     * Pick a variant based on weights using weighted random selection.
     *
     * @param  array<int, mixed>  $variants
     * @param  array<int, mixed>  $weights
     */
    private function pickVariant(array $variants, array $weights): string
    {
        $totalWeight = array_sum($weights);
        $random = mt_rand(1, (int) ($totalWeight * 100)) / 100;

        $cumulative = 0.0;
        foreach ($variants as $index => $variant) {
            $cumulative += $weights[$index] ?? 0;
            if ($random <= $cumulative) {
                return $variant;
            }
        }

        return $variants[0] ?? 'someone_has_a_secret';
    }
}
