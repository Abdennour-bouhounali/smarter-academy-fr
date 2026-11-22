<?php

namespace App\Console\Commands;

use App\Domain\Practice\AnswerImageStore;
use Illuminate\Console\Command;

/**
 * La garde des photos de copie : 12 mois (décision du propriétaire,
 * 2026-10-06), puis effacement — fichier ET ligne. Planifiée chaque nuit
 * (routes/console.php).
 */
class PurgeAnswerImages extends Command
{
    protected $signature = 'smarter:answer-images:purge';

    protected $description = 'Efface les photos de copie dont la garde de 12 mois est échue.';

    public function handle(AnswerImageStore $store): int
    {
        $count = $store->purgeExpired();
        $this->info("{$count} photo(s) de copie effacée(s).");

        return self::SUCCESS;
    }
}
