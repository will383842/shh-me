<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdult
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->birth_year) {
            $age = (int) date('Y') - (int) $user->birth_year;
            $minimumAge = (int) config('shhme.minimum_age', 18);

            if ($age < $minimumAge) {
                return response()->json([
                    'error' => [
                        'code' => 'age_restricted',
                        'message' => 'Tu dois avoir au moins '.$minimumAge.' ans pour utiliser Shh Me.',
                        'status' => 403,
                    ],
                ], 403);
            }
        }

        return $next($request);
    }
}
