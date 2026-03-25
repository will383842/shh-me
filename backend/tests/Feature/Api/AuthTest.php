<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('login apple creates user and returns token', function () {
    $response = $this->postJson('/api/v1/auth/apple', [
        'apple_token' => 'fake-apple-token-123',
        'apple_id' => 'apple-user-001',
        'birth_year' => 2000,
        'email' => 'test@apple.com',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'city', 'referrer_code', 'created_at'],
        ]);

    $this->assertDatabaseHas('users', [
        'apple_id' => 'apple-user-001',
        'email' => 'test@apple.com',
        'birth_year' => 2000,
    ]);
});

test('login google creates user and returns token', function () {
    $response = $this->postJson('/api/v1/auth/google', [
        'google_token' => 'fake-google-token-456',
        'google_id' => 'google-user-001',
        'birth_year' => 1995,
        'email' => 'test@gmail.com',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'city', 'referrer_code', 'created_at'],
        ]);

    $this->assertDatabaseHas('users', [
        'google_id' => 'google-user-001',
        'email' => 'test@gmail.com',
        'birth_year' => 1995,
    ]);
});

test('login requires adult birth year', function () {
    $underageBirthYear = (int) date('Y') - 15; // 15 years old

    $response = $this->postJson('/api/v1/auth/apple', [
        'apple_token' => 'fake-token',
        'apple_id' => 'underage-user',
        'birth_year' => $underageBirthYear,
        'email' => 'kid@example.com',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'error' => [
                'code' => 'age_restricted',
            ],
        ]);

    $this->assertDatabaseMissing('users', [
        'apple_id' => 'underage-user',
    ]);
});

test('logout revokes token', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/auth/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Shh... tu es parti(e) en silence.',
        ]);
});

test('logout without token returns 401', function () {
    $response = $this->postJson('/api/v1/auth/logout');

    $response->assertStatus(401);
});
