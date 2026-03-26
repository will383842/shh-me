<?php

use App\Http\Controllers\Web\LandingController;
use App\Http\Controllers\Web\LegalController;
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
| Legal pages (EN + FR slugs)
|--------------------------------------------------------------------------
*/

Route::middleware(SetSeoLocale::class)->group(function () {
    // Privacy Policy
    Route::get('/privacy', [LegalController::class, 'privacy']);
    Route::get('/fr/confidentialite', [LegalController::class, 'privacy']);

    // Terms of Service
    Route::get('/terms', [LegalController::class, 'terms']);
    Route::get('/fr/conditions', [LegalController::class, 'terms']);

    // Community Guidelines
    Route::get('/community', [LegalController::class, 'community']);
    Route::get('/fr/communaute', [LegalController::class, 'community']);

    // Contact
    Route::get('/contact', [LegalController::class, 'contact']);

    // Account Deletion (required by Google Play & App Store)
    Route::get('/delete-account', [LegalController::class, 'deleteAccount']);
});

/*
|--------------------------------------------------------------------------
| Deep linking — .well-known
|--------------------------------------------------------------------------
*/

Route::get('/.well-known/apple-app-site-association', function () {
    return response()->json([
        'applinks' => [
            'apps' => [],
            'details' => [[
                'appIDs' => ['TEAMID.com.shhme.app'],
                'paths' => ['/p/*'],
            ]],
        ],
    ], 200, ['Content-Type' => 'application/json']);
});

Route::get('/.well-known/assetlinks.json', function () {
    return response()->json([[
        'relation' => ['delegate_permission/common.handle_all_urls'],
        'target' => [
            'namespace' => 'android_app',
            'package_name' => 'com.shhme.app',
            'sha256_cert_fingerprints' => ['TODO:ADD_FINGERPRINT'],
        ],
    ]]);
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
