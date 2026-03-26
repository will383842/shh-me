<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    'notification' => [
        'shh_received' => 'Quelqu\'un a un secret pour toi 🤫',
        'new_message' => 'Une pensée secrète t\'attend 🤫',
        'audio_received' => 'Tu as reçu une voix mystérieuse 🤫',
        'morning_question' => 'Une question pour ton secret... 🤫',
        'afternoon_clue' => 'Un indice vient d\'arriver... 🤫',
        'morning_anticipation' => 'Ton indice arrive entre 12h et 15h. Prépare-toi. 🤫',
        'reveal_ready' => 'Le reveal est prêt. Tu oses ? 🤫',
        'photo_unblurred' => 'La photo de ton admirateur secret est plus nette… 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Errors (never say "Erreur")
    |--------------------------------------------------------------------------
    */

    'error' => [
        'generic' => 'Quelque chose n\'a pas marché. Réessaie 🤫',
        'unauthorized' => 'Cette action nécessite une authentification 🤫',
        'forbidden' => 'Tu n\'as pas accès à ça 🤫',
        'not_found' => 'Ce battement a disparu 🤫',
        'too_many_requests' => 'Doucement 🤫',
        'validation_failed' => 'Il manque quelque chose 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    'auth' => [
        'age_blocked' => 'Shh Me est réservé aux 18 ans et plus. On se retrouve bientôt 🤫',
        'logged_out' => 'À bientôt 🤫',
        'account_deleted' => 'Ton compte a été supprimé. Toutes les données seront purgées sous 30 jours.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Shh Lifecycle
    |--------------------------------------------------------------------------
    */

    'shh' => [
        'expiration' => [
            'breathing' => 'Ce battement respire encore…',
            'weakening' => 'Le battement s\'affaiblit…',
            'last_moments' => 'Derniers instants…',
            'existed' => 'Ce battement a existé.',
        ],
        'sent' => 'Ton shh a été envoyé 🤫',
        'max_per_day' => 'Tu as atteint ta limite du jour. Reviens demain 🤫',
        'blocked' => 'Tu ne peux pas envoyer de shh à cette personne 🤫',
        'inactive' => 'Ce shh n\'est plus actif 🤫',
        'not_participant' => 'Tu ne fais pas partie de ce shh 🤫',
        'no_photo' => 'Ce shh n\'a pas de photo 🤫',
        'photo_processing' => 'La photo est en cours de préparation 🤫',
    ],

    'guess' => [
        'wrong' => 'Pas cette fois 🤫',
        'max_attempts' => 'Plus de tentatives 🤫',
        'receiver_only' => 'Seul le destinataire peut deviner 🤫',
    ],

    'block' => [
        'blocked' => 'Utilisateur bloqué 🤫',
        'unblocked' => 'Utilisateur débloqué 🤫',
        'already_blocked' => 'Déjà bloqué',
        'not_blocked' => 'Pas bloqué',
        'self_block' => 'Tu ne peux pas te bloquer toi-même 🤫',
    ],

    'report' => [
        'submitted' => 'Signalement envoyé. Merci 🤫',
    ],

    'feedback' => [
        'thanks' => 'Merci pour ton retour 🤫',
    ],

    'panic' => [
        'activated' => 'Tout est arrêté. Tu es en sécurité. 🤫 Ton compte se réactivera dans 24h.',
    ],

    'reaction' => [
        'removed' => 'Réaction supprimée',
        'none_to_remove' => 'Pas de réaction à supprimer',
    ],

    'user' => [
        'account_deleted' => 'Ton compte a été supprimé. Toutes les données seront purgées sous 30 jours.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Reveal
    |--------------------------------------------------------------------------
    */

    'reveal' => [
        'connected' => '🤫 Connected',
        'cancelled' => 'Reveal annulé',
        'already_requested' => 'Tu as déjà demandé un reveal pour ce shh',
    ],

    /*
    |--------------------------------------------------------------------------
    | Moderation
    |--------------------------------------------------------------------------
    */

    'moderation' => [
        'text_blocked' => 'Ce message n\'a pas pu être envoyé 🤫',
        'photo_blocked' => 'Cette photo n\'a pas pu être envoyée 🤫',
        'audio_blocked' => 'Cet audio n\'a pas pu être envoyé 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Relance (anti-Duolingo)
    |--------------------------------------------------------------------------
    */

    'relance' => [
        'gentle' => 'Quelque chose de doux t\'attend quand tu voudras. Pas de rush. 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Ghost Push
    |--------------------------------------------------------------------------
    */

    'ghost' => [
        'push' => 'Des personnes de ton quartier ont envoyé un shh ce soir 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Audio (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'audio' => [
        'filter_failed' => 'Le traitement vocal a échoué. Réessaie 🤫',
        'not_validated' => 'Écoute ta voix avant de l\'envoyer 🤫',
        'sent' => 'Ta voix a été envoyée 🤫',
        'too_long' => 'L\'audio ne doit pas dépasser 30 secondes 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Clues (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'clue' => [
        'question_sent' => 'Une question a été envoyée 🤫',
        'answered' => 'Ta réponse a été enregistrée 🤫',
        'delivered' => 'Un indice a été livré 🤫',
    ],

    /*
    |--------------------------------------------------------------------------
    | Connect (Sprint 3-4)
    |--------------------------------------------------------------------------
    */

    'connect' => [
        'waiting' => 'En attente de l\'autre coeur 🤫',
        'cancelled' => 'Connect annulé 🤫',
        'mutual' => 'Les deux coeurs battent ensemble 🤫',
        'too_late' => 'Trop tard pour annuler 🤫',
        'video_generating' => 'Ta vidéo de révélation est en cours de création 🤫',
    ],

];
