<?php

namespace App\Console\Commands;

use App\Domain\Admin\RegistryHealthService;
use Illuminate\Console\Command;

/**
 * Le même diagnostic que l'écran d'administration, en ligne de commande —
 * pour qu'il puisse tourner dans un déploiement, avant qu'un élève ne
 * découvre le problème à notre place.
 */
class RegistryHealth extends Command
{
    protected $signature = 'smarter:registry-health {--json : Sortie brute}';

    protected $description = 'Vérifie la cohérence entre le contenu source et le registre en base';

    public function handle(RegistryHealthService $health): int
    {
        $report = $health->report();

        if ($this->option('json')) {
            $this->line(json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return self::SUCCESS;
        }

        $this->table(['Entité', 'Actifs'], collect($report['counts'])->map(
            fn ($value, $key) => [$key, $value]
        )->values()->all());

        if (! $report['sourceAvailable']) {
            $this->warn('Export du contenu introuvable : les contrôles source ↔ base sont ignorés.');
            $this->line('Lancez d\'abord : node packages/core/curriculum/exportContentRegistry.mjs');

            return self::SUCCESS;
        }

        $structural = $report['structural'];
        $problems = 0;

        foreach ([
            'lessonsWithoutRegistry' => 'Leçon source absente du registre',
            'modulesWithoutSource' => 'Module en base sans source',
            'modulesWithoutRegistry' => 'Module source absent du registre',
            'exercisesWithoutSource' => 'Exercice en base sans source',
            'exercisesWithoutRegistry' => 'Exercice source absent du registre',
        ] as $key => $label) {
            $items = $structural[$key] ?? [];
            if ($items === []) {
                continue;
            }
            $problems += count($items);
            $this->warn("{$label} (".count($items).') :');
            foreach (array_slice($items, 0, 20) as $item) {
                $this->line("  {$item}");
            }
        }

        // Volontairement NON compté comme un problème : le catalogue officiel
        // déclare des leçons « à venir », qui n'ont légitimement pas de source.
        $comingSoon = $structural['lessonsWithoutSource'] ?? [];
        if ($comingSoon !== []) {
            $this->line('Leçons en base sans source (normal si « à venir ») : '.implode(', ', $comingSoon));
        }

        $publication = $report['publication'];
        if ($publication['publishedLessonsWithNoPublishedModule'] !== []) {
            $problems += count($publication['publishedLessonsWithNoPublishedModule']);
            $this->warn('Leçons publiées SANS aucun module publié (l\'élève entre et ne trouve rien) :');
            foreach ($publication['publishedLessonsWithNoPublishedModule'] as $code) {
                $this->line("  {$code}");
            }
        }

        $unknownLp = $report['learningPoints']['modulesReferencingUnknownLearningPoints'];
        if ($unknownLp !== []) {
            $problems += count($unknownLp);
            $this->warn('Modules référençant un point d\'apprentissage inconnu : '.count($unknownLp));
        }

        $this->newLine();
        $problems === 0
            ? $this->info('Registre cohérent : aucun problème structurel.')
            : $this->error("{$problems} problème(s) détecté(s).");

        // Sortie 0 dans tous les cas : c'est un DIAGNOSTIC, pas une porte.
        // Faire échouer un déploiement sur une leçon « à venir » apprendrait
        // surtout à ignorer la commande.
        return self::SUCCESS;
    }
}
