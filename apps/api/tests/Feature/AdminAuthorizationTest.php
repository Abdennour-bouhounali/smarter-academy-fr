<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * La porte. Un élève ne doit atteindre AUCUN point d'entrée
 * d'administration — pas en changeant de route côté React, pas en appelant
 * l'API à la main.
 *
 * Ce test est écrit par balayage de TOUTES les routes /admin plutôt qu'une
 * par une : une route ajoutée demain sans protection sera attrapée ici sans
 * que personne n'ait à penser à l'ajouter.
 */
class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<int, array{string, string}> */
    private function adminRoutes(): array
    {
        $routes = [];

        foreach (app('router')->getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'api/v1/admin')) {
                continue;
            }

            $methods = array_diff($route->methods(), ['HEAD']);
            $uri = str_replace(['{code}', '{id}', '{type}'], ['fractions', '1', 'lesson'], $route->uri());

            foreach ($methods as $method) {
                $routes[] = [$method, '/'.$uri];
            }
        }

        return $routes;
    }

    public function test_un_visiteur_non_connecte_est_refuse_partout(): void
    {
        foreach ($this->adminRoutes() as [$method, $uri]) {
            $response = $this->json($method, $uri);

            $this->assertSame(
                401,
                $response->status(),
                "{$method} {$uri} devrait répondre 401 à un visiteur, a répondu {$response->status()}"
            );
        }
    }

    public function test_un_eleve_est_refuse_partout(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $token = $student->createToken('student-token')->plainTextToken;

        $routes = $this->adminRoutes();
        $this->assertGreaterThan(15, count($routes), 'le balayage doit couvrir toutes les routes admin');

        foreach ($routes as [$method, $uri]) {
            $response = $this->withHeader('Authorization', "Bearer {$token}")->json($method, $uri);

            $this->assertSame(
                403,
                $response->status(),
                "{$method} {$uri} devrait répondre 403 à un élève, a répondu {$response->status()}"
            );
        }
    }

    public function test_un_admin_passe_la_porte(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)->assertJsonPath('success', true);
    }

    /**
     * Le rôle ne vient jamais du client : une inscription produit toujours un
     * élève, quoi que le formulaire prétende envoyer.
     */
    public function test_une_inscription_ne_peut_pas_se_donner_le_role_admin(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'malin@example.com',
            'password' => 'motdepasse123',
            'role' => 'admin',
            'accept_legal' => true,
        ]);

        $response->assertStatus(201);
        $this->assertSame(User::ROLE_STUDENT, User::where('email', 'malin@example.com')->first()->role);
    }

    /**
     * Un admin suspendu est un admin qui n'entre plus : le statut de compte
     * s'applique aussi au personnel.
     */
    public function test_un_admin_suspendu_est_refuse(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $token = $admin->createToken('admin-token')->plainTextToken;

        $admin->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(403);
    }
}
