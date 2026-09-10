<?php

namespace App\Domain\Admin;

use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentReport;
use Illuminate\Support\Facades\DB;

/**
 * Le diagnostic de cohérence : ce que la base croit, comparé à ce que le
 * contenu déclare.
 *
 * Déterministe, sans aucune inférence. Chaque constat est une requête ou une
 * comparaison d'ensembles — pas un score, pas une prédiction.
 *
 * L'export du contenu (packages/core/curriculum/.generated/) sert de source :
 * c'est le même fichier que lit la synchro, donc les deux ne peuvent pas être
 * en désaccord sur ce qu'est « la source ». Si l'export est absent, les
 * contrôles qui en dépendent se déclarent indisponibles plutôt que de
 * conclure à tort que tout le contenu a disparu.
 */
class RegistryHealthService
{
    /** @return array<string, mixed> */
    public function report(): array
    {
        $source = $this->loadSource();

        return [
            'generatedAt' => now()->toIso8601String(),
            'sourceAvailable' => $source !== null,
            'counts' => $this->counts(),
            'structural' => $this->structural($source),
            'publication' => $this->publication(),
            'learningPoints' => $this->learningPointHealth(),
            'reporting' => $this->reportingHealth(),
        ];
    }

    private function counts(): array
    {
        return [
            'lessons' => Lesson::count(),
            'modules' => LessonModule::whereNull('retired_at')->count(),
            'modulesRetired' => LessonModule::whereNotNull('retired_at')->count(),
            'exercises' => PracticeExercise::whereNull('retired_at')->count(),
            'exercisesRetired' => PracticeExercise::whereNotNull('retired_at')->count(),
            'learningPoints' => LearningPoint::whereNull('retired_at')->count(),
        ];
    }

    /**
     * Source ↔ base. Les deux sens comptent : une leçon en base sans source
     * est un orphelin, une source sans base est un contenu invisible pour
     * l'administration.
     */
    private function structural(?array $source): array
    {
        if ($source === null) {
            return ['available' => false, 'reason' => 'source_export_missing'];
        }

        $sourceLessons = collect($source['lessons'] ?? [])->pluck('code')->unique();
        $dbLessons = Lesson::pluck('code')->unique();

        $sourceModules = collect($source['lessons'] ?? [])
            ->flatMap(fn ($lesson) => collect($lesson['modules'] ?? [])
                ->map(fn ($m) => $lesson['code'].'/'.$m['code']))
            ->unique();

        $dbModules = LessonModule::query()
            ->join('lessons', 'lessons.id', '=', 'lesson_modules.lesson_id')
            ->whereNull('lesson_modules.retired_at')
            ->get(['lessons.code as lesson_code', 'lesson_modules.code'])
            ->map(fn ($r) => $r->lesson_code.'/'.$r->code)
            ->unique();

        $sourceExercises = collect($source['exercises'] ?? [])
            ->map(fn ($e) => $e['lessonCode'].'/'.$e['exerciseCode'])
            ->unique();

        $dbExercises = PracticeExercise::query()
            ->join('lessons', 'lessons.id', '=', 'practice_exercises.lesson_id')
            ->whereNull('practice_exercises.retired_at')
            ->get(['lessons.code as lesson_code', 'practice_exercises.exercise_code'])
            ->map(fn ($r) => $r->lesson_code.'/'.$r->exercise_code)
            ->unique();

        return [
            'available' => true,
            // Une leçon en base sans source n'est PAS forcément une erreur :
            // le catalogue officiel porte des leçons « à venir », déclarées
            // sans être écrites. On les liste, sans les qualifier de fautes.
            'lessonsWithoutSource' => $dbLessons->diff($sourceLessons)->values()->all(),
            'lessonsWithoutRegistry' => $sourceLessons->diff($dbLessons)->values()->all(),
            'modulesWithoutSource' => $dbModules->diff($sourceModules)->values()->all(),
            'modulesWithoutRegistry' => $sourceModules->diff($dbModules)->values()->all(),
            'exercisesWithoutSource' => $dbExercises->diff($sourceExercises)->values()->all(),
            'exercisesWithoutRegistry' => $sourceExercises->diff($dbExercises)->values()->all(),
            'duplicateLessonCodes' => $this->duplicateLessonCodes(),
        ];
    }

    /**
     * Les codes de leçon portés par plusieurs lignes. Ce n'est pas une faute
     * en soi ('resolution-problemes' existe en 6e et en 3e), mais c'est le
     * point exact où une synchro peut rattacher au mauvais endroit — donc ça
     * se surveille.
     */
    private function duplicateLessonCodes(): array
    {
        return Lesson::select('code', DB::raw('COUNT(*) as c'))
            ->groupBy('code')
            ->having('c', '>', 1)
            ->pluck('c', 'code')
            ->all();
    }

