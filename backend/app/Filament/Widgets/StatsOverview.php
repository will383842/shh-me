<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Models\Report;
use App\Models\Shh;
use App\Models\ShhConnect;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $today = now()->startOfDay();

        return [
            Stat::make('Active users today', User::where('last_active_at', '>=', $today)->count())
                ->icon('heroicon-o-users')
                ->color('primary'),

            Stat::make('Shh sent today', Shh::where('created_at', '>=', $today)->count())
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('success'),

            Stat::make('Reveals today', ShhConnect::where('created_at', '>=', $today)->where('status', 'connected')->count())
                ->icon('heroicon-o-eye')
                ->color('info'),

            Stat::make('Pending moderation', Report::where('status', 'pending')->count())
                ->icon('heroicon-o-flag')
                ->color('danger'),

            Stat::make('Active shh', Shh::where('status', 'active')->count())
                ->icon('heroicon-o-heart')
                ->color('warning'),
        ];
    }
}
