{{-- Privacy Policy — Shh Me --}}
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
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain }}/privacy">

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

    <h1>{{ __('legal.privacy.title') }}</h1>
    <p class="updated">{{ __('legal.privacy.last_updated') }}</p>
    <p>{{ __('legal.privacy.intro') }}</p>

    {{-- Data Collected --}}
    <h2>{{ __('legal.privacy.data_collected_title') }}</h2>
    <ul>
        @foreach(__('legal.privacy.data_collected_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Purpose --}}
    <h2>{{ __('legal.privacy.purpose_title') }}</h2>
    <ul>
        @foreach(__('legal.privacy.purpose_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Retention --}}
    <h2>{{ __('legal.privacy.retention_title') }}</h2>
    <p>{{ __('legal.privacy.retention_text') }}</p>

    {{-- GDPR Rights --}}
    <h2>{{ __('legal.privacy.rights_eu_title') }}</h2>
    <ul>
        @foreach(__('legal.privacy.rights_eu_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- CCPA Rights --}}
    <h2>{{ __('legal.privacy.rights_us_title') }}</h2>
    <ul>
        @foreach(__('legal.privacy.rights_us_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Security --}}
    <h2>{{ __('legal.privacy.security_title') }}</h2>
    <p>{{ __('legal.privacy.security_text') }}</p>

    {{-- Children --}}
    <h2>{{ __('legal.privacy.children_title') }}</h2>
    <p>{{ __('legal.privacy.children_text') }}</p>

    {{-- DPO --}}
    <h2>{{ __('legal.privacy.dpo_title') }}</h2>
    <p>{{ __('legal.privacy.dpo_text') }}</p>
    <p><a href="mailto:{{ __('legal.privacy.dpo_email') }}">{{ __('legal.privacy.dpo_email') }}</a></p>

    {{-- Contact --}}
    <h2>{{ __('legal.privacy.contact_title') }}</h2>
    <p>{{ __('legal.privacy.contact_text') }}</p>

    {{-- Changes --}}
    <h2>{{ __('legal.privacy.changes_title') }}</h2>
    <p>{{ __('legal.privacy.changes_text') }}</p>
</div>
</body>
</html>
