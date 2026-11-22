<?php

namespace App\Domain\Curriculum;

use App\Domain\Content\AssessmentItemRepository;
use App\Models\AssessmentItem;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\LessonResource;
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
 *   l'ADMIN possède l'état         → publication_status de la LEÇON et des exercices
 *
 * UN MODULE N'A PAS D'ÉTAT PROPRE (propriétaire, 2026-11-11) : sa colonne
 * `publication_status` est la COPIE de celle de sa leçon, réécrite à chaque
 * synchronisation (et par ContentService::changeStatus quand l'admin change
 * la leçon). ContentAccess ne lit que l'état de la leçon.
 *
 * DÉFAUT PUBLIÉ (propriétaire, 2026-11-11) : pousser en production publie.
 * Un exercice NOUVEAU naît avec l'état de sa leçon si elle est publiée
 * (`draft` sinon), et un exercice resté `draft` sous une leçon publiée est
 * publié. Un exercice `hidden` / `archived` (geste de l'admin) est gardé :
 * la resynchro ne rouvre jamais ce que l'admin a masqué.
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
            'resources' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'items' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'unknownLessons' => [],
            // Un item dont les learning points ne sont pas ceux de sa leçon,
            // ou sans point principal unique : REFUSÉ, jamais importé à moitié.
            'invalidItems' => [],
        ];

        try {
            DB::transaction(function () use ($export, $dryRun, &$summary) {
                $this->importModules($export['lessons'] ?? [], $summary);
                $this->importResources($export['lessons'] ?? [], $summary);
                $this->importExercises($export['exercises'] ?? [], $summary);
                $this->importItems($export['items'] ?? [], $summary);

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

                // Le module porte l'état de sa leçon (voir l'en-tête).
                $identity['publication_status'] = $lesson->publication_status;

                if (! $existing) {
                    LessonModule::create($identity + [
                        'lesson_id' => $lesson->id,
                        'code' => $code,
                    ]);
                    $summary['modules']['created'][] = $label;

                    continue;
                }

                // Un module revenu d'entre les morts reprend du service.
                $revived = $existing->retired_at !== null;
                $changed = $this->differs($existing, $identity);

                if ($changed || $revived) {
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
     * Les RESSOURCES déclarées par lesson.config.js (`resources[]`) :
     * manipulations, méthodes, situations, exemples — identité seulement,
     * retrait par `retired_at`, jamais de suppression. Une leçon qui ne
     * déclare pas de tableau `resources` (les 132 leçons héritées) n'est pas
     * touchée : « aucune ressource déclarée » n'est pas « toutes retirées ».
     *
     * @param  array<int, array>  $lessons
     */
    private function importResources(array $lessons, array &$summary): void
    {
        foreach ($lessons as $lessonExport) {
            if (! array_key_exists('resources', $lessonExport) || ! is_array($lessonExport['resources'])) {
                continue;
            }
            $lesson = $this->resolveLesson($lessonExport['code'] ?? null, $lessonExport['grade'] ?? null);
            if (! $lesson) {
                continue; // déjà signalé par importModules
            }

            $seen = [];
            foreach ($lessonExport['resources'] as $index => $r) {
                $code = (string) ($r['code'] ?? '');
                if ($code === '') {
                    continue;
                }
                $seen[] = $code;
                $label = "{$lesson->code}/{$code}";
                $identity = [
                    'kind' => $r['kind'] ?? 'example',
                    'type' => $r['type'] ?? null,
                    'title' => $r['title'] ?? '',
                    'description' => $r['description'] ?? null,
                    'module_number' => $r['module'] ?? null,
                    'learning_point_codes' => $r['learningPointIds'] ?? null,
                    'source_element_ids' => $r['sourceElementIds'] ?? null,
                    'config' => $r['config'] ?? null,
                    'order' => $index,
                ];
                $existing = LessonResource::where('lesson_id', $lesson->id)->where('code', $code)->first();
                if (! $existing) {
                    LessonResource::create($identity + ['lesson_id' => $lesson->id, 'code' => $code]);
                    $summary['resources']['created'][] = $label;

                    continue;
                }
                $revived = $existing->retired_at !== null;
                if ($this->differs($existing, $identity) || $revived) {
                    $existing->fill($identity);
                    $existing->retired_at = null;
                    $existing->save();
                    $summary['resources']['updated'][] = $label;
                } else {
                    $summary['resources']['unchanged'][] = $label;
                }
            }

            $retired = LessonResource::where('lesson_id', $lesson->id)->whereNotIn('code', $seen)->whereNull('retired_at')->get();
            foreach ($retired as $resource) {
                $resource->update(['retired_at' => now()]);
                $summary['resources']['retired'][] = "{$lesson->code}/{$resource->code}";
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

            $lessonPublished = $lesson->publication_status === Lesson::PUB_PUBLISHED;

            if (! $existing) {
                PracticeExercise::create($identity + [
                    'lesson_id' => $lesson->id,
                    'exercise_code' => $code,
                    'publication_status' => $lessonPublished ? PracticeExercise::PUB_PUBLISHED : PracticeExercise::PUB_DRAFT,
                ]);
                $summary['exercises']['created'][] = $label;

                continue;
            }

            // Défaut publié : un `draft` sous une leçon publiée est publié ;
            // `hidden` / `archived` (geste de l'admin) sont gardés.
            if ($lessonPublished && $existing->publication_status === PracticeExercise::PUB_DRAFT) {
                $identity['publication_status'] = PracticeExercise::PUB_PUBLISHED;
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
     * Les ITEMS d'évaluation (Mastery V2, phase 3) : une ligne par question
     * qui peut produire une preuve, avec ses learning points, sa difficulté,
     * son gabarit et sa clé de réponse.
     *
     * Validé contre la base : chaque code de learning point doit exister,
     * appartenir à la leçon de l'item et ne pas être retiré ; il faut
     * exactement un point principal. Un item invalide est signalé et ignoré —
     * le registre n'accueille pas un mapping à moitié juste.
     *
     * Jamais supprimé : un item absent de l'export est RETIRÉ (retired_at),
     * pour que la preuve historique reste résoluble. Une question dont la
     * clé ou les points changent change de content_version ; la ligne est
     * mise à jour, l'historique ne bouge pas.
     *
     * @param  array<int, array>  $items
     */
    private function importItems(array $items, array &$summary): void
    {
        if ($items === []) {
            return;
        }

        $seenByLesson = [];
        $touchedLearningPoints = [];

        foreach ($items as $itemExport) {
            $lesson = $this->resolveLesson($itemExport['lessonCode'] ?? null, null);
            if (! $lesson) {
                $summary['unknownLessons'][] = (string) ($itemExport['lessonCode'] ?? '?');

                continue;
            }

            $key = (string) $itemExport['itemKey'];
            $seenByLesson[$lesson->id][] = $key;

            // ── Validation des learning points contre la base ─────────────
            $declared = array_values(array_filter($itemExport['learningPoints'] ?? [], fn ($lp) => isset($lp['code'])));
            $codes = array_map(fn ($lp) => (string) $lp['code'], $declared);
            $primaries = array_filter($declared, fn ($lp) => ($lp['role'] ?? 'primary') !== 'secondary');
            $points = $codes === [] ? collect() : LearningPoint::whereIn('code', $codes)->whereNull('retired_at')->get()->keyBy('code');

            $reason = null;
            if ($codes === []) {
                $reason = 'aucun learning point';
            } elseif (count($primaries) !== 1) {
                $reason = 'il faut exactement un learning point principal (reçu '.count($primaries).')';
            } elseif ($points->count() !== count(array_unique($codes))) {
                $reason = 'learning point inconnu ou retiré : '.implode(', ', array_diff(array_unique($codes), $points->keys()->all()));
            } elseif ($points->contains(fn ($p) => $p->lesson_id !== $lesson->id)) {
                $reason = 'un learning point n\'appartient pas à la leçon '.$lesson->code;
            }
            if ($reason !== null) {
                $summary['invalidItems'][] = "{$key} — {$reason}";

                continue;
            }

            $attributes = [
                'lesson_id' => $lesson->id,
                'source_kind' => (string) $itemExport['sourceKind'],
                'exercise_code' => $itemExport['exerciseCode'] ?? null,
                'question_id' => (string) $itemExport['questionId'],
                'template_key' => $itemExport['templateKey'] ?? null,
                'difficulty' => (int) ($itemExport['difficulty'] ?? 3),
                'cognitive_demand' => $itemExport['cognitiveDemand'] ?? null,
                'answer_type' => (string) ($itemExport['answerType'] ?? 'choice'),
                'title' => $itemExport['title'] ?? null,
                'learning_points' => array_map(fn ($lp) => ['code' => $lp['code'], 'role' => ($lp['role'] ?? 'primary') === 'secondary' ? 'secondary' : 'primary'], $declared),
                'answer_key' => $itemExport['answerKey'] ?? null,
                'evaluation' => ($itemExport['evaluation'] ?? 'server') === 'client' ? AssessmentItem::EVALUATION_CLIENT : AssessmentItem::EVALUATION_SERVER,
                'content_version' => (string) $itemExport['contentVersion'],
            ];

            $existing = AssessmentItem::where('item_key', $key)->first();
            if (! $existing) {
                $item = AssessmentItem::create($attributes + ['item_key' => $key, 'publication_status' => AssessmentItem::PUB_PUBLISHED]);
                $summary['items']['created'][] = $key;
            } else {
                $revived = $existing->retired_at !== null;
                if ($existing->content_version !== $attributes['content_version'] || $revived || $this->itemDiffers($existing, $attributes)) {
                    $existing->fill($attributes);
                    $existing->retired_at = null;
                    $existing->save();
                    $summary['items']['updated'][] = $key;
                } else {
                    $summary['items']['unchanged'][] = $key;
                }
                $item = $existing;
            }

            // Le pivot rend le compte d'items par point indexé.
            $item->learningPointRows()->sync(
                $points->mapWithKeys(fn ($p) => [$p->id => ['role' => collect($declared)->firstWhere('code', $p->code)['role'] ?? 'primary']])->all()
            );
            foreach ($points as $p) {
                $touchedLearningPoints[$p->id] = true;
            }
        }

        // Retrait — parmi les leçons que cet export mentionne, seulement.
        foreach ($seenByLesson as $lessonId => $keys) {
            $retired = AssessmentItem::where('lesson_id', $lessonId)
                ->whereNotIn('item_key', $keys)
                ->whereNull('retired_at')
                ->get();
            foreach ($retired as $item) {
                $item->update(['retired_at' => now()]);
                $summary['items']['retired'][] = $item->item_key;
                foreach ($item->learningPointRows as $p) {
                    $touchedLearningPoints[$p->id] = true;
                }
            }
        }

        // Le nombre d'items par learning point borne la règle de preuve
        // minimale du moteur : il est en cache, on le purge.
        AssessmentItemRepository::forgetCounts(array_keys($touchedLearningPoints));
    }

    private function itemDiffers(AssessmentItem $item, array $attributes): bool
    {
        foreach (['source_kind', 'exercise_code', 'question_id', 'template_key', 'difficulty', 'cognitive_demand', 'answer_type', 'title', 'evaluation'] as $key) {
            if ($item->{$key} != $attributes[$key]) {
                return true;
            }
        }

        return $item->learning_points != $attributes['learning_points'] || $item->answer_key != $attributes['answer_key'];
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
