<?php

namespace App\Domain\Curriculum;

use App\Domain\Access\AccessTier;
use App\Domain\Curriculum\Support\CurriculumDiffer;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;

/**
 * Turns the curriculum JSON export (see packages/core/curriculum/
 * exportCurriculum.mjs — coursesData.js stays the single source of truth,
 * this just mirrors it into MySQL as the runtime index) into idempotent
 * upserts. Learning points are never hard-deleted: a code that disappears
 * from the source is marked retired_at instead, because learning_evidence
 * may already reference it and a cascade delete would orphan that history.
 */
class CurriculumImporter
{
    /**
     * @param  array{grades: array<int, array<string, mixed>>}  $export
     * @return array{grades: array, chapters: array, lessons: array, learningPoints: array}
     *                                                                                      Each entry: {created: string[], updated: string[], retired: string[], unchanged: string[]}
     */
    public function import(array $export, bool $dryRun = false): array
    {
        try {
            return DB::transaction(function () use ($export, $dryRun) {
                $summary = $this->applyImport($export);

                if ($dryRun) {
                    // The diff ran against real data inside the transaction, so
                    // the summary is exact; aborting the transaction (rather
                    // than manually rolling back inside it) is what guarantees
                    // --dry-run writes nothing.
                    throw new DryRunComplete($summary);
                }

                return $summary;
            });
        } catch (DryRunComplete $e) {
            return $e->summary;
        }
    }

