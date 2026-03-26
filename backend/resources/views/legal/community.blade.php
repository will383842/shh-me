{{-- Community Guidelines — Shh Me --}}
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
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain }}/community">

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

    <h1>{{ __('legal.community.title') }}</h1>
    <p class="updated">{{ __('legal.community.last_updated') }}</p>
    <p>{{ __('legal.community.intro') }}</p>

    {{-- Rules --}}
    <h2>{{ __('legal.community.rules_title') }}</h2>
    <ul>
        @foreach(__('legal.community.rules_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Consequences --}}
    <h2>{{ __('legal.community.consequences_title') }}</h2>
    <p>{{ __('legal.community.consequences_text') }}</p>
    <ul>
        @foreach(__('legal.community.consequences_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    {{-- Reporting --}}
    <h2>{{ __('legal.community.reporting_title') }}</h2>
    <p>{{ __('legal.community.reporting_text') }}</p>
    <p><a href="mailto:{{ __('legal.community.reporting_email') }}">{{ __('legal.community.reporting_email') }}</a></p>

    {{-- Appeals --}}
    <h2>{{ __('legal.community.appeals_title') }}</h2>
    <p>{{ __('legal.community.appeals_text') }}</p>
</div>
</body>
</html>
