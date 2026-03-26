<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class LandingController extends Controller
{
    /**
     * Display the multilingual landing page.
     */
    public function index(): View
    {
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
        ]);
    }
}
