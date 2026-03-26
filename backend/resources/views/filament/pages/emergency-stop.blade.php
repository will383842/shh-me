<x-filament-panels::page>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @foreach(\App\Filament\Pages\EmergencyStop::getFeatures() as $key => $feature)
            <div class="relative rounded-xl border p-6 shadow-sm {{ ($statuses[$key] ?? false) ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20' }}">
                <div class="flex items-center gap-3 mb-3">
                    <x-filament::icon
                        :icon="$feature['icon']"
                        class="h-8 w-8 {{ ($statuses[$key] ?? false) ? 'text-red-600' : 'text-green-600' }}"
                    />
                    <div>
                        <h3 class="text-lg font-bold {{ ($statuses[$key] ?? false) ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400' }}">
                            {{ $feature['label'] }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ $feature['description'] }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center justify-between mt-4">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium {{ ($statuses[$key] ?? false) ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' }}">
                        <span class="h-2 w-2 rounded-full {{ ($statuses[$key] ?? false) ? 'bg-red-500' : 'bg-green-500' }}"></span>
                        {{ ($statuses[$key] ?? false) ? 'STOPPED' : 'Running' }}
                    </span>

                    <x-filament::button
                        wire:click="toggle('{{ $key }}')"
                        :color="($statuses[$key] ?? false) ? 'success' : 'danger'"
                        size="sm"
                    >
                        {{ ($statuses[$key] ?? false) ? 'Reactivate' : 'Stop' }}
                    </x-filament::button>
                </div>
            </div>
        @endforeach
    </div>
</x-filament-panels::page>
