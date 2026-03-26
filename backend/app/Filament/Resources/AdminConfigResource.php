<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\AdminConfigResource\Pages;
use App\Models\AdminConfig;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class AdminConfigResource extends Resource
{
    protected static ?string $model = AdminConfig::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 10;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Configuration')
                    ->schema([
                        Forms\Components\TextInput::make('key')
                            ->disabled()
                            ->columnSpanFull(),

                        Forms\Components\Textarea::make('value_json')
                            ->label('Value (JSON)')
                            ->formatStateUsing(fn (AdminConfig $record): string => json_encode($record->value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))
                            ->dehydrateStateUsing(fn (string $state): array => json_decode($state, true))
                            ->afterStateUpdated(function (Forms\Set $set, string $state): void {
                                // Validate JSON
                                json_decode($state);
                            })
                            ->rows(10)
                            ->columnSpanFull(),

                        Forms\Components\Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('value')
                    ->formatStateUsing(function (mixed $state): string {
                        $json = json_encode($state, JSON_UNESCAPED_UNICODE);

                        return Str::limit($json, 60);
                    })
                    ->tooltip(fn (AdminConfig $record): string => json_encode($record->value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)),

                Tables\Columns\TextColumn::make('description')
                    ->limit(40)
                    ->toggleable(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime('Y-m-d H:i')
                    ->sortable(),
            ])
            ->defaultSort('key')
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListAdminConfigs::route('/'),
            'edit' => Pages\EditAdminConfig::route('/{record}/edit'),
        ];
    }
}
