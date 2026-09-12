<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * LA COMMANDE DE REMISE À ZÉRO — et surtout ses refus.
 *
 * Une commande destructive doit être testée sur ce qu'elle NE fait PAS :
 * emporter un administrateur, ou s'exécuter sans qu'on l'ait demandée
 * explicitement. Le reste (elle supprime bien) est le cas facile.
 */
class PurgeStudentAccountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_simulation_ne_supprime_rien(): void
    {
        User::factory()->count(3)->create(['role' => 'student']);

        $this->artisan('smarter:purge-students', ['--dry-run' => true])
            ->assertSuccessful();

        $this->assertSame(3, User::where('role', 'student')->count());
    }

    public function test_sans_force_la_commande_refuse(): void
    {
        User::factory()->count(2)->create(['role' => 'student']);

        $this->artisan('smarter:purge-students')->assertFailed();

        $this->assertSame(2, User::where('role', 'student')->count());
    }

    /**
     * LE garde-fou : se verrouiller hors de sa propre plateforme est
     * l'accident que cette commande doit rendre impossible.
     */
    public function test_un_administrateur_n_est_jamais_supprime(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        User::factory()->count(2)->create(['role' => 'student']);

        $this->artisan('smarter:purge-students', ['--force' => true])
            ->expectsConfirmation(
                'Supprimer définitivement 2 compte(s) élève et TOUTES leurs données ?',
                'yes'
            )
            ->assertSuccessful();

        $this->assertSame(0, User::where('role', 'student')->count());
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'role' => User::ROLE_ADMIN]);
    }

    public function test_repondre_non_annule_la_suppression(): void
    {
        User::factory()->count(2)->create(['role' => 'student']);

        $this->artisan('smarter:purge-students', ['--force' => true])
            ->expectsConfirmation(
                'Supprimer définitivement 2 compte(s) élève et TOUTES leurs données ?',
                'no'
            )
            ->assertSuccessful();

        $this->assertSame(2, User::where('role', 'student')->count());
    }
}
