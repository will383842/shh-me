<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    'notification' => [
        'shh_received' => 'Someone has a secret about you 🤫',
        'new_message' => 'A secret thought is waiting for you 🤫',
        'audio_received' => 'You received a mysterious voice 🤫',
        'morning_question' => 'A question for your secret... 🤫',
        'afternoon_clue' => 'A clue just arrived... 🤫',
        'morning_anticipation' => 'Your clue arrives between 12pm and 3pm. Get ready. 🤫',
        'reveal_ready' => 'The reveal is ready. Do you dare? 🤫',
        'photo_unblurred' => "Your secret admirer's photo is clearer… 🤫",
    ],

    /*
    |--------------------------------------------------------------------------
    | Errors (never say "Error")
    |--------------------------------------------------------------------------
    */

    'error' => [
        'generic' => "Something didn't work. Try again 🤫",
        'unauthorized' => 'This action requires authentication 🤫',
        'forbidden' => "You don't have access to this 🤫",
        'not_found' => 'This heartbeat has vanished 🤫',
        'too_many_requests' => 'Slow down a little 🤫',
        'validation_failed' => 'Something is missing 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    'auth' => [
        'age_blocked' => 'Shh Me is reserved for 18 and over. See you soon 🤫',
        'logged_out' => 'See you soon 🤫',
        'account_deleted' => 'Your account has been deleted. All data will be purged within 30 days.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Shh Lifecycle
    |--------------------------------------------------------------------------
    */

    'shh' => [
        'expiration' => [
            'breathing' => 'This heartbeat is still breathing…',
            'weakening' => 'The heartbeat is fading…',
            'last_moments' => 'Last moments…',
            'existed' => 'This heartbeat existed.',
        ],
        'sent' => 'Your shh has been sent 🤫',
        'max_per_day' => "You've reached your daily limit. Come back tomorrow 🤫",
        'blocked' => "You can't send a shh to this person 🤫",
        'inactive' => 'This shh is no longer active 🤫',
        'not_participant' => "You're not part of this shh 🤫",
        'no_photo' => 'This shh has no photo 🤫',
        'photo_processing' => 'Photo is being prepared 🤫',
    ],

    'guess' => [
        'wrong' => 'Not this time 🤫',
        'max_attempts' => 'No more attempts 🤫',
        'receiver_only' => 'Only the receiver can guess 🤫',
    ],

    'block' => [
        'blocked' => 'User blocked 🤫',
        'unblocked' => 'User unblocked 🤫',
        'already_blocked' => 'Already blocked',
        'not_blocked' => 'Not blocked',
        'self_block' => "You can't block yourself 🤫",
    ],

    'report' => [
        'submitted' => 'Report submitted. Thank you 🤫',
    ],

    'feedback' => [
        'thanks' => 'Thank you for your feedback 🤫',
    ],

    'panic' => [
        'activated' => "Everything is stopped. You're safe. 🤫 Your account will reactivate in 24h.",
    ],

    'reaction' => [
        'removed' => 'Reaction removed',
        'none_to_remove' => 'No reaction to remove',
    ],

    'user' => [
        'account_deleted' => 'Your account has been deleted. All data will be purged within 30 days.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Reveal
    |--------------------------------------------------------------------------
    */

    'reveal' => [
        'connected' => '🤫 Connected',
        'cancelled' => 'Reveal cancelled',
        'already_requested' => 'You already requested a reveal for this shh',
    ],

    /*
    |--------------------------------------------------------------------------
    | Moderation
    |--------------------------------------------------------------------------
    */

    'moderation' => [
        'text_blocked' => 'This message could not be sent 🤫',
        'photo_blocked' => 'This photo could not be sent 🤫',
        'audio_blocked' => 'This audio could not be sent 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Relance (anti-Duolingo)
    |--------------------------------------------------------------------------
    */

    'relance' => [
        'gentle' => 'Something sweet is waiting for you whenever you want. No rush. 🤫',
        'morning_11h' => "You haven't answered... Your crush is waiting for their clue 🤫",
    ],

    /*
    |--------------------------------------------------------------------------
    | Ghost Push
    |--------------------------------------------------------------------------
    */

    'ghost' => [
        'push' => 'People near you sent a shh tonight 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Audio (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'audio' => [
        'filter_failed' => 'Voice processing failed. Try again 🤫',
        'not_validated' => 'Listen to your voice before sending 🤫',
        'sent' => 'Your voice has been sent 🤫',
        'too_long' => 'Audio must be 30 seconds or less 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Clues (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'clue' => [
        'question_sent' => 'A question has been sent 🤫',
        'answered' => 'Your answer has been recorded 🤫',
        'delivered' => 'A clue has been delivered 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Connect (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'connect' => [
        'waiting' => 'Waiting for the other heart 🤫',
        'cancelled' => 'Connect cancelled 🤫',
        'mutual' => 'Both hearts beat together 🤫',
        'too_late' => 'Too late to cancel 🤫',
        'video_generating' => 'Your reveal video is being created 🤫',
    ],

];
