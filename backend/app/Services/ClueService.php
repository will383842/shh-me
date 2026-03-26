<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Shh;
use App\Models\ShhClue;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClueService
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    /**
     * Layer 1: Generate a daily question via AI based on the shh day number.
     * Returns null on failure so caller can fall back to layer 2.
     */
    public function generateQuestionWithAI(Shh $shh): ?string
    {
        $dayNumber = $this->getDayNumber($shh);

        $prompt = 'You are a creative mystery game master for an anonymous messaging app called Shh Me. '
            ."Generate a single intriguing personal question for day {$dayNumber} of a 7-day mystery. "
            .'The question should help the receiver guess who the anonymous sender is, '
            .'getting progressively more revealing as days increase. '
            .'Day 1-2: very vague. Day 3-4: moderate. Day 5-7: more direct. '
            .'Return ONLY the question text, nothing else.';

        try {
            $response = Http::timeout((int) config('shhme.clue_ai_timeout_seconds', 5))
                ->withHeaders([
                    'Authorization' => 'Bearer '.config('services.openai.api_key'),
                ])
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $prompt],
                        ['role' => 'user', 'content' => "Generate a question for day {$dayNumber}."],
                    ],
                    'max_tokens' => 100,
                    'temperature' => 0.9,
                ]);

            if (! $response->successful()) {
                Log::warning('ClueService: AI question generation returned non-200', [
                    'status' => $response->status(),
                    'shh_id' => $shh->id,
                ]);

                return null;
            }

            $question = trim($response->json('choices.0.message.content', ''));

            return $question !== '' ? $question : null;
        } catch (\Throwable $e) {
            Log::warning('ClueService: AI question generation failed', [
                'error' => $e->getMessage(),
                'shh_id' => $shh->id,
            ]);

            return null;
        }
    }

    /**
     * Layer 2: Pick a random pre-written question from the DB,
     * matching level + day_range + locale, excluding already-used IDs for this shh.
     */
    public function pickFallbackQuestion(Shh $shh, string $locale = 'en'): string
    {
        $dayNumber = $this->getDayNumber($shh);
        $level = $this->getLevelForDay($dayNumber);
        $dayRange = $this->getDayRange($dayNumber);

        $usedQuestionIds = DB::table('shh_clues')
            ->where('shh_id', $shh->id)
            ->whereNotNull('question_text')
            ->pluck('question_text')
            ->toArray();

        $query = DB::table('clue_questions')
            ->where('level', $level)
            ->where('day_range', $dayRange)
            ->where('locale', $locale)
            ->where('is_active', true);

        if (! empty($usedQuestionIds)) {
            $query->whereNotIn('question_text', $usedQuestionIds);
        }

        $question = $query->inRandomOrder()->first();

        if ($question) {
            return $question->question_text;
        }

        // Fallback: any question for this locale that hasn't been used
        $question = DB::table('clue_questions')
            ->where('locale', $locale)
            ->where('is_active', true)
            ->when(! empty($usedQuestionIds), fn ($q) => $q->whereNotIn('question_text', $usedQuestionIds))
            ->inRandomOrder()
            ->first();

        return $question ? $question->question_text : 'What is something only you and this person would know?';
    }

    /**
     * Layer 1 (clue): Transform a sender's answer into a poetic/mysterious clue via AI.
     * Returns null on failure so caller can fall back to template.
     */
    public function generateClueWithAI(string $question, string $answer): ?string
    {
        $prompt = 'You are a poetic mystery writer for an anonymous messaging app. '
            ."Transform the sender's answer into a mysterious, poetic clue. "
            .'The clue should hint at the answer without revealing it directly. '
            .'Keep it under 30 words. Be evocative and enigmatic. '
            .'Return ONLY the clue text, nothing else.';

        try {
            $response = Http::timeout((int) config('shhme.clue_ai_timeout_seconds', 5))
                ->withHeaders([
                    'Authorization' => 'Bearer '.config('services.openai.api_key'),
                ])
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $prompt],
                        ['role' => 'user', 'content' => "Question: {$question}\nAnswer: {$answer}\n\nGenerate a mysterious clue."],
                    ],
                    'max_tokens' => 80,
                    'temperature' => 0.8,
                ]);

            if (! $response->successful()) {
                Log::warning('ClueService: AI clue generation returned non-200', [
                    'status' => $response->status(),
                ]);

                return null;
            }

            $clue = trim($response->json('choices.0.message.content', ''));

            return $clue !== '' ? $clue : null;
        } catch (\Throwable $e) {
            Log::warning('ClueService: AI clue generation failed', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Layer 2 (clue): Pick a random ClueTemplate for the question and replace {answer} placeholder.
     */
    public function generateClueFromTemplate(ShhClue $clue): string
    {
        $template = DB::table('clue_templates')
            ->where('question_id', function ($query) use ($clue) {
                $query->select('id')
                    ->from('clue_questions')
                    ->where('question_text', $clue->question_text)
                    ->limit(1);
            })
            ->inRandomOrder()
            ->first();

        if ($template && $clue->sender_answer) {
            return str_replace('{answer}', $clue->sender_answer, $template->template_text);
        }

        // Generic fallback templates
        $genericTemplates = [
            'A whisper carries a secret: {answer}...',
            'Between the lines, you might read: {answer}.',
            'The shadow speaks of {answer}.',
            "If you listen closely, you'll hear: {answer}.",
            'Hidden in plain sight: {answer}.',
        ];

        $chosen = $genericTemplates[array_rand($genericTemplates)];

        return str_replace('{answer}', $clue->sender_answer ?? '...', $chosen);
    }

    /**
     * Layer 3: Generate an automatic clue from the sender's profile data.
     * Uses VaultService to retrieve sender identity.
     */
    public function generateAutoClue(Shh $shh): string
    {
        $participants = $this->vaultService->getParticipantIds($shh->vault_ref);
        $senderId = $participants['senderId'] ?? null;

        if (! $senderId) {
            return 'This person exists in your world...';
        }

        $sender = User::find($senderId);

        if (! $sender) {
            return 'This person exists in your world...';
        }

        $templates = [];

        if ($sender->city) {
            $templates[] = "This person breathes the air of {$sender->city}.";
            $templates[] = "The streets of {$sender->city} know their footsteps.";
        }

        if ($sender->birth_year) {
            $age = (int) now()->format('Y') - $sender->birth_year;
            $decade = (int) floor($age / 10) * 10;
            $templates[] = "Someone in their {$decade}s carries this secret.";
            $templates[] = "Born under a star from the {$sender->birth_year}s sky.";
        }

        if ($sender->created_at) {
            $monthsAgo = (int) $sender->created_at->diffInMonths(now());
            if ($monthsAgo < 1) {
                $templates[] = 'A newcomer with something already on their mind.';
            } elseif ($monthsAgo < 6) {
                $templates[] = "They've been carrying this feeling for a few months now.";
            } else {
                $templates[] = 'This person has been watching from a distance for quite some time.';
            }
        }

        if (empty($templates)) {
            $templates = [
                'This person exists in your world...',
                'Someone is thinking about you right now.',
                'A familiar soul hides behind this message.',
            ];
        }

        return $templates[array_rand($templates)];
    }

    /**
     * Check if this is day 4 with counter-indication enabled.
     * On J4, a misleading clue is sent to create suspense/doubt.
     */
    public function isJ4CounterIndication(Shh $shh): bool
    {
        $dayNumber = $this->getDayNumber($shh);

        return $dayNumber === 4 && (bool) config('shhme.clue_j4_counter_indication', true);
    }

    /**
     * Return a random counter-indication clue for J4.
     * These clues intentionally mislead the receiver.
     */
    public function getCounterIndicationClue(): string
    {
        $templates = [
            "Ce n'est peut-être pas qui tu penses…",
            'And if you were looking in the wrong direction?',
            'The person you suspect... is probably not the one.',
            'Sometimes the obvious answer is the wrong one.',
            "Don't trust your first instinct today.",
        ];

        return $templates[array_rand($templates)];
    }

    private function getDayNumber(Shh $shh): int
    {
        return (int) $shh->created_at->diffInDays(now()) + 1;
    }

    private function getLevelForDay(int $dayNumber): string
    {
        return match (true) {
            $dayNumber <= 2 => 'easy',
            $dayNumber <= 4 => 'medium',
            default => 'hard',
        };
    }

    private function getDayRange(int $dayNumber): string
    {
        return match (true) {
            $dayNumber <= 2 => '1-2',
            $dayNumber <= 4 => '3-4',
            default => '5-7',
        };
    }
}
