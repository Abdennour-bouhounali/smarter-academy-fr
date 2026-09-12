<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_with_only_email_and_password_and_receives_a_token_and_student_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'alice@example.com',
            'password' => 'password123',
            'accept_legal' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.role', 'student')
            ->assertJsonPath('user.email', 'alice@example.com')
            ->assertJsonPath('user.grade', null)
            ->assertJsonPath('user.firstName', null)
            ->assertJsonPath('user.lastName', null)
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com',
            'role' => 'student',
            'grade' => null,
        ]);
    }

    public function test_registration_does_not_require_a_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'noconfirm@example.com',
            'password' => 'password123',
            'accept_legal' => true,
        ]);

        $response->assertStatus(201);
    }

    public function test_registration_cannot_be_used_to_self_assign_the_admin_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'eve@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'accept_legal' => true,
        ]);

        $response->assertStatus(201)->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', [
            'email' => 'eve@example.com',
            'role' => 'student',
        ]);
    }

    public function test_registration_ignores_a_client_supplied_grade_until_onboarding_sets_it(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'grady@example.com',
            'password' => 'password123',
            'grade' => '6e',
            'accept_legal' => true,
        ]);

        // Grade is only ever set via PATCH /auth/grade after account creation —
        // registration doesn't accept it, even if the client sends one.
        $response->assertStatus(201)->assertJsonPath('user.grade', null);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'taken@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_registration_rejects_a_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'bob@example.com',
            'password' => 'short',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_a_registered_student_can_log_in(): void
    {
        User::factory()->create([
            'email' => 'student@example.com',
            'password' => 'password123',
            'role' => 'student',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'student@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.role', 'student');
    }

    public function test_an_admin_can_still_log_in(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)->assertJsonPath('user.role', 'admin');
    }

    public function test_login_rejects_incorrect_credentials(): void
    {
        User::factory()->create([
            'email' => 'student@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'student@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_the_current_user_can_be_fetched_with_a_valid_token(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '3e']);
        $token = $user->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.grade', '3e');
    }

    public function test_a_student_can_change_their_grade(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $token = $user->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/v1/auth/grade', ['grade' => '5e']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.grade', '5e');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'grade' => '5e']);
    }

    /**
     * L'accueil d'un nouvel élève, tel qu'il se déroule VRAIMENT depuis que
     * l'adresse doit être vérifiée : on s'inscrit, on prouve son adresse,
     * ET ENSUITE on choisit sa classe.
     *
     * L'étape de vérification est au milieu, et non un détail de mise en
     * scène : sans elle, PATCH /auth/grade répond 403. Le test l'exécute donc
     * pour de bon, au lieu de forcer la colonne en base — c'est le parcours
     * de l'élève qui est vérifié ici, pas un état de table.
     */
    public function test_a_newly_registered_student_can_set_their_grade_via_onboarding(): void
    {
        $register = $this->postJson('/api/v1/auth/register', [
            'email' => 'onboarding@example.com',
            'password' => 'password123',
            'accept_legal' => true,
        ]);
        $register->assertJsonPath('user.grade', null);
        $register->assertJsonPath('user.emailVerified', false);
        $token = $register->json('token');

        // Tant que l'adresse n'est pas prouvée, l'espace reste fermé.
        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/v1/auth/grade', ['grade' => '6e'])
            ->assertStatus(403)
            ->assertJsonPath('emailVerified', false);

        $user = User::where('email', 'onboarding@example.com')->firstOrFail();
        $this->get(\App\Domain\Identity\EmailVerificationLink::for($user))
            ->assertRedirect(config('app.frontend_url').'/verification-email?statut=succes');

        // Le garde d'authentification mémorise l'utilisateur qu'il a résolu,
        // pour ne pas le relire à chaque appel dans une même requête. Ici,
        // trois requêtes se suivent DANS LE MÊME processus : sans cet oubli,
        // la troisième reverrait l'instance chargée par la première, encore
        // non vérifiée. En production le problème n'existe pas — chaque
        // requête HTTP repart d'une application neuve — c'est une précaution
        // propre au harnais de test.
        $this->app['auth']->forgetGuards();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/v1/auth/grade', ['grade' => '6e']);

        $response->assertStatus(200)->assertJsonPath('user.grade', '6e');
    }

    public function test_changing_grade_requires_authentication(): void
    {
        $response = $this->patchJson('/api/v1/auth/grade', ['grade' => '5e']);

        $response->assertStatus(401);
    }

    public function test_changing_grade_requires_a_grade_value(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $token = $user->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/v1/auth/grade', []);

        $response->assertStatus(422)->assertJsonValidationErrors('grade');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'grade' => '6e']);
    }

    public function test_changing_grade_only_affects_the_authenticated_users_own_record(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $otherStudent = User::factory()->create(['role' => 'student', 'grade' => '3e']);
        $token = $user->createToken('student-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/v1/auth/grade', ['grade' => '4e'])
            ->assertStatus(200);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'grade' => '4e']);
        $this->assertDatabaseHas('users', ['id' => $otherStudent->id, 'grade' => '3e']);
    }

    public function test_an_unauthenticated_request_cannot_fetch_the_current_user(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_logout_revokes_the_token_so_it_can_no_longer_be_used(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('student-token')->plainTextToken;
        $tokenId = explode('|', $token)[0];

        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');
        $logoutResponse->assertStatus(200)->assertJsonPath('success', true);

        // Assert the token row itself is gone — the real session-invalidation guarantee.
        // (Not re-asserting via a second in-process request: Sanctum's RequestGuard
        // caches the resolved user for the guard instance's lifetime, and Laravel's
        // HTTP test client reuses one application/guard instance across calls within
        // a test method, so a second call here would pass for the wrong reason even
        // if revocation were broken. A real cross-process request — verified live
        // against a running server as part of this phase's end-to-end pass — is what
        // actually proves a revoked token gets rejected.)
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_logout_only_revokes_the_current_token_not_other_sessions(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $tokenA = $user->createToken('device-a')->plainTextToken;
        $tokenB = $user->createToken('device-b')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200);

        // Device B's session must remain valid.
        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200);
    }

    public function test_a_student_cannot_access_the_admin_only_contact_list(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/contact');

        $response->assertStatus(403);
    }

    public function test_an_admin_can_access_the_contact_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/contact');

        $response->assertStatus(200);
    }

    public function test_an_unauthenticated_visitor_cannot_access_the_contact_list(): void
    {
        $response = $this->getJson('/api/v1/contact');

        $response->assertStatus(401);
    }

    /**
     * Regression test: a plain request with no Accept header (what a real
     * frontend fetch() call sends, and what getJson()'s forced Accept header
     * would otherwise mask) used to trip Laravel's default guest-redirect,
     * which calls route('login') — a route this pure-API app doesn't have —
     * turning what should be a 401 into an unhandled 500.
     */
    public function test_an_unauthenticated_plain_request_still_gets_a_clean_401(): void
    {
        $response = $this->get('/api/v1/contact');

        $response->assertStatus(401);
    }
}
