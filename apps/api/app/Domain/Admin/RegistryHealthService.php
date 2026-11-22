<?php

namespace App\Domain\Admin;

use App\Domain\Access\AccessTier;
use App\Models\Chapter;
use App\Models\Grade;
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
            'activation' => $this->activation(),
            'tier' => $this->tier(),
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
        // `toBase()` : `pluck` sur un modèle rend une collection ELOQUENT, dont
        // `diff()` compare des modèles par clé primaire et appelle getKey()
        // sur chaque élément — ce qui lève sur des chaînes. La collection de
        // base compare les valeurs, qui est ce qu'on veut ici.
        $dbLessons = Lesson::pluck('code')->toBase()->unique();

        $sourceModules = collect($source['lessons'] ?? [])
            ->flatMap(fn ($lesson) => collect($lesson['modules'] ?? [])
                ->map(fn ($m) => $lesson['code'].'/'.$m['code']))
            ->unique();

        $dbModules = LessonModule::query()
            ->join('lessons', 'lessons.id', '=', 'lesson_modules.lesson_id')
            ->whereNull('lesson_modules.retired_at')
            ->get(['lessons.code as lesson_code', 'lesson_modules.code'])
            ->map(fn ($r) => $r->lesson_code.'/'.$r->code)
            ->toBase()
            ->unique();

        $sourceExercises = collect($source['exercises'] ?? [])
            ->map(fn ($e) => $e['lessonCode'].'/'.$e['exerciseCode'])
            ->unique();

        $dbExercises = PracticeExercise::query()
            ->join('lessons', 'lessons.id', '=', 'practice_exercises.lesson_id')
            ->whereNull('practice_exercises.retired_at')
            ->get(['lessons.code as lesson_code', 'practice_exercises.exercise_code'])
            ->map(fn ($r) => $r->lesson_code.'/'.$r->exercise_code)
            ->toBase()
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

    /**
     * Activation des classes : la base (`grades.is_active`) doit refléter
     * packages/core/curriculum/activeGrades.js tel qu'exporté par
     * exportCurriculum.mjs. Une dérive signifie qu'un import est en retard —
     * le frontend et l'API ne s'accorderaient plus sur ce qui est ouvert.
     *
     * @return array{active: string[], drift: array<int, array{code: string, database: bool, source: ?bool}>, sourceAvailable: bool}
     */
    private function activation(): array
    {
        $db = Grade::query()->orderBy('order')->get(['code', 'is_active']);

        $export = $this->loadCurriculumExport();
        $source = null;
        if ($export !== null) {
            $source = collect($export)->mapWithKeys(fn ($g) => [$g['code'] => (bool) ($g['active'] ?? false)]);
        }

        $drift = [];
        $unexpected = [];
        if ($source !== null) {
            foreach ($db as $grade) {
                $expected = $source->get($grade->code);

                // ── PÉRIMÈTRE (phase 6F) ────────────────────────────────
                // Une classe EN BASE que le catalogue ne déclare pas n'est
                // pas une simple dérive d'activation : c'est du curriculum
                // que le produit ne connaît pas et que personne ne peut
                // atteindre par une surface légitime. C'est exactement ce
                // que la base portait avant le nettoyage — 8 classes
                // françaises invisibles du catalogue algérien.
                //
                // Signalé à part pour que le message le nomme pour ce qu'il
                // est, et que la porte dise quoi faire (scope-curriculum),
                // au lieu de conseiller un import qui ne l'effacerait pas.
                if ($expected === null) {
                    $unexpected[] = $grade->code;

                    continue;
                }

                if ($expected !== (bool) $grade->is_active) {
                    $drift[] = ['code' => $grade->code, 'database' => (bool) $grade->is_active, 'source' => $expected];
                }
            }
            // Une classe que l'export ACTIVE mais que la base n'a pas encore : l'import
            // est en retard (1AM–3AM, 2026-10-14 — le front les montre, l'API les refuse).
            $known = $db->pluck('code')->all();
            foreach ($source as $code => $active) {
                if ($active && ! in_array($code, $known, true)) {
                    $drift[] = ['code' => $code, 'database' => false, 'source' => true];
                }
            }
        }

        return [
            'active' => $db->where('is_active', true)->pluck('code')->values()->all(),
            'drift' => $drift,
            'unexpectedGrades' => $unexpected,
            'lessonsOutsideCatalogue' => $source !== null ? ($this->lessonsOutsideCatalogue() ?? []) : [],
            'orphans' => $this->curriculumOrphans(),
            'sourceAvailable' => $source !== null,
        ];
    }

    /**
     * Du curriculum rattaché à rien : un chapitre sans classe, une leçon sans
     * chapitre, un point sans leçon.
     *
     * Les clés étrangères rendent cela impossible tant qu'elles sont en
     * place — d'où l'intérêt de le vérifier : si un compte s'en trouve, c'est
     * qu'une suppression a contourné le schéma (SQL manuel, contraintes
     * désactivées, import d'un dump partiel), et la base ne dit plus la
     * vérité sur ce qu'elle contient.
     *
     * @return array{chapters: int, lessons: int, learningPoints: int}
     */
    private function curriculumOrphans(): array
    {
        return [
            'chapters' => Chapter::query()
                ->leftJoin('grades', 'grades.id', '=', 'chapters.grade_id')
                ->whereNull('grades.id')->count(),
            'lessons' => Lesson::query()
                ->leftJoin('chapters', 'chapters.id', '=', 'lessons.chapter_id')
                ->whereNull('chapters.id')->count(),
            'learningPoints' => LearningPoint::query()
                ->leftJoin('lessons', 'lessons.id', '=', 'learning_points.lesson_id')
                ->whereNull('lessons.id')->count(),
        ];
    }

    /**
     * Le PALIER COMMERCIAL, contrôlé sur SA seule autorité : la base.
     *
     * `lessons.tier` est la seule source de vérité du palier, et
     * l'administrateur en est l'autorité (ContentService::changeTier). Le
     * catalogue n'en porte aucun — l'import crée une leçon nouvelle en `free`
     * et ne réécrit jamais celui d'une leçon existante. Comparer la base au
     * catalogue ferait donc passer chaque décision d'administration pour une
     * dérive : ce n'en est pas une, c'est la configuration voulue.
     *
     * Ce qui reste un DÉFAUT, et que ce contrôle signale : un palier absent
     * ou inconnu (NULL, chaîne vide, faute de frappe). AccessTier::normalize()
     * le sert comme gratuit — la protection tient — mais l'administration
     * afficherait une valeur que personne n'a choisie. La règle de
     * ContentService (« une leçon doit porter un palier explicite ») vaut
     * aussi pour la base.
     *
     * Limité aux classes ACTIVES, comme l'activation.
     *
     * @return array{invalid: array<int, array{code: string, grade: string, database: ?string}>, counts: array<string, int>, checked: int, authority: string}
     */
    private function tier(): array
    {
        $rows = Lesson::query()
            ->join('chapters', 'chapters.id', '=', 'lessons.chapter_id')
            ->join('grades', 'grades.id', '=', 'chapters.grade_id')
            ->where('grades.is_active', true)
            ->get(['lessons.code', 'lessons.tier', 'grades.code as grade_code']);

        $invalid = [];
        $counts = array_fill_keys(AccessTier::TIERS, 0);

        foreach ($rows as $row) {
            if (! in_array($row->tier, AccessTier::TIERS, true)) {
                $invalid[] = ['code' => $row->code, 'grade' => $row->grade_code, 'database' => $row->tier];

                continue;
            }
            $counts[$row->tier]++;
        }

        return [
            'invalid' => $invalid,
            'counts' => $counts,
            'checked' => $rows->count(),
            'authority' => 'database',
        ];
    }

    /**
     * L'IDENTITÉ du curriculum : une leçon en base, sous une classe active,
     * dont le catalogue ne déclare pas le code.
     *
     * Ce contrôle vivait jusqu'ici dans celui du palier (« source absente »).
     * Il n'a rien à voir avec l'argent : c'est une question de périmètre — la
     * base porte une leçon que le produit ne connaît plus. `smarter:prune-
     * retired-learning-points` la retire si elle ne porte aucun historique.
     *
     * @return string[]|null null quand l'export est introuvable
     */
    private function lessonsOutsideCatalogue(): ?array
    {
        $export = $this->loadCurriculumExport();
        if ($export === null) {
            return null;
        }

        $known = [];
        foreach ($export as $grade) {
            foreach ($grade['chapters'] ?? [] as $chapter) {
                foreach ($chapter['lessons'] ?? [] as $lesson) {
                    $known[$lesson['code']] = true;
                }
            }
        }

        return Lesson::query()
            ->join('chapters', 'chapters.id', '=', 'lessons.chapter_id')
            ->join('grades', 'grades.id', '=', 'chapters.grade_id')
            ->where('grades.is_active', true)
            ->pluck('lessons.code')
            ->reject(fn (string $code) => isset($known[$code]))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * L'export du catalogue, décodé — la même source que lit l'import, donc
     * les deux ne peuvent pas être en désaccord sur ce qu'est « la source ».
     *
     * Null si le fichier manque : les contrôles qui en dépendent se déclarent
     * indisponibles plutôt que de conclure à tort.
     *
     * @return array<int, array<string, mixed>>|null
     */
    private function loadCurriculumExport(): ?array
    {
        $path = config('curriculum.export_output_path');

        if (! is_string($path) || ! is_file($path)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) && isset($decoded['grades']) ? $decoded['grades'] : null;
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
