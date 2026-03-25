<?php

declare(strict_types=1);

use App\Services\ShhVaultService;

test('vault service is injectable', function () {
    $service = app()->make(ShhVaultService::class);

    expect($service)->toBeInstanceOf(ShhVaultService::class);
});

test('encryption key is configured', function () {
    // In test env, the key may be empty string but the config key must exist
    $key = config('shhme.vault_encryption_key');

    expect($key)->not->toBeNull();
});
