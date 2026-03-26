<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ClueQuestion;
use App\Models\ClueTemplate;
use Illuminate\Database\Seeder;

class ClueQuestionSeeder extends Seeder
{
    /**
     * Seed clue questions and their templates.
     *
     * Structure: 3 levels × 3 day_ranges × 2 locales = 18 combinations, 5-6 questions each.
     * Each question gets 3 templates.
     */
    public function run(): void
    {
        $questions = $this->getQuestions();

        foreach ($questions as $combo) {
            foreach ($combo['questions'] as $questionText) {
                $question = ClueQuestion::create([
                    'level' => $combo['level'],
                    'day_range' => $combo['day_range'],
                    'question_text' => $questionText,
                    'locale' => $combo['locale'],
                    'is_active' => true,
                ]);

                foreach ($combo['templates'] as $templateText) {
                    ClueTemplate::create([
                        'question_id' => $question->id,
                        'template_text' => $templateText,
                        'locale' => $combo['locale'],
                    ]);
                }
            }
        }
    }

    /**
     * @return array<int, array{level: string, day_range: string, locale: string, questions: list<string>, templates: list<string>}>
     */
    private function getQuestions(): array
    {
        return [
            // ===================================================================
            // KNOWS_IRL — English
            // ===================================================================
            [
                'level' => 'knows_irl',
                'day_range' => 'days_1_3',
                'locale' => 'en',
                'questions' => [
                    'In what context do you usually see this person?',
                    "What's the first thing you noticed about them?",
                    'Morning person or night owl?',
                    'What does their laugh sound like?',
                    'Coffee or tea?',
                    'What color would you associate with this person?',
                ],
                'templates' => [
                    "🤫 If you're looking, check near {answer}…",
                    '🤫 Here\'s a clue: {answer}',
                    '🤫 Someone whispered: {answer}…',
                ],
            ],
            [
                'level' => 'knows_irl',
                'day_range' => 'days_4_7',
                'locale' => 'en',
                'questions' => [
                    'What does this person do that makes you smile?',
                    "Describe a moment with them you'll never forget.",
                    'What would you tell them if they knew?',
                    'What song reminds you of them?',
                    "What's their hidden talent?",
                    'If you could give them one gift, what would it be?',
                ],
                'templates' => [
                    '🤫 They once said something about {answer}…',
                    '🤫 A memory surfaces: {answer}',
                    '🤫 The answer hides in plain sight: {answer}…',
                ],
            ],
            [
                'level' => 'knows_irl',
                'day_range' => 'days_5_7',
                'locale' => 'en',
                'questions' => [
                    'What do you admire most about them?',
                    'What habit of theirs do you find endearing?',
                    'How do they make a room feel when they walk in?',
                    'What would a perfect day with them look like?',
                    'What do you think they dream about?',
                ],
                'templates' => [
                    '🤫 Almost there… think about {answer}',
                    '🤫 The final clue: {answer}',
                    '🤫 One last whisper: {answer}…',
                ],
            ],

            // ===================================================================
            // CROSSED_PATHS — English
            // ===================================================================
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_1_3',
                'locale' => 'en',
                'questions' => [
                    'Where do you usually see this person?',
                    'What day of the week do you see them most?',
                    'What were they wearing last time?',
                    'Do they know you exist?',
                    'What caught your eye first?',
                    'At what time of day do your paths cross?',
                ],
                'templates' => [
                    '🤫 You might find them near {answer}…',
                    '🤫 A stranger noticed: {answer}',
                    '🤫 Paths crossed because of {answer}…',
                ],
            ],
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_4_7',
                'locale' => 'en',
                'questions' => [
                    'Have you ever made eye contact?',
                    'What do you imagine their voice sounds like?',
                    'If you could say one thing to them, what would it be?',
                    'What do you think they do for a living?',
                    'Do they seem like someone who laughs easily?',
                    'What makes them stand out in a crowd?',
                ],
                'templates' => [
                    '🤫 Between glances: {answer}…',
                    '🤫 A passing thought: {answer}',
                    '🤫 In the crowd, someone thinks: {answer}…',
                ],
            ],
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_5_7',
                'locale' => 'en',
                'questions' => [
                    'If they walked up to you right now, what would you do?',
                    'What do you wish you knew about them?',
                    'How long have you been noticing them?',
                    'What moment made you realize you wanted to know them?',
                    'Would you recognize them from their walk alone?',
                ],
                'templates' => [
                    '🤫 The mystery deepens: {answer}',
                    '🤫 So close now… {answer}',
                    '🤫 A final glimpse: {answer}…',
                ],
            ],

            // ===================================================================
            // ONLINE_ONLY — English
            // ===================================================================
            [
                'level' => 'online_only',
                'day_range' => 'days_1_3',
                'locale' => 'en',
                'questions' => [
                    'Where did you first discover this person online?',
                    'What was the first post of theirs that caught your attention?',
                    'How would you describe their online vibe in three words?',
                    'Do they post often or are they more of a lurker?',
                    'What emoji best represents them?',
                    'What topic do they seem most passionate about?',
                ],
                'templates' => [
                    '🤫 Scroll back to {answer}…',
                    '🤫 A digital breadcrumb: {answer}',
                    '🤫 Behind the screen: {answer}…',
                ],
            ],
            [
                'level' => 'online_only',
                'day_range' => 'days_4_7',
                'locale' => 'en',
                'questions' => [
                    "What's the most interesting thing they've shared?",
                    'Do you think their online persona matches who they really are?',
                    'What would your first message to them say?',
                    "What's one thing you've learned about them from their posts?",
                    'If their profile were a song, what genre would it be?',
                    'Have you ever almost sent them a message?',
                ],
                'templates' => [
                    '🤫 Between the pixels: {answer}…',
                    '🤫 A notification whispers: {answer}',
                    '🤫 Hidden in their feed: {answer}…',
                ],
            ],
            [
                'level' => 'online_only',
                'day_range' => 'days_5_7',
                'locale' => 'en',
                'questions' => [
                    'What would meeting them in real life feel like?',
                    'What do you think their voice sounds like?',
                    'If you could ask them one question face to face, what would it be?',
                    'What made you keep coming back to their profile?',
                    "What's the bravest thing you've seen them post?",
                ],
                'templates' => [
                    '🤫 From screen to soul: {answer}',
                    '🤫 The avatar reveals: {answer}…',
                    '🤫 One click away: {answer}…',
                ],
            ],

            // ===================================================================
            // KNOWS_IRL — French
            // ===================================================================
            [
                'level' => 'knows_irl',
                'day_range' => 'days_1_3',
                'locale' => 'fr',
                'questions' => [
                    'Dans quel contexte voyez-vous habituellement cette personne ?',
                    'Quelle est la première chose que vous avez remarquée chez elle ?',
                    'Plutôt du matin ou du soir ?',
                    'Comment décririez-vous son rire ?',
                    'Café ou thé ?',
                    'Quelle couleur associeriez-vous à cette personne ?',
                ],
                'templates' => [
                    '🤫 Si tu cherches, regarde du côté de {answer}…',
                    '🤫 Un indice : {answer}',
                    "🤫 Quelqu'un a murmuré : {answer}…",
                ],
            ],
            [
                'level' => 'knows_irl',
                'day_range' => 'days_4_7',
                'locale' => 'fr',
                'questions' => [
                    "Qu'est-ce que cette personne fait qui vous fait sourire ?",
                    "Décrivez un moment avec elle que vous n'oublierez jamais.",
                    'Que lui diriez-vous si elle savait ?',
                    'Quelle chanson vous rappelle cette personne ?',
                    'Quel est son talent caché ?',
                    'Si vous pouviez lui offrir un cadeau, ce serait quoi ?',
                ],
                'templates' => [
                    '🤫 Cette personne a un jour parlé de {answer}…',
                    '🤫 Un souvenir remonte : {answer}',
                    '🤫 La réponse se cache sous vos yeux : {answer}…',
                ],
            ],
            [
                'level' => 'knows_irl',
                'day_range' => 'days_5_7',
                'locale' => 'fr',
                'questions' => [
                    "Qu'admirez-vous le plus chez cette personne ?",
                    'Quelle habitude trouvez-vous attachante chez elle ?',
                    "Comment change-t-elle l'atmosphère quand elle entre dans une pièce ?",
                    'À quoi ressemblerait une journée parfaite avec elle ?',
                    'De quoi pensez-vous que cette personne rêve ?',
                ],
                'templates' => [
                    '🤫 Presque là… pense à {answer}',
                    '🤫 Le dernier indice : {answer}',
                    '🤫 Un dernier murmure : {answer}…',
                ],
            ],

            // ===================================================================
            // CROSSED_PATHS — French
            // ===================================================================
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_1_3',
                'locale' => 'fr',
                'questions' => [
                    'Où voyez-vous habituellement cette personne ?',
                    'Quel jour de la semaine la croisez-vous le plus ?',
                    'Que portait-elle la dernière fois ?',
                    'Est-ce qu\'elle sait que vous existez ?',
                    "Qu'est-ce qui a attiré votre regard en premier ?",
                    'À quelle heure vos chemins se croisent-ils ?',
                ],
                'templates' => [
                    '🤫 Tu pourrais la trouver près de {answer}…',
                    '🤫 Un inconnu a remarqué : {answer}',
                    '🤫 Les chemins se croisent grâce à {answer}…',
                ],
            ],
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_4_7',
                'locale' => 'fr',
                'questions' => [
                    'Avez-vous déjà échangé un regard ?',
                    'Comment imaginez-vous sa voix ?',
                    'Si vous pouviez lui dire une seule chose, ce serait quoi ?',
                    'Que pensez-vous que cette personne fait dans la vie ?',
                    'A-t-elle l\'air de rire facilement ?',
                    "Qu'est-ce qui la distingue dans la foule ?",
                ],
                'templates' => [
                    '🤫 Entre deux regards : {answer}…',
                    '🤫 Une pensée fugace : {answer}',
                    "🤫 Dans la foule, quelqu'un pense : {answer}…",
                ],
            ],
            [
                'level' => 'crossed_paths',
                'day_range' => 'days_5_7',
                'locale' => 'fr',
                'questions' => [
                    "Si elle s'approchait de vous maintenant, que feriez-vous ?",
                    "Qu'aimeriez-vous savoir sur elle ?",
                    'Depuis combien de temps la remarquez-vous ?',
                    'Quel moment vous a fait réaliser que vous vouliez la connaître ?',
                    'La reconnaîtriez-vous rien qu\'à sa démarche ?',
                ],
                'templates' => [
                    '🤫 Le mystère s\'épaissit : {answer}',
                    '🤫 Si proche maintenant… {answer}',
                    '🤫 Un dernier aperçu : {answer}…',
                ],
            ],

            // ===================================================================
            // ONLINE_ONLY — French
            // ===================================================================
            [
                'level' => 'online_only',
                'day_range' => 'days_1_3',
                'locale' => 'fr',
                'questions' => [
                    'Où avez-vous découvert cette personne en ligne ?',
                    'Quel post a attiré votre attention en premier ?',
                    'Comment décririez-vous son style en ligne en trois mots ?',
                    'Publie-t-elle souvent ou reste-t-elle discrète ?',
                    'Quel emoji la représente le mieux ?',
                    'Quel sujet semble la passionner le plus ?',
                ],
                'templates' => [
                    '🤫 Remonte ton fil jusqu\'à {answer}…',
                    '🤫 Un indice numérique : {answer}',
                    '🤫 Derrière l\'écran : {answer}…',
                ],
            ],
            [
                'level' => 'online_only',
                'day_range' => 'days_4_7',
                'locale' => 'fr',
                'questions' => [
                    "Quelle est la chose la plus intéressante qu'elle a partagée ?",
                    'Pensez-vous que son image en ligne reflète qui elle est vraiment ?',
                    'Que dirait votre premier message ?',
                    "Qu'avez-vous appris sur elle grâce à ses publications ?",
                    'Si son profil était une chanson, quel genre serait-ce ?',
                    'Avez-vous déjà failli lui envoyer un message ?',
                ],
                'templates' => [
                    '🤫 Entre les pixels : {answer}…',
                    '🤫 Une notification murmure : {answer}',
                    '🤫 Caché dans son fil : {answer}…',
                ],
            ],
            [
                'level' => 'online_only',
                'day_range' => 'days_5_7',
                'locale' => 'fr',
                'questions' => [
                    'Que ressentirait une rencontre en vrai ?',
                    'Comment imaginez-vous sa voix ?',
                    'Si vous pouviez lui poser une question en face, ce serait quoi ?',
                    "Qu'est-ce qui vous fait revenir sur son profil ?",
                    "Quel est le post le plus courageux que vous avez vu d'elle ?",
                ],
                'templates' => [
                    '🤫 De l\'écran au cœur : {answer}',
                    '🤫 L\'avatar révèle : {answer}…',
                    '🤫 À un clic de distance : {answer}…',
                ],
            ],
        ];
    }
}
