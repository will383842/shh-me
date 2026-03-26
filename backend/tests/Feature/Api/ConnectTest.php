<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhConnect;
use App\Models\User;
use App\Services\ConnectService;
use App\Services\ShhVaultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('request connect success', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $this->mock(ConnectService::class, function ($mock) {
        $mock->shouldReceive('requestConnect')
            ->once()
            ->andReturn(new ShhConnect([
                'status' => 'pending',
                'sender_connected_at' => now(),
                'sender_phone' => '+33612345678',
            ]));
    });

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/connect", [
            'phone' => '+33612345678',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'status',
                'message',
            ],
        ]);
});

test('cancel connect within 5s', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $this->mock(ConnectService::class, function ($mock) {
        $mock->shouldReceive('cancelConnect')
            ->once()
            ->andReturn(true);
    });

    $response = $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/shh/{$shh->id}/connect");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['message'],
        ]);
});

test('cancel connect after 5s 422', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $this->mock(ConnectService::class, function ($mock) {
        $mock->shouldReceive('cancelConnect')
            ->once()
            ->andReturn(false);
    });

    $response = $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/shh/{$shh->id}/connect");

    $response->assertStatus(422)
        ->assertJsonPath('error.code', 'TOO_LATE');
});

test('status polling', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/connect/status");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'status',
                'sender_connected',
                'receiver_connected',
                'mutual',
            ],
        ])
        ->assertJsonPath('data.status', 'none');
});

test('connect without auth 401', function () {
    $shh = Shh::factory()->create();

    $response = $this->postJson("/api/v1/shh/{$shh->id}/connect", [
        'phone' => '+33612345678',
    ]);

    $response->assertStatus(401);
});
