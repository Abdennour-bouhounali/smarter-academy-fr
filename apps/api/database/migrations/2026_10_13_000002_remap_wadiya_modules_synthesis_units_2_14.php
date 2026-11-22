<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * « وضعيات » d'entraînement — synthèses « أدمج تعلّماتي » des unités 2 à 14 (2026-10-13).
 *
 * Chaque leçon `wadiya-idmajiya-*` prend le format de l'unité 1 : six modules « الوضعية التدريبية » (1 à 6) après « أستعدّ »,
 * l'ancien module 1 devient 7 (analyse), le test final devient 8 ; « أؤكّد تعلّماتي » et « أتعمّق » sont supprimés (→ 0). La progression stocke les modules terminés PAR NUMÉRO : on les remappe UNE fois,
 * avec la même table que le client (packages/core/progress/moduleLayoutMigrations.js, version 2 de chaque leçon).
 * Modèle : 2026_10_13_000001_remap_wadiya_modules_idmajiya_aadad.php (unité 1).
 *
 * Irréversible par nature : down() ne fait rien.
 * Voir docs/architecture/PROGRESS_MODEL.md § Renumérotation des modules.
 */
return new class extends Migration
{
    private const MAP = [
        'wadiya-idmajiya-ashia' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-dawaran' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-fada' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-harfi' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-ihsa' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-judhur' => ['1' => '7', '2' => '0', '3' => '8'],
        'wadiya-idmajiya-jumal' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-khattiya' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-maalam' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-muadalat' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-muthallathat' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-taalufiya' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
        'wadiya-idmajiya-talis' => ['1' => '7', '2' => '0', '3' => '0', '4' => '8'],
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
