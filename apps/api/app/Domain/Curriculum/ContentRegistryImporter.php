<?php

namespace App\Domain\Curriculum;

use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use Illuminate\Support\Facades\DB;

/**
 * Reflète le REGISTRE DE CONTENU — modules et exercices — dans MySQL.
 *
 * Frère de CurriculumImporter, et volontairement séparé : celui-là reflète le
 * catalogue officiel (coursesData.js), celui-ci reflète ce que les leçons
 * déclarent réellement (lesson.config.js + content/practice). Deux sources,
 * deux commandes, deux diffs lisibles.
 *
 * LA RÈGLE CENTRALE — deux propriétaires, une table :
 *
 *   la SYNCHRO possède l'identité  → code, numéro, titre, étape, points enseignés
 *   l'ADMIN possède l'état         → publication_status
 *
 * Une resynchro ne touche donc JAMAIS publication_status d'une ligne existante.
 * Sans cela, chaque déploiement rouvrirait silencieusement le module qu'un
 * administrateur venait de masquer parce qu'il était cassé — et personne ne
 * s'en apercevrait avant le prochain signalement d'élève.
 *
 * POLITIQUE DE PUBLICATION À LA DÉCOUVERTE : un contenu NOUVELLEMENT
 * découvert naît en `draft`, jamais publié. Le contenu déjà en base garde
 * l'état qu'il a — cette règle ne rétroagit pas.
 *
 * Pourquoi : sans elle, écrire une leçon et lancer la synchro la met en ligne
 * devant les élèves sans que personne ne l'ait relue. Publier doit rester un
 * GESTE, pas un effet de bord du déploiement. L'inverse (naître publié) ne se
 * remarque jamais — c'est exactement le genre d'accident qu'on ne découvre
 * qu'en lisant un signalement d'élève.
 *
 * ET ON NE SUPPRIME PAS : un code disparu du contenu est marqué `retired_at`.
 * Même raison que pour les learning points — student_lesson_progress
 * .completed_modules référence ces codes sous forme de chaînes, et effacer la
 * ligne rendrait une progression d'élève illisible. Un code qui réapparaît
 * voit son `retired_at` levé.
 */
class ContentRegistryImporter
{
    /**
     * @param  array{lessons?: array<int, array>, exercises?: array<int, array>}  $export
     * @return array{modules: array{created: string[], updated: string[], retired: string[], unchanged: string[]}, exercises: array{created: string[], updated: string[], retired: string[], unchanged: string[]}, unknownLessons: string[]}
     */
    public function import(array $export, bool $dryRun = false): array
    {
        $summary = [
            'modules' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'exercises' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'unknownLessons' => [],
        ];

        try {
            DB::transaction(function () use ($export, $dryRun, &$summary) {
                $this->importModules($export['lessons'] ?? [], $summary);
                $this->importExercises($export['exercises'] ?? [], $summary);

                // Même mécanique que CurriculumImporter : le diff est calculé
                // pour de vrai, puis la transaction est annulée. Le résumé
                // reste donc exact, et rien n'est écrit.
                if ($dryRun) {
                    throw new DryRunComplete($summary);
                }
            });
        } catch (DryRunComplete) {
            // Attendu en --dry-run.
        }

        return $summary;
    }

