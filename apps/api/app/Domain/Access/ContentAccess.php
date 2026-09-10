<?php

namespace App\Domain\Access;

use App\Models\Lesson;
use App\Models\PracticeExercise;
use DomainException;

/**
 * La porte d'accès au contenu — UN seul endroit.
 *
 * La spec (§24) demande que la décision d'accès soit centralisée plutôt que
 * dispersée en conditions dans des composants. C'est ici.
 *
 * L'ordre est celui du contrat :
 *
 *     état du compte  (middleware account.active, en amont de toute route)
 *          ↓
 *     état de publication du contenu  ← ce fichier
 *          ↓
 *     droit d'accès / palier          ← pas encore branché, voir plus bas
 *
 * Ce qui N'EST PAS fait ici, et pourquoi : le palier (`lessons.tier`) ne
 * bloque rien, parce qu'aucun système d'abonnement n'est intégré. La table
 * subscriptions existe et l'administration la lit, mais rien ne l'écrit — un
 * palier appliqué aujourd'hui fermerait les leçons premium à des élèves qui
 * n'ont aucun moyen de payer. Le crochet est prêt, la règle viendra avec le
 * premier paiement réel.
 *
 * Une leçon ABSENTE du registre reste accessible : la base est un miroir du
 * contenu, pas son autorité. Refuser ce qui n'est pas encore importé
 * fermerait la plateforme au premier oubli de synchronisation.
 */
class ContentAccess
{
    /**
     * La leçon est-elle ouverte aux élèves ?
     *
     * @throws DomainException si elle est masquée, archivée ou en brouillon.
     */
    public static function assertLessonAvailable(string $lessonCode): void
    {
        $lessons = Lesson::where('code', $lessonCode)->get();

        // Inconnue du registre : on laisse passer (voir le docblock).
        if ($lessons->isEmpty()) {
            return;
        }

        // Un code de leçon se répète d'une classe à l'autre. Si AU MOINS une
        // des leçons portant ce code est publiée, l'accès reste ouvert :
        // masquer la version de 6e ne doit pas fermer celle de 3e.
        if ($lessons->contains(fn (Lesson $lesson) => $lesson->isVisibleToStudents())) {
            return;
        }

        throw new DomainException('Cette leçon n\'est pas disponible pour le moment.');
    }

    /**
     * L'exercice est-il ouvert ? Un exercice masqué individuellement ne doit
     * plus être servi, même si sa leçon l'est.
     */
    public static function isExerciseAvailable(string $lessonCode, string $exerciseCode): bool
    {
        $exercise = PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('exercise_code', $exerciseCode)
            ->first();

        return $exercise === null || $exercise->isVisibleToStudents();
    }

    /**
     * Les identifiants d'exercice à retirer d'un inventaire, pour une leçon.
     *
     * Renvoyé en liste plutôt qu'interrogé exercice par exercice : le tirage
     * d'une séance en examine une quinzaine, et quinze requêtes là où une
     * suffit se paierait à chaque ouverture.
     *
     * @return string[]
     */
    public static function hiddenExerciseCodes(string $lessonCode): array
    {
        return PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('publication_status', '!=', PracticeExercise::PUB_PUBLISHED)
            ->pluck('exercise_code')
            ->all();
    }
}
