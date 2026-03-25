<?php

declare(strict_types=1);

use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\PanicController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('me', [UserController::class, 'me']);
    Route::patch('me', [UserController::class, 'update']);
    Route::delete('me', [UserController::class, 'destroy']);
    Route::get('me/export', [UserController::class, 'export']);

    Route::post('feedback', [FeedbackController::class, 'store'])->middleware('throttle:5,1');
    Route::post('me/panic', [PanicController::class, 'trigger'])->middleware('throttle:5,1');

    Route::post('blocks/{user}', [BlockController::class, 'store']);
    Route::delete('blocks/{user}', [BlockController::class, 'destroy']);
    Route::get('blocks', [BlockController::class, 'index']);
});
