<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'apple_id' => fake()->optional()->uuid(),
            'google_id' => fake()->optional()->uuid(),
            'email' => fake()->unique()->safeEmail(),
            'birth_year' => fake()->numberBetween(1970, 2006),
            'city' => fake()->city(),
            'country_code' => fake()->countryCode(),
            'preferred_locale' => 'en',
            'timezone' => 'UTC',
            'device_token' => null,
            'onboarding_completed' => true,
            'referrer_code' => Str::random(10),
            'total_shh_received' => 0,
            'total_reveals' => 0,
            'shh_ghost_enabled' => false,
        ];
    }

    /**
     * User with Apple auth.
     */
    public function withApple(): static
    {
        return $this->state(fn (array $attributes) => [
            'apple_id' => fake()->uuid(),
            'google_id' => null,
        ]);
    }

    /**
     * User with Google auth.
     */
    public function withGoogle(): static
    {
        return $this->state(fn (array $attributes) => [
            'apple_id' => null,
            'google_id' => fake()->uuid(),
        ]);
    }

    /**
     * User with onboarding not completed.
     */
    public function onboardingIncomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'onboarding_completed' => false,
        ]);
    }

    /**
     * Ghost mode enabled.
     */
    public function ghost(): static
    {
        return $this->state(fn (array $attributes) => [
            'shh_ghost_enabled' => true,
        ]);
    }
}
