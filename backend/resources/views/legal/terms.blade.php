{{-- Terms of Service — Shh Me --}}
<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{{ $pageTitle }} — Shh Me</title>
    <meta name="description" content="{{ $metaDescription }}">

    <link rel="canonical" href="{{ $canonicalUrl }}">
    <link rel="alternate" hreflang="{{ $locale }}" href="{{ $canonicalUrl }}">
    <link rel="alternate" hreflang="{{ $alternateLocale }}" href="{{ $alternateUrl }}">
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain }}/terms">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $pageTitle }} — Shh Me">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:site_name" content="Shh Me">
    @if($seoOgImage)
    <meta property="og:image" content="{{ $seoOgImage }}">
    @endif

    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:#1a1a2e;background:#fafafa;padding:2rem 1rem}
        .container{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 2px 12px rgba(0,0,0,.06)}
        h1{font-size:1.8rem;margin-bottom:.5rem;color:#6c3ce0}
        h2{font-size:1.25rem;margin:2rem 0 .75rem;color:#1a1a2e;border-bottom:2px solid #f0ecfa;padding-bottom:.5rem}
        p{margin-bottom:1rem;color:#444}
        ul{margin:0 0 1rem 1.5rem}
        li{margin-bottom:.5rem;color:#444}
        .updated{font-size:.85rem;color:#888;margin-bottom:1.5rem}
        a{color:#6c3ce0;text-decoration:none}
        a:hover{text-decoration:underline}
        .back{display:inline-block;margin-bottom:1.5rem;font-size:.9rem}
    </style>
</head>
<body>
<div class="container">
    <a href="/{{ $locale }}" class="back">&larr; Shh Me</a>

    <h1>{{ __('legal.terms.title') }}</h1>
    <p class="updated">{{ __('legal.terms.last_updated') }}</p>
    <p>{{ __('legal.terms.intro') }}</p>

    {{-- Eligibility --}}
    <h2>{{ __('legal.terms.eligibility_title') }}</h2>
    <p>{{ __('legal.terms.eligibility_text') }}</p>

    {{-- Acceptable Use --}}
    <h2>{{ __('legal.terms.acceptable_use_title') }}</h2>
    <p>{{ __('legal.terms.acceptable_use_text') }}</p>
    <ul>
        @foreach(__('legal.terms.acceptable_use_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Moderation --}}
    <h2>{{ __('legal.terms.moderation_title') }}</h2>
    <p>{{ __('legal.terms.moderation_text') }}</p>

    {{-- Account Deletion --}}
    <h2>{{ __('legal.terms.account_deletion_title') }}</h2>
    <p>{{ __('legal.terms.account_deletion_text') }}</p>

    {{-- IP --}}
    <h2>{{ __('legal.terms.ip_title') }}</h2>
    <p>{{ __('legal.terms.ip_text') }}</p>

    {{-- Liability --}}
    <h2>{{ __('legal.terms.liability_title') }}</h2>
    <p>{{ __('legal.terms.liability_text') }}</p>

    {{-- Termination --}}
    <h2>{{ __('legal.terms.termination_title') }}</h2>
    <p>{{ __('legal.terms.termination_text') }}</p>

    {{-- Governing Law --}}
    <h2>{{ __('legal.terms.governing_law_title') }}</h2>
    <p>{{ __('legal.terms.governing_law_text') }}</p>

    {{-- Contact --}}
    <h2>{{ __('legal.terms.contact_title') }}</h2>
    <p>{{ __('legal.terms.contact_text') }}</p>
</div>
</body>
</html>
