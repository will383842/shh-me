<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ReportResource\Pages;
use App\Models\Report;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';

    protected static ?string $navigationGroup = 'Moderation';

    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) Report::where('status', 'pending')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        $count = Report::where('status', 'pending')->count();

        return $count > 0 ? 'danger' : 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Report details')
                    ->schema([
                        Forms\Components\TextInput::make('id')
                            ->label('Report ID')
                            ->disabled(),
                        Forms\Components\TextInput::make('reporter_id')
                            ->label('Reporter ID')
                            ->disabled(),
                        Forms\Components\TextInput::make('target_type')
                            ->disabled(),
                        Forms\Components\TextInput::make('target_id')
                            ->disabled(),
                        Forms\Components\Textarea::make('reason')
                            ->disabled()
                            ->columnSpanFull(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'reviewed' => 'Reviewed',
                                'actioned' => 'Actioned',
                            ])
                            ->disabled(),
                        Forms\Components\Textarea::make('admin_notes')
                            ->disabled()
                            ->columnSpanFull(),
                        Forms\Components\DateTimePicker::make('created_at')
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->limit(8)
                    ->tooltip(fn (Report $record): string => $record->id)
                    ->sortable(),

                Tables\Columns\TextColumn::make('reporter.email')
                    ->label('Reporter')
                    ->formatStateUsing(function (?string $state): string {
                        if (! $state) {
                            return '—';
                        }

                        $parts = explode('@', $state);

                        return Str::limit($parts[0], 1, '***').'@'.$parts[1];
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('target_type')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('reason')
                    ->limit(40)
                    ->tooltip(fn (Report $record): string => $record->reason ?? ''),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'reviewed',
                        'success' => 'actioned',
                    ])
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'reviewed' => 'Reviewed',
                        'actioned' => 'Actioned',
                    ]),

                Tables\Filters\SelectFilter::make('target_type')
                    ->options([
                        'shh' => 'Shh',
                        'message' => 'Message',
                        'user' => 'User',
                        'audio' => 'Audio',
                        'photo' => 'Photo',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\Action::make('mark_reviewed')
                    ->label('Reviewed')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Admin notes')
                            ->placeholder('Optional notes...'),
                    ])
                    ->action(function (Report $record, array $data): void {
                        $record->update([
                            'status' => 'reviewed',
                            'admin_notes' => $data['admin_notes'] ?? $record->admin_notes,
                        ]);
                    })
                    ->visible(fn (Report $record): bool => $record->status === 'pending'),

                Tables\Actions\Action::make('mark_actioned')
                    ->label('Actioned')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Admin notes')
                            ->placeholder('Describe action taken...'),
                    ])
                    ->action(function (Report $record, array $data): void {
                        $record->update([
                            'status' => 'actioned',
                            'admin_notes' => $data['admin_notes'] ?? $record->admin_notes,
                        ]);
                    })
                    ->visible(fn (Report $record): bool => in_array($record->status, ['pending', 'reviewed'])),

                Tables\Actions\Action::make('suspend_reporter')
                    ->label('Suspend reporter 24h')
                    ->icon('heroicon-o-pause-circle')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (Report $record): void {
                        $record->reporter?->update([
                            'paused_until' => now()->addHours(24),
                        ]);
                    }),

                Tables\Actions\Action::make('suspend_target')
                    ->label('Suspend target 24h')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (Report $record): bool => $record->target_type === 'user')
                    ->action(function (Report $record): void {
                        $target = User::find($record->target_id);
                        $target?->update([
                            'paused_until' => now()->addHours(24),
                        ]);
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReports::route('/'),
            'view' => Pages\ViewReport::route('/{record}'),
        ];
    }
}
