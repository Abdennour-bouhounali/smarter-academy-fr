<?php

namespace App\Domain\Curriculum;

use App\Domain\Curriculum\Support\CurriculumDiffer;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
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
     *         Each entry: {created: string[], updated: string[], retired: string[], unchanged: string[]}
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
            'lessons' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
            'learningPoints' => ['created' => [], 'updated' => [], 'retired' => [], 'unchanged' => []],
        ];

        foreach ($export['grades'] as $gradeData) {
            $gradeSource = [
                'name' => $gradeData['name'],
                'level' => $gradeData['level'],
                'order' => $gradeData['order'] ?? 0,
            ];
            $existingGrade = Grade::where('code', $gradeData['code'])->first();
            $this->recordDiff($summary['grades'], $gradeData['code'], $existingGrade?->only(array_keys($gradeSource)), $gradeSource);

            $grade = Grade::updateOrCreate(['code' => $gradeData['code']], $gradeSource);

            foreach ($gradeData['chapters'] as $chapterData) {
                $chapterSource = [
                    'title' => $chapterData['title'],
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

                foreach ($chapterData['lessons'] as $lessonData) {
                    $lessonSource = [
                        'official_object_code' => $lessonData['officialObjectCode'],
                        'title' => $lessonData['title'],
                        'description' => $lessonData['description'],
                        'status' => $lessonData['status'],
                        'duration_minutes' => $lessonData['durationMinutes'] ?? null,
                        'tier' => $lessonData['tier'] ?? 'premium',
                        'order' => $lessonData['order'],
                    ];
                    $existingLesson = Lesson::where('chapter_id', $chapter->id)->where('code', $lessonData['code'])->first();
                    $this->recordDiff(
                        $summary['lessons'],
                        "{$gradeData['code']}/{$lessonData['code']}",
                        $existingLesson?->only(array_keys($lessonSource)),
                        $lessonSource
                    );

                    $lesson = Lesson::updateOrCreate(
                        ['chapter_id' => $chapter->id, 'code' => $lessonData['code']],
                        $lessonSource
                    );

                    $this->importLearningPoints($lesson, $lessonData['learningPoints'], $summary['learningPoints']);
                }
            }
        }

        return $summary;
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