    /**
     * @param  array{grades: array<int, array<string, mixed>>}  $export
     */
    private function applyImport(array $export): array
    {
        $summary = [
            'grades' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'chapters' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'units' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'lessons' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'learningPoints' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'lessonPrerequisites' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'learningPointPrerequisites' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
        ];

        // Les arêtes de prérequis sont posées en SECONDE PASSE, une fois toutes
        // les leçons et tous les points de tous les chapitres écrits : une
        // leçon peut dépendre d'une leçon importée après elle.
        $lessonEdges = [];        // [lessonCode => [prereqCode, …]] (codes globalement uniques)
        $pointEdges = [];         // [lpCode => [[code, requiredMastery], …]]
        $lessonIdByCode = [];

        foreach ($export['grades'] as $gradeData) {
            $gradeSource = [
                'name' => $gradeData['name'],
                'level' => $gradeData['level'],
                'order' => $gradeData['order'] ?? 0,
                // Activation travels with the catalogue (activeGrades.js → export →
                // here). Absent from an older export = closed, never open.
                'is_active' => (bool) ($gradeData['active'] ?? false),
            ];
            $existingGrade = Grade::where('code', $gradeData['code'])->first();
            $this->recordDiff($summary['grades'], $gradeData['code'], $existingGrade?->only(array_keys($gradeSource)), $gradeSource);

            $grade = Grade::updateOrCreate(['code' => $gradeData['code']], $gradeSource);

            foreach ($gradeData['chapters'] as $chapterData) {
                $chapterSource = [
                    'title' => $chapterData['title'],
                    // Les SUJETS du programme officiel. Ils voyagent avec le
                    // chapitre parce qu'aucune leçon ne les porte encore : le
                    // découpage en leçons de 4AM est une décision de phase 7
                    // (docs/ALGERIA_4AM_CURRICULUM.md), et la base ne doit pas
                    // la préempter en inventant 28 leçons.
                    //
                    // Un chapitre sans sujets (les chapitres français hérités)
                    // reçoit null, pas un tableau vide : l'absence de sujets
                    // n'est pas une liste vide de sujets.
                    'topics' => ($chapterData['topics'] ?? []) === [] ? null : $chapterData['topics'],
                    'order' => $chapterData['order'],
                ];
                $existingChapter = Chapter::where('grade_id', $grade->id)->where('code', $chapterData['code'])->first();
                $this->recordDiff(
                    $summary['chapters'],
                    "{$gradeData['code']}/{$chapterData['code']}",
                    $existingChapter?->only(array_keys($chapterSource)),
                    $chapterSource
                );

                $chapter = Chapter::updateOrCreate(
                    ['grade_id' => $grade->id, 'code' => $chapterData['code']],
                    $chapterSource
                );

                // Les UNITÉS du manuel (phase 8) — miroir de dz/units_*.json.
                $unitIdByCode = [];
                foreach ($chapterData['units'] ?? [] as $unitData) {
                    $unitSource = [
                        'title' => $unitData['title'],
                        'subtitle' => $unitData['subtitle'] ?? null,
                        'number' => $unitData['number'] ?? null,
                        'objectives' => $unitData['objectives'] ?? null,
                        'source_topic_codes' => $unitData['sourceTopicCodes'] ?? null,
                        'textbook' => $unitData['textbook'] ?? null,
                        'order' => $unitData['order'] ?? 0,
                    ];
                    $existingUnit = Unit::where('chapter_id', $chapter->id)->where('code', $unitData['code'])->first();
                    $this->recordDiff($summary['units'], "{$gradeData['code']}/{$chapterData['code']}/{$unitData['code']}", $existingUnit?->only(array_keys($unitSource)), $unitSource);
                    $unit = Unit::updateOrCreate(['chapter_id' => $chapter->id, 'code' => $unitData['code']], $unitSource);
                    $unitIdByCode[$unitData['code']] = $unit->id;
                }

                foreach ($chapterData['lessons'] as $lessonData) {
                    $lessonSource = [
                        'unit_id' => isset($lessonData['unitCode']) && $lessonData['unitCode'] !== null ? ($unitIdByCode[$lessonData['unitCode']] ?? null) : null,
                        'kind' => $lessonData['kind'] ?? 'lesson',
                        'title_source' => $lessonData['titleSource'] ?? 'official_topic',
                        'textbook_ref' => $lessonData['textbookRef'] ?? null,
                        'official_object_code' => $lessonData['officialObjectCode'],
                        'title' => $lessonData['title'],
                        'description' => $lessonData['description'],
                        'status' => $lessonData['status'],
                        'duration_minutes' => $lessonData['durationMinutes'] ?? null,
                        // PAS de `tier` ici : voir le bloc de création
                        // ci-dessous. Le palier appartient à l'administrateur.
                        'order' => $lessonData['order'],
                    ];
                    $existingLesson = Lesson::where('chapter_id', $chapter->id)->where('code', $lessonData['code'])->first();
                    $this->recordDiff(
                        $summary['lessons'],
                        "{$gradeData['code']}/{$lessonData['code']}",
                        $existingLesson?->only(array_keys($lessonSource)),
                        $lessonSource
                    );

                    // ── Le PALIER : écrit à la CRÉATION, jamais à la mise à jour ──
                    //
                    // `lessons.tier` est la seule source de vérité du palier, et
                    // l'ADMINISTRATEUR en est l'autorité (ContentService::changeTier).
                    // Une synchronisation du catalogue décrit ce qu'est une leçon
                    // — titre, unité, points — jamais qui peut l'ouvrir. Elle ne
                    // touche donc pas au palier d'une leçon existante : une leçon
                    // rendue premium le reste après chaque import et chaque
                    // déploiement, une leçon rendue gratuite aussi.
                    //
                    // Une leçon NOUVELLE naît gratuite. C'est un défaut de création,
                    // pas une classification : aucune liste, aucun identifiant,
                    // aucun chapitre ne la rend gratuite — et un `tier` présent
                    // dans un export ancien est ignoré, pour la même raison.
                    if ($existingLesson === null) {
                        $lesson = Lesson::create(
                            ['chapter_id' => $chapter->id, 'code' => $lessonData['code']]
                            + $lessonSource
                            + ['tier' => AccessTier::FREE]
                            + self::publicationOnCreate($lessonData['status'])
                        );
                    } else {
                        $existingLesson->fill($lessonSource + self::publicationOnUpdate($existingLesson, $lessonData['status']))->save();
                        $lesson = $existingLesson;
                    }

                    $this->importLearningPoints($lesson, $lessonData['learningPoints'], $summary['learningPoints']);

                    $lessonIdByCode[$lessonData['code']] = $lesson->id;
                    $lessonEdges[$lessonData['code']] = $lessonData['prerequisiteLessonCodes'] ?? [];
                    foreach ($lessonData['learningPoints'] as $point) {
                        $pointEdges[$point['code']] = array_map(
                            fn ($p) => [$p['code'], (float) ($p['requiredMastery'] ?? 0.7)],
                            $point['prerequisites'] ?? []
                        );
                    }
                }
            }
        }

        $this->syncLessonPrerequisites($lessonEdges, $lessonIdByCode, $summary['lessonPrerequisites']);
        $this->syncLearningPointPrerequisites($pointEdges, $summary['learningPointPrerequisites']);

        return $summary;
    }

