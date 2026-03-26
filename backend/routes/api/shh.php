<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AudioController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\ShhController;
use App\Http\Controllers\Api\ShhGuessController;
use App\Http\Controllers\Api\ShhMessageController;
use App\Http\Controllers\Api\ShhPhotoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('shh', [ShhController::class, 'store'])->middleware('throttle:15,1');
    Route::get('shh', [ShhController::class, 'index'])->middleware('throttle:60,1');
    Route::get('shh/{shh}', [ShhController::class, 'show'])->middleware('throttle:60,1');

    Route::middleware('throttle:30,1')->group(function () {
        Route::post('shh/{shh}/messages', [ShhMessageController::class, 'store']);
        Route::get('shh/{shh}/messages', [ShhMessageController::class, 'index']);
    });

    Route::get('shh/{shh}/photo', [ShhPhotoController::class, 'show'])->middleware('throttle:60,1');

    Route::middleware('throttle:10,1')->group(function () {
        Route::post('shh/{shh}/guess', [ShhGuessController::class, 'store']);
        Route::get('shh/{shh}/guess', [ShhGuessController::class, 'index']);
    });

    Route::post('messages/{message}/reactions', [ReactionController::class, 'store'])->middleware('throttle:30,1');
    Route::delete('messages/{message}/reactions', [ReactionController::class, 'destroy'])->middleware('throttle:30,1');

    // Audio routes (Sprint 3-4)
    Route::post('shh/{shh}/audio', [AudioController::class, 'store'])->middleware('throttle:10,1');
    Route::post('shh/{shh}/audio/send', [AudioController::class, 'send'])->middleware('throttle:10,1');
    Route::get('shh/{shh}/audio', [AudioController::class, 'index'])->middleware('throttle:60,1');
});
