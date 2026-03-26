<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Shh;
use App\Models\ShhAudio;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View as ViewFacade;
use Illuminate\View\View;

class WebPreviewController extends Controller
{
    /**
     * Public web preview page for a shh (no auth required).
     * Shows ECG animation, timer, audio teaser (3s), expiration countdown, store buttons.
     * Supports multilingual SEO via locale prefix or Accept-Language header.
     */
    public function show(string $anonymousId, ?string $locale = null): View
    {
        // Set locale if provided via URL, otherwise middleware already handled it
        if ($locale && in_array($locale, config('shhme.supported_locales', ['en', 'fr']), true)) {
            app()->setLocale($locale);
        }

        // Ensure shared SEO variables exist (fallback if middleware was bypassed)
        $this->ensureSeoDefaults();

        $shh = Shh::where('anonymous_id', $anonymousId)->first();

        if (! $shh) {
            abort(404);
        }

        $teaserUrl = null;
        $audioDuration = null;

        try {
            // Find the latest validated audio with a teaser
            $audio = ShhAudio::where('shh_id', $shh->id)
                ->where('validated_by_sender', true)
                ->where('moderation_status', '!=', 'blocked')
                ->whereNotNull('teaser_path')
                ->orderBy('created_at', 'desc')
                ->first();

            if ($audio && $audio->teaser_path) {
                $teaserUrl = Storage::disk('r2')->temporaryUrl($audio->teaser_path, now()->addMinutes(30));
                $audioDuration = $audio->duration_seconds ?? config('shhme.audio_max_seconds', 30);
            }
        } catch (\Throwable $e) {
            Log::warning('WebPreviewController: failed to load teaser audio', [
                'anonymous_id' => $anonymousId,
                'error' => $e->getMessage(),
            ]);
        }

        $currentLocale = app()->getLocale();
        $alternateLocale = $currentLocale === 'en' ? 'fr' : 'en';
        $domain = config('shhme.seo.domain', 'https://shh-me.com');

        $canonicalUrl = $domain.'/'.$currentLocale.'/p/'.$anonymousId;
        $alternateUrl = $domain.'/'.$alternateLocale.'/p/'.$anonymousId;

        try {
            return view('shh.preview', [
                'shh' => $shh,
                'bpm' => $shh->bpm_symbolic,
                'expiresAt' => $shh->expires_at->toIso8601String(),
                'isExpired' => $shh->status === 'expired',
                'teaserUrl' => $teaserUrl,
                'audioDuration' => $audioDuration,
                'locale' => $currentLocale,
                'alternateLocale' => $alternateLocale,
                'canonicalUrl' => $canonicalUrl,
                'alternateUrl' => $alternateUrl,
                'seoLocale' => $currentLocale,
                'seoDomain' => $domain,
                'seoOgImage' => config('shhme.seo.default_og_image', ''),
                'seoAppStoreUrl' => config('shhme.seo.app_store_url', ''),
                'seoPlayStoreUrl' => config('shhme.seo.play_store_url', ''),
            ]);
        } catch (\Throwable $e) {
            Log::error('WebPreviewController: view rendering failed', [
                'anonymous_id' => $anonymousId,
                'error' => $e->getMessage(),
            ]);
            abort(500);
        }
    }

    /**
     * Ensure shared SEO variables are available even without SetSeoLocale middleware.
     */
    private function ensureSeoDefaults(): void
    {
        $shared = ViewFacade::getShared();

        if (! isset($shared['seoLocale'])) {
            ViewFacade::share('seoLocale', app()->getLocale());
        }
        if (! isset($shared['seoDomain'])) {
            ViewFacade::share('seoDomain', config('shhme.seo.domain', 'https://shh-me.com'));
        }
        if (! isset($shared['seoOgImage'])) {
            ViewFacade::share('seoOgImage', config('shhme.seo.default_og_image', ''));
        }
        if (! isset($shared['seoAppStoreUrl'])) {
            ViewFacade::share('seoAppStoreUrl', config('shhme.seo.app_store_url', ''));
        }
        if (! isset($shared['seoPlayStoreUrl'])) {
            ViewFacade::share('seoPlayStoreUrl', config('shhme.seo.play_store_url', ''));
        }
    }
}
