<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class AudioFilterService
{
    private string $ffmpegBinary;

    public function __construct()
    {
        $this->ffmpegBinary = (string) config('shhme.ffmpeg_binary', 'ffmpeg');
    }

    /**
     * Apply an audio voice filter via FFmpeg.
     *
     * @return string The output file path of the filtered audio.
     *
     * @throws \RuntimeException If FFmpeg fails or the voice config is missing.
     */
    public function applyFilter(string $inputPath, string $voiceName = 'le_souffle'): string
    {
        $voiceConfig = config("shhme.audio_voices.{$voiceName}");

        if (! $voiceConfig || empty($voiceConfig['filter'])) {
            throw new \RuntimeException("Audio voice '{$voiceName}' not found in config.");
        }

        $filter = $voiceConfig['filter'];
        $outputPath = $this->generateOutputPath($inputPath, "filtered_{$voiceName}");

        $command = sprintf(
            '%s -y -i %s -af %s %s',
            escapeshellarg($this->ffmpegBinary),
            escapeshellarg($inputPath),
            escapeshellarg($filter),
            escapeshellarg($outputPath)
        );

        $result = Process::run($command);

        if (! $result->successful()) {
            Log::error('AudioFilterService: FFmpeg filter failed', [
                'command' => $command,
                'error' => $result->errorOutput(),
                'exit_code' => $result->exitCode(),
            ]);

            throw new \RuntimeException('FFmpeg audio filter failed: '.$result->errorOutput());
        }

        return $outputPath;
    }

    /**
     * Generate a teaser by cutting the first N seconds of a filtered audio file.
     *
     * @return string The output file path of the teaser.
     *
     * @throws \RuntimeException If FFmpeg fails.
     */
    public function generateTeaser(string $filteredPath, int $seconds = 3): string
    {
        $outputPath = $this->generateOutputPath($filteredPath, 'teaser');

        $command = sprintf(
            '%s -y -i %s -t %d -c copy %s',
            escapeshellarg($this->ffmpegBinary),
            escapeshellarg($filteredPath),
            $seconds,
            escapeshellarg($outputPath)
        );

        $result = Process::run($command);

        if (! $result->successful()) {
            Log::error('AudioFilterService: FFmpeg teaser generation failed', [
                'command' => $command,
                'error' => $result->errorOutput(),
                'exit_code' => $result->exitCode(),
            ]);

            throw new \RuntimeException('FFmpeg teaser generation failed: '.$result->errorOutput());
        }

        return $outputPath;
    }

    /**
     * Get the duration of an audio file in seconds via ffprobe.
     *
     * @throws \RuntimeException If ffprobe fails.
     */
    public function getDuration(string $filePath): int
    {
        $ffprobeBinary = str_replace('ffmpeg', 'ffprobe', $this->ffmpegBinary);

        $command = sprintf(
            '%s -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 %s',
            escapeshellarg($ffprobeBinary),
            escapeshellarg($filePath)
        );

        $result = Process::run($command);

        if (! $result->successful()) {
            Log::error('AudioFilterService: ffprobe duration check failed', [
                'command' => $command,
                'error' => $result->errorOutput(),
                'exit_code' => $result->exitCode(),
            ]);

            throw new \RuntimeException('ffprobe duration check failed: '.$result->errorOutput());
        }

        $duration = trim($result->output());

        return (int) ceil((float) $duration);
    }

    private function generateOutputPath(string $inputPath, string $suffix): string
    {
        $extension = pathinfo($inputPath, PATHINFO_EXTENSION) ?: 'webm';
        $basename = pathinfo($inputPath, PATHINFO_FILENAME);

        return sys_get_temp_dir().'/'.$basename.'_'.$suffix.'_'.Str::random(8).'.'.$extension;
    }
}
