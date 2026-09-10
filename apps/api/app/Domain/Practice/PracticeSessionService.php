<?php

namespace App\Domain\Practice;

use App\Domain\Access\ContentAccess;
use App\Models\ExerciseAttempt;
use App\Models\Lesson;
use App\Models\PracticeSession;
use App\Models\QuestionAttempt;
use App\Models\User;
use DomainException;

/**
 * Cycle de vie d'une séance de pratique.
 *
 * `startOrResume` suit le patron de DiagnosticEngine::startOrResume : un
 * identifiant fourni par le client rend l'ouverture idempotente, si bien
 * qu'un double appui ou un rechargement retrouve la séance au lieu d'en
 * ouvrir une seconde.
 */
class PracticeSessionService
{
    public function __construct(private ExerciseRepository $exercises) {}

    public function startOrResume(User $user, string $lessonCode, string $sessionId, int $level): array
    {
        PracticeCapability::assertActive($lessonCode);
        // L'état de publication décidé par l'administration s'applique ici,
        // avant qu'une séance n'existe : tout le reste du moteur exige une
        // séance, donc en hérite (même raisonnement que PracticeCapability).
        ContentAccess::assertLessonAvailable($lessonCode);

        $existing = PracticeSession::where('session_id', $sessionId)->first();
        if ($existing) {
            if ($existing->user_id !== $user->id) {
                // Séance d'un autre élève : invalide, sans révéler qu'elle existe.
                throw new DomainException('Séance introuvable.');
            }

            return ['session' => $existing, 'resumed' => true];
        }

        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            throw new DomainException('Leçon inconnue.');
        }
        if ($level < 1 || $level > 5) {
            throw new DomainException('Niveau invalide.');
        }
        if (($this->exercises->countsByLevel($lessonCode)[$level] ?? 0) === 0) {
            throw new DomainException("Aucun exercice disponible au niveau {$level}.");
        }

        $session = PracticeSession::create([
            'session_id' => $sessionId,
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'level' => $level,
            'status' => 'open',
            'started_at' => now(),
        ]);

        return ['session' => $session, 'resumed' => false];
    }

    /** La séance du demandeur, ou une exception qui ne dit pas si elle existe. */
    public function ownedBy(User $user, string $sessionId): PracticeSession
    {
        $session = PracticeSession::where('session_id', $sessionId)->first();
        if ($session === null || $session->user_id !== $user->id) {
            throw new DomainException('Séance introuvable.');
        }

        return $session;
    }

    /**
     * Ouvre une question : crée (ou retrouve) sa tentative. C'est cette ligne
     * qui permettra à une demande d'indice de se rattacher à quelque chose —
     * un indice précède la réponse.
     */
    public function openQuestion(
        User $user,
        PracticeSession $session,
        string $exerciseId,
        string $questionId,
        string $attemptUuid,
    ): QuestionAttempt {
        $existing = QuestionAttempt::where('attempt_uuid', $attemptUuid)->first();
        if ($existing) {
            if ($existing->user_id !== $user->id) {
                throw new DomainException('Tentative invalide.');
            }

            return $existing;
        }

        $lessonCode = $session->lesson->code;
        if ($this->exercises->findQuestion($lessonCode, $exerciseId, $questionId) === null) {
            throw new DomainException('Question inconnue.');
        }

        // Un exercice retiré par l'administration ne s'ouvre plus, même dans
        // une séance déjà commencée. Le contrôle est ici parce que c'est le
        // point par lequel passe CHAQUE question ouverte : le contenu des
        // exercices est servi au client depuis les fichiers du bundle, donc
        // c'est le premier endroit où le serveur a son mot à dire.
        if (! ContentAccess::isExerciseAvailable($lessonCode, $exerciseId)) {
            throw new DomainException('Cet exercice n\'est plus disponible.');
        }

        $exerciseAttempt = ExerciseAttempt::firstOrCreate(
            ['practice_session_id' => $session->id, 'exercise_id' => $exerciseId],
            ['level' => $session->level, 'status' => 'in_progress', 'started_at' => now()],
        );

        $previous = QuestionAttempt::where('exercise_attempt_id', $exerciseAttempt->id)
            ->where('question_id', $questionId)->count();

        return QuestionAttempt::create([
            'exercise_attempt_id' => $exerciseAttempt->id,
            'user_id' => $user->id,
            'question_id' => $questionId,
            'attempt_uuid' => $attemptUuid,
            'attempt_number' => $previous + 1,
            'started_at' => now(),
        ]);
    }

    public function complete(PracticeSession $session): PracticeSession
    {
        if ($session->status === 'open') {
            $session->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return $session->fresh();
    }
}
