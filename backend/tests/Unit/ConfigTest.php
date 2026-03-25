<?php

declare(strict_types=1);

test('shhme config has all required keys', function (): void {
    $config = config('shhme');

    expect($config)->toBeArray();

    // Lifecycle
    expect($config)->toHaveKey('shh_expiration_hours');
    expect($config)->toHaveKey('shh_opened_expiration_days');
    expect($config)->toHaveKey('reveal_timeout_hours');
    expect($config)->toHaveKey('connect_cancel_seconds');
    expect($config)->toHaveKey('max_shh_per_day');
    expect($config)->toHaveKey('minimum_age');

    // Push limits
    expect($config)->toHaveKey('max_push_per_day');
    expect($config)->toHaveKey('max_push_system_per_day');
    expect($config)->toHaveKey('max_push_contextual_per_day');

    // Clue system
    expect($config)->toHaveKey('clue_morning_question_hour');
    expect($config)->toHaveKey('clue_afternoon_window_start');
    expect($config)->toHaveKey('clue_afternoon_window_end');
    expect($config)->toHaveKey('clue_ai_timeout_seconds');
    expect($config)->toHaveKey('clue_j4_counter_indication');

    // Photo blur
    expect($config)->toHaveKey('blur_levels');
    expect($config['blur_levels'])->toBeArray()->toHaveCount(5);

    // Audio
    expect($config)->toHaveKey('audio_max_seconds');
    expect($config)->toHaveKey('audio_voices');
    expect($config['audio_voices'])->toHaveKey('le_souffle');

    // BPM
    expect($config)->toHaveKey('bpm_ranges');
    expect($config['bpm_ranges'])->toHaveKeys(['morning', 'daytime', 'evening', 'night', 'deep_night']);

    // Locales
    expect($config)->toHaveKey('supported_locales');
    expect($config['supported_locales'])->toContain('en')->toContain('fr');
});

test('minimum age is 18', function (): void {
    expect(config('shhme.minimum_age'))->toBe(18);
});

test('shh expiration is 48 hours', function (): void {
    expect(config('shhme.shh_expiration_hours'))->toBe(48);
});

test('connect cancel timeout is 5 seconds', function (): void {
    expect(config('shhme.connect_cancel_seconds'))->toBe(5);
});

test('max push per day is 4', function (): void {
    expect(config('shhme.max_push_per_day'))->toBe(4);
});

test('blur levels are [40, 30, 15, 5, 0]', function (): void {
    expect(config('shhme.blur_levels'))->toBe([40, 30, 15, 5, 0]);
});

test('audio max duration is 30 seconds', function (): void {
    expect(config('shhme.audio_max_seconds'))->toBe(30);
});

test('database config has pgsql connection', function (): void {
    expect(config('database.connections'))->toHaveKey('pgsql');
    expect(config('database.connections.pgsql.driver'))->toBe('pgsql');
});

test('vault database connection exists', function (): void {
    $connections = config('database.connections');
    expect($connections)->toHaveKey('vault');
    expect($connections['vault']['driver'])->toBe('pgsql');
});

test('redis has cache and persistent connections', function (): void {
    $redis = config('database.redis');
    expect($redis)->toHaveKey('cache');
    expect($redis)->toHaveKey('persistent');
});

test('r2 public and private disks are configured', function (): void {
    $disks = config('filesystems.disks');
    expect($disks)->toHaveKey('r2-public');
    expect($disks)->toHaveKey('r2-private');
    expect($disks['r2-public']['driver'])->toBe('s3');
    expect($disks['r2-private']['driver'])->toBe('s3');
});
