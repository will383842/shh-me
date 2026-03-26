<?php

declare(strict_types=1);

namespace App\Filament\Resources\AdminConfigResource\Pages;

use App\Filament\Resources\AdminConfigResource;
use Filament\Resources\Pages\EditRecord;

class EditAdminConfig extends EditRecord
{
    protected static string $resource = AdminConfigResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (isset($data['value_json'])) {
            $data['value'] = json_decode($data['value_json'], true);
            unset($data['value_json']);
        }

        $data['updated_by'] = auth()->id();

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [];
    }
}
