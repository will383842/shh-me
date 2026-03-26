<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Models\Report;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Str;

class ModerationQueue extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Pending moderation';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Report::query()
                    ->where('status', 'pending')
                    ->orderByDesc('created_at')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->limit(8),

                Tables\Columns\TextColumn::make('reporter.email')
                    ->label('Reporter')
                    ->formatStateUsing(function (?string $state): string {
                        if (! $state) {
                            return '—';
                        }

                        $parts = explode('@', $state);

                        return Str::limit($parts[0], 1, '***').'@'.$parts[1];
                    }),

                Tables\Columns\TextColumn::make('target_type')
                    ->badge(),

                Tables\Columns\TextColumn::make('reason')
                    ->limit(30),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Reviewed')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(fn (Report $record) => $record->update(['status' => 'reviewed'])),

                Tables\Actions\Action::make('reject')
                    ->label('Action')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(fn (Report $record) => $record->update(['status' => 'actioned'])),
            ])
            ->paginated(false);
    }
}
