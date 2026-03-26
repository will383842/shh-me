<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap with hreflang alternates.
     */
    public function index(): Response
    {
        $domain = config('shhme.seo.domain', 'https://shh-me.com');
        $locales = config('shhme.supported_locales', ['en', 'fr']);
        $now = now()->toDateString();

        $pages = [
            ['path' => '', 'changefreq' => 'weekly', 'priority' => '1.0'],
            ['path' => '/privacy', 'changefreq' => 'monthly', 'priority' => '0.3'],
            ['path' => '/terms', 'changefreq' => 'monthly', 'priority' => '0.3'],
            ['path' => '/community-guidelines', 'changefreq' => 'monthly', 'priority' => '0.3'],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'."\n";
        $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n";

        foreach ($pages as $page) {
            foreach ($locales as $locale) {
                $url = $domain.'/'.$locale.$page['path'];

                $xml .= "  <url>\n";
                $xml .= "    <loc>{$url}</loc>\n";
                $xml .= "    <lastmod>{$now}</lastmod>\n";
                $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
                $xml .= "    <priority>{$page['priority']}</priority>\n";

                // hreflang alternates for each locale
                foreach ($locales as $altLocale) {
                    $altUrl = $domain.'/'.$altLocale.$page['path'];
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLocale}\" href=\"{$altUrl}\" />\n";
                }

                // x-default points to English
                $defaultUrl = $domain.'/en'.$page['path'];
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$defaultUrl}\" />\n";

                $xml .= "  </url>\n";
            }
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
