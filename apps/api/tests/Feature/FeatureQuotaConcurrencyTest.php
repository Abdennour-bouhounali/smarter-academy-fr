<?php

namespace Tests\Feature;

use App\Domain\Access\Features\FeatureAccessDenied;
use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Models\FeatureAccessPolicy;
use App\Models\NotebookNote;
use App\Models\UsageEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Deux requêtes SIMULTANÉES ne dépassent jamais un quota.
 *
 * Une vraie course, pas une simulation : N processus fils (pcntl_fork),
 * chacun sur SA connexion MySQL, partent au même instant et tentent de
 * consommer la DERNIÈRE unité ; la création dort 300 ms à l'intérieur de la
 * section critique pour élargir la fenêtre. Sans le verrou de la ligne users
 * (FeatureAccessService::consume), tous compteraient « 0 utilisé » avant que
 * le premier n'écrive, et tous passeraient.
 *
 * Pas de RefreshDatabase : ses données vivent dans une transaction que les
 * autres connexions ne voient pas. Les lignes sont donc COMMITÉES, et
 * nettoyées en fin de test. Sauté sous SQLite (pas de verrou de ligne, et
 * une base en mémoire qu'un fils ne partage pas) ou sans pcntl.
 */
class FeatureQuotaConcurrencyTest extends TestCase
{
    private const WORKERS = 4;

    private ?User $user = null;

    private ?array $savedPolicy = null;

    protected function setUp(): void
    {
        parent::setUp();
        if (DB::getDriverName() !== 'mysql' || ! function_exists('pcntl_fork') || ! function_exists('posix_kill')) {
            $this->markTestSkipped('Course réelle : MySQL et pcntl requis.');
        }
        $this->artisan('migrate', ['--force' => true]);
    }

    protected function tearDown(): void
    {
        if ($this->user !== null) {
            DB::reconnect();
            UsageEvent::where('user_id', $this->user->id)->delete();
            NotebookNote::where('user_id', $this->user->id)->delete();
            $this->user->delete();
            if ($this->savedPolicy !== null) {
                FeatureAccessPolicy::where('feature_key', FeatureRegistry::NOTEBOOK)->update($this->savedPolicy);
            }
        }
        parent::tearDown();
    }

    public function test_des_requetes_simultanees_ne_depassent_pas_le_quota(): void
    {
        $policy = FeatureAccessPolicy::where('feature_key', FeatureRegistry::NOTEBOOK)->firstOrFail();
        $this->savedPolicy = $policy->only(['is_enabled', 'free_allowed', 'premium_allowed', 'free_quota', 'premium_quota', 'quota_period']);
        $policy->update(['is_enabled' => true, 'free_allowed' => true, 'free_quota' => 2, 'quota_period' => 'month']);

        $this->user = User::factory()->create(['role' => User::ROLE_STUDENT]);
        // Une unité déjà consommée : il en reste UNE pour quatre concurrents.
        UsageEvent::create(['user_id' => $this->user->id, 'usage_type' => 'notebook_copy', 'feature_key' => 'notebook', 'tier' => 'free']);

        $dir = sys_get_temp_dir().'/sa-race-'.getmypid().'-'.uniqid();
        mkdir($dir);
        $start = microtime(true) + 1.0;
        $userId = $this->user->id;

        DB::disconnect(); // aucun fils n'hérite de la socket du parent
        $pids = [];
        for ($i = 0; $i < self::WORKERS; $i++) {
            $pid = pcntl_fork();
            if ($pid === 0) {
                $this->worker($userId, $start, "{$dir}/{$i}");
            }
            $pids[] = $pid;
        }
        foreach ($pids as $pid) {
            pcntl_waitpid($pid, $status);
        }
        DB::reconnect();

        $results = array_map(fn ($i) => @file_get_contents("{$dir}/{$i}") ?: 'missing', range(0, self::WORKERS - 1));
        array_map('unlink', glob("{$dir}/*"));
        rmdir($dir);

        sort($results);
        $this->assertSame(['created', 'denied', 'denied', 'denied'], $results, 'une seule requête obtient la dernière unité');
        $this->assertSame(2, UsageEvent::where('user_id', $userId)->count());
        $this->assertSame(1, NotebookNote::where('user_id', $userId)->count());
    }

    /** Le corps d'un fils : sa connexion, le départ commun, une tentative, un fichier, SIGKILL. */
    private function worker(int $userId, float $start, string $file): never
    {
        $result = 'error';
        try {
            DB::reconnect();
            $service = app(FeatureAccessService::class);
            $service->forget();
            $user = User::findOrFail($userId);
            usleep((int) max(0, ($start - microtime(true)) * 1_000_000));

            $service->consume($user, FeatureRegistry::NOTEBOOK, function () use ($user) {
                usleep(300_000); // la fenêtre de course, DANS la section critique
                return NotebookNote::create(['user_id' => $user->id, 'content' => 'x', 'content_text' => 'x', 'note_type' => 'note']);
            });
            $result = 'created';
        } catch (FeatureAccessDenied) {
            $result = 'denied';
        } catch (\Throwable $e) {
            $result = 'error: '.$e->getMessage();
        }
        file_put_contents($file, $result);
        // SIGKILL : ni destructeurs ni fonctions d'arrêt de PHPUnit dans le fils.
        posix_kill(getmypid(), SIGKILL);
        exit(0);
    }
}
