<?php

namespace App\Console\Commands;

use App\Domain\Curriculum\ContentRegistryImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

/**
 * Reflète le registre de contenu (modules de leçon, exercices de pratique)
 * dans MySQL. Jumeau de smarter:import-curriculum, mêmes affordances.
 *
 * À rejouer après tout ajout ou renommage de module. Sans danger : la
 * commande est idempotente, ne supprime rien, et ne touche jamais l'état de
 * publication décidé par un administrateur.
 */
class ImportContentRegistry extends Command
{
    protected $signature = 'smarter:import-content-registry
        {--dry-run : Compute and print the full diff without writing anything}
        {--from-json= : Read a pre-generated registry export instead of running the Node export script}';

    protected $description = 'Mirror lesson modules and practice exercises into MySQL — idempotent, never deletes, never overrides admin publication state';

    public function handle(ContentRegistryImporter $importer): int
    {
        $jsonPath = $this->option('from-json') ?: $this->generateExport();
        if ($jsonPath === null) {
            return self::FAILURE;
        }

        if (! is_file($jsonPath)) {
            $this->error("Content registry export not found: {$jsonPath}");

            return self::FAILURE;
        }

        $export = json_decode((string) file_get_contents($jsonPath), true);
        if (! is_array($export) || ! isset($export['lessons'])) {
            $this->error("Content registry export is not valid JSON with a 'lessons' key: {$jsonPath}");

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $summary = $importer->import($export, $dryRun);

        $this->table(
            ['Kind', 'Created', 'Updated', 'Retired', 'Unchanged'],
            collect(['modules', 'exercises'])->map(fn ($kind) => [
                $kind,
                count($summary[$kind]['created']),
                count($summary[$kind]['updated']),
                count($summary[$kind]['retired']),
                count($summary[$kind]['unchanged']),
            ])->all()
        );

        foreach (['modules', 'exercises'] as $kind) {
            foreach (['created', 'updated', 'retired'] as $change) {
                foreach ($summary[$kind][$change] as $label) {
                    $this->line("  {$kind} {$change}: {$label}");
                }
            }
        }

        // Une leçon non rattachée n'est pas une broutille : ses modules sont
        // absents du registre, donc invisibles pour l'administration.
        $unknown = array_unique($summary['unknownLessons']);
        if ($unknown !== []) {
            $this->warn('Leçons introuvables en base (lancez d\'abord smarter:import-curriculum) :');
            foreach ($unknown as $code) {
                $this->line("  {$code}");
            }
        }

        $this->info($dryRun ? 'Dry run — nothing was written.' : 'Content registry imported.');

        return self::SUCCESS;
    }

    private function generateExport(): ?string
    {
        $script = config('curriculum.registry_export_script_path');
        $output = config('curriculum.registry_export_output_path');

        $result = Process::run(['node', $script, $output]);

        if (! $result->successful()) {
            $this->error("Content registry export script failed:\n".$result->errorOutput());
            $this->line('If Node is unavailable here, generate the export elsewhere and pass --from-json=<path>.');

            return null;
        }

        $this->line(trim($result->output()));

        return $output;
    }
}
