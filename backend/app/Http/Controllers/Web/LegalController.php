<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\View as ViewFacade;
use Illuminate\View\View;

class LegalController extends Controller
{
    /**
     * Privacy Policy (GDPR + CCPA compliant).
     */
    public function privacy(): View
    {
        $this->ensureSeoDefaults();
        $locale = app()->getLocale();

        return view('legal.privacy', $this->seoData($locale, 'privacy'));
    }

    /**
     * Terms of Service.
     */
    public function terms(): View
    {
        $this->ensureSeoDefaults();
        $locale = app()->getLocale();

        return view('legal.terms', $this->seoData($locale, 'terms'));
    }

    /**
     * Community Guidelines (required by Google Play for UGC apps).
     */
    public function community(): View
    {
        $this->ensureSeoDefaults();
        $locale = app()->getLocale();

        return view('legal.community', $this->seoData($locale, 'community'));
    }

    /**
     * Contact page.
     */
    public function contact(): View
    {
        $this->ensureSeoDefaults();
        $locale = app()->getLocale();

        return view('legal.contact', $this->seoData($locale, 'contact'));
    }

    /**
     * Account deletion page (required by Google Play & App Store).
     */
    public function deleteAccount(): View
    {
        $this->ensureSeoDefaults();
        $locale = app()->getLocale();

        return view('legal.delete-account', $this->seoData($locale, 'delete_account'));
    }

    /**
     * Build SEO data array for a legal page.
     *
     * @return array<string, mixed>
     */
    private function seoData(string $locale, string $page): array
    {
        $domain = config('shhme.seo.domain', 'https://shh-me.com');
        $alternateLocale = $locale === 'en' ? 'fr' : 'en';

        return [
            'locale' => $locale,
            'alternateLocale' => $alternateLocale,
            'pageTitle' => __("legal.{$page}.title"),
            'metaDescription' => __("legal.{$page}.meta_description"),
            'canonicalUrl' => $domain.'/'.$this->slugForPage($page, $locale),
            'alternateUrl' => $domain.'/'.$this->slugForPage($page, $alternateLocale),
            'seoDomain' => $domain,
            'seoOgImage' => config('shhme.seo.default_og_image', ''),
        ];
    }

    /**
     * Map page key + locale to its URL slug.
     */
    private function slugForPage(string $page, string $locale): string
    {
        $slugs = [
            'privacy' => ['en' => 'privacy', 'fr' => 'fr/confidentialite'],
            'terms' => ['en' => 'terms', 'fr' => 'fr/conditions'],
            'community' => ['en' => 'community', 'fr' => 'fr/communaute'],
            'contact' => ['en' => 'contact', 'fr' => 'contact'],
            'delete_account' => ['en' => 'delete-account', 'fr' => 'delete-account'],
        ];

        return $slugs[$page][$locale] ?? $slugs[$page]['en'];
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
    }
}
