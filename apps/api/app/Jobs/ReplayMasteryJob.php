<?php

namespace App\Jobs;

use App\Models\MasteryReplay;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Throwable;

/**
 * Un rejeu demandé depuis l'administration, exécuté HORS de la requête.
 *
 * Il délègue à smarter:mastery:replay (Artisan::call, dans le processus —
 * pas de proc_open, que Hostinger désactive) : un seul code de rejeu, qu'on
 * l'appelle depuis un terminal ou depuis l'écran d'administration. La ligne
 * mastery_replays créée par l'administration sert de ticket ; la commande
 * écrit la sienne avec le diff complet, et le ticket pointe vers elle.
 */
class ReplayMasteryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;

    public function __construct(public int $ticketId) {}

    public function handle(): void
    {
        $ticket = MasteryReplay::find($this->ticketId);
        if ($ticket === null) {
            return;
        }
        $ticket->update(['status' => MasteryReplay::STATUS_RUNNING, 'started_at' => now()]);

        $options = ['--engine' => $ticket->engine_version];
        match ($ticket->scope) {
            'user' => $options['--user'] = $ticket->scope_id,
            'learning_point' => $options['--lp'] = $ticket->scope_id,
            'lesson' => $options['--lesson'] = $ticket->scope_id,
            default => $options['--all'] = true,
        };
        if ($ticket->dry_run) {
            $options['--dry-run'] = true;
        }

        try {
            $exit = Artisan::call('smarter:mastery:replay', $options);
            $run = MasteryReplay::where('id', '>', $ticket->id)->latest('id')->first();
            $ticket->update([
                'status' => $exit === 0 ? MasteryReplay::STATUS_COMPLETED : MasteryReplay::STATUS_FAILED,
                'pairs_total' => $run?->pairs_total ?? 0,
                'pairs_done' => $run?->pairs_done ?? 0,
                'pairs_changed' => $run?->pairs_changed ?? 0,
                'diff_summary' => ($run?->diff_summary ?? []) + ['runId' => $run?->id],
                'error' => $exit === 0 ? null : trim(Artisan::output()),
                'finished_at' => now(),
            ]);
        } catch (Throwable $e) {
            $ticket->update(['status' => MasteryReplay::STATUS_FAILED, 'error' => $e->getMessage(), 'finished_at' => now()]);

            throw $e;
        }
    }
}
