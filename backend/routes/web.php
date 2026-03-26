<?php

use App\Http\Controllers\Web\WebPreviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public web preview (no auth required)
Route::get('/p/{anonymousId}', [WebPreviewController::class, 'show']);
