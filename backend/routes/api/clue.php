<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ClueController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('shh/{shh}/clues', [ClueController::class, 'index'])->middleware('throttle:60,1');
    Route::get('shh/{shh}/clues/question', [ClueController::class, 'todayQuestion'])->middleware('throttle:30,1');
    Route::post('shh/{shh}/clues/answer', [ClueController::class, 'answerQuestion'])->middleware('throttle:10,1');
});
