<?php

declare(strict_types=1);

use App\Services\BpmService;

test('generates bpm in range', function () {
    $service = new BpmService;
    $bpm = $service->generate();

    expect($bpm)->toBeGreaterThanOrEqual(72)
        ->toBeLessThanOrEqual(110);
});

test('generates contextual bpm morning', function () {
    $service = new BpmService;
    $bpm = $service->generate(8); // 8h = morning range

    // Morning range is 72-80 with +/- 5 variation, clamped to [72, 110]
    expect($bpm)->toBeGreaterThanOrEqual(67) // 72 - 5
        ->toBeLessThanOrEqual(110);

    // More specifically, should be within reasonable morning bounds
    expect($bpm)->toBeGreaterThanOrEqual(72)
        ->toBeLessThanOrEqual(85); // 80 + 5
});

test('never same twice', function () {
    $service = new BpmService;
    $bpms = [];

    for ($i = 0; $i < 10; $i++) {
        $bpms[] = $service->generate();
    }

    $uniqueValues = array_unique($bpms);

    expect(count($uniqueValues))->toBeGreaterThanOrEqual(2);
});
