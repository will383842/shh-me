<?php

use App\Http\Middleware\CheckEmergencyStop;
use App\Http\Middleware\EnsureAdult;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\TrackLastActive;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::prefix('api/v1')
                ->middleware('api')
                ->group(function () {
                    require base_path('routes/api/auth.php');
                    require base_path('routes/api/shh.php');
                    require base_path('routes/api/reveal.php');
                    require base_path('routes/api/clue.php');
                    require base_path('routes/api/user.php');
                    require base_path('routes/api/report.php');
                    require base_path('routes/api/stats.php');
                    require base_path('routes/api/health.php');
                });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'adult' => EnsureAdult::class,
            'track.active' => TrackLastActive::class,
        ]);

        $middleware->appendToGroup('api', [
            CheckEmergencyStop::class,
            TrackLastActive::class,
            SetLocale::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
