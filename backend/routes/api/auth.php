<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('apple', [AuthController::class, 'apple']);
    Route::post('google', [AuthController::class, 'google']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
