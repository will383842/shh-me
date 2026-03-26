{{-- Landing page — Shh Me --}}
{{-- Variables: $locale, $alternateLocale, $canonicalUrl, $alternateUrl, $faqItems --}}
<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- SEO Meta --}}
    <title>{{ __('seo.meta_title') }}</title>
    <meta name="description" content="{{ __('seo.meta_description') }}">
    <meta name="keywords" content="{{ __('seo.meta_keywords') }}">

    {{-- Canonical & hreflang --}}
    <link rel="canonical" href="{{ $canonicalUrl }}">
    <link rel="alternate" hreflang="{{ $locale }}" href="{{ $canonicalUrl }}">
    <link rel="alternate" hreflang="{{ $alternateLocale }}" href="{{ $alternateUrl }}">
    <link rel="alternate" hreflang="x-default" href="{{ $seoDomain ?? config('shhme.seo.domain') }}/en">

    {{-- Open Graph --}}
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ __('seo.og_title') }}">
    <meta property="og:description" content="{{ __('seo.og_description') }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:site_name" content="{{ __('seo.og_site_name') }}">
    <meta property="og:image" content="{{ $seoOgImage ?? config('shhme.seo.default_og_image') }}">
    <meta property="og:locale" content="{{ $locale === 'fr' ? 'fr_FR' : 'en_US' }}">
    <meta property="og:locale:alternate" content="{{ $locale === 'fr' ? 'en_US' : 'fr_FR' }}">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ __('seo.twitter_title') }}">
    <meta name="twitter:description" content="{{ __('seo.twitter_description') }}">
    <meta name="twitter:image" content="{{ $seoOgImage ?? config('shhme.seo.default_og_image') }}">

    {{-- JSON-LD: WebApplication --}}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "{{ __('seo.app_name') }}",
        "description": "{{ __('seo.meta_description') }}",
        "url": "{{ $seoDomain ?? config('shhme.seo.domain') }}",
        "applicationCategory": "SocialNetworkingApplication",
        "operatingSystem": "iOS, Android",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "inLanguage": ["en", "fr"]
    }
    </script>

    {{-- JSON-LD: FAQPage --}}
    @if(!empty($faqItems))
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            @foreach($faqItems as $i => $item)
            {
                "@type": "Question",
                "name": "{!! addslashes($item['q']) !!}",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "{!! addslashes($item['a']) !!}"
                }
            }@if(!$loop->last),@endif
            @endforeach
        ]
    }
    </script>
    @endif

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg: #111111;
            --bg-card: #1a1a1a;
            --primary: #DCFB4E;
            --text: #ffffff;
            --text-muted: #aaaaaa;
            --font-display: 'Baloo 2', cursive;
            --font-body: 'DM Sans', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
            background: var(--bg);
            color: var(--text);
            font-family: var(--font-body);
            -webkit-font-smoothing: antialiased;
            line-height: 1.6;
        }

        .section {
            max-width: 960px;
            margin: 0 auto;
            padding: 80px 20px;
        }

        /* ===== HERO ===== */
        .hero {
            min-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px 20px;
        }

        .hero h1 {
            font-family: var(--font-display);
            font-size: clamp(2rem, 5vw, 3.2rem);
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 20px;
        }

        .hero p {
            font-size: clamp(1rem, 2.5vw, 1.25rem);
            color: var(--text-muted);
            max-width: 560px;
            margin-bottom: 40px;
        }

        .hero-cta {
            display: inline-block;
            padding: 16px 48px;
            background: var(--primary);
            color: var(--bg);
            font-size: 1.1rem;
            font-weight: 700;
            text-decoration: none;
            border-radius: 14px;
            transition: transform 0.15s;
        }

        .hero-cta:active { transform: scale(0.97); }

        /* ===== LANGUAGE SWITCH ===== */
        .lang-switch {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 100;
        }

        .lang-switch a {
            display: inline-block;
            padding: 6px 14px;
            border: 1px solid var(--primary);
            border-radius: 20px;
            color: var(--primary);
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            transition: background 0.2s, color 0.2s;
        }

        .lang-switch a:hover {
            background: var(--primary);
            color: var(--bg);
        }

        /* ===== SECTION TITLES ===== */
        .section-title {
            font-family: var(--font-display);
            font-size: clamp(1.5rem, 4vw, 2.2rem);
            font-weight: 700;
            text-align: center;
            margin-bottom: 48px;
        }

        /* ===== HOW IT WORKS ===== */
        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 32px;
        }

        .step {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 32px 24px;
            text-align: center;
        }

        .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--primary);
            color: var(--bg);
            font-family: var(--font-display);
            font-size: 1.3rem;
            font-weight: 800;
            margin-bottom: 16px;
        }

        .step h3 {
            font-family: var(--font-display);
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .step p {
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        /* ===== FEATURES ===== */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 24px;
        }

        .feature-card {
            background: var(--bg-card);
            border-radius: 14px;
            padding: 24px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }

        .feature-icon {
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(220, 251, 78, 0.12);
            color: var(--primary);
            font-size: 1.2rem;
        }

        .feature-card p {
            font-size: 0.95rem;
            line-height: 1.5;
        }

        /* ===== FAQ ===== */
        .faq-list {
            max-width: 720px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .faq-item {
            background: var(--bg-card);
            border-radius: 14px;
            overflow: hidden;
        }

        .faq-question {
            width: 100%;
            background: none;
            border: none;
            color: var(--text);
            font-family: var(--font-body);
            font-size: 1rem;
            font-weight: 600;
            text-align: left;
            padding: 20px 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .faq-question::after {
            content: '+';
            font-size: 1.4rem;
            color: var(--primary);
            flex-shrink: 0;
            transition: transform 0.2s;
        }

        .faq-item.open .faq-question::after {
            transform: rotate(45deg);
        }

        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .faq-item.open .faq-answer {
            max-height: 300px;
        }

        .faq-answer p {
            padding: 0 24px 20px;
            font-size: 0.92rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* ===== STORE BUTTONS ===== */
        .store-section {
            text-align: center;
            padding: 60px 20px 40px;
        }

        .store-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
            margin-top: 32px;
        }

        .store-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 600;
            transition: transform 0.15s;
        }

        .store-btn:active { transform: scale(0.97); }

        .store-btn--ios {
            background: #ffffff;
            color: #000000;
        }

        .store-btn--android {
            background: var(--primary);
            color: #111111;
        }

        .store-btn svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
        }

        /* ===== FOOTER ===== */
        footer {
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid #222;
        }

        footer nav {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 24px;
            margin-bottom: 16px;
        }

        footer a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.85rem;
            transition: color 0.2s;
        }

        footer a:hover { color: var(--primary); }

        footer .copyright {
            font-size: 0.75rem;
            color: #666;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 480px) {
            .section { padding: 60px 16px; }
            .hero { min-height: 80vh; padding: 40px 16px; }
            .steps { grid-template-columns: 1fr; }
            .features-grid { grid-template-columns: 1fr; }
            .store-buttons { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>

    {{-- Language Switch --}}
    <div class="lang-switch">
        <a href="{{ $alternateUrl }}">{{ strtoupper($alternateLocale) }}</a>
    </div>

    {{-- HERO --}}
    <section class="hero">
        <h1>{{ __('vitrine.hero_title') }}</h1>
        <p>{{ __('vitrine.hero_subtitle') }}</p>
        <a class="hero-cta" href="#store">{{ __('vitrine.hero_cta') }}</a>
    </section>

    {{-- HOW IT WORKS --}}
    <section class="section">
        <h2 class="section-title">{{ __('vitrine.how_it_works') }}</h2>
        <div class="steps">
            <div class="step">
                <div class="step-number">1</div>
                <h3>{{ __('vitrine.step1_title') }}</h3>
                <p>{{ __('vitrine.step1_desc') }}</p>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <h3>{{ __('vitrine.step2_title') }}</h3>
                <p>{{ __('vitrine.step2_desc') }}</p>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <h3>{{ __('vitrine.step3_title') }}</h3>
                <p>{{ __('vitrine.step3_desc') }}</p>
            </div>
        </div>
    </section>

    {{-- FEATURES --}}
    <section class="section">
        <h2 class="section-title">{{ __('vitrine.features_title') }}</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <p>{{ __('vitrine.feature_anonymous') }}</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🎙</div>
                <p>{{ __('vitrine.feature_voice') }}</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📸</div>
                <p>{{ __('vitrine.feature_photo') }}</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <p>{{ __('vitrine.feature_clues') }}</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🤝</div>
                <p>{{ __('vitrine.feature_reveal') }}</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🛡</div>
                <p>{{ __('vitrine.feature_safe') }}</p>
            </div>
        </div>
    </section>

    {{-- FAQ --}}
    @if(!empty($faqItems))
    <section class="section">
        <h2 class="section-title">{{ __('faq.title') }}</h2>
        <div class="faq-list">
            @foreach($faqItems as $item)
            <div class="faq-item">
                <button class="faq-question" type="button" aria-expanded="false">
                    {{ $item['q'] }}
                </button>
                <div class="faq-answer">
                    <p>{{ $item['a'] }}</p>
                </div>
            </div>
            @endforeach
        </div>
    </section>
    @endif

    {{-- STORE BUTTONS --}}
    <section class="store-section" id="store">
        <h2 class="section-title">{{ __('vitrine.hero_cta') }}</h2>
        <div class="store-buttons">
            <a href="{{ $seoAppStoreUrl ?? config('shhme.seo.app_store_url') }}" class="store-btn store-btn--ios" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                {{ __('vitrine.store_ios') }}
            </a>
            <a href="{{ $seoPlayStoreUrl ?? config('shhme.seo.play_store_url') }}" class="store-btn store-btn--android" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.54c-.35-.2-.57-.59-.57-1.04V1.5c0-.45.22-.84.57-1.04L14.54 12 3.18 23.54zM16.36 13.82l-1.82-1.82 1.82-1.82 4.05 2.34c.46.27.46.92 0 1.18l-4.05 2.12zM14.54 12L4.36 1.64l12.18 7.02L14.54 12zm0 0l2 3.34L4.36 22.36 14.54 12z"/></svg>
                {{ __('vitrine.store_android') }}
            </a>
        </div>
    </section>

    {{-- FOOTER --}}
    <footer>
        <nav>
            <a href="/{{ $locale }}/privacy">{{ __('vitrine.footer_privacy') }}</a>
            <a href="/{{ $locale }}/terms">{{ __('vitrine.footer_terms') }}</a>
            <a href="mailto:contact@shh-me.com">{{ __('vitrine.footer_contact') }}</a>
        </nav>
        <p class="copyright">&copy; {{ date('Y') }} Shh Me. All rights reserved.</p>
    </footer>

    {{-- FAQ Toggle --}}
    <script>
        document.querySelectorAll('.faq-question').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var item = btn.closest('.faq-item');
                var isOpen = item.classList.contains('open');
                // Close all
                document.querySelectorAll('.faq-item.open').forEach(function(el) {
                    el.classList.remove('open');
                    el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });
                // Toggle current
                if (!isOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    </script>

</body>
</html>
