<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhMessage;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('send message success', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/messages", [
            'content' => 'Shh... je pense a toi',
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'content',
                'sender_role',
                'moderation_status',
                'created_at',
            ],
        ]);
});

test('send message too long 422', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->andReturn('sender');
    });

    $longContent = str_repeat('a', 201);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/messages", [
            'content' => $longContent,
        ]);

    $response->assertStatus(422);
});

test('send message without auth 401', function () {
    $shh = Shh::factory()->create();

    $response = $this->postJson("/api/v1/shh/{$shh->id}/messages", [
        'content' => 'Hello',
    ]);

    $response->assertStatus(401);
});

test('list messages returns paginated', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create();

    ShhMessage::factory()->count(3)->create(['shh_id' => $shh->id]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/messages");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data',
            'meta',
        ]);
});
