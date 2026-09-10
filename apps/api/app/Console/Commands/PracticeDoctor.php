<?php

namespace App\Console\Commands;

use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\PracticeCapability;
use App\Models\LearningPoint;
use Illuminate\Console\Command;
use Throwable;

/**
 * Vérifie que le serveur voit bien le contenu de pratique.
 *
 * Écrite après s'être fait prendre : le dépôt d'exercices met son index en
 * cache, et un index mis en cache AVANT que les exercices n'existent laisse
 * un Hub vide et parfaitement silencieux — aucune erreur, aucune trace, juste
 * zéro niveau. Le même piège attend tout déploiement où content/ n'a pas été
 * synchronisé à côté de l'API.
 *
 *   php artisan smarter:practice-doctor [--clear]
 */
class PracticeDoctor extends Command
{
    protected $signature = 'smarter:practice-doctor {--clear : vide le cache du contenu avant de vérifier}';

    protected $description = 'Diagnostique le contenu du moteur d\'exercices (chemin, index, learning points)';

    public function handle(ExerciseRepository $exercises): int
    {
        if ($this->option('clear')) {
            $this->call('cache:clear');
        }

        $this->line('Chemin du contenu : '.config('practice.content_path'));

        try {
            $this->line('Résolu            : '.$exercises->contentPath());
        } catch (Throwable $e) {
            $this->error($e->getMessage());
            $this->warn('Sur un déploiement, synchronisez content/ ou définissez PRACTICE_CONTENT_PATH.');

            return self::FAILURE;
        }

        $active = PracticeCapability::activeLessons();
        if ($active === []) {
            $this->error('Aucune leçon activée — content/practice/active.json est vide ou illisible.');

            return self::FAILURE;
        }

        $failed = false;
        foreach ($active as $lessonCode) {
            $counts = $exercises->countsByLevel($lessonCode);
            $total = array_sum($counts);
            $this->newLine();
            $this->line("Leçon « {$lessonCode} » : {$total} exercice(s)");

            if ($total === 0) {
                $this->error('  Index VIDE. Si les fichiers existent, le cache est périmé : relancez avec --clear.');
                $failed = true;

                continue;
            }

            foreach ($counts as $level => $n) {
                $this->line("  niveau {$level} : {$n}".($n < 3 ? '  ⚠ moins de 3' : ''));
            }

            // Un code de learning point absent de la base rendrait toute
            // preuve impossible à enregistrer — au moment de répondre, trop tard.
            $missing = [];
            foreach ($exercises->allIdsFor($lessonCode) as $id) {
                foreach ($exercises->find($lessonCode, $id)['questions'] ?? [] as $q) {
                    foreach ($q['learningPoints'] ?? [] as $lp) {
                        if (! LearningPoint::where('code', $lp['code'])->whereNull('retired_at')->exists()) {
                            $missing[$lp['code']] = true;
                        }
                    }
                }
            }
            if ($missing !== []) {
                $this->error('  Learning points absents de la base : '.implode(', ', array_keys($missing)));
                $this->warn('  Lancez `php artisan smarter:import-curriculum`.');
                $failed = true;
            } else {
                $this->info('  Tous les learning points existent en base.');
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
