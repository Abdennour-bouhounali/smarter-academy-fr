<?php

namespace App\Console\Commands;

use App\Domain\Progress\Replay\ReplayService;
use App\Models\StudentLearningPointProgress;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Vérifie l'invariant central : « l'état enregistré est la fonction de la
 * preuve et de la version qu'il déclare ». Tire N couples (élève, point) au
 * hasard, les rejoue dans LEUR version, compare. Un écart est journalisé
 * (`state.verify_mismatch`) et fait échouer la commande — il ne corrige rien
 * (c'est le rôle de smarter:mastery:replay, décidé par un humain).
 *
 *   php artisan smarter:mastery:verify --sample=100
 *
 * Planifiée chaque nuit (routes/console.php).
 */
class MasteryVerify extends Command
{
    protected $signature = 'smarter:mastery:verify {--sample= : Nombre de couples (défaut : config mastery.verify_sample)}';

    protected $description = 'Rejoue un échantillon de couples (élève, learning point) et compare à l\'état enregistré.';

    public function handle(ReplayService $replay): int
    {
        $sample = (int) ($this->option('sample') ?? config('mastery.verify_sample', 100));
        $rows = StudentLearningPointProgress::query()->inRandomOrder()->limit($sample)->get(['user_id', 'learning_point_id', 'engine_version']);

        $mismatches = [];
        foreach ($rows as $row) {
            if (! $replay->matchesStored((int) $row->user_id, (int) $row->learning_point_id)) {
                $mismatches[] = ['user_id' => $row->user_id, 'learning_point_id' => $row->learning_point_id, 'engine_version' => $row->engine_version];
            }
        }

        $channel = Log::channel(config('mastery.log_channel', 'mastery'));
        if ($mismatches !== []) {
            $channel->error('state.verify_mismatch', ['checked' => $rows->count(), 'mismatches' => $mismatches]);
            $this->error(count($mismatches)." écart(s) sur {$rows->count()} couple(s) vérifié(s).");
            foreach ($mismatches as $m) {
                $this->line("  user {$m['user_id']} · point {$m['learning_point_id']} · v{$m['engine_version']}");
            }

            return self::FAILURE;
        }

        $channel->info('state.verify_ok', ['checked' => $rows->count()]);
        $this->info("{$rows->count()} couple(s) vérifié(s), aucun écart.");

        return self::SUCCESS;
    }
}
