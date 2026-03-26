{{-- Web preview page for a shh (public, no auth required) --}}
{{-- Variables: $shh, $bpm, $expiresAt, $isExpired, $teaserUrl, $audioDuration, $locale, $alternateLocale, $canonicalUrl, $alternateUrl --}}
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
    <link rel="alternate" hreflang="x-default" href="{{ str_replace('/' . $locale . '/', '/en/', $canonicalUrl) }}">

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

    {{-- JSON-LD: BreadcrumbList --}}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "{{ __('seo.app_name') }}",
                "item": "{{ $seoDomain ?? config('shhme.seo.domain') }}"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "{{ __('preview.title') }}",
                "item": "{{ $canonicalUrl }}"
            }
        ]
    }
    </script>

    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg: #111111;
            --primary: #DCFB4E;
            --text: #ffffff;
            --text-muted: #aaaaaa;
        }

        body {
            background: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            text-align: center;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 420px;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
        }

        /* ECG Animation */
        .ecg-container {
            width: 100%;
            height: 80px;
            overflow: hidden;
            position: relative;
        }

        .ecg-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            animation: ecg-scroll var(--ecg-speed, 2s) linear infinite;
        }

        @keyframes ecg-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        .ecg-line path {
            fill: none;
            stroke: var(--primary);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        /* Title */
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.3;
        }

        .bpm-text {
            font-size: 1.1rem;
            color: var(--primary);
            font-weight: 500;
        }

        /* Timer */
        .timer {
            display: flex;
            flex-direction: column;
            gap: 6px;
            align-items: center;
        }

        .timer-prefix {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .timer-countdown {
            font-size: 1.8rem;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: var(--primary);
            letter-spacing: 2px;
        }

        /* Audio Teaser */
        .audio-teaser {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        .audio-teaser p {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .sound-btn {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
        }

        .sound-btn:hover,
        .sound-btn:focus {
            background: var(--primary);
            color: var(--bg);
        }

        /* Expired State */
        .expired-message {
            font-size: 1.2rem;
            color: var(--text-muted);
            padding: 32px 0;
        }

        /* Store Buttons */
        .store-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            max-width: 280px;
        }

        .store-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 600;
            transition: transform 0.15s, opacity 0.15s;
        }

        .store-btn:active {
            transform: scale(0.97);
        }

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

        /* CTA */
        .cta-primary {
            display: block;
            width: 100%;
            max-width: 280px;
            padding: 16px 24px;
            background: var(--primary);
            color: var(--bg);
            font-size: 1.05rem;
            font-weight: 700;
            text-decoration: none;
            border-radius: 14px;
            text-align: center;
            transition: transform 0.15s;
        }

        .cta-primary:active {
            transform: scale(0.97);
        }

        /* Trust Line */
        .trust-line {
            font-size: 0.75rem;
            color: var(--text-muted);
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">

        @if($isExpired)
            <p class="expired-message">{{ __('preview.expired') }}</p>
        @else
            {{-- ECG Animation --}}
            <div class="ecg-container" style="--ecg-speed: {{ max(0.5, 60 / $bpm) }}s">
                <svg class="ecg-line" viewBox="0 0 800 80" preserveAspectRatio="none">
                    <path d="M0,40 L60,40 L70,40 L80,20 L90,60 L100,10 L110,70 L120,35 L130,40 L200,40
                             L260,40 L270,40 L280,20 L290,60 L300,10 L310,70 L320,35 L330,40 L400,40
                             L460,40 L470,40 L480,20 L490,60 L500,10 L510,70 L520,35 L530,40 L600,40
                             L660,40 L670,40 L680,20 L690,60 L700,10 L710,70 L720,35 L730,40 L800,40" />
                </svg>
            </div>

            {{-- Title --}}
            <h1>{{ __('preview.title') }}</h1>
            <p class="bpm-text">{{ __('preview.subtitle', ['bpm' => $bpm]) }}</p>

            {{-- Expiration Countdown --}}
            <div class="timer">
                <span class="timer-prefix">{{ __('preview.timer_prefix') }}</span>
                <span class="timer-countdown" id="countdown" data-expires="{{ $expiresAt }}">--:--:--</span>
            </div>

            {{-- Audio Teaser --}}
            @if($teaserUrl)
                <div class="audio-teaser">
                    <p>{{ __('preview.teaser_text', ['duration' => $audioDuration ?? 30]) }}</p>
                    <audio id="teaser-audio" preload="metadata">
                        <source src="{{ $teaserUrl }}" type="audio/mpeg">
                    </audio>
                    <button class="sound-btn" id="sound-btn" type="button" aria-label="{{ __('preview.sound_button') }}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        {{ __('preview.sound_button') }}
                    </button>
                </div>
            @endif
        @endif

        {{-- CTA --}}
        <a class="cta-primary" href="{{ $seoAppStoreUrl ?? config('shhme.seo.app_store_url') }}">
            {{ __('preview.cta') }}
        </a>

        {{-- Store Buttons --}}
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

        {{-- Trust Line --}}
        <p class="trust-line">{{ __('preview.trust_line') }}</p>

    </div>

    {{-- Countdown Timer --}}
    <script>
        (function() {
            var el = document.getElementById('countdown');
            if (!el) return;
            var expires = new Date(el.getAttribute('data-expires')).getTime();

            function update() {
                var now = Date.now();
                var diff = expires - now;
                if (diff <= 0) {
                    el.textContent = '00:00:00';
                    clearInterval(timer);
                    return;
                }
                var h = Math.floor(diff / 3600000);
                var m = Math.floor((diff % 3600000) / 60000);
                var s = Math.floor((diff % 60000) / 1000);
                el.textContent =
                    (h < 10 ? '0' + h : h) + ':' +
                    (m < 10 ? '0' + m : m) + ':' +
                    (s < 10 ? '0' + s : s);
            }

            update();
            var timer = setInterval(update, 1000);
        })();
    </script>

    {{-- Audio Teaser Player --}}
    @if($teaserUrl && !$isExpired)
    <script>
        (function() {
            var btn = document.getElementById('sound-btn');
            var audio = document.getElementById('teaser-audio');
            if (!btn || !audio) return;

            btn.addEventListener('click', function() {
                if (audio.paused) {
                    audio.play();
                    btn.style.background = 'var(--primary)';
                    btn.style.color = 'var(--bg)';
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--primary)';
                }
            });

            audio.addEventListener('ended', function() {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary)';
            });
        })();
    </script>
    @endif
</body>
</html>