    /**
     * L'ÉTAT DE PUBLICATION d'une leçon NOUVELLE (phase 2 du cycle moyen, 2026-10-14).
     *
     * `lessons.status` (catalogue : `available` / `coming_soon`) dit si la leçon est
     * ÉCRITE ; `lessons.publication_status` est ce que le SERVEUR fait respecter
     * (ContentAccess, Mastery V2, carte de la classe, défi du jour). La colonne naît
     * `published` par défaut : sans cette règle, les 196 leçons `coming_soon` de
     * 1AM–3AM — importées avec leurs الكفاءات (décision D2) — seraient OUVERTES côté
     * serveur alors qu'elles n'ont aucun contenu. Une leçon `coming_soon` naît donc
     * `draft` ; une leçon `available` naît `published` (comportement d'avant).
     */
    private static function publicationOnCreate(string $status): array
    {
        return $status === 'available'
            ? ['publication_status' => Lesson::PUB_PUBLISHED, 'published_at' => now()]
            : ['publication_status' => Lesson::PUB_DRAFT];
    }

    /**
     * L'ÉTAT DE PUBLICATION d'une leçon EXISTANTE. L'administrateur en reste
     * l'autorité ; l'import n'y touche que dans les deux cas où le catalogue
     * l'impose :
     *
     *  - une leçon `coming_soon` n'est jamais `published` (elle n'a pas de
     *    contenu) : `published` → `draft` ; `hidden` / `archived` sont gardés ;
     *  - PUBLIER une leçon générée = la faire passer `coming_soon` → `available`
     *    dans lessons_<g>_*.json (LESSON_DEVELOPMENT_GUIDE « Publish a lesson ») :
     *    si elle est encore au `draft` que l'import lui a donné, elle devient
     *    `published`.
     *  - DÉFAUT PUBLIÉ (propriétaire, 2026-11-11) : une leçon `available` encore
     *    `draft` est publiée à CHAQUE synchronisation — pousser en production
     *    publie, sans geste manuel. Pour RETENIR une leçon écrite, l'admin la
     *    met `hidden` (ou `archived`) : ces deux états sont gardés.
     */
    private static function publicationOnUpdate(Lesson $lesson, string $status): array
    {
        if ($status !== 'available') {
            return $lesson->publication_status === Lesson::PUB_PUBLISHED
                ? ['publication_status' => Lesson::PUB_DRAFT]
                : [];
        }
        if ($lesson->publication_status === Lesson::PUB_DRAFT) {
            return ['publication_status' => Lesson::PUB_PUBLISHED, 'published_at' => now()];
        }

        return [];
    }

    /**
     * Les prérequis PÉDAGOGIQUES entre leçons : la table n'a aucune donnée
     * élève, on la ramène exactement à ce que la source déclare (ajouts et
     * retraits), pour les seules leçons présentes dans l'export.
     *
     * @param  array<string, string[]>  $edges
     * @param  array<string, int>  $idByCode
     */
    private function syncLessonPrerequisites(array $edges, array $idByCode, array &$bucket): void
    {
        foreach ($edges as $code => $prereqCodes) {
            $lesson = Lesson::find($idByCode[$code] ?? null);
            if (! $lesson) {
                continue;
            }
            $wanted = [];
            foreach ($prereqCodes as $pre) {
                if (isset($idByCode[$pre])) {
                    $wanted[] = $idByCode[$pre];
                } else {
                    // Un prérequis vers une leçon inconnue de l'export n'est pas
                    // silencieusement ignoré : il apparaît comme « retired » (non posé).
                    $bucket['retired'][] = "{$code} → {$pre} (leçon inconnue)";
                }
            }
            $current = $lesson->prerequisites()->pluck('lessons.id')->all();
            sort($wanted);
            sort($current);
            if ($wanted === $current) {
                if ($wanted !== []) {
                    $bucket['unchanged'][] = $code;
                }

                continue;
            }
            $lesson->prerequisites()->sync($wanted);
            $bucket[$current === [] ? 'created' : 'updated'][] = $code;
        }
    }

