<?php

declare(strict_types=1);

use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

Route::get('stats/community', [StatsController::class, 'community']);
