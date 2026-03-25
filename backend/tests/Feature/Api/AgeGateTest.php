<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('under 18 blocked', function () {
    // Try to register via Apple with an underage birth year
    $underageBirthYear = (int) date('Y') - 16;

    $response = $this->postJson('/api/v1/auth/apple', [
        'apple_token' => 'fake-token',
        'apple_id' => 'minor-apple-id',
        'birth_year' => $underageBirthYear,
        'email' => 'minor@example.com',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'error' => [
                'code' => 'age_restricted',
                'status' => 403,
            ],
        ]);

    // Also test via Google
    $responseGoogle = $this->postJson('/api/v1/auth/google', [
        'google_token' => 'fake-token',
        'google_id' => 'minor-google-id',
        'birth_year' => $underageBirthYear,
        'email' => 'minor@example.com',
    ]);

    $responseGoogle->assertStatus(403)
        ->assertJson([
            'error' => [
                'code' => 'age_restricted',
            ],
        ]);

    // Ensure no user was created
    $this->assertDatabaseMissing('users', ['apple_id' => 'minor-apple-id']);
    $this->assertDatabaseMissing('users', ['google_id' => 'minor-google-id']);
});

test('adult passes', function () {
    $adultBirthYear = (int) date('Y') - 25;

    $response = $this->postJson('/api/v1/auth/apple', [
        'apple_token' => 'fake-token',
        'apple_id' => 'adult-apple-id',
        'birth_year' => $adultBirthYear,
        'email' => 'adult@example.com',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'token',
            'user' => ['id'],
        ]);

    $this->assertDatabaseHas('users', [
        'apple_id' => 'adult-apple-id',
        'birth_year' => $adultBirthYear,
    ]);
});
