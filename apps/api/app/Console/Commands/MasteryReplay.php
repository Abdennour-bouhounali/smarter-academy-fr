<?php

namespace App\Console\Commands;

use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Replay\ReplayService;
use App\Models\LearningPoint;
use App\Models\MasteryReplay as ReplayRun;
use Illuminate\Console\Command;
use Throwable;

/**
 * Rejoue la preuve immuable et reconstruit l'état de maîtrise.
 *
 *   php artisan smarter:mastery:replay --all --dry-run --report=storage/replay.json
 *   php artisan smarter:mastery:replay --all --engine=2
 *   php artisan smarter:mastery:replay --user=42 --lp=4am_tayin-pgcd_P1
 *   php artisan smarter:mastery:replay --lesson=tayin-pgcd --engine=1     # retour arrière
 *
 * Déterministe (même preuve + même version ⇒ même état), idempotent (rejouer
 * deux fois ne change rien), par lots, et journalisé dans mastery_replays. Le
 * dry-run écrit le diff sans toucher une ligne : c'est ce qu'un humain relit
 * avant de basculer de version.
 */
class MasteryReplay extends Command
{
    protected $signature = 'smarter:mastery:replay
        {--engine= : Version du moteur (défaut : config mastery.engine_version)}
        {--user= : Un élève (id)}
        {--lp= : Un learning point (code ou id)}
        {--lesson= : Une leçon (code)}
        {--all : Tous les couples ayant de la preuve}
        {--dry-run : Calculer le diff sans écrire}
        {--report= : Écrire le diff complet en JSON à ce chemin}
        {--chunk=500 : Taille des lots}';

    protected $description = 'Reconstruit student_learning_point_progress depuis learning_evidence (Mastery V2).';

    public function handle(ReplayService $replay, EngineRegistry $engines): int
    {
        $version = $this->option('engine') !== null ? (int) $this->option('engine') : (int) config('mastery.engine_version');
        $engine = $engines->version($version);
        $dryRun = (bool) $this->option('dry-run');

        $scope = [];
        $scopeName = 'all';
        $scopeId = null;
        if ($this->option('user') !== null) {
            $scope['user'] = (int) $this->option('user');
            $scopeName = 'user';
            $scopeId = (string) $scope['user'];
        }
        if ($this->option('lp') !== null) {
            $lp = ctype_digit((string) $this->option('lp'))
                ? LearningPoint::find((int) $this->option('lp'))
                : LearningPoint::where('code', $this->option('lp'))->first();
            if ($lp === null) {
                $this->error("Learning point introuvable : {$this->option('lp')}");

                return self::FAILURE;
            }
            $scope['learningPoint'] = $lp->id;
            $scopeName = 'learning_point';
            $scopeId = $lp->code;
        }
        if ($this->option('lesson') !== null) {
            $lessonId = ReplayService::lessonId((string) $this->option('lesson'));
            if ($lessonId === null) {
                $this->error("Leçon introuvable : {$this->option('lesson')}");

                return self::FAILURE;
            }
            $scope['lesson'] = $lessonId;
            $scopeName = 'lesson';
            $scopeId = (string) $this->option('lesson');
        }
        if ($scope === [] && ! $this->option('all')) {
            $this->error('Précisez un périmètre : --user, --lp, --lesson ou --all.');

            return self::FAILURE;
        }

        $run = ReplayRun::create([
            'engine_version' => $engine->version(),
            'scope' => $scopeName,
            'scope_id' => $scopeId,
            'dry_run' => $dryRun,
            'status' => ReplayRun::STATUS_RUNNING,
            'started_at' => now(),
        ]);

        $summary = [
            'engineVersion' => $engine->version(),
            'dryRun' => $dryRun,
            'statusBefore' => [],
            'statusAfter' => [],
            'transitions' => [],
            'reasonsAfter' => [],
            'changed' => 0,
            'total' => 0,
            'examples' => [],
        ];
        $details = [];

        try {
            foreach ($replay->pairs($scope)->chunk((int) $this->option('chunk')) as $chunk) {
                foreach ($chunk as $pair) {
                    $result = $replay->recompute((int) $pair->user_id, (int) $pair->learning_point_id, $engine, $dryRun);
                    $summary['total']++;

                    $before = $result['before']['status'] ?? 'none';
                    $after = $result['after']['status'];
                    $summary['statusBefore'][$before] = ($summary['statusBefore'][$before] ?? 0) + 1;
                    $summary['statusAfter'][$after] = ($summary['statusAfter'][$after] ?? 0) + 1;
                    $summary['reasonsAfter'][$result['after']['statusReason']] = ($summary['reasonsAfter'][$result['after']['statusReason']] ?? 0) + 1;
                    if ($result['changed']) {
                        $summary['changed']++;
                        $key = "{$before} -> {$after}";
                        $summary['transitions'][$key] = ($summary['transitions'][$key] ?? 0) + 1;
                        if (count($summary['examples']) < 50) {
                            $summary['examples'][] = ['userId' => $pair->user_id, 'learningPointId' => $pair->learning_point_id] + $result;
                        }
                    }
                    if ($this->option('report') !== null) {
                        $details[] = ['userId' => $pair->user_id, 'learningPointId' => $pair->learning_point_id] + $result;
                    }
                }
                $run->update(['pairs_done' => $summary['total'], 'pairs_changed' => $summary['changed']]);
            }
        } catch (Throwable $e) {
            $run->update(['status' => ReplayRun::STATUS_FAILED, 'error' => $e->getMessage(), 'finished_at' => now(), 'diff_summary' => $summary]);
            $this->error("Rejeu interrompu : {$e->getMessage()}");

            return self::FAILURE;
        }

        $run->update([
            'status' => ReplayRun::STATUS_COMPLETED,
            'pairs_total' => $summary['total'],
            'pairs_done' => $summary['total'],
            'pairs_changed' => $summary['changed'],
            'diff_summary' => $summary,
            'finished_at' => now(),
        ]);

        if ($this->option('report') !== null) {
            file_put_contents((string) $this->option('report'), json_encode(['summary' => $summary, 'pairs' => $details], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->line("Rapport écrit : {$this->option('report')}");
        }

        $this->table(['couples', 'modifiés', 'avant', 'après', 'raisons'], [[
            $summary['total'],
            $summary['changed'],
            json_encode($summary['statusBefore']),
            json_encode($summary['statusAfter']),
            json_encode($summary['reasonsAfter']),
        ]]);
        foreach ($summary['transitions'] as $transition => $count) {
            $this->line("  {$transition}: {$count}");
        }
        $this->info(($dryRun ? 'Dry run — rien n\'a été écrit. ' : 'État reconstruit. ')."Journal : mastery_replays #{$run->id}");

        return self::SUCCESS;
    }
}
