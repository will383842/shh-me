<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\EmergencyStopService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class CheckEmergencyStop
{
    public function __construct(
        private readonly EmergencyStopService $emergencyStop,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        if ($this->emergencyStop->isActive('all')) {
            return response()->json([
                'message' => 'Service temporarily unavailable.',
            ], 503);
        }

        $path = $request->path();

        if ($this->emergencyStop->isActive('audio') && str_contains($path, 'audio')) {
            return response()->json([
                'message' => 'Audio service temporarily unavailable.',
            ], 503);
        }

        if ($this->emergencyStop->isActive('reveal') && str_contains($path, 'connect')) {
            return response()->json([
                'message' => 'Reveal service temporarily unavailable.',
            ], 503);
        }

        return $next($request);
    }
}
