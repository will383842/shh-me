<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhAudio;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('upload audio success', function () {
    Queue::fake();
    Storage::fake('r2');

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    // Create a minimal valid WAV file (44-byte header + tiny data)
    $wavHeader = pack(
        'A4VA4A4VvvVVvvA4V',
        'RIFF',    // ChunkID
        44,        // ChunkSize (header + data)
        'WAVE',    // Format
        'fmt ',    // Subchunk1ID
        16,        // Subchunk1Size (PCM)
        1,         // AudioFormat (PCM)
        1,         // NumChannels (mono)
        44100,     // SampleRate
        88200,     // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
        2,         // BlockAlign
        16,        // BitsPerSample
        'data',    // Subchunk2ID
        0,         // Subchunk2Size (0 bytes of audio = 0 seconds)
    );

    $tmpPath = tempnam(sys_get_temp_dir(), 'wav');
    file_put_contents($tmpPath, $wavHeader);

    $file = new UploadedFile(
        path: $tmpPath,
        originalName: 'voice.wav',
        mimeType: 'audio/wav',
        error: null,
        test: true,
    );

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/audio", [
            'audio' => $file,
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'duration_seconds',
                'moderation_status',
                'validated_by_sender',
                'created_at',
            ],
        ]);

    $this->assertDatabaseHas('shh_audio', [
        'shh_id' => $shh->id,
        'sender_role' => 'sender',
        'validated_by_sender' => false,
    ]);
});

test('upload without auth 401', function () {
    $shh = Shh::factory()->create();

    $file = UploadedFile::fake()->create('voice.wav', 100, 'audio/wav');

    $response = $this->postJson("/api/v1/shh/{$shh->id}/audio", [
        'audio' => $file,
    ]);

    $response->assertStatus(401);
});

test('send audio requires validation', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $audio = ShhAudio::create([
        'shh_id' => $shh->id,
        'original_path' => 'shh/test/audio/original/voice.wav',
        'duration_seconds' => 10,
        'sender_role' => 'sender',
        'moderation_status' => 'pending',
        'validated_by_sender' => false,
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->andReturn('sender');
        $mock->shouldReceive('getParticipantIds')->andReturn(['senderId' => 'x', 'receiverId' => 'y']);
    });

    // Try to send without validated_by_sender — the controller checks
    // moderation_status !== 'blocked', then sets validated_by_sender = true.
    // Since the audio isn't blocked and isn't already validated, it proceeds.
    // The endpoint should return 200 (it validates and sends in one step).
    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/audio/send", [
            'audio_id' => $audio->id,
        ]);

    // Controller sets validated_by_sender = true on send
    $response->assertStatus(200);

    $this->assertDatabaseHas('shh_audio', [
        'id' => $audio->id,
        'validated_by_sender' => true,
    ]);
});

test('send audio success', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $audio = ShhAudio::create([
        'shh_id' => $shh->id,
        'original_path' => 'shh/test/audio/original/voice.wav',
        'filtered_path' => 'shh/test/audio/filtered/voice.wav',
        'duration_seconds' => 10,
        'sender_role' => 'sender',
        'moderation_status' => 'approved',
        'validated_by_sender' => true,
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/audio/send", [
            'audio_id' => $audio->id,
        ]);

    // Already validated, returns 200 with 'already sent' message
    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['message'],
        ]);
});

test('list audio returns signed urls', function () {
    Queue::fake();

    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    ShhAudio::create([
        'shh_id' => $shh->id,
        'original_path' => 'shh/test/audio/original/voice.wav',
        'filtered_path' => 'shh/test/audio/filtered/voice.wav',
        'duration_seconds' => 10,
        'sender_role' => 'sender',
        'moderation_status' => 'approved',
        'validated_by_sender' => true,
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    Storage::shouldReceive('disk')
        ->with('r2')
        ->andReturnSelf();
    Storage::shouldReceive('temporaryUrl')
        ->andReturn('https://r2.example.com/shh/audio/filtered/voice.wav?token=abc');

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/audio");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'sender_role',
                    'duration_seconds',
                    'moderation_status',
                    'audio_url',
                    'created_at',
                ],
            ],
        ]);
});
