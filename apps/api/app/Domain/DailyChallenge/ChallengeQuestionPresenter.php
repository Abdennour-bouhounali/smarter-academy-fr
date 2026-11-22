<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Practice\ExerciseRepository;
use App\Models\DailyChallengeQuestion;
use App\Models\MadarRefuel;

/**
 * La question d'un défi telle que le CLIENT la reçoit — servie par le
 * serveur, SANS clé de réponse.
 *
 * C'est la différence avec la pratique (D5 : la banque de pratique livre
 * encore ses réponses attendues dans le JSON du client) : un défi est une
 * compétition, donc rien de ce qui permettrait de répondre sans savoir ne
 * quitte le serveur avant la réponse — ni `expectedAnswer`, ni `isCorrect`
 * des choix, ni les signatures de misconception, ni les indices, ni le
 * retour. La correction (`reveal`) n'est servie qu'une fois la réponse
 * enregistrée.
 *
 * La « محطة التزوّد » du jeu « مدار » sert ses questions par le même
 * présentateur (MadarRefuel porte les mêmes `exercise_code` / `question_id`) :
 * une seule frontière entre la clé de réponse et le client.
 */
class ChallengeQuestionPresenter
{
    /** Les seules clés d'une question que le client voit avant de répondre. */
    private const PUBLIC_KEYS = ['id', 'lead', 'statement', 'answerType', 'answerFormat', 'evaluationPolicy'];

    public function __construct(private ExerciseRepository $exercises) {}

    /** Le contenu complet (serveur seulement). */
    public function content(DailyChallengeQuestion|MadarRefuel $q, string $lessonCode): ?array
    {
        return $this->exercises->findQuestion($lessonCode, $q->exercise_code, $q->question_id);
    }

    /** @return array<string, mixed>|null ce que l'élève voit pour répondre */
    public function public(DailyChallengeQuestion|MadarRefuel $q, string $lessonCode): ?array
    {
        return $this->publicRef($lessonCode, $q->exercise_code, $q->question_id);
    }

    /**
     * La même vue publique, par référence (leçon, exercice, question) — servie
     * aussi par « بوصلتي » (Domain/Compass) : une seule frontière entre la clé
     * de réponse et le client, quel que soit le parcours.
     *
     * @return array<string, mixed>|null
     */
    public function publicRef(string $lessonCode, string $exerciseId, string $questionId): ?array
    {
        $exercise = $this->exercises->find($lessonCode, $exerciseId);
        $question = $this->exercises->findQuestion($lessonCode, $exerciseId, $questionId);
        if ($exercise === null || $question === null) {
            return null;
        }

        $public = array_intersect_key($question, array_flip(self::PUBLIC_KEYS));
        // La requiredForm (« irréductible ») est une consigne visible, le reste de
        // la politique d'évaluation ne regarde que le serveur.
        if (isset($public['evaluationPolicy'])) {
            $public['evaluationPolicy'] = array_intersect_key($public['evaluationPolicy'], ['requiredForm' => true]);
        }
        if (isset($question['choices'])) {
            $public['choices'] = array_map(
                fn ($c) => ['id' => $c['id'], 'content' => $c['content']],
                $question['choices'],
            );
        }

        return [
            // TOUTE la mise en place de l'exercice : sans ses `formulas` (« A = … ») ni son
            // `table`, « إليك العدد A حيث: » arrivait seul et la question était insoluble
            // (corrigé le 2026-11-09 — défi, محطة التزوّد et بوصلتي).
            'statement' => [
                'content' => $exercise['statement']['content'] ?? '',
                'formulas' => $exercise['statement']['formulas'] ?? null,
                'table' => $exercise['statement']['table'] ?? null,
                'figure' => $exercise['statement']['figure'] ?? null,
            ],
            'question' => $public,
        ];
    }

    /**
     * La correction, après la réponse : la bonne réponse et UNE phrase
     * d'explication (le retour « correct » du contenu). Le défi n'est pas une
     * leçon : la remédiation détaillée se fait ensuite, en pratique.
     *
     * @return array{correctAnswer: mixed, correctChoiceIds: string[], explanation: ?string}
     */
    public function reveal(DailyChallengeQuestion|MadarRefuel $q, string $lessonCode): array
    {
        $question = $this->content($q, $lessonCode) ?? [];
        $correctChoiceIds = [];
        foreach ($question['choices'] ?? [] as $c) {
            if (! empty($c['isCorrect'])) {
                $correctChoiceIds[] = $c['id'];
            }
        }

        return [
            'correctAnswer' => $correctChoiceIds === [] ? ($question['expectedAnswer'] ?? null) : null,
            'correctChoiceIds' => $correctChoiceIds,
            'explanation' => $question['feedback']['correct'] ?? null,
        ];
    }
}
