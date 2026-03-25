<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:5,1'])->group(function () {
    Route::post('reports', [ReportController::class, 'store']);
});
