<?php

use App\Http\Controllers\Web\LandingController;
use App\Http\Controllers\Web\SitemapController;
use App\Http\Controllers\Web\WebPreviewController;
use App\Http\Middleware\SetSeoLocale;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SEO-aware routes (locale-prefixed)
|--------------------------------------------------------------------------
*/

Route::middleware(SetSeoLocale::class)->group(function () {
    // Landing page — root redirects to auto-detected locale
    Route::get('/', [LandingController::class, 'index']);

    // Landing page — explicit locale
    Route::get('/{locale}', [LandingController::class, 'index'])
        ->where('locale', 'en|fr');

    // Preview — with explicit locale
    Route::get('/{locale}/p/{anonymousId}', [WebPreviewController::class, 'show'])
        ->where('locale', 'en|fr');

    // Preview — auto-detect locale from Accept-Language
    Route::get('/p/{anonymousId}', [WebPreviewController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Sitemap & Robots
|--------------------------------------------------------------------------
*/

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

Route::get('/robots.txt', fn () => response(
    "User-agent: *\nAllow: /\nSitemap: https://shh-me.com/sitemap.xml",
    200,
    ['Content-Type' => 'text/plain']
));
