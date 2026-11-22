<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Déploiement « مسائل » — unité 11 « الأشعة والانسحاب » (2026-10-07).
 *
 * Quatre leçons insèrent trois modules « مسألة » avant leur إختبار أولي, qui est
 * renuméroté (4 → 7 ou 5 → 8). La progression stocke les modules terminés PAR
 * NUMÉRO : un ancien « 4 » / « 5 » désigne l'ancien test. On le renumérote ici,
 * UNE fois — même table que le client (packages/core/progress/moduleLayoutMigrations.js,
 * version 2 de chaque leçon). Modèle : 2026_10_05_000003_remap_problem_modules_qasim_adad_tabii.php.
 *
 * Irréversible par nature : down() ne fait rien.
 * Voir docs/architecture/PROGRESS_MODEL.md § Renumérotation des modules.
 */
return new class extends Migration
{
    private const MAP = [
        'insihab-shuaa' => ['5' => '8'],
        'shuaayn-mutasawiyayn' => ['5' => '8'],
        'majmu-shuaayn' => ['5' => '8'],
        'barahin-ashia' => ['5' => '8'],
    ];

    public function up(): void
    {
        foreach (self::MAP as $code => $map) {
            $lessonIds = DB::table('lessons')->where('code', $code)->pluck('id');
            if ($lessonIds->isEmpty()) {
                continue;
            }

            DB::table('student_lesson_progress')->whereIn('lesson_id', $lessonIds)->orderBy('id')
                ->each(function ($row) use ($map) {
                    $completed = array_map('strval', json_decode($row->completed_modules ?? '[]', true) ?: []);
                    $remapped = array_values(array_unique(array_map(fn ($m) => $map[$m] ?? $m, $completed)));
                    $current = $row->current_module !== null && isset($map[(string) $row->current_module])
                        ? (int) $map[(string) $row->current_module]
                        : $row->current_module;

                    DB::table('student_lesson_progress')->where('id', $row->id)->update([
                        'completed_modules' => json_encode($remapped),
                        'current_module' => $current,
                    ]);
                });
        }
    }

    public function down(): void
    {
        // Irréversible : voir l'en-tête.
    }
};
