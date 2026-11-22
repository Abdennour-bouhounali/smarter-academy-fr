<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * LA LIBRAIRIE FERMÉE (config/books.php, défaut fermé) : chaque route de la
 * librairie répond 404 — même sans compte, même pour l'administrateur — et
 * le seeder ne sème pas de livre. La suite tourne librairie OUVERTE
 * (phpunit.xml) ; ce test la ferme lui-même.
 */
class BooksSwitchTest extends TestCase
{
    use RefreshDatabase;

    private const BOOK_PATHS = '#^api/v1/(books(/|$)|admin/(books|book-orders|book-order-payments|book-messages|book-managers)(/|$))#';

    public function test_le_defaut_est_ferme(): void
    {
        $config = require config_path('books.php');
        if (getenv('BOOKS_ENABLED') === false) {
            $this->assertFalse($config['enabled']);
        }
        $this->assertStringContainsString("env('BOOKS_ENABLED', false)", (string) file_get_contents(config_path('books.php')));
    }

    public function test_fermee_une_route_publique_repond_404(): void
    {
        config(['books.enabled' => false]);

        $this->getJson('/api/v1/books')->assertNotFound();
        $this->getJson('/api/v1/books/wilayas')->assertNotFound();
        $this->postJson('/api/v1/books/smart-protocol/orders', [])->assertNotFound();
    }

    public function test_fermee_une_route_d_administration_repond_404_meme_a_l_administrateur(): void
    {
        config(['books.enabled' => false]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'email_verified_at' => now()]);

        $this->getJson('/api/v1/admin/books')->assertNotFound();
        $this->withToken($admin->createToken('t')->plainTextToken)->getJson('/api/v1/admin/books')->assertNotFound();
        $this->withToken($admin->createToken('t')->plainTextToken)->getJson('/api/v1/admin/book-managers')->assertNotFound();
    }

    /** Toutes les routes de la librairie portent l'interrupteur, et lui en premier. */
    public function test_chaque_route_de_la_librairie_porte_l_interrupteur_en_premier(): void
    {
        $found = 0;
        foreach (Route::getRoutes() as $route) {
            if (! preg_match(self::BOOK_PATHS, $route->uri())) {
                continue;
            }
            $found++;
            $middleware = $route->gatherMiddleware();
            $this->assertSame('books.enabled', $middleware[array_key_first(array_filter($middleware, fn ($m) => $m !== 'api'))] ?? null, $route->uri());
        }
        $this->assertGreaterThanOrEqual(20, $found);
    }

    public function test_fermee_ouverte_les_autres_routes_du_tableau_de_bord_restent(): void
    {
        config(['books.enabled' => false]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'email_verified_at' => now()]);

        $this->withToken($admin->createToken('t')->plainTextToken)->getJson('/api/v1/admin/account')->assertOk();
    }

    public function test_fermee_le_seeder_ne_seme_pas_de_livre(): void
    {
        config(['books.enabled' => false]);
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('books', 0);
    }
}
