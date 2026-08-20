<?php

namespace App\Console\Commands;

use App\Domain\Curriculum\Support\CurriculumDiffer;
use App\Models\Grade;
use App\Models\LearningPoint;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class ValidateCurriculum extends Command
{
    protected $signature = 'smarter:validate-curriculum
        {--from-json= : Read a pre-generated curriculum export instead of running the Node export script}
        {--output= : Where to write CURRICULUM_SYNC_REPORT.md (default docs/reports/CURRICULUM_SYNC_REPORT.md at repo root)}
        {--strict : Exit non-zero when any drift is found (CI mode)}';

    protected $description = 'Compare coursesData.js against MySQL and write CURRICULUM_SYNC_REPORT.md — never writes to the database';

    public function handle(): int
    {
        $jsonPath = $this->option('from-json') ?: $this->generateExport();
        if ($jsonPath === null || ! is_file($jsonPath)) {
            $this->error('Curriculum export unavailable.');

            return self::FAILURE;
        }

        $export = json_decode(file_get_contents($jsonPath), true);
        if (! is_array($export) || ! isset($export['grades'])) {
            $this->error('Curriculum export is not valid JSON with a grades key.');

            return self::FAILURE;
        }

        [$sections, $driftCount, $retiredWithEvidence] = $this->analyse($export);
        $durationViolations = $this->checkDurations($export);

        $reportPath = $this->option('output')
            ?: base_path('../../docs/reports/CURRICULUM_SYNC_REPORT.md');
        @mkdir(dirname($reportPath), 0755, true);
        file_put_contents($reportPath, $this->renderReport($sections, $driftCount, $retiredWithEvidence, $durationViolations));

        $this->info("Report written to {$reportPath}");
        $this->line($driftCount === 0
            ? 'No drift: MySQL matches coursesData.js.'
            : "{$driftCount} drift item(s) found — see the report.");
        if ($durationViolations !== []) {
            $this->line(count($durationViolations).' lesson duration violation(s) — see the report.');
        }

        if (($driftCount > 0 || $durationViolations !== []) && $this->option('strict')) {
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @return array{0: array<string, array<string, string[]>>, 1: int, 2: string[]}
     */
    private function analyse(array $export): array
    {
        // Flatten both sides to code-keyed maps, then reuse the importer's
        // pure differ rather than reimplementing comparison logic here.
        $sourceLessons = [];
        $sourcePoints = [];
        $sourceGrades = [];
        $sourceChapters = [];

        foreach ($export['grades'] as $g) {
            $sourceGrades[$g['code']] = ['name' => $g['name'], 'level' => $g['level']];
            foreach ($g['chapters'] as $c) {
                $sourceChapters["{$g['code']}/{$c['code']}"] = ['title' => $c['title']];
                foreach ($c['lessons'] as $l) {
                    $sourceLessons["{$g['code']}/{$l['code']}"] = ['title' => $l['title'], 'status' => $l['status']];
                    foreach ($l['learningPoints'] as $p) {
                        $sourcePoints[$p['code']] = ['title' => $p['title'], 'order' => $p['order']];
                    }
                }
            }
        }

        $dbGrades = [];
        $dbChapters = [];
        $dbLessons = [];
        foreach (Grade::with('chapters.lessons')->get() as $grade) {
            $dbGrades[$grade->code] = ['name' => $grade->name, 'level' => $grade->level];
            foreach ($grade->chapters as $chapter) {
                $dbChapters["{$grade->code}/{$chapter->code}"] = ['title' => $chapter->title];
                foreach ($chapter->lessons as $lesson) {
                    $dbLessons["{$grade->code}/{$lesson->code}"] = ['title' => $lesson->title, 'status' => $lesson->status];
                }
            }
        }

        $dbPoints = [];
        $retiredWithEvidence = [];
        foreach (LearningPoint::withCount('learningEvidence')->get() as $point) {
            if ($point->isRetired()) {
                if ($point->learning_evidence_count > 0) {
                    $retiredWithEvidence[] = $point->code;
                }

                // Retired points are expected to be absent from the source —
                // don't count them as drift.
                continue;
            }
            $dbPoints[$point->code] = ['title' => $point->title, 'order' => $point->order];
        }

        $sections = [
            'Grades' => CurriculumDiffer::diff($sourceGrades, $dbGrades),
            'Chapters' => CurriculumDiffer::diff($sourceChapters, $dbChapters),
            'Lessons' => CurriculumDiffer::diff($sourceLessons, $dbLessons),
            'Learning points' => CurriculumDiffer::diff($sourcePoints, $dbPoints),
        ];

        // In a read-only comparison: 'created' = in source but missing from DB
        // (not yet imported); 'updated' = present in both but drifted;
        // 'retired' = in DB but gone from source (would be retired on import).
        $driftCount = 0;
        foreach ($sections as $diff) {
            $driftCount += count($diff['created']) + count($diff['updated']) + count($diff['retired']);
        }

        return [$sections, $driftCount, $retiredWithEvidence];
    }

    /**
     * The lesson duration cap (packages/core/curriculum/lessonStages.js —
     * MAX_LESSON_MINUTES) is a pedagogical invariant, not sync drift, so it
     * gets its own section; --strict fails on violations all the same. Kept
     * in sync manually with MAX_LESSON_MINUTES since PHP can't import the JS
     * constant directly.
     *
     * @return string[]
     */
    private function checkDurations(array $export): array
    {
        $cap = 90;
        $violations = [];
        foreach ($export['grades'] as $g) {
            foreach ($g['chapters'] as $c) {
                foreach ($c['lessons'] as $l) {
                    $minutes = $l['durationMinutes'] ?? null;
                    $key = "{$g['code']}/{$l['code']}";
                    if ($minutes !== null && $minutes > $cap) {
                        $violations[] = "`{$key}` declares {$minutes} min (cap: {$cap}) — split it";
                    } elseif ($minutes === null && ($l['status'] ?? null) === 'available') {
                        $violations[] = "`{$key}` is available but has no durationMinutes";
                    }
                }
            }
        }

        return $violations;
    }

    /**
     * @param  string[]  $retiredWithEvidence
     * @param  string[]  $durationViolations
     */
    private function renderReport(array $sections, int $driftCount, array $retiredWithEvidence, array $durationViolations): string
    {
        $lines = [
            '# Curriculum Sync Report',
            '',
            'Comparison of `packages/core/curriculum/coursesData.js` (source of truth)',
            'against the MySQL runtime curriculum tables. Generated by',
            '`php artisan smarter:validate-curriculum` — read-only, never writes to the DB.',
            '',
            $driftCount === 0
                ? '**Result: in sync — no drift.**'
                : "**Result: {$driftCount} drift item(s).** Run `php artisan smarter:import-curriculum` to reconcile.",
            '',
        ];

        foreach ($sections as $title => $diff) {
            $lines[] = "## {$title}";
            $lines[] = '';
            $lines[] = sprintf(
                '- Missing from DB (would be created): %d',
                count($diff['created'])
            );
            foreach ($diff['created'] as $code) {
                $lines[] = "  - `{$code}`";
            }
            $lines[] = sprintf('- Drifted (title/order/status differ): %d', count($diff['updated']));
            foreach ($diff['updated'] as $code) {
                $lines[] = "  - `{$code}`";
            }
            $lines[] = sprintf('- In DB but gone from source (would be retired): %d', count($diff['retired']));
            foreach ($diff['retired'] as $code) {
                $lines[] = "  - `{$code}`";
            }
            $lines[] = sprintf('- In sync: %d', count($diff['unchanged']));
            $lines[] = '';
        }

        $lines[] = '## Lesson duration cap (90 min)';
        $lines[] = '';
        if ($durationViolations === []) {
            $lines[] = 'All lessons respect the cap.';
        } else {
            foreach ($durationViolations as $violation) {
                $lines[] = "- {$violation}";
            }
        }
        $lines[] = '';

        $lines[] = '## Retired learning points that still carry evidence (informational)';
        $lines[] = '';
        if ($retiredWithEvidence === []) {
            $lines[] = 'None.';
        } else {
            $lines[] = 'These codes were removed from the curriculum source but keep their';
            $lines[] = 'evidence history (retired, never deleted):';
            foreach ($retiredWithEvidence as $code) {
                $lines[] = "- `{$code}`";
            }
        }
        $lines[] = '';

        return implode("\n", $lines)."\n";
    }

    private function generateExport(): ?string
    {
        $script = config('curriculum.export_script_path');
        $output = config('curriculum.export_output_path');

        $result = Process::run(['node', $script, $output]);
        if (! $result->successful()) {
            $this->error("Curriculum export script failed:\n".$result->errorOutput());

            return null;
        }

        return $output;
    }
}