    /**
     * @param  array<int, array>  $lessons
     */
    private function importModules(array $lessons, array &$summary): void
    {
        // Un code de leçon peut se répéter d'un niveau à l'autre
        // ('resolution-problemes' existe en 6e et en 3e). L'export porte la
        // classe, ce qui lève l'ambiguïté ; sans elle, on ne rattache que si
        // le code est unique en base — jamais au hasard.
        foreach ($lessons as $lessonExport) {
            $lesson = $this->resolveLesson($lessonExport['code'] ?? null, $lessonExport['grade'] ?? null);

            if (! $lesson) {
                $summary['unknownLessons'][] = (string) ($lessonExport['code'] ?? '?');

                continue;
            }

            $seen = [];

            foreach ($lessonExport['modules'] ?? [] as $moduleExport) {
                $code = (string) $moduleExport['code'];
                $seen[] = $code;
                $label = "{$lesson->code}/{$code}";

                $identity = [
                    'number' => $moduleExport['number'] ?? 0,
                    'slug' => $moduleExport['slug'] ?? null,
                    'title' => $moduleExport['title'] ?? '',
                    'description' => $moduleExport['description'] ?? null,
                    'stage' => $moduleExport['stage'] ?? null,
                    'estimated_min' => $moduleExport['estimatedMin'] ?? null,
                    'difficulty' => $moduleExport['difficulty'] ?? null,
                    'teaches_learning_point_codes' => $moduleExport['teachesLearningPointCodes'] ?? null,
                ];

                $existing = LessonModule::where('lesson_id', $lesson->id)->where('code', $code)->first();

                if (! $existing) {
                    LessonModule::create($identity + [
                        'lesson_id' => $lesson->id,
                        'code' => $code,
                        // Brouillon : un module découvert n'est pas un module
                        // relu (voir la politique en tête de classe).
                        'publication_status' => LessonModule::PUB_DRAFT,
                    ]);
                    $summary['modules']['created'][] = $label;

                    continue;
                }

                // Un module revenu d'entre les morts reprend du service.
                $revived = $existing->retired_at !== null;
                $changed = $this->differs($existing, $identity);

                if ($changed || $revived) {
                    // Noter l'absence de publication_status ici : c'est tout
                    // l'intérêt de cette classe.
                    $existing->fill($identity);
                    $existing->retired_at = null;
                    $existing->save();
                    $summary['modules']['updated'][] = $label;
                } else {
                    $summary['modules']['unchanged'][] = $label;
                }
            }

            // Retrait — jamais suppression.
            $retired = LessonModule::where('lesson_id', $lesson->id)
                ->whereNotIn('code', $seen)
                ->whereNull('retired_at')
                ->get();

            foreach ($retired as $module) {
                $module->update(['retired_at' => now()]);
                $summary['modules']['retired'][] = "{$lesson->code}/{$module->code}";
            }
        }
    }

    /**
     * @param  array<int, array>  $exercises
     */
    private function importExercises(array $exercises, array &$summary): void
    {
        $seenByLesson = [];

        foreach ($exercises as $exerciseExport) {
            $lesson = $this->resolveLesson($exerciseExport['lessonCode'] ?? null, null);

            if (! $lesson) {
                $summary['unknownLessons'][] = (string) ($exerciseExport['lessonCode'] ?? '?');

                continue;
            }

            $code = (string) $exerciseExport['exerciseCode'];
            $seenByLesson[$lesson->id][] = $code;
            $label = "{$lesson->code}/{$code}";

            $identity = [
                'level' => $exerciseExport['level'] ?? 1,
                'title' => $exerciseExport['title'] ?? null,
                'question_count' => $exerciseExport['questionCount'] ?? 0,
            ];

            $existing = PracticeExercise::where('lesson_id', $lesson->id)
                ->where('exercise_code', $code)
                ->first();

            if (! $existing) {
                PracticeExercise::create($identity + [
                    'lesson_id' => $lesson->id,
                    'exercise_code' => $code,
                    'publication_status' => PracticeExercise::PUB_DRAFT,
                ]);
                $summary['exercises']['created'][] = $label;

                continue;
            }

            $revived = $existing->retired_at !== null;

            if ($this->differs($existing, $identity) || $revived) {
                $existing->fill($identity);
                $existing->retired_at = null;
                $existing->save();
                $summary['exercises']['updated'][] = $label;
            } else {
                $summary['exercises']['unchanged'][] = $label;
            }
        }

        // Un exercice n'est retiré que parmi les leçons que cet export
        // mentionne : le moteur d'exercices s'active leçon par leçon, et une
        // leçon absente de l'index n'est pas une leçon dont les exercices
        // auraient disparu.
        foreach ($seenByLesson as $lessonId => $codes) {
            $retired = PracticeExercise::where('lesson_id', $lessonId)
                ->whereNotIn('exercise_code', $codes)
                ->whereNull('retired_at')
                ->get();

            foreach ($retired as $exercise) {
                $exercise->update(['retired_at' => now()]);
                $summary['exercises']['retired'][] = "{$exercise->lesson_id}/{$exercise->exercise_code}";
            }
        }
    }

    /**
     * Rattache un code de leçon à sa ligne. Le code seul ne suffit pas
     * toujours — il se répète d'une classe à l'autre — donc la classe tranche
     * quand elle est connue, et on refuse plutôt que de deviner.
     */
    private function resolveLesson(?string $code, ?string $grade): ?Lesson
    {
        if ($code === null) {
            return null;
        }

        $query = Lesson::where('code', $code);

        if ($grade !== null) {
            $query->whereHas('chapter.grade', fn ($q) => $q->where('code', $grade));
        }

        $matches = $query->get();

        return $matches->count() === 1 ? $matches->first() : null;
    }

    /**
     * @param  array<string, mixed>  $identity
     */
    private function differs($model, array $identity): bool
    {
        foreach ($identity as $key => $value) {
            if ($model->{$key} != $value) {
                return true;
            }
        }

        return false;
    }
}
