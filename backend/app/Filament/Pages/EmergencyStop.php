<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Services\EmergencyStopService;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class EmergencyStop extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-shield-exclamation';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 20;

    protected static ?string $title = 'Emergency Stop';

    protected static string $view = 'filament.pages.emergency-stop';

    /**
     * @var array<string, bool>
     */
    public array $statuses = [];

    private const FEATURES = [
        'audio' => ['label' => 'STOP Audio', 'description' => 'Disable all audio routes', 'icon' => 'heroicon-o-microphone'],
        'reveal' => ['label' => 'STOP Reveal', 'description' => 'Disable all connect/reveal routes', 'icon' => 'heroicon-o-eye-slash'],
        'mur' => ['label' => 'STOP Mur', 'description' => 'Disable wall feature (future MVP2)', 'icon' => 'heroicon-o-rectangle-stack'],
        'radar' => ['label' => 'STOP Radar', 'description' => 'Disable radar feature (future)', 'icon' => 'heroicon-o-signal'],
        'all' => ['label' => 'STOP ALL', 'description' => 'Kill switch — disable entire API', 'icon' => 'heroicon-o-power'],
    ];

    public function mount(): void
    {
        $this->refreshStatuses();
    }

    public function refreshStatuses(): void
    {
        $service = app(EmergencyStopService::class);
        $this->statuses = $service->getStatus();
    }

    public function toggle(string $key): void
    {
        $service = app(EmergencyStopService::class);
        $newState = $service->toggle($key);

        $this->refreshStatuses();

        $label = self::FEATURES[$key]['label'] ?? $key;

        Notification::make()
            ->title($label.($newState ? ' ACTIVATED' : ' deactivated'))
            ->body($newState ? 'Feature is now STOPPED.' : 'Feature is now running.')
            ->color($newState ? 'danger' : 'success')
            ->send();
    }

    /**
     * @return array<string, array{label: string, description: string, icon: string}>
     */
    public static function getFeatures(): array
    {
        return self::FEATURES;
    }
}
