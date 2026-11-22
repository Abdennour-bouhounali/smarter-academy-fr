<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * `smarter:db-backup` : la sauvegarde EST la condition préalable de
 * `migrate --force` en production (.github/workflows/deploy.yml). Ce qui est
 * vérifié ici n'est donc pas « un fichier a été écrit », mais « ce fichier
 * contiendrait de quoi restaurer » — un fichier tronqué qui a l'air valide est
 * pire que pas de fichier du tout.
 */
class DbBackupCommandTest extends TestCase
{
    use RefreshDatabase;

    private function tempPath(string $name = 'backup.sql'): string
    {
        $dir = sys_get_temp_dir().'/sa-db-backup-'.uniqid();
        mkdir($dir);

        return "{$dir}/{$name}";
    }

    /**
     * Exécute le repli PDO directement. Nécessaire parce que `RefreshDatabase`
     * garde la transaction du test ouverte : un `mysqldump` lancé en
     * sous-processus se connecte à part et ne verrait aucune des lignes
     * écrites ici. Le repli, lui, emprunte la connexion du test.
     */
    private function runPdoExport(string $out): bool
    {
        $command = new \App\Console\Commands\DbBackup;
        $command->setLaravel($this->app);

        $input = new \Symfony\Component\Console\Input\ArrayInput(
            ['--rows-per-insert' => '50'],
            new \Symfony\Component\Console\Input\InputDefinition([
                new \Symfony\Component\Console\Input\InputOption('rows-per-insert', null, \Symfony\Component\Console\Input\InputOption::VALUE_OPTIONAL, '', '200'),
            ])
        );
        (new \ReflectionProperty($command, 'input'))->setValue($command, $input);
        (new \ReflectionProperty($command, 'output'))->setValue(
            $command,
            new \Illuminate\Console\OutputStyle($input, new \Symfony\Component\Console\Output\BufferedOutput)
        );

        $method = new \ReflectionMethod($command, 'withPdo');
        $method->setAccessible(true);

        return (bool) $method->invoke($command, $out);
    }

    public function test_la_sauvegarde_contient_la_structure_et_les_lignes(): void
    {
        $user = User::factory()->create(['email' => 'sauvegarde@smarter.dz']);

        $out = $this->tempPath();
        $this->artisan('smarter:db-backup', ['--out' => $out])->assertSuccessful();

        $this->assertFileExists($out);
        $sql = file_get_contents($out);

        // La structure : sans CREATE TABLE, une restauration n'a nulle part où écrire.
        $this->assertStringContainsString('CREATE TABLE', $sql);
        $this->assertStringContainsString('`users`', $sql);

        // Les LIGNES ne sont pas vérifiées ici, et c'est délibéré :
        // `RefreshDatabase` laisse la transaction du test ouverte, or
        // `mysqldump` se connecte à part et ne voit donc pas ce que ce test
        // vient d'écrire. Ce n'est pas un défaut de la commande — en
        // production personne ne sauvegarde depuis une transaction ouverte.
        // Le contenu est vérifié sur le repli PDO, qui emprunte la connexion
        // du test : voir test_le_repli_pdo_produit_un_fichier_restaurable().

        // Les contraintes sont neutralisées le temps de la restauration, sinon
        // l'ordre des tables déciderait du succès. L'écriture diffère selon le
        // producteur — mysqldump l'emballe dans un commentaire versionné
        // `/*!40014 ... FOREIGN_KEY_CHECKS=0 */`, le repli PDO l'écrit
        // simplement — donc on teste l'intention, pas la mise en forme.
        $this->assertMatchesRegularExpression('/FOREIGN_KEY_CHECKS\s*=\s*0/', $sql);

        $this->assertSame($user->email, User::find($user->id)?->email, 'la sauvegarde ne modifie rien');
    }

    public function test_le_repli_pdo_produit_un_fichier_restaurable(): void
    {
        // C'est le chemin qui s'exécutera réellement sur l'hébergement mutualisé,
        // où `mysqldump` n'est pas garanti. Il mérite donc d'être testé pour
        // lui-même, et pas seulement quand le binaire est absent de la machine.
        User::factory()->create(['email' => 'repli@smarter.dz', 'first_name' => 'الجبر']);

        $out = $this->tempPath('pdo.sql');
        $this->assertTrue($this->runPdoExport($out));

        $sql = file_get_contents($out);
        $this->assertStringContainsString('SET FOREIGN_KEY_CHECKS = 0;', $sql);
        $this->assertStringContainsString('SET FOREIGN_KEY_CHECKS = 1;', $sql, 'les contraintes sont RÉTABLIES à la fin');
        $this->assertStringContainsString('CREATE TABLE', $sql);
        $this->assertStringContainsString('repli@smarter.dz', $sql);
        $this->assertStringContainsString('الجبر', $sql);
    }

