<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdminConfig;
use Illuminate\Database\Seeder;

class AdminConfigSeeder extends Seeder
{
    /**
     * Seed default admin configuration values.
     */
    public function run(): void
    {
        $configs = [
            [
                'key' => 'max_shh_per_day',
                'value' => 15,
                'description' => 'Maximum number of shh a user can send per day',
            ],
            [
                'key' => 'max_push_per_day',
                'value' => 4,
                'description' => 'Maximum number of push notifications per user per day',
            ],
            [
                'key' => 'audio_filter_enabled',
                'value' => true,
                'description' => 'Enable audio voice filter on shh messages',
            ],
            [
                'key' => 'ghost_push_enabled',
                'value' => true,
                'description' => 'Enable ghost push notifications for anonymous senders',
            ],
            [
                'key' => 'moderation_auto_block_threshold',
                'value' => 0.7,
                'description' => 'AI moderation confidence threshold for auto-blocking content',
            ],
        ];

        foreach ($configs as $config) {
            AdminConfig::updateOrCreate(
                ['key' => $config['key']],
                [
                    'value' => $config['value'],
                    'description' => $config['description'],
                ],
            );
        }
    }
}
