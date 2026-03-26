<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Filament\Widgets\ModerationQueue;
use App\Filament\Widgets\StatsOverview;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $title = 'Shh Me Dashboard';

    public function getWidgets(): array
    {
        return [
            StatsOverview::class,
            ModerationQueue::class,
        ];
    }
}
