<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/** « مسيّرو المكتبة » : l'administrateur les crée, les suspend, réédite leur mot de passe. */
class BookManagerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    public function test_l_admin_cree_un_gestionnaire_qui_peut_se_connecter(): void
    {
        $response = $this->actingAs($this->admin())->postJson('/api/v1/admin/book-managers', [
            'firstName' => 'سمير', 'lastName' => 'بلقاسم', 'email' => 'Libraire@Example.com',
        ])->assertStatus(201);

        $password = $response->json('password');
        $this->assertNotEmpty($password);

        $manager = User::where('email', 'libraire@example.com')->firstOrFail();
        $this->assertSame(User::ROLE_BOOK_MANAGER, $manager->role);
        $this->assertNotNull($manager->email_verified_at);

        $this->assertTrue(Hash::check($password, $manager->password));

        $this->actingAs($this->admin())->getJson('/api/v1/admin/book-managers')
            ->assertOk()->assertJsonPath('managers.0.email', 'libraire@example.com');
    }

    public function test_une_adresse_deja_utilisee_est_refusee(): void
    {
        User::factory()->create(['email' => 'pris@example.com', 'role' => User::ROLE_STUDENT]);

        $this->actingAs($this->admin())->postJson('/api/v1/admin/book-managers', [
            'firstName' => 'أ', 'lastName' => 'ب', 'email' => 'pris@example.com',
        ])->assertStatus(422)->assertJsonPath('reason', 'email_taken');

        $this->assertSame(User::ROLE_STUDENT, User::where('email', 'pris@example.com')->first()->role);
    }

    public function test_suspendre_ferme_la_porte_et_reactiver_la_rouvre(): void
    {
        $manager = User::factory()->create(['role' => User::ROLE_BOOK_MANAGER, 'email_verified_at' => now()]);
        $admin = $this->admin();

        $this->actingAs($admin)->patchJson("/api/v1/admin/book-managers/{$manager->id}/status", ['status' => 'suspended'])
            ->assertOk()->assertJsonPath('manager.status', 'suspended');

        $token = $manager->fresh()->createToken('t')->plainTextToken;
        $this->app['auth']->forgetGuards();
        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/v1/admin/book-orders')->assertStatus(403);

        $this->app['auth']->forgetGuards();
        $this->withHeaders(['Authorization' => ''])->actingAs($admin)
            ->patchJson("/api/v1/admin/book-managers/{$manager->id}/status", ['status' => 'active'])
            ->assertOk()->assertJsonPath('manager.status', 'active');
    }

    public function test_reediter_le_mot_de_passe_ferme_les_sessions(): void
    {
        $manager = User::factory()->create(['role' => User::ROLE_BOOK_MANAGER]);
        $manager->createToken('old');

        $response = $this->actingAs($this->admin())->postJson("/api/v1/admin/book-managers/{$manager->id}/password")
            ->assertOk();

        $this->assertNotEmpty($response->json('password'));
        $this->assertSame(0, $manager->tokens()->count());
    }

    public function test_seul_un_gestionnaire_peut_etre_vise(): void
    {
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);

        $this->actingAs($this->admin())->postJson("/api/v1/admin/book-managers/{$teacher->id}/password")
            ->assertNotFound();
    }
}
