<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class SetSeoLocale
{
    /**
     * Detect language from URL prefix, Accept-Language header, or default.
     * Shares SEO data with all views.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = config('shhme.supported_locales', ['en', 'fr']);
        $defaultLocale = config('shhme.default_locale', 'en');

        // 1. URL prefix (/fr/..., /en/...)
        $locale = $request->route('locale');

        // 2. Accept-Language header fallback
        if (! $locale || ! in_array($locale, $supportedLocales, true)) {
            $locale = $this->detectFromHeader($request, $supportedLocales) ?? $defaultLocale;
        }

        app()->setLocale($locale);

        // Share SEO data with all views
        $domain = config('shhme.seo.domain', 'https://shh-me.com');
        $alternateLocale = $locale === 'en' ? 'fr' : 'en';

        View::share('seoLocale', $locale);
        View::share('seoAlternateLocale', $alternateLocale);
        View::share('seoDomain', $domain);
        View::share('seoOgImage', config('shhme.seo.default_og_image'));
        View::share('seoAppStoreUrl', config('shhme.seo.app_store_url'));
        View::share('seoPlayStoreUrl', config('shhme.seo.play_store_url'));

        return $next($request);
    }

    /**
     * Parse Accept-Language header and return the best matching locale.
     *
     * @param  array<string>  $supported
     */
    private function detectFromHeader(Request $request, array $supported): ?string
    {
        $header = $request->header('Accept-Language', '');
        if (empty($header)) {
            return null;
        }

        // Parse entries like "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
        $entries = [];
        foreach (explode(',', $header) as $part) {
            $segments = explode(';', trim($part));
            $lang = strtolower(trim($segments[0]));
            $quality = 1.0;

            if (isset($segments[1])) {
                $qPart = trim($segments[1]);
                if (str_starts_with($qPart, 'q=')) {
                    $quality = (float) substr($qPart, 2);
                }
            }

            $entries[] = ['lang' => $lang, 'q' => $quality];
        }

        // Sort by quality descending
        usort($entries, fn (array $a, array $b) => $b['q'] <=> $a['q']);

        foreach ($entries as $entry) {
            // Exact match (e.g., "fr")
            if (in_array($entry['lang'], $supported, true)) {
                return $entry['lang'];
            }

            // Prefix match (e.g., "fr-FR" -> "fr")
            $prefix = substr($entry['lang'], 0, 2);
            if (in_array($prefix, $supported, true)) {
                return $prefix;
            }
        }

        return null;
    }
}
