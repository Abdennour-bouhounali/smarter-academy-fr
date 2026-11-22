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
 *   php artisan smarter:practice-doctor [--clear] [--expect-active=SHA256] [--expect-index=SHA256]
 *
 * Le déploiement l'exécute après avoir synchronisé content/practice/, avec
 * les empreintes de active.json et index.generated.json du commit déployé :
 * un contenu absent, périmé ou lu ailleurs (PRACTICE_*_PATH) fait ÉCHOUER le
 * déploiement au lieu de laisser chaque aperçu de pratique répondre 422
 * (incident du 2026-09-25 — le pipeline ne livrait pas content/practice/).
 */
class PracticeDoctor extends Command
{
    protected $signature = 'smarter:practice-doctor
        {--clear : vide le cache du contenu avant de vérifier}
        {--expect-active= : empreinte SHA-256 attendue de active.json}
        {--expect-index= : empreinte SHA-256 attendue de index.generated.json}';

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

        // Le serveur lit-il LE contenu du commit déployé ?
        $fingerprints = [
            'active.json' => [PracticeCapability::path(), $this->option('expect-active')],
            'index.generated.json' => [$exercises->contentPath().'/index.generated.json', $this->option('expect-index')],
        ];
        foreach ($fingerprints as $name => [$file, $expected]) {
            if ($file === null || ! is_file($file)) {
                $this->error("{$name} introuvable (config practice.*_path).");

                return self::FAILURE;
            }
            $actual = hash_file('sha256', $file);
            $this->line(sprintf('%-22s %s  %s', $name, substr($actual, 0, 12), $file));
            if (is_string($expected) && $expected !== '' && ! hash_equals($expected, $actual)) {
                $this->error("{$name} ne correspond pas au commit déployé (attendu ".substr($expected, 0, 12).').');

                return self::FAILURE;
            }
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
