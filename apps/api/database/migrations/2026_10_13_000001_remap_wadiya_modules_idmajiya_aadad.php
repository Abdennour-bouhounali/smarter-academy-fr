<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * « وضعيات » d'entraînement — synthèse de l'unité 1 « أدمج تعلّماتي » (2026-10-13).
 *
 * La leçon `wadiya-idmajiya-aadad` supprime « أؤكّد تعلّماتي » (module 2), insère six modules
 * « وضعية تدريبية » (1 à 6), déplace l'analyse de la situation (1 → 7, « تحليل الوضعية النهائية للاختبار »)
 * juste avant « وضعية الاختبار النهائي », qui passe du module 3 au module 8. La progression stocke les
 * modules terminés PAR NUMÉRO : on les remappe UNE fois ; l'ancien « 2 » est ramené à « 0 » (sans effet).
 * On le renumérote ici, UNE fois — même table que le client
 * (packages/core/progress/moduleLayoutMigrations.js, version 2 de la leçon).
 * Modèle : 2026_10_07_000014_remap_problem_modules_unit14_fada.php.
 *
 * Irréversible par nature : down() ne fait rien.
 * Voir docs/architecture/PROGRESS_MODEL.md § Renumérotation des modules.
 */
return new class extends Migration
{
    private const MAP = [
        'wadiya-idmajiya-aadad' => ['1' => '7', '2' => '0', '3' => '8'],
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
