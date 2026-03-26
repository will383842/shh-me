<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ConnectController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('shh/{shh}/connect', [ConnectController::class, 'store'])->middleware('throttle:5,1');
    Route::delete('shh/{shh}/connect', [ConnectController::class, 'cancel'])->middleware('throttle:5,1');
    Route::get('shh/{shh}/connect/status', [ConnectController::class, 'status'])->middleware('throttle:120,1');
    Route::get('shh/{shh}/connect/video', [ConnectController::class, 'video'])->middleware('throttle:30,1');
});
