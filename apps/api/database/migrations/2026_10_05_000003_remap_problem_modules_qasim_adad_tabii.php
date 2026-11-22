<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Pilote « مسائل » — 2026-10-05.
 *
 * La leçon qasim-adad-tabii insère trois modules « مسألة » (4, 5, 6) avant son
 * إختبار أولي, qui passe de 4 à 7. La progression stocke les modules terminés
 * PAR NUMÉRO : un « 4 » enregistré avant ce changement désigne l'ancien test.
 * On le renumérote ici, UNE fois — après, « 4 » est la مسألة 1.
 *
 * Même table que le client (packages/core/progress/moduleLayoutMigrations.js) :
 * le client migre son stockage local, le serveur ses lignes ; l'union des deux
 * (LessonProgressService) ne réintroduit donc jamais l'ancien sens.
 *
 * Irréversible par nature (après le déploiement, un « 7 » peut être un vrai
 * test passé dans la nouvelle disposition) : down() ne fait rien.
 */
return new class extends Migration
{
    private const MAP = ['qasim-adad-tabii' => ['4' => '7']];

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