    /**
     * @param  array<string, array<int, array{0: string, 1: float}>>  $edges
     */
    private function syncLearningPointPrerequisites(array $edges, array &$bucket): void
    {
        $codes = array_unique(array_merge(array_keys($edges), ...array_map(fn ($list) => array_column($list, 0), array_values($edges) ?: [[]])));
        $idByCode = LearningPoint::whereIn('code', $codes)->pluck('id', 'code')->all();

        foreach ($edges as $code => $list) {
            $pointId = $idByCode[$code] ?? null;
            if (! $pointId) {
                continue;
            }
            $wanted = [];
            foreach ($list as [$preCode, $mastery]) {
                if (isset($idByCode[$preCode])) {
                    $wanted[$idByCode[$preCode]] = ['required_mastery' => $mastery];
                } else {
                    $bucket['retired'][] = "{$code} → {$preCode} (point inconnu)";
                }
            }
            $point = LearningPoint::find($pointId);
            $current = $point->prerequisites()->pluck('learning_points.id')->all();
            $wantedIds = array_keys($wanted);
            sort($current);
            sort($wantedIds);
            if ($current === $wantedIds) {
                if ($wantedIds !== []) {
                    $bucket['unchanged'][] = $code;
                }
                // Le seuil peut avoir changé sans que l'arête bouge : on le réécrit.
                foreach ($wanted as $preId => $pivot) {
                    $point->prerequisites()->updateExistingPivot($preId, $pivot);
                }

                continue;
            }
            $point->prerequisites()->sync($wanted);
            $bucket[$current === [] ? 'created' : 'updated'][] = $code;
        }
    }

    /**
     * @param  array<int, array{code: string, title: string, order: int}>  $sourcePoints
     */
    private function importLearningPoints(Lesson $lesson, array $sourcePoints, array &$bucket): void
    {
        $source = [];
        foreach ($sourcePoints as $point) {
            $source[$point['code']] = ['title' => $point['title'], 'order' => $point['order']];
        }

        $existing = [];
        foreach (LearningPoint::where('lesson_id', $lesson->id)->get() as $row) {
            if ($row->isRetired() && ! array_key_exists($row->code, $source)) {
                continue; // already retired and still absent — nothing to re-retire
            }
            // A retired point that reappears in the source is compared like any
            // other, so it lands in updated/unchanged and gets un-retired below.
            $existing[$row->code] = ['title' => $row->title, 'order' => $row->order];
        }

        $diff = CurriculumDiffer::diff($source, $existing);

        foreach ($diff['created'] as $code) {
            LearningPoint::updateOrCreate(
                ['code' => $code],
                ['lesson_id' => $lesson->id, ...$source[$code], 'retired_at' => null]
            );
            $bucket['created'][] = $code;
        }
        foreach ($diff['updated'] as $code) {
            LearningPoint::where('code', $code)->update([...$source[$code], 'retired_at' => null]);
            $bucket['updated'][] = $code;
        }
        foreach ($diff['retired'] as $code) {
            LearningPoint::where('code', $code)->whereNull('retired_at')->update(['retired_at' => now()]);
            $bucket['retired'][] = $code;
        }
        foreach ($diff['unchanged'] as $code) {
            // An unchanged-but-previously-retired point reappearing in the
            // source still needs its retirement lifted.
            LearningPoint::where('code', $code)->whereNotNull('retired_at')->update(['retired_at' => null]);
            $bucket['unchanged'][] = $code;
        }
    }

    private function recordDiff(array &$bucket, string $code, ?array $existing, array $source): void
    {
        if ($existing === null) {
            $bucket['created'][] = $code;

            return;
        }

        $diff = CurriculumDiffer::diff([$code => $source], [$code => $existing]);
        $key = $diff['updated'] !== [] ? 'updated' : 'unchanged';
        $bucket[$key][] = $code;
    }
}
