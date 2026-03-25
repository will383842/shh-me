<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('create report success', function () {
    $user = User::factory()->create();
    $targetId = (string) Str::ulid();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reports', [
            'target_type' => 'shh',
            'target_id' => $targetId,
            'reason' => 'Contenu inapproprie',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message']);

    $this->assertDatabaseHas('reports', [
        'reporter_id' => $user->id,
        'target_type' => 'shh',
        'target_id' => $targetId,
        'reason' => 'Contenu inapproprie',
        'status' => 'pending',
    ]);
});

test('create report invalid target 422', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reports', [
            'target_type' => 'invalid_type',
            'target_id' => (string) Str::ulid(),
            'reason' => 'Test',
        ]);

    $response->assertStatus(422);
});

test('create report without auth 401', function () {
    $response = $this->postJson('/api/v1/reports', [
        'target_type' => 'shh',
        'target_id' => (string) Str::ulid(),
        'reason' => 'Test',
    ]);

    $response->assertStatus(401);
});
