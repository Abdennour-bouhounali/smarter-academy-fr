<?php

namespace App\Domain\Access;

use App\Models\Lesson;
use App\Models\LessonModule;
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
     * Le MODULE est-il ouvert ?
     *
     * Pas de cascade : un module en brouillon reste inaccessible sous une
     * leçon publiée, et publier une leçon ne publie aucun module. Chaque
     * niveau porte son propre état — c'est ce qui permet de retirer UN module
     * cassé sans fermer la leçon entière (spec §10), et ce qui évite qu'une
     * publication de leçon ouvre par surprise du contenu jamais relu.
     *
     * @throws DomainException si le module est masqué, archivé ou en brouillon.
     */
    public static function assertModuleAvailable(string $lessonCode, int|string $moduleRef): void
    {
        // La leçon d'abord : inutile de dire « module indisponible » quand
        // c'est toute la leçon qui est fermée.
        self::assertLessonAvailable($lessonCode);

        $modules = LessonModule::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where(function ($q) use ($moduleRef) {
                // Le client désigne un module par son NUMÉRO (la progression
                // stocke des numéros) ou par son CODE ('00', '07'). Les deux
                // sont acceptés parce que les deux circulent déjà.
                $q->where('code', (string) $moduleRef);
                if (is_numeric($moduleRef)) {
                    $q->orWhere('number', (int) $moduleRef);
                }
            })
            ->whereNull('retired_at')
            ->get();

        // Inconnu du registre : on laisse passer, même raison que pour la
        // leçon — la base miroite le contenu, elle n'en est pas l'autorité.
        if ($modules->isEmpty()) {
            return;
        }

        if ($modules->contains(fn (LessonModule $module) => $module->isVisibleToStudents())) {
            return;
        }

        throw new DomainException('Ce module n\'est pas disponible pour le moment.');
    }

    /** Variante non levante, pour filtrer une liste. */
    public static function isModuleAvailable(string $lessonCode, int|string $moduleRef): bool
    {
        try {
            self::assertModuleAvailable($lessonCode, $moduleRef);

            return true;
        } catch (DomainException) {
            return false;
        }
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
     * L'inventaire d'accès destiné à l'élève : ce qui est FERMÉ.
     *
     * Renvoyé en liste de fermetures plutôt qu'en liste d'ouvertures : le
     * catalogue vit dans le frontend (coursesData.js), la base n'en est que
     * le miroir. Envoyer « voici les 132 leçons ouvertes » ferait de la base
     * une seconde définition du catalogue, qui dériverait. Envoyer « voici
     * les 3 choses fermées » laisse une seule source de vérité au contenu, et
     * une seule autorité à la publication.
     *
     * Conséquence voulue : une leçon absente du registre reste ouverte.
     *
     * @return array{lessons: string[], modules: array<string, int[]>}
     */
    public static function closedInventory(): array
    {
        $closedLessons = Lesson::where('publication_status', '!=', Lesson::PUB_PUBLISHED)
            ->pluck('code')
            // Un code peut porter deux leçons (6e et 3e) : il n'est fermé que
            // si AUCUNE des deux n'est publiée. Même règle qu'assertLessonAvailable.
            ->unique()
            ->filter(fn (string $code) => ! Lesson::where('code', $code)
                ->where('publication_status', Lesson::PUB_PUBLISHED)
                ->exists())
            ->values()
            ->all();

        $closedModules = [];
        $rows = LessonModule::query()
            ->join('lessons', 'lessons.id', '=', 'lesson_modules.lesson_id')
            ->where('lesson_modules.publication_status', '!=', LessonModule::PUB_PUBLISHED)
            ->whereNull('lesson_modules.retired_at')
            ->get(['lessons.code as lesson_code', 'lesson_modules.number']);

        foreach ($rows as $row) {
            $closedModules[$row->lesson_code][] = (int) $row->number;
        }

        return ['lessons' => $closedLessons, 'modules' => $closedModules];
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
