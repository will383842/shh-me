<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('me returns authenticated user', function () {
    $user = User::factory()->create([
        'city' => 'Paris',
        'country_code' => 'FR',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/me');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'city',
                'country_code',
                'preferred_locale',
                'total_shh_received',
                'total_reveals',
                'onboarding_completed',
                'shh_ghost_enabled',
                'referrer_code',
                'created_at',
            ],
        ])
        ->assertJsonPath('data.city', 'Paris')
        ->assertJsonPath('data.country_code', 'FR');
});

test('update profile success', function () {
    $user = User::factory()->create([
        'city' => 'Lyon',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->patchJson('/api/v1/me', [
            'city' => 'Marseille',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.city', 'Marseille');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'city' => 'Marseille',
    ]);
});

test('me without auth returns 401', function () {
    $response = $this->getJson('/api/v1/me');

    $response->assertStatus(401);
});
