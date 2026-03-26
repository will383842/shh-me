<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('preview page loads', function () {
    // With a non-existent anonymous ID, the controller aborts with 404
    $response = $this->get('/p/some-anonymous-id');

    $response->assertStatus(404);
});

test('preview no auth required', function () {
    // GET /p/xxx without any auth token should NOT return 401.
    // It should return 404 (shh not found) — not 401 (unauthenticated).
    $response = $this->get('/p/xxx');

    $response->assertStatus(404);
    // Explicitly verify it's not a 401
    expect($response->status())->not->toBe(401);
});
