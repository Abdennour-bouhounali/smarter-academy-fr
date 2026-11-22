<?php

namespace App\Console\Commands;

use App\Models\Lesson;
use Illuminate\Console\Command;

/**
 * Ce que la base contient EN LEÇONS, avec leur publication et leur palier —
 * en lecture seule.
 *
 * Existe pour le déploiement (deploy.yml, « Synchronise the curriculum
 * mirror ») : la base de production n'est lisible par personne d'autre que
 * le serveur, et c'est pourtant elle qui fait foi pour le palier
 * (`lessons.tier`, décidé par l'administrateur). Le journal du déploiement
 * dit donc, à chaque livraison, quelles leçons existent en production et
 * sous quel palier.
 *
 *   --tiers-only  une ligne par leçon, « classe/code palier » (un espace —
 *                 un code de leçon n'en contient jamais), triée :
 *                 le format que le déploiement compare avant et après la
 *                 synchronisation pour prouver qu'aucun palier n'a bougé.
 *
 *     php artisan smarter:lesson-inventory
 *     php artisan smarter:lesson-inventory --tiers-only
 */
class LessonInventory extends Command
{
    protected $signature = 'smarter:lesson-inventory
        {--tiers-only : Une ligne « classe/code palier » par leçon, pour comparaison}';

    protected $description = 'Liste les leçons en base (classe, unité, publication, palier) — lecture seule';

    public function handle(): int
    {
        $lessons = Lesson::query()
            ->with(['chapter.grade', 'unit'])
            ->get()
            ->sortBy(fn (Lesson $l) => sprintf(
                '%s|%05d|%05d',
                $l->chapter?->grade?->code ?? '',
                $l->chapter?->order ?? 0,
                $l->order ?? 0,
            ))
            ->values();

        if ($this->option('tiers-only')) {
            foreach ($lessons as $lesson) {
                $this->line(($lesson->chapter?->grade?->code ?? '?').'/'.$lesson->code.' '.($lesson->tier ?? 'NULL'));
            }

            return self::SUCCESS;
        }

        $this->table(
            ['Classe', 'Active', 'Unité', 'Leçon', 'Statut', 'Publication', 'Palier'],
            $lessons->map(fn (Lesson $l) => [
                $l->chapter?->grade?->code ?? '?',
                $l->chapter?->grade?->is_active ? 'oui' : 'non',
                $l->unit?->code ?? '—',
                $l->code,
                $l->status,
                $l->publication_status,
                $l->tier ?? 'NULL',
            ])->all(),
        );

        $published = $lessons->where('publication_status', Lesson::PUB_PUBLISHED);
        $this->info(sprintf(
            '%d leçon(s) en base, dont %d publiée(s) : %d gratuite(s), %d premium.',
            $lessons->count(),
            $published->count(),
            $published->where('tier', 'free')->count(),
            $published->where('tier', 'premium')->count(),
        ));

        return self::SUCCESS;
    }
}
