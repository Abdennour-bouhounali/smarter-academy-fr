<?php

namespace App\Console\Commands;

use App\Domain\Curriculum\CurriculumImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class ImportCurriculum extends Command
{
    protected $signature = 'smarter:import-curriculum
        {--dry-run : Compute and print the full diff without writing anything}
        {--from-json= : Read a pre-generated curriculum export instead of running the Node export script}';

    protected $description = 'Mirror the curriculum (coursesData.js) into MySQL — idempotent, never deletes learning points';

    public function handle(CurriculumImporter $importer): int
    {
        $jsonPath = $this->option('from-json') ?: $this->generateExport();
        if ($jsonPath === null) {
            return self::FAILURE;
        }

        if (! is_file($jsonPath)) {
            $this->error("Curriculum export not found: {$jsonPath}");

            return self::FAILURE;
        }

        $export = json_decode(file_get_contents($jsonPath), true);
        if (! is_array($export) || ! isset($export['grades'])) {
            $this->error("Curriculum export is not valid JSON with a 'grades' key: {$jsonPath}");

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $summary = $importer->import($export, $dryRun);

        $this->table(
            ['Level', 'Created', 'Updated', 'Retired', 'Unchanged'],
            collect($summary)->map(fn ($diff, $level) => [
                $level,
                count($diff['created']),
                count($diff['updated']),
                count($diff['retired']),
                count($diff['unchanged']),
            ])->values()->all()
        );

        foreach (['created', 'updated', 'retired'] as $kind) {
            foreach ($summary as $level => $diff) {
                foreach ($diff[$kind] as $code) {
                    $this->line("  {$kind}: {$level} {$code}");
                }
            }
        }

        $this->info($dryRun ? 'Dry run — nothing was written.' : 'Curriculum imported.');

        return self::SUCCESS;
    }

    /**
     * Shells out to the Node export script so a human runs exactly one
     * command. Environments without Node (e.g. a prod container) can pass
     * --from-json with a pre-generated file instead.
     */
    private function generateExport(): ?string
    {
        $script = config('curriculum.export_script_path');
        $output = config('curriculum.export_output_path');

        $result = Process::run(['node', $script, $output]);

        if (! $result->successful()) {
            $this->error("Curriculum export script failed:\n".$result->errorOutput());
            $this->line('If Node is unavailable here, generate the export elsewhere and pass --from-json=<path>.');

            return null;
        }

        $this->line(trim($result->output()));

        return $output;
    }
}
