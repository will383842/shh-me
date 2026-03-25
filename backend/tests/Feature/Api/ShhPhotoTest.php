<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('get photo returns url', function () {
    Storage::fake('r2');

    $user = User::factory()->create();
    $shh = Shh::factory()->withPhoto()->create();
    $photo = ShhPhoto::factory()->create(['shh_id' => $shh->id]);

    // Mock the Storage disk to return a temporary URL
    Storage::shouldReceive('disk')
        ->with('r2')
        ->andReturnSelf();
    Storage::shouldReceive('temporaryUrl')
        ->andReturn('https://r2.example.com/shh/photo.webp?token=abc');

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/photo");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'blur_level',
                'url',
                'created_at',
            ],
        ]);
});

test('get photo without auth 401', function () {
    $shh = Shh::factory()->withPhoto()->create();

    $response = $this->getJson("/api/v1/shh/{$shh->id}/photo");

    $response->assertStatus(401);
});
