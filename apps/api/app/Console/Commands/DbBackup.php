<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;
use Throwable;

/**
 * Écrit une sauvegarde SQL complète de la base, AVANT que le déploiement ne
 * touche au schéma.
 *
 * Pourquoi cette commande existe
 *   Le pipeline applique désormais `migrate --force` en production. Une
 *   migration qui se passe mal sur des données d'élèves réelles n'est pas
 *   rattrapable sans copie : cette commande EST la condition préalable de
 *   l'étape de migration. Si elle échoue, le déploiement s'arrête et le schéma
 *   n'est pas touché.
 *
 * Pourquoi ne pas simplement appeler `mysqldump`
 *   Sur un hébergement mutualisé le binaire n'est pas garanti. On l'utilise
 *   quand il est là (c'est le format le plus fidèle et le plus rapide), et on
 *   retombe sinon sur un export écrit avec la connexion PDO de Laravel, qui
 *   existe toujours puisque l'application tourne. L'objectif n'est pas
 *   l'élégance : c'est qu'il y ait TOUJOURS une copie.
 *
 * Ce que le fichier contient
 *   La structure de chaque table (SHOW CREATE TABLE) puis ses lignes, en
 *   INSERT par paquets, entourés d'un `SET FOREIGN_KEY_CHECKS = 0` pour que la
 *   restauration ne dépende pas de l'ordre des tables. Les vues sont ignorées.
 *
 *     php artisan smarter:db-backup --out=storage/app/backups/pre-deploy.sql
 *     php artisan smarter:db-backup --keep=10
 */
class DbBackup extends Command
{
    protected $signature = 'smarter:db-backup
        {--out= : Fichier .sql à écrire (défaut : storage/app/backups/db-<date>.sql)}
        {--keep=10 : Nombre de sauvegardes à conserver dans le dossier par défaut (0 = toutes)}
        {--rows-per-insert=200 : Lignes par INSERT dans la solution de repli}';

    protected $description = 'Sauvegarde la base en SQL (mysqldump si disponible, sinon export PDO) — prérequis de toute migration en production';

    public function handle(): int
    {
        $connection = config('database.default');
        if (config("database.connections.$connection.driver") !== 'mysql') {
            $this->error("Seul MySQL est pris en charge (connexion « $connection »).");

            return self::FAILURE;
        }

        $path = $this->resolvePath();
        @mkdir(dirname($path), 0775, true);

        if (! is_dir(dirname($path)) || ! is_writable(dirname($path))) {
            $this->error('Dossier de sauvegarde inaccessible : '.dirname($path));

            return self::FAILURE;
        }

        $this->line('Base : '.config("database.connections.$connection.database"));

        $ok = $this->withMysqldump($connection, $path);
        if ($ok === null) {
            $this->line('mysqldump indisponible — export par la connexion de Laravel.');
            $ok = $this->withPdo($path);
        }

        if (! $ok) {
            // Ne jamais laisser derrière soi un fichier tronqué : il aurait
            // l'air d'une sauvegarde valide le jour où quelqu'un le restaure.
            @unlink($path);
            $this->error('Sauvegarde ÉCHOUÉE. Le fichier partiel a été supprimé.');

            return self::FAILURE;
        }

        $bytes = (int) filesize($path);
        if ($bytes < 1024) {
            @unlink($path);
            $this->error("Sauvegarde suspecte ($bytes octets) — supprimée plutôt que gardée.");

            return self::FAILURE;
        }

        $this->info(sprintf('Sauvegarde écrite : %s (%s)', $path, $this->human($bytes)));
        $this->prune($path);

        return self::SUCCESS;
    }

    private function resolvePath(): string
    {
        $out = $this->option('out');
        if ($out) {
            return str_starts_with($out, '/') ? $out : base_path($out);
        }

        return storage_path('app/backups/db-'.now()->format('Y-m-d_His').'.sql');
    }

