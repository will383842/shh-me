{{-- Contact — Shh Me --}}
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
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain }}/contact">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $pageTitle }} — Shh Me">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:site_name" content="Shh Me">

    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:#1a1a2e;background:#fafafa;padding:2rem 1rem}
        .container{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 2px 12px rgba(0,0,0,.06)}
        h1{font-size:1.8rem;margin-bottom:.5rem;color:#6c3ce0}
        h2{font-size:1.25rem;margin:2rem 0 .75rem;color:#1a1a2e}
        p{margin-bottom:1rem;color:#444}
        form{margin-top:1.5rem}
        label{display:block;font-weight:600;margin-bottom:.4rem;color:#1a1a2e;font-size:.95rem}
        input[type="email"],textarea{width:100%;padding:.75rem 1rem;border:1.5px solid #e0dce8;border-radius:8px;font-size:1rem;font-family:inherit;margin-bottom:1.25rem;transition:border-color .2s}
        input[type="email"]:focus,textarea:focus{outline:none;border-color:#6c3ce0}
        textarea{min-height:140px;resize:vertical}
        button{background:#6c3ce0;color:#fff;border:none;padding:.85rem 2rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:background .2s}
        button:hover{background:#5a2dc5}
        .email-direct{margin-top:2rem;padding-top:1.5rem;border-top:1px solid #f0ecfa}
        a{color:#6c3ce0;text-decoration:none}
        a:hover{text-decoration:underline}
        .back{display:inline-block;margin-bottom:1.5rem;font-size:.9rem}
    </style>
</head>
<body>
<div class="container">
    <a href="/{{ $locale }}" class="back">&larr; Shh Me</a>

    <h1>{{ __('legal.contact.title') }}</h1>
    <p>{{ __('legal.contact.intro') }}</p>

    <form method="POST" action="/contact">
        @csrf
        <label for="email">{{ __('legal.contact.email_label') }}</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com">

        <label for="message">{{ __('legal.contact.message_label') }}</label>
        <textarea id="message" name="message" required placeholder="..."></textarea>

        <button type="submit">{{ __('legal.contact.submit') }}</button>
    </form>

    <div class="email-direct">
        <p>{{ __('legal.contact.email_text') }}</p>
        <p><a href="mailto:{{ __('legal.contact.email_address') }}">{{ __('legal.contact.email_address') }}</a></p>
    </div>
</div>
</body>
</html>
