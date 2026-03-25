<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhGuess;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guess returns generic response', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('receiver');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/guess", [
            'guessed_identifier' => 'jean@example.com',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['result', 'attempts_remaining'],
        ])
        ->assertJsonPath('data.attempts_remaining', 2);
});

test('guess max 3 attempts', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    // Pre-create 3 guesses to exhaust attempts
    for ($i = 1; $i <= 3; $i++) {
        ShhGuess::create([
            'shh_id' => $shh->id,
            'guessed_identifier' => "guess{$i}@example.com",
            'attempt_number' => $i,
        ]);
    }

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('receiver');
    });

    // 4th attempt should be blocked
    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/guess", [
            'guessed_identifier' => 'guess4@example.com',
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'error' => [
                'code' => 'max_attempts_reached',
            ],
        ]);
});

test('guess without auth 401', function () {
    $shh = Shh::factory()->create();

    $response = $this->postJson("/api/v1/shh/{$shh->id}/guess", [
        'guessed_identifier' => 'someone@example.com',
    ]);

    $response->assertStatus(401);
});
