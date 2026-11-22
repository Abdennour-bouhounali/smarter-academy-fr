<?php

namespace App\Domain\Practice;

use App\Models\Lesson;
use App\Models\QuestionAttempt;
use App\Models\User;

/**
 * Les MÉDAILLES de l'espace d'exercices (propriétaire, 2026-10-06) — miroir
 * EXACT de `apps/web/src/features/practice/exam/medals.js`, vérifié sur la même
 * fixture (`medals.fixture.json`, MedalsTest).
 *
 * Réponse juste : or (aucun إرشاد, dans le temps), argent (un défaut : un
 * إرشاد OU le temps dépassé), bronze (deux défauts ou plus). Une « بيّن أن »
 * auto-évaluée ne rapporte rien ; corrigée par l'enseignant, si. Points : 3 / 2 / 1.
 *
 * Rien n'est stocké : les médailles se DÉDUISENT des tentatives enregistrées
 * (issue, إرشادات demandés, `answer.seconds`) et du temps de l'étape
 * (`timeSeconds` du contenu).
 */
final class Medals
{
    public const POINTS = ['gold' => 3, 'silver' => 2, 'bronze' => 1];

    public static function medalFor(string $outcome, ?string $answerType, int $hintsUsed, ?float $seconds, ?float $limit, ?string $evaluatedBy = null): ?string
    {
        // Une note qu'on se donne soi-même ne rapporte rien (« بيّن أن »
        // auto-évaluée, copie en photo auto-notée) ; la note de l'ENSEIGNANT,
        // si (« تصحيح الأستاذ », 2026-10-06).
        if ($evaluatedBy === 'self' || ($answerType === 'selfCheck' && $evaluatedBy !== 'teacher')) {
            return null;
        }
        if (! in_array($outcome, ['correct', 'equivalent_correct'], true)) {
            return null;
        }
        $late = $seconds !== null && $limit !== null && $seconds > $limit;
        $faults = max(0, $hintsUsed) + ($late ? 1 : 0);

        return $faults === 0 ? 'gold' : ($faults === 1 ? 'silver' : 'bronze');
    }

    public function __construct(private ExerciseRepository $exercises) {}

    /**
     * La خزانة d'un élève pour une leçon : totaux, points, et par niveau.
     * Une médaille par question : la PREMIÈRE réponse enregistrée (celle que
     * la maîtrise retient — et la seule, sur une feuille d'examen).
     *
     * @return array{total: array{gold:int,silver:int,bronze:int,points:int}, levels: array<int, array{gold:int,silver:int,bronze:int,points:int}>}
     */
    public function forStudent(User $user, Lesson $lesson): array
    {
        $rows = QuestionAttempt::query()
            ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
            ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
            ->where('practice_sessions.user_id', $user->id)
            ->where('practice_sessions.lesson_id', $lesson->id)
            ->whereNotNull('question_attempts.submitted_at')
            ->orderBy('question_attempts.id')
            ->get(['question_attempts.*', 'exercise_attempts.exercise_id as ex_id', 'exercise_attempts.level as ex_level']);

        $empty = ['gold' => 0, 'silver' => 0, 'bronze' => 0, 'points' => 0];
        $total = $empty;
        $levels = [];
        $seen = [];
        foreach ($rows as $row) {
            $key = $row->ex_id.':'.$row->question_id;
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $question = $this->exercises->findQuestion($lesson->code, $row->ex_id, $row->question_id);
            if ($question === null) {
                continue;
            }
            $answer = is_array($row->submitted_answer) ? $row->submitted_answer : [];
            $medal = self::medalFor(
                (string) $row->outcome,
                $question['answerType'] ?? null,
                (int) $row->hints_used,
                isset($answer['seconds']) && is_numeric($answer['seconds']) ? (float) $answer['seconds'] : null,
                isset($question['timeSeconds']) ? (float) $question['timeSeconds'] : null,
                $row->evaluated_by,
            );
            if ($medal === null) {
                continue;
            }
            $level = (int) $row->ex_level;
            $levels[$level] ??= $empty;
            foreach ([&$total, &$levels[$level]] as &$bucket) {
                $bucket[$medal]++;
                $bucket['points'] += self::POINTS[$medal];
            }
            unset($bucket);
        }
        ksort($levels);

        return ['total' => $total, 'levels' => $levels];
    }
}
