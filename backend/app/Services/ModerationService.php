<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ModerationService
{
    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = (string) config('services.openai.api_key', '');
    }

    public function moderateText(string $content): string
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ])
                ->post('https://api.openai.com/v1/moderations', [
                    'input' => $content,
                ]);

            if (! $response->successful()) {
                Log::warning('OpenAI Moderation API returned non-200', [
                    'status' => $response->status(),
                ]);

                return 'review';
            }

            $result = $response->json('results.0');

            if (! $result) {
                return 'review';
            }

            if ($result['flagged'] === true) {
                $categories = $result['categories'] ?? [];
                $hardBlock = ($categories['sexual/minors'] ?? false)
                    || ($categories['violence/graphic'] ?? false)
                    || ($categories['self-harm'] ?? false);

                return $hardBlock ? 'blocked' : 'review';
            }

            return 'passed';
        } catch (\Throwable $e) {
            Log::warning('OpenAI Moderation API failed', ['error' => $e->getMessage()]);

            return 'review';
        }
    }

    public function moderatePhoto(string $imagePath): string
    {
        try {
            $imageUrl = filter_var($imagePath, FILTER_VALIDATE_URL)
                ? $imagePath
                : 'data:image/jpeg;base64,'.base64_encode(file_get_contents($imagePath));

            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                ])
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a content moderation assistant. Analyze the image for nudity, sexual content, violence, or inappropriate content. Respond with ONLY one word: "passed", "blocked", or "review".',
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'image_url',
                                    'image_url' => ['url' => $imageUrl],
                                ],
                                [
                                    'type' => 'text',
                                    'text' => 'Is this image appropriate for a dating/social app? Respond with only: passed, blocked, or review.',
                                ],
                            ],
                        ],
                    ],
                    'max_tokens' => 10,
                ]);

            if (! $response->successful()) {
                Log::warning('GPT-4 Vision moderation returned non-200', [
                    'status' => $response->status(),
                ]);

                return 'review';
            }

            $verdict = strtolower(trim($response->json('choices.0.message.content', 'review')));

            return in_array($verdict, ['passed', 'blocked', 'review']) ? $verdict : 'review';
        } catch (\Throwable $e) {
            Log::warning('GPT-4 Vision moderation failed', ['error' => $e->getMessage()]);

            return 'review';
        }
    }
}
