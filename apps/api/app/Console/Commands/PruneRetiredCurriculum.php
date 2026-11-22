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
 *
 * ── `--with-history`, et pourquoi il n'est PAS le défaut ─────────────────
 * Une leçon retirée du catalogue mais PORTEUSE d'historique (preuves,
 * progression, tentative de test final) est délibérément conservée : c'est la
 * décision de la phase 8 pour le prototype `pgcd`, « la progression des élèves
 * qui l'avaient ouverte reste lisible ». En production, c'est la seule
 * conduite acceptable.
 *
 * Sur une base de DÉVELOPPEMENT, cet historique appartient à des comptes
 * d'essai, et la ligne résiduelle fait échouer `smarter:registry-health
 * --gate` (qui contrôle toutes les leçons d'une classe active, archivées
 * comprises). `--with-history` permet alors de réconcilier la base avec le
 * catalogue de fichiers.
 *
 * Trois verrous, parce que le geste est irréversible :
 *   1. il refuse de s'exécuter hors d'un environnement local ;
 *   2. il exige `--force` en plus du drapeau ;
 *   3. il énumère, avant de détruire, ce que chaque leçon emporte.
 *
 *     php artisan smarter:prune-retired-learning-points --dry-run
 *     php artisan smarter:prune-retired-learning-points --with-history --dry-run
 *     php artisan smarter:prune-retired-learning-points --with-history --force
 */
class PruneRetiredCurriculum extends Command
{
    protected $signature = 'smarter:prune-retired-learning-points
        {--from-json= : Read a pre-generated curriculum export instead of running the Node export script}
        {--dry-run : Report what would be deleted without deleting}
        {--with-history : DEV ONLY — also delete catalogue-absent lessons that still carry evidence/progress}
        {--delete-lesson=* : ANY ENV — delete only these named catalogue-absent lessons, history included (owner decision; needs --force)}
        {--force : Required with --with-history or --delete-lesson to actually delete}';

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

        if ($this->option('delete-lesson')) {
            return $this->deleteNamedLessons((array) $this->option('delete-lesson'), $sourceLessonCodes);
        }

        // Retired learning points with no evidence — safe to drop.
        $prunablePoints = LearningPoint::whereNotNull('retired_at')
            ->whereDoesntHave('learningEvidence')
            ->get();

        // Lessons gone from the source with no evidence, no lesson progress,
        // and no learning point still carrying evidence (a cascade delete
        // would otherwise take evidence-bearing retired points with it).
        //
        // Since 2026-09-25 this runs on EVERY production deploy (deploy.yml,
        // after the curriculum sync), so « no history » is checked against
        // every table a student writes for a lesson — not only evidence and
        // progress. A lesson a student ever touched is never deleted here.
        $prunableLessons = Lesson::whereNotIn('code', array_keys($sourceLessonCodes))
            ->whereDoesntHave('learningPoints.learningEvidence')
            ->whereNotIn('id', DB::table('learning_evidence')->select('lesson_id'))
            ->whereNotIn('id', DB::table('student_lesson_progress')->select('lesson_id'))
            ->whereNotIn('id', DB::table('lesson_final_test_attempts')->select('lesson_id'))
            ->whereNotIn('id', DB::table('practice_sessions')->select('lesson_id'))
            ->whereNotIn('id', DB::table('learning_points')
                ->join('student_learning_point_progress', 'student_learning_point_progress.learning_point_id', '=', 'learning_points.id')
                ->select('learning_points.lesson_id'))
            ->get();

        // ── Les leçons absentes du catalogue MAIS porteuses d'historique ──
        // Conservées par défaut (voir l'en-tête). `--with-history` les ajoute,
        // en développement seulement.
        $withHistory = (bool) $this->option('with-history');
        $historyLessons = collect();

        if ($withHistory) {
            if (! app()->environment('local')) {
                $this->error('--with-history ne s\'exécute qu\'en environnement local (APP_ENV='.app()->environment().').');

                return self::FAILURE;
            }

            $historyLessons = Lesson::whereNotIn('code', array_keys($sourceLessonCodes))
                ->whereNotIn('id', $prunableLessons->pluck('id'))
                ->get();
        }

        // ── Kept for history, but never served ───────────────────────────
        // A catalogue-absent lesson that carries history is KEPT (above). It
        // has no content any more — no route, no card — so it must not stay
        // published: the API would still accept writes on it, and the admin
        // would list it as live. It is ARCHIVED instead, the same act as
        // `smarter:curriculum-sql --retire-lesson`: the history stays readable,
        // nothing is deleted. Only lessons not already archived, and not those
        // --with-history is about to delete.
        $toArchive = Lesson::whereNotIn('code', array_keys($sourceLessonCodes))
            ->whereNotIn('id', $prunableLessons->pluck('id'))
            ->whereNotIn('id', $historyLessons->pluck('id'))
            ->where('publication_status', '!=', Lesson::PUB_ARCHIVED)
            ->get();

        foreach ($toArchive as $lesson) {
            $this->line("lesson `{$lesson->code}` — absent from the catalogue, carries history: archived, not deleted");
        }

        foreach ($prunablePoints as $point) {
            $this->line("learning point `{$point->code}`");
        }
        foreach ($prunableLessons as $lesson) {
            $this->line("lesson `{$lesson->code}`");
        }

        foreach ($historyLessons as $lesson) {
            $this->warn("lesson `{$lesson->code}` — ABSENTE DU CATALOGUE, PORTEUSE D'HISTORIQUE :");
            foreach ($this->dependents($lesson) as $label => $count) {
                if ($count > 0) {
                    $this->line("    {$label}: {$count}");
                }
            }
        }

        // La confirmation se décide AVANT le résumé : sans elle, rien n'est
        // supprimé, et le résumé ne doit donc pas dire « supprimé ».
        $blocked = $historyLessons->isNotEmpty() && ! $this->option('dry-run') && ! $this->option('force');
        $willDelete = ! $this->option('dry-run') && ! $blocked;

        $this->info(sprintf(
            '%d retired learning point(s), %d orphaned lesson(s) and %d lesson(s) with history %s; %d lesson(s) kept for history %s.',
            $prunablePoints->count(),
            $prunableLessons->count(),
            $historyLessons->count(),
            $willDelete ? 'deleted' : 'would be deleted',
            $toArchive->count(),
            $willDelete ? 'archived' : 'would be archived'
        ));

        if ($blocked) {
            $this->error('--with-history détruit de l\'historique : ajoutez --force pour confirmer. Rien n\'a été supprimé.');

            return self::FAILURE;
        }

        if ($willDelete) {
            DB::transaction(function () use ($prunablePoints, $prunableLessons, $historyLessons, $toArchive) {
                Lesson::whereIn('id', $toArchive->pluck('id'))->update([
                    'publication_status' => Lesson::PUB_ARCHIVED,
                    'archived_at' => now(),
                ]);
                LearningPoint::whereIn('id', $prunablePoints->pluck('id'))->delete();
                Lesson::whereIn('id', $prunableLessons->pluck('id'))->delete();
                // Les clés étrangères sont en ON DELETE CASCADE : points
                // d'apprentissage, preuves, progression, tentatives et
                // exercices partent avec la leçon, sans ligne orpheline.
                Lesson::whereIn('id', $historyLessons->pluck('id'))->delete();
            });
        }

        return self::SUCCESS;
    }

    /**
     * `--delete-lesson=<code>` — l'owner décide qu'une leçon retirée du
     * catalogue doit DISPARAÎTRE, historique compris (2026-10-28, le prototype
     * `pgcd` : archivée à chaque déploiement, l'owner la veut supprimée).
     * Contrairement à `--with-history`, permis en production, mais ciblé :
     * seules les leçons NOMMÉES, et seulement si le catalogue ne les déclare
     * plus — une leçon vivante ne peut pas être supprimée par ce chemin. Les
     * clés étrangères emportent le reste (CASCADE, ou NULL pour les notes du
     * cahier, les rapports et les interventions de classe).
     *
     * @param  array<int, string>  $codes
     * @param  array<string, true>  $sourceLessonCodes
     */
    private function deleteNamedLessons(array $codes, array $sourceLessonCodes): int
    {
        $declared = array_values(array_filter($codes, fn ($code) => isset($sourceLessonCodes[$code])));
        if ($declared !== []) {
            $this->error('Le catalogue déclare encore : '.implode(', ', $declared).'. Rien n\'a été supprimé.');

            return self::FAILURE;
        }

        $lessons = Lesson::whereIn('code', $codes)->get();
        foreach (array_diff($codes, $lessons->pluck('code')->all()) as $missing) {
            $this->line("lesson `{$missing}` — absent from the database, nothing to delete");
        }

        foreach ($lessons as $lesson) {
            $this->warn("lesson `{$lesson->code}` — {$lesson->title} :");
            foreach ($this->dependents($lesson) as $label => $count) {
                if ($count > 0) {
                    $this->line("    {$label}: {$count}");
                }
            }
        }

        if ($this->option('dry-run')) {
            $this->info(sprintf('%d lesson(s) would be deleted.', $lessons->count()));

            return self::SUCCESS;
        }

        if (! $this->option('force')) {
            $this->error('--delete-lesson détruit de l\'historique : ajoutez --force pour confirmer. Rien n\'a été supprimé.');

            return self::FAILURE;
        }

        Lesson::whereIn('id', $lessons->pluck('id'))->delete();
        $this->info(sprintf('%d lesson(s) deleted.', $lessons->count()));

        return self::SUCCESS;
    }

    /**
     * Ce qu'une leçon emporterait avec elle — compté AVANT toute suppression,
     * pour que la destruction soit lue plutôt qu'espérée.
     *
     * @return array<string, int>
     */
    private function dependents(Lesson $lesson): array
    {
        $pointIds = DB::table('learning_points')->where('lesson_id', $lesson->id)->pluck('id');

        $counts = ['learning_points' => $pointIds->count()];

        foreach ([
            'lesson_modules', 'lesson_resources', 'practice_exercises', 'practice_sessions',
            'learning_evidence', 'student_lesson_progress', 'lesson_final_test_attempts',
        ] as $table) {
            $counts[$table] = DB::table($table)->where('lesson_id', $lesson->id)->count();
        }

        $counts['student_learning_point_progress'] = $pointIds->isEmpty() ? 0
            : DB::table('student_learning_point_progress')->whereIn('learning_point_id', $pointIds)->count();

        return $counts;
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
