<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\View as ViewFacade;
use Illuminate\View\View;

class LandingController extends Controller
{
    /**
     * Display the multilingual landing page.
     */
    public function index(): View
    {
        // Ensure shared SEO variables exist (fallback if middleware was bypassed)
        $this->ensureSeoDefaults();

        $locale = app()->getLocale();
        $domain = config('shhme.seo.domain', 'https://shh-me.com');
        $alternateLocale = $locale === 'en' ? 'fr' : 'en';

        $faqItems = __('faq.items');

        return view('landing.index', [
            'locale' => $locale,
            'alternateLocale' => $alternateLocale,
            'canonicalUrl' => $domain.'/'.$locale,
            'alternateUrl' => $domain.'/'.$alternateLocale,
            'faqItems' => is_array($faqItems) ? $faqItems : [],
            'seoLocale' => $locale,
            'seoDomain' => $domain,
            'seoOgImage' => config('shhme.seo.default_og_image', ''),
            'seoAppStoreUrl' => config('shhme.seo.app_store_url', ''),
            'seoPlayStoreUrl' => config('shhme.seo.play_store_url', ''),
        ]);
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
