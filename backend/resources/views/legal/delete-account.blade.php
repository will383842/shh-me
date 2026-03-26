{{-- Delete Account — Shh Me --}}
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
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain }}/delete-account">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $pageTitle }} — Shh Me">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:site_name" content="Shh Me">

    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:#1a1a2e;background:#fafafa;padding:2rem 1rem}
        .container{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 2px 12px rgba(0,0,0,.06)}
        h1{font-size:1.8rem;margin-bottom:.5rem;color:#e03c3c}
        h2{font-size:1.25rem;margin:2rem 0 .75rem;color:#1a1a2e;border-bottom:2px solid #fce8e8;padding-bottom:.5rem}
        p{margin-bottom:1rem;color:#444}
        ul{margin:0 0 1rem 1.5rem}
        li{margin-bottom:.5rem;color:#444}
        form{margin-top:1.5rem;padding:1.5rem;background:#fef9f9;border-radius:8px;border:1px solid #fce8e8}
        label{display:block;font-weight:600;margin-bottom:.4rem;color:#1a1a2e;font-size:.95rem}
        input[type="email"]{width:100%;padding:.75rem 1rem;border:1.5px solid #e0dce8;border-radius:8px;font-size:1rem;font-family:inherit;margin-bottom:1.25rem;transition:border-color .2s}
        input[type="email"]:focus{outline:none;border-color:#e03c3c}
        button{background:#e03c3c;color:#fff;border:none;padding:.85rem 2rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:background .2s}
        button:hover{background:#c52d2d}
        .warning{background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:1rem;margin:1.5rem 0;color:#856404;font-size:.95rem}
        .in-app{margin-top:1.5rem;padding:1rem;background:#f0ecfa;border-radius:8px;color:#444;font-size:.95rem}
        a{color:#6c3ce0;text-decoration:none}
        a:hover{text-decoration:underline}
        .back{display:inline-block;margin-bottom:1.5rem;font-size:.9rem}
    </style>
</head>
<body>
<div class="container">
    <a href="/{{ $locale }}" class="back">&larr; Shh Me</a>

    <h1>{{ __('legal.delete_account.title') }}</h1>
    <p>{{ __('legal.delete_account.intro') }}</p>

    {{-- What happens --}}
    <h2>{{ __('legal.delete_account.what_happens_title') }}</h2>
    <ul>
        @foreach(__('legal.delete_account.what_happens_items') as $item)
        <li>{{ $item }}</li>
        @endforeach
    </ul>

    <div class="warning">
        &#9888; {{ __('legal.delete_account.confirmation_text') }}
    </div>

    <form method="POST" action="/delete-account">
        @csrf
        <label for="email">{{ __('legal.delete_account.email_label') }}</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com">

        <button type="submit" onclick="return confirm('{{ __('legal.delete_account.title') }}?')">
            {{ __('legal.delete_account.confirm_button') }}
        </button>
    </form>

    <div class="in-app">
        {{ __('legal.delete_account.in_app_text') }}
    </div>
</div>
</body>
</html>
