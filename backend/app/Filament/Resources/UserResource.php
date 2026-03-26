<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Users';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Identity')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->disabled(),
                        Forms\Components\TextInput::make('birth_year')
                            ->disabled(),
                        Forms\Components\TextInput::make('city')
                            ->disabled(),
                        Forms\Components\TextInput::make('country_code')
                            ->disabled(),
                        Forms\Components\TextInput::make('preferred_locale')
                            ->disabled(),
                        Forms\Components\TextInput::make('timezone')
                            ->disabled(),
                    ])->columns(2),

                Forms\Components\Section::make('Status')
                    ->schema([
                        Forms\Components\Toggle::make('onboarding_completed')
                            ->disabled(),
                        Forms\Components\Toggle::make('is_premium')
                            ->disabled(),
                        Forms\Components\Toggle::make('shh_ghost_enabled')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('last_active_at')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('paused_until')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('accepted_terms_at')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('created_at')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('deleted_at')
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
                    ->tooltip(fn (User $record): string => $record->id)
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->formatStateUsing(function (?string $state): string {
                        if (! $state) {
                            return '—';
                        }

                        $parts = explode('@', $state);

                        return Str::limit($parts[0], 1, '***').'@'.$parts[1];
                    })
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('city')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('country_code')
                    ->label('Country')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('birth_year')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('shh_received_count')
                    ->label('Shh received')
                    ->counts('contacts')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->getStateUsing(function (User $record): string {
                        if ($record->deleted_at) {
                            return 'deleted';
                        }

                        if ($record->paused_until && $record->paused_until->isFuture()) {
                            return 'suspended';
                        }

                        return 'active';
                    })
                    ->colors([
                        'success' => 'active',
                        'danger' => 'deleted',
                        'warning' => 'suspended',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('country_code')
                    ->label('Country')
                    ->searchable(),

                Tables\Filters\TernaryFilter::make('onboarding_completed')
                    ->label('Onboarding done'),

                Tables\Filters\TernaryFilter::make('is_premium')
                    ->label('Premium'),

                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\Action::make('suspend_24h')
                    ->label('Suspend 24h')
                    ->icon('heroicon-o-pause-circle')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(fn (User $record) => $record->update([
                        'paused_until' => now()->addHours(24),
                    ])),

                Tables\Actions\Action::make('suspend_7d')
                    ->label('Suspend 7d')
                    ->icon('heroicon-o-pause-circle')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(fn (User $record) => $record->update([
                        'paused_until' => now()->addDays(7),
                    ])),

                Tables\Actions\Action::make('suspend_30d')
                    ->label('Suspend 30d')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(fn (User $record) => $record->update([
                        'paused_until' => now()->addDays(30),
                    ])),

                Tables\Actions\DeleteAction::make()
                    ->label('Soft delete'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'view' => Pages\ViewUser::route('/{record}'),
        ];
    }
}