    public function test_toutes_les_tables_de_la_base_sont_presentes(): void
    {
        $out = $this->tempPath();
        $this->artisan('smarter:db-backup', ['--out' => $out])->assertSuccessful();
        $sql = file_get_contents($out);

        // Une sauvegarde partielle est un piège : elle restaure sans erreur et
        // laisse des tables manquantes. On vérifie donc la base réelle, pas une
        // liste écrite à la main qui vieillirait à chaque migration.
        $tables = [];
        foreach (DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"') as $row) {
            $tables[] = array_values((array) $row)[0];
        }

        $this->assertNotEmpty($tables);
        foreach ($tables as $table) {
            $this->assertStringContainsString("`{$table}`", $sql, "la table {$table} est absente de la sauvegarde");
        }
    }

    public function test_les_apostrophes_et_l_arabe_survivent(): void
    {
        // Le contenu de la plateforme est arabe, et une apostrophe mal échappée
        // casse la restauration au milieu du fichier — donc bien après qu'on
        // ait cru la sauvegarde bonne. Passe par le repli PDO, seul chemin qui
        // voit les lignes d'un test sous `RefreshDatabase`.
        User::factory()->create(['email' => "l'apostrophe@smarter.dz", 'first_name' => 'الرياضيات']);

        $out = $this->tempPath('echappement.sql');
        $this->assertTrue($this->runPdoExport($out));
        $sql = file_get_contents($out);

        $this->assertStringContainsString('الرياضيات', $sql);
        $this->assertStringNotContainsString("'l'apostrophe@smarter.dz'", $sql, "l'apostrophe est échappée, pas laissée nue");
    }

    public function test_un_hote_sans_proc_open_bascule_sur_le_repli(): void
    {
        // La régression exacte du 2026-09-23 : Hostinger désactive `proc_open`,
        // la sonde `Process::run` a donc levé « The Process class relies on
        // proc_open » et la commande a ÉCHOUÉ au lieu de basculer sur le repli.
        // Comme la sauvegarde est la condition préalable de la migration, le
        // déploiement s'est arrêté net. `withMysqldump()` doit rendre null —
        // « je ne peux pas, prends le repli » — et jamais lever.
        $command = new \App\Console\Commands\DbBackup;
        $command->setLaravel($this->app);

        $method = new \ReflectionMethod($command, 'withMysqldump');
        $method->setAccessible(true);

        // On ne peut pas retirer proc_open du PHP de test ; on vérifie donc la
        // lecture de `disable_functions`, qui est ce que fait la commande.
        $previous = ini_get('disable_functions');
        $this->assertIsString($previous, 'disable_functions est lisible');

        // Contrat effectivement testable ici : la méthode ne lève JAMAIS, quel
        // que soit l'état de l'hôte, et un retour null déclenche le repli.
        $out = $this->tempPath('sonde.sql');
        $result = $method->invoke($command, config('database.default'), $out);
        $this->assertTrue($result === null || is_bool($result));

        // Et le repli, lui, produit bien un fichier : c'est ce qui aurait dû
        // se passer en production.
        $fallback = $this->tempPath('repli.sql');
        $this->assertTrue($this->runPdoExport($fallback));
        $this->assertFileExists($fallback);
    }

    public function test_un_dossier_inaccessible_echoue_franchement(): void
    {
        // Le pipeline s'arrête sur cet échec et ne migre pas : il doit donc
        // être un échec, jamais un avertissement.
        $this->artisan('smarter:db-backup', ['--out' => '/proc/impossible/backup.sql'])
            ->assertFailed();
    }

    public function test_keep_ne_supprime_rien_hors_du_dossier_par_defaut(): void
    {
        // --keep ne s'applique qu'au dossier des sauvegardes. Un --out explicite
        // pointe souvent vers un dossier partagé ; y faire du ménage serait une
        // suppression que personne n'a demandée.
        $dir = sys_get_temp_dir().'/sa-db-backup-keep-'.uniqid();
        mkdir($dir);
        $voisin = "{$dir}/db-voisin.sql";
        file_put_contents($voisin, '-- ne pas supprimer');

        $this->artisan('smarter:db-backup', ['--out' => "{$dir}/db-nouvelle.sql", '--keep' => 1])
            ->assertSuccessful();

        $this->assertFileExists($voisin);
    }
}
