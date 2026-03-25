<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Shh;
use App\Models\ShhMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShhMessage>
 */
class ShhMessageFactory extends Factory
{
    protected $model = ShhMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shh_id' => Shh::factory(),
            'content_encrypted' => fake()->sentence(10),
            'sender_role' => fake()->randomElement(['sender', 'receiver']),
            'moderation_status' => 'passed',
        ];
    }

    /**
     * Message from sender.
     */
    public function fromSender(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender_role' => 'sender',
        ]);
    }

    /**
     * Message from receiver.
     */
    public function fromReceiver(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender_role' => 'receiver',
        ]);
    }

    /**
     * Message flagged by moderation.
     */
    public function flagged(): static
    {
        return $this->state(fn (array $attributes) => [
            'moderation_status' => 'flagged',
        ]);
    }

    /**
     * Message blocked by moderation.
     */
    public function blocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'moderation_status' => 'blocked',
        ]);
    }
}
