<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Shh;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Shh>
 */
class ShhFactory extends Factory
{
    protected $model = Shh::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vault_ref' => Str::ulid(),
            'status' => 'active',
            'bpm_symbolic' => fake()->numberBetween(72, 110),
            'bpm_hour' => fake()->numberBetween(0, 23),
            'exchange_count' => 0,
            'audio_unlocked' => false,
            'has_photo' => false,
            'sender_first_word' => fake()->optional()->word(),
            'expires_at' => now()->addHours(48),
        ];
    }

    /**
     * Expired shh.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'expires_at' => now()->subHour(),
        ]);
    }

    /**
     * Pending shh.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Shh with photo.
     */
    public function withPhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_photo' => true,
        ]);
    }

    /**
     * Shh with audio unlocked.
     */
    public function audioUnlocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'audio_unlocked' => true,
        ]);
    }
}
