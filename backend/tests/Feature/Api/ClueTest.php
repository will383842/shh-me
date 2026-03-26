<?php

declare(strict_types=1);

use App\Models\Shh;
use App\Models\ShhClue;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('list clues for receiver', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    // Create delivered clues
    ShhClue::create([
        'shh_id' => $shh->id,
        'day_number' => 1,
        'question_text' => 'What color are their eyes?',
        'sender_answer' => 'Blue',
        'clue_text' => 'Eyes like the ocean...',
        'clue_source' => 'ai',
        'question_sent_at' => now()->subDay(),
        'answer_received_at' => now()->subDay(),
        'clue_delivered_at' => now()->subHours(12),
    ]);

    ShhClue::create([
        'shh_id' => $shh->id,
        'day_number' => 2,
        'question_text' => 'Coffee or tea?',
        'sender_answer' => 'Coffee',
        'clue_text' => 'Fueled by dark roast...',
        'clue_source' => 'template',
        'question_sent_at' => now()->subHours(6),
        'answer_received_at' => now()->subHours(5),
        'clue_delivered_at' => now()->subHours(2),
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('receiver');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/clues");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'day_number',
                    'clue_text',
                    'clue_source',
                    'clue_delivered_at',
                ],
            ],
        ])
        ->assertJsonCount(2, 'data');
});

test('today question for sender', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    // Create a pending question (sent but not answered)
    ShhClue::create([
        'shh_id' => $shh->id,
        'day_number' => 1,
        'question_text' => 'Morning person or night owl?',
        'question_sent_at' => now()->subHours(2),
        'answer_received_at' => null,
        'clue_delivered_at' => null,
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/shh/{$shh->id}/clues/question");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'day_number',
                'question_text',
                'question_sent_at',
            ],
        ])
        ->assertJsonPath('data.question_text', 'Morning person or night owl?');
});

test('answer question success', function () {
    $user = User::factory()->create();
    $shh = Shh::factory()->create(['status' => 'active']);

    $clue = ShhClue::create([
        'shh_id' => $shh->id,
        'day_number' => 1,
        'question_text' => 'Coffee or tea?',
        'question_sent_at' => now()->subHours(2),
        'answer_received_at' => null,
        'clue_delivered_at' => null,
    ]);

    $this->mock(ShhVaultService::class, function ($mock) {
        $mock->shouldReceive('getRole')->once()->andReturn('sender');
    });

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/shh/{$shh->id}/clues/answer", [
            'clue_id' => $clue->id,
            'answer' => 'Definitely coffee, black no sugar',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['message'],
        ]);

    $this->assertDatabaseHas('shh_clues', [
        'id' => $clue->id,
        'sender_answer' => 'Definitely coffee, black no sugar',
    ]);

    // answer_received_at should be set
    $clue->refresh();
    expect($clue->answer_received_at)->not->toBeNull();
});

test('clues without auth 401', function () {
    $shh = Shh::factory()->create();

    $response = $this->getJson("/api/v1/shh/{$shh->id}/clues");

    $response->assertStatus(401);
});
