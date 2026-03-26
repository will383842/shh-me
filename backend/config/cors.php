<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://shh-me.com',
        'https://admin.shh-me.com',
        'http://localhost:*',
        'http://127.0.0.1:*',
    ],
    'allowed_origins_patterns' => [
        '#^https?://localhost(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
