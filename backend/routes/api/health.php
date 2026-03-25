<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

Route::get('health', function () {
    $services = [];

    // PostgreSQL main
    try {
        DB::connection('pgsql')->getPdo();
        $services['database'] = ['status' => 'up', 'driver' => 'pgsql'];
    } catch (Throwable $e) {
        $services['database'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    // PostgreSQL vault
    try {
        DB::connection('vault')->getPdo();
        $services['vault'] = ['status' => 'up', 'driver' => 'pgsql'];
    } catch (Throwable $e) {
        $services['vault'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    // Redis cache (6379)
    try {
        Redis::connection('cache')->ping();
        $services['redis_cache'] = ['status' => 'up', 'port' => 6379];
    } catch (Throwable $e) {
        $services['redis_cache'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    // Redis persistent (6380)
    try {
        Redis::connection('persistent')->ping();
        $services['redis_persistent'] = ['status' => 'up', 'port' => 6380];
    } catch (Throwable $e) {
        $services['redis_persistent'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    // FFmpeg
    $ffmpegBinary = config('shhme.ffmpeg_binary', 'ffmpeg');
    $ffmpegOutput = shell_exec($ffmpegBinary.' -version 2>&1');
    $services['ffmpeg'] = [
        'status' => $ffmpegOutput && str_contains($ffmpegOutput, 'ffmpeg version') ? 'up' : 'down',
        'version' => $ffmpegOutput ? trim(explode("\n", $ffmpegOutput)[0]) : null,
    ];

    // R2 public bucket
    try {
        $services['r2_public'] = [
            'status' => config('filesystems.disks.r2-public.driver') === 's3' ? 'configured' : 'misconfigured',
            'bucket' => config('filesystems.disks.r2-public.bucket'),
        ];
    } catch (Throwable $e) {
        $services['r2_public'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    // R2 private bucket
    try {
        $services['r2_private'] = [
            'status' => config('filesystems.disks.r2-private.driver') === 's3' ? 'configured' : 'misconfigured',
            'bucket' => config('filesystems.disks.r2-private.bucket'),
        ];
    } catch (Throwable $e) {
        $services['r2_private'] = ['status' => 'down', 'error' => $e->getMessage()];
    }

    $allUp = collect($services)->every(fn ($s) => in_array($s['status'], ['up', 'configured']));

    return response()->json([
        'status' => $allUp ? 'healthy' : 'degraded',
        'timestamp' => now()->toISOString(),
        'services' => $services,
    ], $allUp ? 200 : 503);
})->name('health');
