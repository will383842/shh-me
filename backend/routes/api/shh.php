<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\ShhController;
use App\Http\Controllers\Api\ShhGuessController;
use App\Http\Controllers\Api\ShhMessageController;
use App\Http\Controllers\Api\ShhPhotoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('shh', [ShhController::class, 'store']);
    Route::get('shh', [ShhController::class, 'index']);
    Route::get('shh/{shh}', [ShhController::class, 'show']);

    Route::post('shh/{shh}/messages', [ShhMessageController::class, 'store']);
    Route::get('shh/{shh}/messages', [ShhMessageController::class, 'index']);

    Route::get('shh/{shh}/photo', [ShhPhotoController::class, 'show']);

    Route::post('shh/{shh}/guess', [ShhGuessController::class, 'store']);
    Route::get('shh/{shh}/guess', [ShhGuessController::class, 'index']);

    Route::post('messages/{message}/reactions', [ReactionController::class, 'store']);
    Route::delete('messages/{message}/reactions', [ReactionController::class, 'destroy']);
});
