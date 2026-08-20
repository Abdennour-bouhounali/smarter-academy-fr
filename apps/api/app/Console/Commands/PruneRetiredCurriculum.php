<?php

namespace App\Console\Commands;

use App\Models\LearningPoint;
use App\Models\Lesson;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;

/**
 * One-off cleanup companion to smarter:import-curriculum. The importer never
 * deletes anything: a renamed lesson leaves its old row (and retired learning
 * points) behind forever. That caution exists to protect evidence history —
 * but rows with NO evidence and NO progress are pure dead weight, e.g. the
 * pre-split lesson codes ('fractions' next to 'fractions-1'/'fractions-2')
 * left over from the 45-minute split. This command deletes only those
 * provably-unreferenced rows; anything carrying history is kept untouched.
 */
class PruneRetiredCurriculum extends Command
{
    protected $signature = 'smarter:prune-retired-learning-points
        {--from-json= : Read a pre-generated curriculum export instead of running the Node export script}
        {--dry-run : Report what would be deleted without deleting}';

    protected $description = 'Delete retired learning points and orphaned lessons that carry no evidence and no student progress';

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

        $sourceLessonCodes = [];
        foreach ($export['grades'] as $g) {
            foreach ($g['chapters'] as $c) {
                foreach ($c['lessons'] as $l) {
                    $sourceLessonCodes[$l['code']] = true;
                }
            }
        }

        // Retired learning points with no evidence — safe to drop.
        $prunablePoints = LearningPoint::whereNotNull('retired_at')
            ->whereDoesntHave('learningEvidence')
            ->get();

        // Lessons gone from the source with no evidence, no lesson progress,
        // and no learning point still carrying evidence (a cascade delete
        // would otherwise take evidence-bearing retired points with it).
        $prunableLessons = Lesson::whereNotIn('code', array_keys($sourceLessonCodes))
            ->whereDoesntHave('learningPoints.learningEvidence')
            ->whereNotIn('id', DB::table('learning_evidence')->select('lesson_id'))
            ->whereNotIn('id', DB::table('student_lesson_progress')->select('lesson_id'))
            ->get();

        foreach ($prunablePoints as $point) {
            $this->line("learning point `{$point->code}`");
        }
        foreach ($prunableLessons as $lesson) {
            $this->line("lesson `{$lesson->code}`");
        }
        $this->info(sprintf(
            '%d retired learning point(s) and %d orphaned lesson(s) %s.',
            $prunablePoints->count(),
            $prunableLessons->count(),
            $this->option('dry-run') ? 'would be deleted' : 'deleted'
        ));

        if (! $this->option('dry-run')) {
            DB::transaction(function () use ($prunablePoints, $prunableLessons) {
                LearningPoint::whereIn('id', $prunablePoints->pluck('id'))->delete();
                Lesson::whereIn('id', $prunableLessons->pluck('id'))->delete();
            });
        }

        return self::SUCCESS;
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
