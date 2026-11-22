<?php

namespace App\Console\Commands;

use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Replay\ReplayService;
use App\Domain\Progress\TransitionRecorder;
use App\Models\LearningPointStateTransition;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Reconstruit l'HISTOIRE de maîtrise (learning_point_state_transitions)
 * pour la preuve antérieure à son enregistrement vivant.
 *
 *   php artisan smarter:mastery:transitions-backfill --all
 *   php artisan smarter:mastery:transitions-backfill --user=42
 *   php artisan smarter:mastery:transitions-backfill --all --rebuild
 *
 * Le rejeu est CELUI de ReplayService (un seul algorithme), sous la version
 * courante du moteur ; chaque pas qui change l'état devient une ligne
 * `origin = backfill`, datée de la preuve. L'interface la présente comme
 * « reconstruite » : ce n'est pas ce que l'élève a vu à l'époque si le
 * moteur a changé depuis.
 *
 * Idempotent : un couple qui a déjà une histoire reconstruite est sauté
 * (sauf --rebuild, qui efface et refait les seules lignes `backfill`). Un
 * couple qui a une histoire VIVANTE n'est complété que pour la preuve
 * antérieure à sa première ligne vivante : on ne réécrit jamais ce qui a
 * été enregistré en direct.
 */
class MasteryTransitionsBackfill extends Command
{
    protected $signature = 'smarter:mastery:transitions-backfill
        {--user= : Un élève (id)}
        {--all : Tous les couples ayant de la preuve}
        {--rebuild : Effacer puis refaire les lignes reconstruites}';

    protected $description = 'Reconstruit l\'histoire des états de maîtrise depuis learning_evidence.';

    public function handle(ReplayService $replay, EngineRegistry $engines): int
    {
        $scope = [];
        if ($this->option('user') !== null) {
            $scope['user'] = (int) $this->option('user');
        } elseif (! $this->option('all')) {
            $this->error('Précisez un périmètre : --user ou --all.');

            return self::FAILURE;
        }

        $engine = $engines->current();
        $rebuild = (bool) $this->option('rebuild');
        $pairs = 0;
        $written = 0;
        $skipped = 0;

        foreach ($replay->pairs($scope) as $pair) {
            $pairs++;
            $existing = LearningPointStateTransition::query()
                ->where('user_id', $pair->user_id)->where('learning_point_id', $pair->learning_point_id);

            $hasBackfill = (clone $existing)->where('origin', LearningPointStateTransition::ORIGIN_BACKFILL)->exists();
            if ($hasBackfill && ! $rebuild) {
                $skipped++;

                continue;
            }

            // La première ligne enregistrée en direct borne la reconstruction.
            $firstRecorded = (clone $existing)->where('origin', '!=', LearningPointStateTransition::ORIGIN_BACKFILL)->min('occurred_at');
            $cutoff = $firstRecorded !== null ? Carbon::parse($firstRecorded) : null;

            $rows = [];
            $now = now();
            $replay->replay($pair->user_id, $pair->learning_point_id, $engine, function (object $row, MasteryState $before, MasteryState $after) use (&$rows, $pair, $engine, $cutoff, $now) {
                $at = $row->submitted_at !== null ? Carbon::parse($row->submitted_at) : null;
                if ($cutoff !== null && ($at === null || $at->greaterThanOrEqualTo($cutoff))) {
                    return;
                }
                // Avant la toute première preuve, il n'y avait pas de ligne :
                // l'état « avant » est l'absence, pas l'état initial du moteur.
                $previous = $before->attempts === 0 ? null : $before;
                if (! TransitionRecorder::changed($previous, $after)) {
                    return;
                }
                $rows[] = TransitionRecorder::row(
                    $pair->user_id, $pair->learning_point_id, $previous, $after, $engine->version(),
                    LearningPointStateTransition::ORIGIN_BACKFILL, $at, (int) $row->id,
                ) + ['created_at' => $now, 'updated_at' => $now];
            });

            DB::transaction(function () use ($rebuild, $pair, $rows) {
                if ($rebuild) {
                    LearningPointStateTransition::query()
                        ->where('user_id', $pair->user_id)->where('learning_point_id', $pair->learning_point_id)
                        ->where('origin', LearningPointStateTransition::ORIGIN_BACKFILL)
                        ->delete();
                }
                foreach (array_chunk($rows, 500) as $chunk) {
                    LearningPointStateTransition::insert($chunk);
                }
            });
            $written += count($rows);
        }

        $this->info("Couples parcourus : {$pairs} — lignes reconstruites : {$written} — déjà reconstruits : {$skipped}.");

        return self::SUCCESS;
    }
}
