<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shh Lifecycle
    |--------------------------------------------------------------------------
    */

    'shh_expiration_hours' => 48,
    'shh_opened_expiration_days' => 7,
    'reveal_timeout_hours' => 48,
    'connect_cancel_seconds' => 5,
    'max_shh_per_day' => 15,
    'minimum_age' => 18,

    /*
    |--------------------------------------------------------------------------
    | Push Notifications — max 4/day (1 system + 3 contextual)
    |--------------------------------------------------------------------------
    */

    'max_push_per_day' => 4,
    'max_push_system_per_day' => 1,
    'max_push_contextual_per_day' => 3,

    /*
    |--------------------------------------------------------------------------
    | Clue System — 2 moments/day + 3-layer fallback
    |--------------------------------------------------------------------------
    */

    'clue_morning_question_hour' => 9,
    'clue_morning_anticipation_hour' => 9,
    'clue_afternoon_window_start' => 12,
    'clue_afternoon_window_end' => 15,
    'clue_ai_timeout_seconds' => 5,
    'clue_fallback_min_questions' => 500,
    'clue_j4_counter_indication' => true,

    /*
    |--------------------------------------------------------------------------
    | Photo Blur — 5 levels [40, 30, 15, 5, 0]
    |--------------------------------------------------------------------------
    */

    'blur_levels' => [40, 30, 15, 5, 0],
    'blur_confetti_enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Audio — FFmpeg server-side (cost: $0)
    |--------------------------------------------------------------------------
    */

    'audio_max_seconds' => 30,
    'audio_teaser_seconds' => 3,
    'audio_voices' => [
        'le_souffle' => [
            'label' => 'Le Souffle',
            'filter' => 'asetrate=44100*0.85,aresample=44100,aecho=0.8:0.88:60:0.4',
            'mvp' => 1,
            'premium' => false,
        ],
        // MVP2 voices:
        // 'la_brise' => [
        //     'label' => 'La Brise',
        //     'filter' => 'asetrate=44100*1.15,aresample=44100,chorus=0.5:0.9:50:0.4:0.25:2',
        //     'mvp' => 2,
        //     'premium' => false,
        // ],
        // 'l_echo' => [
        //     'label' => "L'Écho",
        //     'filter' => 'flanger=depth=3:speed=0.3,aecho=0.8:0.9:40:0.5',
        //     'mvp' => 2,
        //     'premium' => false,
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | App Open Sound — 0.3s pavlovian conditioning
    |--------------------------------------------------------------------------
    */

    'app_open_sound_enabled' => true,
    'app_open_sound_duration_ms' => 300,

    /*
    |--------------------------------------------------------------------------
    | Sender First Word — after 3s gesture
    |--------------------------------------------------------------------------
    */

    'sender_first_word_enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Quick Replies — 3 contextual options + free text
    |--------------------------------------------------------------------------
    */

    'quick_replies_enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | BPM — contextual by time of day
    |--------------------------------------------------------------------------
    */

    'bpm_ranges' => [
        'morning' => ['min' => 72, 'max' => 80],      // 6h-9h
        'daytime' => ['min' => 80, 'max' => 95],       // 9h-18h
        'evening' => ['min' => 88, 'max' => 105],      // 18h-22h
        'night' => ['min' => 78, 'max' => 92],          // 22h-2h
        'deep_night' => ['min' => 72, 'max' => 80],    // 2h-6h
    ],
    'bpm_min' => 72,
    'bpm_max' => 110,

    /*
    |--------------------------------------------------------------------------
    | Expiration Microcopy — humanized (never a cold timer)
    |--------------------------------------------------------------------------
    */

    'expiration_microcopy' => [
        48 => 'shh.expiration.breathing',
        24 => 'shh.expiration.weakening',
        6 => 'shh.expiration.last_moments',
        0 => 'shh.expiration.existed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Community Counter — cascade (never 0)
    |--------------------------------------------------------------------------
    */

    'community_counter_min_threshold' => 10,
    'community_counter_levels' => ['city', 'region', 'country', 'global'],
    'community_counter_cache_ttl' => 60,
    'community_counter_recalc_cron' => '0 * * * *',

    /*
    |--------------------------------------------------------------------------
    | Moderation — monthly budget alert at 80%
    |--------------------------------------------------------------------------
    */

    'moderation_budget_monthly_cents' => 50000,

    /*
    |--------------------------------------------------------------------------
    | Encryption
    |--------------------------------------------------------------------------
    */

    'message_encryption' => 'AES-256-CBC',

    /*
    |--------------------------------------------------------------------------
    | FFmpeg binary path
    |--------------------------------------------------------------------------
    */

    'ffmpeg_binary' => env('FFMPEG_BINARY', 'ffmpeg'),

    /*
    |--------------------------------------------------------------------------
    | Supported locales
    |--------------------------------------------------------------------------
    */

    'supported_locales' => ['en', 'fr'],
    'default_locale' => 'en',

];
