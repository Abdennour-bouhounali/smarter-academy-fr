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
    protected $signature = 'smarter:registry-health
        {--json : Sortie brute}
        {--gate : Échoue (code 1) si l\'activation ou le périmètre ont dérivé, ou si un palier en base est invalide — pour l\'intégration continue}';

    protected $description = 'Vérifie la cohérence entre le contenu source et le registre en base';

    public function handle(RegistryHealthService $health): int
    {
        $report = $health->report();

        // ── Le MODE PORTE (--gate) ──────────────────────────────────────
        //
        // Sans ce drapeau, la commande reste ce qu'elle a toujours été : un
        // diagnostic qui sort 0 quoi qu'il arrive, parce que faire échouer un
        // déploiement sur une leçon « à venir » apprendrait surtout à
        // l'ignorer.
        //
        // Avec, elle ne juge QUE ce qui est une contradiction, pas une
        // imperfection :
        //
        //   activation → le frontend cache une classe que l'API sert (ou
        //                l'inverse) : la fuite de contenu dormant que la
        //                phase 3 existe pour fermer.
        //   périmètre  → une leçon en base que le catalogue ne déclare plus.
        //   palier     → un palier ABSENT ou INCONNU en base. Le palier n'est
        //                JAMAIS comparé au catalogue : il appartient à la base
        //                (lessons.tier, décidé par l'administrateur), et une
        //                décision d'administration n'est pas une dérive.
        //
        // Une source ABSENTE est un échec en mode porte, à la différence du
        // mode diagnostic : une porte qui ne peut pas vérifier ne s'ouvre pas.
        if ($this->option('gate')) {
            return $this->gate($report);
        }

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
        // surtout à ignorer la commande. Voir --gate pour l'inverse.
        return self::SUCCESS;
    }

    /**
     * La porte : activation et palier, rien d'autre.
     *
     * @param  array<string, mixed>  $report
     */
    private function gate(array $report): int
    {
        $activation = $report['activation'];
        $tier = $report['tier'];
        $failures = [];

        if (! ($activation['sourceAvailable'] ?? false)) {
            $failures[] = "L'export du catalogue est introuvable : la cohérence source ↔ base ne peut pas être vérifiée.\n"
                .'    Lancez : node packages/core/curriculum/exportCurriculum.mjs';
        }

        // ── PÉRIMÈTRE : une classe en base que le catalogue ignore ───────
        // Distinct de la dérive d'activation, et plus grave : ce n'est pas un
        // désaccord sur l'état d'une classe, c'est du curriculum que le
        // produit ne connaît pas. Un import ne l'effacera pas (il n'efface
        // jamais rien) — d'où le conseil différent.
        foreach ($activation['unexpectedGrades'] ?? [] as $code) {
            $failures[] = "Classe « {$code} » présente en base mais ABSENTE du catalogue : du curriculum hors périmètre.\n"
                .'    Lancez : php artisan smarter:scope-curriculum --dry-run';
        }

        foreach ($activation['orphans'] ?? [] as $entity => $count) {
            if ($count > 0) {
                $failures[] = "{$count} ligne(s) de curriculum orpheline(s) ({$entity}) : rattachées à une classe, un chapitre ou une leçon qui n'existe plus.";
            }
        }

        foreach ($activation['drift'] ?? [] as $row) {
            $source = $row['source'] === null ? 'ABSENTE de la source' : ($row['source'] ? 'active' : 'inactive');
            $database = $row['database'] ? 'active' : 'inactive';
            $failures[] = "Classe « {$row['code']} » : base = {$database}, source = {$source}.";
        }

        foreach ($activation['lessonsOutsideCatalogue'] ?? [] as $code) {
            $failures[] = "Leçon « {$code} » présente en base (classe active) mais ABSENTE du catalogue.\n"
                .'    Lancez : php artisan smarter:prune-retired-learning-points --dry-run';
        }

        foreach ($tier['invalid'] ?? [] as $row) {
            $value = $row['database'] === null ? 'NULL' : "« {$row['database']} »";
            $failures[] = "Leçon « {$row['code']} » ({$row['grade']}) : palier {$value} — ni free ni premium. Fixez-le dans l'administration (contenu → palier).";
        }

        if ($this->option('json')) {
            $this->line(json_encode([
                'gate' => $failures === [] ? 'pass' : 'fail',
                'failures' => $failures,
                'activation' => $activation,
                'tier' => $tier,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return $failures === [] ? self::SUCCESS : self::FAILURE;
        }

        if ($failures === []) {
            $active = $activation['active'] === [] ? 'aucune' : implode(', ', $activation['active']);
            $this->info("✅ Activation, périmètre et paliers cohérents (classes actives : {$active} ; {$tier['checked']} leçon(s) vérifiée(s) : {$tier['counts']['free']} gratuite(s), {$tier['counts']['premium']} premium — paliers décidés en base par l'administrateur).");

            return self::SUCCESS;
        }

        $this->error(count($failures).' dérive(s) entre le catalogue et la base :');
        foreach ($failures as $failure) {
            $this->line("  ✗ {$failure}");
        }
        $this->newLine();
        $this->line('Le catalogue (packages/core) et l\'API ne s\'accordent plus sur ce qui est ouvert ou sur ce qui existe,');
        $this->line('ou un palier en base n\'est pas une valeur connue.');
        $this->line('Réappliquez la poignée de main :');
        $this->line('  node packages/core/curriculum/exportCurriculum.mjs && php artisan smarter:import-curriculum');

        return self::FAILURE;
    }
}
