<?php

namespace App\Console\Commands;

use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Publie d'un coup ce que le catalogue déclare prêt — l'équivalent, pour une
 * base entière, de l'étape 4 de « Publish a lesson » (guide §11) : « rien de
 * généré ne reste draft » (propriétaire, 2026-10-26).
 *
 *   - leçons `status = available` encore `draft`        → published
 *   - modules non retirés `draft` d'une leçon publiée   → published
 *   - exercices non retirés `draft` d'une leçon publiée → published
 *
 * Ne touche JAMAIS : une leçon `archived` (retrait volontaire de l'admin), une
 * leçon `coming_soon` (1AM–3AM non générées : `draft` par contrat), une ligne
 * retirée (`retired_at`), ni le `tier`. Idempotent. Lancé à la main
 * (workflow « Publish available content »), jamais par le déploiement, qui
 * laisse l'admin maître de la publication.
 *
 *     php artisan smarter:publish-available-content --dry-run
 */
class PublishAvailableContent extends Command
{
    protected $signature = 'smarter:publish-available-content
        {--dry-run : Compter sans rien écrire}';

    protected $description = 'Publie les leçons « available » encore draft, puis leurs modules et exercices draft non retirés';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $counts = DB::transaction(function () use ($dry) {
            $toPublish = Lesson::query()
                ->where('status', 'available')
                ->where('publication_status', Lesson::PUB_DRAFT);

            $counts = ['lessons' => (clone $toPublish)->count()];
            // In dry-run, also count the content of the lessons that WOULD be published.
            $targetLessonIds = Lesson::query()
                ->where('publication_status', Lesson::PUB_PUBLISHED)
                ->orWhere(fn ($w) => $w->where('status', 'available')->where('publication_status', Lesson::PUB_DRAFT))
                ->pluck('id');

            if (! $dry) {
                (clone $toPublish)->update(['publication_status' => Lesson::PUB_PUBLISHED, 'published_at' => now()]);
            }

            foreach (['modules' => LessonModule::class, 'exercises' => PracticeExercise::class] as $key => $model) {
                $q = $model::query()
                    ->whereNull('retired_at')
                    ->where('publication_status', Lesson::PUB_DRAFT)
                    ->whereIn('lesson_id', $targetLessonIds);
                $counts[$key] = (clone $q)->count();
                if (! $dry) {
                    $q->update(['publication_status' => Lesson::PUB_PUBLISHED, 'updated_at' => now()]);
                }
            }

            return $counts;
        });

        $verb = $dry ? 'à publier' : 'publié(e)s';
        $this->info("Leçons {$verb} : {$counts['lessons']}");
        $this->info("Modules {$verb} : {$counts['modules']}");
        $this->info("Exercices {$verb} : {$counts['exercises']}");

        if (! $dry) {
            $left = LessonModule::query()->whereNull('retired_at')->where('publication_status', Lesson::PUB_DRAFT)
                ->whereIn('lesson_id', Lesson::query()->where('publication_status', Lesson::PUB_PUBLISHED)->select('id'))
                ->count();
            if ($left > 0) {
                $this->error("{$left} module(s) d'une leçon publiée restent draft.");

                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }
}
