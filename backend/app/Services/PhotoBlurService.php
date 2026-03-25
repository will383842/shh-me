<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class PhotoBlurService
{
    private const MAX_DIMENSION = 1080;

    private const WEBP_QUALITY = 80;

    private const BLUR_LEVELS = [40, 30, 15, 5, 0];

    private const BLUR_ITERATIONS = [
        40 => 80,
        30 => 60,
        15 => 30,
        5 => 10,
        0 => 0,
    ];

    public function generateBlurLevels(string $originalPath, string $shhId): array
    {
        $sourceImage = imagecreatefromstring(file_get_contents($originalPath));

        if ($sourceImage === false) {
            throw new \RuntimeException('Failed to create image from source');
        }

        $origWidth = imagesx($sourceImage);
        $origHeight = imagesy($sourceImage);

        if ($origWidth > self::MAX_DIMENSION || $origHeight > self::MAX_DIMENSION) {
            $ratio = min(self::MAX_DIMENSION / $origWidth, self::MAX_DIMENSION / $origHeight);
            $newWidth = (int) round($origWidth * $ratio);
            $newHeight = (int) round($origHeight * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($resized, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($sourceImage);
            $sourceImage = $resized;
        }

        $paths = [];

        foreach (self::BLUR_LEVELS as $index => $level) {
            $copy = imagecreatetruecolor(imagesx($sourceImage), imagesy($sourceImage));
            imagecopy($copy, $sourceImage, 0, 0, 0, 0, imagesx($sourceImage), imagesy($sourceImage));

            $iterations = self::BLUR_ITERATIONS[$level];
            for ($i = 0; $i < $iterations; $i++) {
                imagefilter($copy, IMG_FILTER_GAUSSIAN_BLUR);
            }

            $tempPath = tempnam(sys_get_temp_dir(), 'blur_').'.webp';
            imagewebp($copy, $tempPath, self::WEBP_QUALITY);
            imagedestroy($copy);

            $r2Path = "shh/{$shhId}/blur_{$level}.webp";
            Storage::disk('r2')->put($r2Path, file_get_contents($tempPath));
            unlink($tempPath);

            $paths[] = $r2Path;
        }

        imagedestroy($sourceImage);

        return $paths;
    }

    public function getBlurLevelForExchangeCount(int $exchangeCount): int
    {
        return match (true) {
            $exchangeCount <= 0 => 40,
            $exchangeCount === 1 => 30,
            $exchangeCount === 2 => 15,
            $exchangeCount === 3 => 5,
            default => 0,
        };
    }
}
