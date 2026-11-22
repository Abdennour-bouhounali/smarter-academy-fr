<?php

namespace Tests\Feature;

use App\Domain\Identity\PendingGoogleSignup;
use App\Domain\Identity\GoogleIdentity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Prénom et nom — le nom de chaque compte, et les trois portes qui l'écrivent
 * (inscription, fin d'inscription Google, profil). Une seule règle pour les
 * trois : PersonName.
 */
class PersonNameTest extends TestCase
{
    use RefreshDatabase;

    private function registerPayload(array $overrides = []): array
    {
        return array_merge([
            'firstName' => 'Zoé',
            'lastName' => 'D\'Almeida',
            'email' => 'zoe@example.fr',
            'password' => 'password123',
            'accept_legal' => true,
        ], $overrides);
    }

    private function verifiedUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => User::ROLE_STUDENT,
            'email_verified_at' => now(),
            'first_name' => null,
            'last_name' => null,
        ], $attributes));
    }

    // ── INSCRIPTION ────────────────────────────────────────────────────

    public function test_l_inscription_exige_le_prenom_et_le_nom(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registerPayload(['firstName' => '', 'lastName' => null]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['firstName', 'lastName']);

        $this->assertDatabaseMissing('users', ['email' => 'zoe@example.fr']);
    }

    public function test_l_inscription_enregistre_le_nom_normalise(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', $this->registerPayload([
            'firstName' => '  Jean   Pierre ',
            'lastName' => 'Le  Goff',
        ]))
            ->assertCreated()
            ->assertJsonPath('user.firstName', 'Jean Pierre')
            ->assertJsonPath('user.lastName', 'Le Goff')
            ->assertJsonPath('user.nameComplete', true);
    }

    // ── PROFIL ─────────────────────────────────────────────────────────

    public function test_un_compte_sans_nom_est_signale_incomplet(): void
    {
        Sanctum::actingAs($this->verifiedUser());

        $this->getJson('/api/v1/auth/me')->assertJsonPath('user.nameComplete', false);
    }

    public function test_un_eleve_modifie_son_nom(): void
    {
        $user = $this->verifiedUser();
        Sanctum::actingAs($user);

        $this->patchJson('/api/v1/auth/profile', ['firstName' => ' Jean-Pierre ', 'lastName' => 'O’Neil'])
            ->assertOk()
            ->assertJsonPath('user.firstName', 'Jean-Pierre')
            ->assertJsonPath('user.lastName', 'O’Neil')
            ->assertJsonPath('user.nameComplete', true);

        $this->assertSame('Jean-Pierre', $user->fresh()->first_name);
    }

    public function test_un_enseignant_modifie_aussi_son_nom(): void
    {
        Sanctum::actingAs($this->verifiedUser(['role' => User::ROLE_TEACHER]));

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'Hélène', 'lastName' => 'Benali'])
            ->assertOk()
            ->assertJsonPath('user.firstName', 'Hélène');
    }

    /** Des lettres seulement : ni chiffres, ni ponctuation, ni balises, ni séparateur en tête, en queue ou doublé. */
    public function test_le_profil_refuse_ce_qui_n_est_pas_un_nom(): void
    {
        Sanctum::actingAs($this->verifiedUser(['first_name' => 'Léa', 'last_name' => 'Martin']));

        foreach (['Léa3', '3', 'Léa!', 'Léa,', 'Léa.', '<script>', '<b>Léa</b>', '😀😀', '-Léa', 'Léa-', 'Jean - Pierre', 'Jean--Pierre', "'Léa", 'Léa_Martin', 'Léa@', str_repeat('a', 51)] as $bad) {
            $this->patchJson('/api/v1/auth/profile', ['firstName' => $bad, 'lastName' => 'Martin'])
                ->assertStatus(422)
                ->assertJsonValidationErrors('firstName');
        }

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'Léa'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('lastName');
    }

    /** Un nom en lettres arabes est refusé avec la même erreur qu'un nom à chiffres. */
    public function test_le_profil_refuse_un_nom_en_lettres_arabes(): void
    {
        Sanctum::actingAs($this->verifiedUser(['first_name' => 'Léa', 'last_name' => 'Martin']));

        foreach (['علي', 'Léa علي'] as $bad) {
            $this->patchJson('/api/v1/auth/profile', ['firstName' => $bad, 'lastName' => 'Martin'])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['firstName' => 'Le prénom ne peut contenir que des lettres']);
        }
    }

    public function test_les_accents_les_apostrophes_et_les_traits_d_union_sont_acceptes(): void
    {
        Sanctum::actingAs($this->verifiedUser());

        foreach ([['Zoé', 'D\'Almeida'], ['Jean-Pierre', 'O’Neil'], ['Maëlle', 'Lefèvre'], ['Françoise', 'Œuvray'], ['Noé', 'Ü']] as [$first, $last]) {
            $this->patchJson('/api/v1/auth/profile', ['firstName' => $first, 'lastName' => $last])
                ->assertOk()
                ->assertJsonPath('user.firstName', $first)
                ->assertJsonPath('user.lastName', $last);
        }
    }

    /** Un nom enregistré qui ne passe pas la règle ne compte pas : le compte repasse par l'étape. */
    public function test_un_nom_invalide_existant_rend_le_compte_incomplet(): void
    {
        Sanctum::actingAs($this->verifiedUser(['first_name' => 'أمين', 'last_name' => 'Kaci']));

        $this->getJson('/api/v1/auth/me')->assertJsonPath('user.nameComplete', false);
    }

    public function test_l_inscription_refuse_un_nom_avec_des_chiffres(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registerPayload(['firstName' => 'Zoé2']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('firstName');
    }

    public function test_le_profil_exige_une_adresse_verifiee(): void
    {
        Sanctum::actingAs($this->verifiedUser(['email_verified_at' => null]));

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'Léa', 'lastName' => 'Martin'])
            ->assertStatus(403);
    }

    public function test_le_profil_exige_une_session(): void
    {
        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'Léa', 'lastName' => 'Martin'])
            ->assertStatus(401);
    }

    // ── GOOGLE ─────────────────────────────────────────────────────────

    private function handoff(): string
    {
        return PendingGoogleSignup::issue(new GoogleIdentity(
            providerUserId: '1000000000000000077',
            email: 'lea@gmail.com',
            emailVerified: true,
            firstName: 'Léa',
            lastName: 'M',
        ));
    }

    /** Google SUGGÈRE ; c'est le nom confirmé à la première connexion qui est enregistré. */
    public function test_google_enregistre_le_nom_confirme_et_non_celui_de_google(): void
    {
        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $this->handoff(),
            'accept_legal' => true,
            'password' => 'Secret123',
            'firstName' => 'Léa-Rose',
            'lastName' => 'Mercier',
        ])->assertCreated()->assertJsonPath('user.nameComplete', true);

        $user = User::where('email', 'lea@gmail.com')->firstOrFail();
        $this->assertSame('Léa-Rose', $user->first_name);
        $this->assertSame('Mercier', $user->last_name);
    }

    public function test_google_refuse_un_nom_invalide(): void
    {
        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $this->handoff(),
            'accept_legal' => true,
            'password' => 'Secret123',
            'firstName' => 'L3a',
            'lastName' => '<b>M</b>',
        ])->assertStatus(422)->assertJsonValidationErrors(['firstName', 'lastName']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_google_ne_cree_rien_sans_nom_confirme(): void
    {
        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $this->handoff(),
            'accept_legal' => true,
            'password' => 'Secret123',
        ])->assertStatus(422)->assertJsonValidationErrors(['firstName', 'lastName']);

        $this->assertDatabaseCount('users', 0);
    }
}
