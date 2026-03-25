<?php

declare(strict_types=1);

use App\Services\ModerationService;
use Illuminate\Support\Facades\Http;

test('moderation service is injectable', function () {
    $service = app()->make(ModerationService::class);

    expect($service)->toBeInstanceOf(ModerationService::class);
});

test('moderate text returns valid status', function () {
    Http::fake([
        'api.openai.com/v1/moderations' => Http::response([
            'results' => [
                [
                    'flagged' => false,
                    'categories' => [],
                ],
            ],
        ], 200),
    ]);

    $service = app()->make(ModerationService::class);
    $result = $service->moderateText('Hello, how are you?');

    expect($result)->toBeIn(['passed', 'blocked', 'review']);
    expect($result)->toBe('passed');
});