    /**
     * @return bool|null  null quand mysqldump est hors de portée (on passe au repli)
     */
    private function withMysqldump(string $connection, string $path): ?bool
    {
        // Hostinger — comme beaucoup d'hébergements mutualisés — désactive
        // `proc_open` et `exec` dans php.ini. Sans cette vérification, le
        // moindre appel à Process lève « The Process class relies on proc_open »
        // et la commande échoue au lieu de basculer sur le repli : c'est
        // précisément ce qui a fait échouer le premier déploiement automatique
        // du schéma (2026-09-23). On le constate donc AVANT de toucher à
        // Process, et on n'y touche plus du tout si la fonction est interdite.
        $disabled = array_map('trim', explode(',', (string) ini_get('disable_functions')));
        if (! function_exists('proc_open') || in_array('proc_open', $disabled, true)) {
            return null;
        }

        try {
            $probe = Process::run('command -v mysqldump');
        } catch (Throwable) {
            // Une autre restriction de l'hôte : le repli reste la bonne réponse.
            return null;
        }

        if (! $probe->successful()) {
            return null;
        }

        $c = config("database.connections.$connection");

        try {
            // Le mot de passe passe par l'environnement : jamais sur la ligne de
            // commande, qui est lisible par tout le monde dans `ps`.
            $result = Process::timeout(1800)
                ->env(['MYSQL_PWD' => (string) ($c['password'] ?? '')])
                ->run(sprintf(
                    'mysqldump --host=%s --port=%s --user=%s --single-transaction --quick '
                    .'--routines --triggers --default-character-set=utf8mb4 %s > %s',
                    escapeshellarg((string) $c['host']),
                    escapeshellarg((string) ($c['port'] ?: 3306)),
                    escapeshellarg((string) $c['username']),
                    escapeshellarg((string) $c['database']),
                    escapeshellarg($path),
                ));
        } catch (Throwable $e) {
            // L'hôte interdit l'exécution de processus : le repli est la bonne
            // réponse, pas un échec.
            $this->warn('mysqldump inutilisable ('.$e->getMessage().').');

            return null;
        }

        if (! $result->successful()) {
            $this->warn('mysqldump a échoué : '.trim($result->errorOutput()));

            return false;
        }

        return true;
    }

    private function withPdo(string $path): bool
    {
        $handle = fopen($path, 'w');
        if ($handle === false) {
            return false;
        }

        try {
            $database = DB::getDatabaseName();
            fwrite($handle, "-- Sauvegarde Smarter Academy — $database — ".now()->toDateTimeString()."\n");
            fwrite($handle, "-- Export par la connexion PDO de Laravel (mysqldump indisponible).\n");
            fwrite($handle, "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n");

            foreach ($this->tables() as $table) {
                $create = (array) DB::selectOne("SHOW CREATE TABLE `$table`");
                $ddl = $create['Create Table'] ?? null;
                if ($ddl === null) {
                    continue; // une vue, pas une table
                }

                fwrite($handle, "\n-- ── $table ──\n");
                fwrite($handle, "DROP TABLE IF EXISTS `$table`;\n$ddl;\n");

                $this->writeRows($handle, $table);
            }

            fwrite($handle, "\nSET FOREIGN_KEY_CHECKS = 1;\n");
        } catch (Throwable $e) {
            $this->error('Export interrompu : '.$e->getMessage());
            fclose($handle);

            return false;
        }

        fclose($handle);

        return true;
    }

    /** @return string[] */
    private function tables(): array
    {
        $names = [];
        foreach (DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"') as $row) {
            $names[] = array_values((array) $row)[0];
        }
        sort($names);

        return $names;
    }

    private function writeRows($handle, string $table): void
    {
        $perInsert = max(1, (int) $this->option('rows-per-insert'));
        $columns = null;
        $buffer = [];

        // orderBy + chunk : une pagination stable même si la table est grande.
        DB::table($table)->orderByRaw('1')->chunk(1000, function ($rows) use (&$columns, &$buffer, $handle, $table, $perInsert) {
            foreach ($rows as $row) {
                $values = (array) $row;
                $columns ??= array_keys($values);

                $buffer[] = '('.implode(', ', array_map([$this, 'quote'], array_values($values))).')';

                if (count($buffer) >= $perInsert) {
                    $this->flush($handle, $table, $columns, $buffer);
                }
            }
        });

        if ($buffer !== []) {
            $this->flush($handle, $table, $columns ?? [], $buffer);
        }
    }

    private function flush($handle, string $table, array $columns, array &$buffer): void
    {
        if ($buffer === [] || $columns === []) {
            return;
        }
        $cols = implode(', ', array_map(fn ($c) => "`$c`", $columns));
        fwrite($handle, "INSERT INTO `$table` ($cols) VALUES\n".implode(",\n", $buffer).";\n");
        $buffer = [];
    }

    private function quote(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        // Passe par le PDO de la connexion : c'est lui qui connaît l'échappement
        // correct pour ce serveur et ce jeu de caractères.
        return DB::getPdo()->quote((string) $value);
    }

    /** Ne garde que les N sauvegardes les plus récentes du dossier par défaut. */
    private function prune(string $written): void
    {
        $keep = (int) $this->option('keep');
        $dir = storage_path('app/backups');
        if ($keep <= 0 || dirname($written) !== $dir) {
            return;
        }

        $files = glob($dir.'/db-*.sql') ?: [];
        if (count($files) <= $keep) {
            return;
        }

        usort($files, fn ($a, $b) => filemtime($b) <=> filemtime($a));
        foreach (array_slice($files, $keep) as $old) {
            @unlink($old);
            $this->line('Ancienne sauvegarde supprimée : '.basename($old));
        }
    }

    private function human(int $bytes): string
    {
        foreach (['o', 'Ko', 'Mo', 'Go'] as $unit) {
            if ($bytes < 1024) {
                return round($bytes, 1).' '.$unit;
            }
            $bytes = (int) ($bytes / 1024);
        }

        return $bytes.' To';
    }
}