    private function publication(): array
    {
        // Une leçon publiée dont AUCUN module n'est publié : l'élève y entre
        // et ne trouve rien. C'est le défaut le plus visible pour lui.
        $publishedWithoutPublishedModules = Lesson::query()
            ->where('publication_status', Lesson::PUB_PUBLISHED)
            ->whereHas('modules', fn ($q) => $q->whereNull('retired_at'))
            ->whereDoesntHave('modules', fn ($q) => $q
                ->whereNull('retired_at')
                ->where('publication_status', LessonModule::PUB_PUBLISHED))
            ->pluck('code')
            ->all();

        $publishedWithSomeUnpublished = Lesson::query()
            ->where('publication_status', Lesson::PUB_PUBLISHED)
            ->whereHas('modules', fn ($q) => $q
                ->whereNull('retired_at')
                ->where('publication_status', '!=', LessonModule::PUB_PUBLISHED))
            ->withCount(['modules as unpublished_modules_count' => fn ($q) => $q
                ->whereNull('retired_at')
                ->where('publication_status', '!=', LessonModule::PUB_PUBLISHED)])
            ->get(['id', 'code'])
            ->mapWithKeys(fn ($l) => [$l->code => $l->unpublished_modules_count])
            ->all();

        return [
            'lessonsByStatus' => Lesson::select('publication_status', DB::raw('COUNT(*) as c'))
                ->groupBy('publication_status')->pluck('c', 'publication_status')->all(),
            'modulesByStatus' => LessonModule::whereNull('retired_at')
                ->select('publication_status', DB::raw('COUNT(*) as c'))
                ->groupBy('publication_status')->pluck('c', 'publication_status')->all(),
            'exercisesByStatus' => PracticeExercise::whereNull('retired_at')
                ->select('publication_status', DB::raw('COUNT(*) as c'))
                ->groupBy('publication_status')->pluck('c', 'publication_status')->all(),
            'publishedLessonsWithNoPublishedModule' => $publishedWithoutPublishedModules,
            'publishedLessonsWithUnpublishedModules' => $publishedWithSomeUnpublished,
        ];
    }

    private function learningPointHealth(): array
    {
        $modules = LessonModule::whereNull('retired_at')->get(['id', 'lesson_id', 'code', 'stage', 'teaches_learning_point_codes']);
        $knownCodes = LearningPoint::pluck('code')->flip();

        $withoutLp = [];
        $teachingWithoutLp = [];
        $unknownRefs = [];

        foreach ($modules as $module) {
            $codes = $module->teaches_learning_point_codes;

            if ($codes === null || $codes === []) {
                // Attendu pour deux étapes, et pour de bonnes raisons : un
                // module `prerequisite_check` MESURE des acquis antérieurs, un
                // module `evaluation` VÉRIFIE — le contrat interdit même
                // explicitement à une évaluation d'en déclarer
                // (validate-lessons.mjs). Ce n'est donc pas une faute, d'où le
                // regroupement PAR ÉTAPE plutôt qu'une liste brute alarmante.
                //
                // Les AUTRES étapes, elles, enseignent : un module de
                // découverte ou de manipulation sans point déclaré est une
                // métadonnée manquante, et mérite d'être vu.
                $stage = $module->stage ?? 'inconnu';
                $withoutLp[$stage] = ($withoutLp[$stage] ?? 0) + 1;

                if (! in_array($stage, ['prerequisite_check', 'evaluation'], true)) {
                    $teachingWithoutLp[] = [
                        'module' => $module->id,
                        'code' => $module->code,
                        'stage' => $stage,
                    ];
                }

                continue;
            }

            foreach ($codes as $code) {
                if (! $knownCodes->has($code)) {
                    $unknownRefs[] = ['module' => $module->id, 'code' => $code];
                }
            }
        }

        return [
            'modulesWithoutLearningPointsByStage' => $withoutLp,
            // Le sous-ensemble qui compte : les modules qui ENSEIGNENT sans
            // dire quoi. Vide = rien à corriger.
            'teachingModulesWithoutLearningPoints' => $teachingWithoutLp,
            'modulesReferencingUnknownLearningPoints' => $unknownRefs,
            'retiredLearningPointsStillReferenced' => $this->retiredLpStillReferenced(),
        ];
    }

    private function retiredLpStillReferenced(): array
    {
        $retired = LearningPoint::whereNotNull('retired_at')->pluck('code');
        if ($retired->isEmpty()) {
            return [];
        }

        $hits = [];
        foreach (LessonModule::whereNull('retired_at')->whereNotNull('teaches_learning_point_codes')->get() as $module) {
            foreach ($module->teaches_learning_point_codes ?? [] as $code) {
                if ($retired->contains($code)) {
                    $hits[] = ['module' => $module->id, 'code' => $code];
                }
            }
        }

        return $hits;
    }

    private function reportingHealth(): array
    {
        return [
            'byStatus' => StudentReport::select('status', DB::raw('COUNT(*) as c'))
                ->groupBy('status')->pluck('c', 'status')->all(),
            'byPriority' => StudentReport::select('priority', DB::raw('COUNT(*) as c'))
                ->groupBy('priority')->pluck('c', 'priority')->all(),
            'byCategory' => StudentReport::select('category', DB::raw('COUNT(*) as c'))
                ->groupBy('category')->pluck('c', 'category')->all(),
            'unresolved' => StudentReport::whereIn('status', [
                StudentReport::STATUS_NEW, StudentReport::STATUS_IN_REVIEW,
            ])->count(),
            'highOrCritical' => StudentReport::whereIn('priority', ['high', 'critical'])
                ->whereIn('status', [StudentReport::STATUS_NEW, StudentReport::STATUS_IN_REVIEW])
                ->count(),
            // Les signalements pointant un contenu que le registre ne connaît
            // plus : ils restent lisibles (les codes sont conservés en clair),
            // mais leur lien est cassé.
            'orphanedContext' => StudentReport::whereNull('lesson_id')
                ->whereNotNull('lesson_code')->count(),
        ];
    }

    private function loadSource(): ?array
    {
        $path = config('curriculum.registry_export_output_path');
        if (! is_string($path) || ! is_file($path)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : null;
    }
}
