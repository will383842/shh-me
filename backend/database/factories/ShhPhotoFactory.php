<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Shh;
use App\Models\ShhPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ShhPhoto>
 */
class ShhPhotoFactory extends Factory
{
    protected $model = ShhPhoto::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $baseDir = 'shh/'.Str::ulid();

        return [
            'shh_id' => Shh::factory(),
            'original_path' => $baseDir.'/original.webp',
            'blur_paths' => [
                $baseDir.'/blur_1.webp',
                $baseDir.'/blur_2.webp',
                $baseDir.'/blur_3.webp',
                $baseDir.'/blur_4.webp',
                $baseDir.'/blur_5.webp',
            ],
            'blur_levels_generated' => true,
        ];
    }

    /**
     * Photo with blur not yet generated.
     */
    public function blurPending(): static
    {
        return $this->state(fn (array $attributes) => [
            'blur_paths' => [],
            'blur_levels_generated' => false,
        ]);
    }
}
