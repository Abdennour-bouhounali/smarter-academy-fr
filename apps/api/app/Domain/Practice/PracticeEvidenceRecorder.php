<?php

namespace App\Domain\Practice;

use App\Domain\Progress\ProgressEngine;
use App\Models\PracticeSession;
use App\Models\QuestionAttempt;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Le seul endroit où la pratique touche à la maîtrise.
 *
 * Il n'écrit jamais student_learning_point_progress lui-même : il appelle
 * ProgressEngine, comme le test final. C'est ce qui fait converger les deux
 * sources sur une seule évaluation — non par discipline, mais parce qu'il n'y
 * a pas d'autre porte.
 *
 * Frontière de confiance de cette phase : la justesse est calculée par le
 * client, exactement comme pour le test final (asymétrie documentée dans
 * LEARNING_ARCHITECTURE.md — le contenu des questions vit hors du serveur).
 * Ce que le serveur possède, lui, et qu'il vérifie ici : que la question
 * existe, que ses learning points sont bien ceux déclarés par le CONTENU et
 * non par le client, que la leçon correspond, et que la tentative appartient
 * au demandeur.
 */
class PracticeEvidenceRecorder
{
    /** Les six issues de la cible §11. */
    private const OUTCOMES = [
        'correct', 'equivalent_correct', 'partially_correct',
        'incorrect', 'syntax_error', 'abandoned',
    ];

    private const SUCCESS_OUTCOMES = ['correct', 'equivalent_correct'];

    public function __construct(
        private ProgressEngine $progress,
        private ExerciseRepository $exercises,
    ) {}

    /**
     * @param  array{outcome: string, answer?: array|null, normalizedAnswer?: ?string, misconceptionId?: ?string}  $payload
     * @return array{attempt: QuestionAttempt, duplicate: bool}
     */
    public function record(
        User $user,
        PracticeSession $session,
        QuestionAttempt $attempt,
        string $exerciseId,
        array $payload,
    ): array {
        if ($attempt->user_id !== $user->id) {
            throw new DomainException('Tentative invalide.');
        }
        if (! in_array($payload['outcome'], self::OUTCOMES, true)) {
            throw new DomainException('Issue de réponse inconnue.');
        }

        // Rejeu : la tentative a déjà sa réponse. Idempotent, comme la preuve.
        if ($attempt->submitted_at !== null) {
            return ['attempt' => $attempt, 'duplicate' => true];
        }

        $lessonCode = $session->lesson->code;
        $question = $this->exercises->findQuestion($lessonCode, $exerciseId, $attempt->question_id);
        if ($question === null) {
            throw new DomainException('Question inconnue.');
        }

        // Les learning points viennent du CONTENU, jamais du corps de la
        // requête : un client ne choisit pas quelles compétences il crédite.
        $refs = array_values(array_map(
            fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
            $question['learningPoints'] ?? [],
        ));
        if ($refs === []) {
            throw new DomainException('Cette question ne déclare aucun point d\'apprentissage.');
        }

        $isCorrect = in_array($payload['outcome'], self::SUCCESS_OUTCOMES, true);

        DB::transaction(function () use ($attempt, $payload, $isCorrect, $user, $lessonCode, $refs, $session, $exerciseId) {
            $attempt->update([
                'submitted_answer' => $payload['answer'] ?? null,
                'normalized_answer' => $payload['normalizedAnswer'] ?? null,
                'outcome' => $payload['outcome'],
                'misconception_id' => $payload['misconceptionId'] ?? null,
                'submitted_at' => now(),
            ]);

            $this->progress->recordEvidence($user, $lessonCode, [
                'questionCode' => "{$exerciseId}:{$attempt->question_id}",
                // La même clé d'idempotence des deux côtés : une preuve et sa
                // tentative ne peuvent pas diverger sur un rejeu.
                'attemptId' => $attempt->attempt_uuid,
                'isCorrect' => $isCorrect,
                'outcome' => $payload['outcome'],
                'learningPointRefs' => $refs,
                'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
                'level' => $session->level,
                'hintsUsed' => $attempt->hints_used,
                'misconceptionId' => $payload['misconceptionId'] ?? null,
                'sourceId' => $session->session_id,
                'answer' => $payload['answer'] ?? null,
            ]);

            $session->increment('questions_answered');
            if ($isCorrect) {
                $session->increment('correct_count');
            }
        });

        return ['attempt' => $attempt->fresh(), 'duplicate' => false];
    }
}
