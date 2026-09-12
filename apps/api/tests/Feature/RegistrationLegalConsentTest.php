<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * LE CONSENTEMENT LÉGAL À L'INSCRIPTION.
 *
 * Ce que ces tests protègent : qu'un compte ne puisse pas naître sans
 * consentement, et que la version acceptée vienne du SERVEUR. La seconde
 * moitié est la plus facile à casser sans s'en apercevoir — il suffirait
 * qu'un jour quelqu'un « rende le formulaire plus souple » en acceptant la
 * version envoyée par le client.
 */
class RegistrationLegalConsentTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'email' => 'nouvelle@example.com',
            'password' => 'password123',
            'accept_legal' => true,
        ], $overrides);
    }

    public function test_une_inscription_valide_enregistre_les_versions_et_la_date(): void
    {
        $this->travelTo(now()->setTime(10, 0));

        $this->postJson('/api/v1/auth/register', $this->payload())
            ->assertStatus(201);

        $user = User::where('email', 'nouvelle@example.com')->firstOrFail();

        $this->assertSame(config('legal.terms_version'), $user->terms_accepted_version);
        $this->assertSame(config('legal.privacy_version'), $user->privacy_policy_accepted_version);
        $this->assertNotNull($user->legal_consent_at);
        $this->assertTrue($user->legal_consent_at->equalTo(now()));
    }

    public function test_sans_la_case_cochee_aucun_compte_n_est_cree(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload(['accept_legal' => false]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('accept_legal');

        $this->assertDatabaseMissing('users', ['email' => 'nouvelle@example.com']);
    }

    public function test_la_case_absente_est_refusee_comme_une_case_decochee(): void
    {
        $payload = $this->payload();
        unset($payload['accept_legal']);

        $this->postJson('/api/v1/auth/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('accept_legal');

        $this->assertDatabaseMissing('users', ['email' => 'nouvelle@example.com']);
    }

    /**
     * LE test de cette suite.
     *
     * Le client annonce avoir accepté une version ancienne — celle qui
     * l'arrange, ou celle qu'un script a inventée. Le serveur n'en tient
     * aucun compte : il écrit la version qui a cours.
     */
    public function test_les_versions_envoyees_par_le_client_sont_ignorees(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload([
            'terms_accepted_version' => '1999-01-01',
            'privacy_policy_accepted_version' => '1999-01-01',
            'legal_consent_at' => '1999-01-01T00:00:00Z',
            'cgu_version' => '1999-01-01',
        ]))->assertStatus(201);

        $user = User::where('email', 'nouvelle@example.com')->firstOrFail();

        $this->assertSame(config('legal.terms_version'), $user->terms_accepted_version);
        $this->assertSame(config('legal.privacy_version'), $user->privacy_policy_accepted_version);
        $this->assertNotSame('1999-01-01', $user->terms_accepted_version);
        $this->assertTrue($user->legal_consent_at->year >= 2026);
    }

    public function test_le_mot_de_passe_est_hache_et_l_adresse_n_est_pas_verifiee(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload())->assertStatus(201);

        $user = User::where('email', 'nouvelle@example.com')->firstOrFail();

        $this->assertNotSame('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
        $this->assertNull($user->email_verified_at);
    }

    /**
     * §23 : les comptes antérieurs ne reçoivent AUCUN consentement fabriqué.
     * La migration laisse les colonnes nulles, et rien ne les remplit après
     * coup — « null » se lit « n'a jamais accepté », ce qui est la vérité.
     */
    public function test_un_compte_anterieur_ne_recoit_pas_de_consentement_fabrique(): void
    {
        $ancien = User::factory()->create(['role' => 'student']);

        $this->assertNull($ancien->terms_accepted_version);
        $this->assertNull($ancien->privacy_policy_accepted_version);
        $this->assertNull($ancien->legal_consent_at);

        // Se connecter ne fabrique pas davantage de consentement.
        $this->postJson('/api/v1/auth/login', [
            'email' => $ancien->email,
            'password' => 'password',
        ])->assertStatus(200);

        $this->assertNull($ancien->fresh()->legal_consent_at);
    }

    public function test_les_versions_legales_sont_publiques_et_en_lecture_seule(): void
    {
        $this->getJson('/api/v1/legal/versions')
            ->assertStatus(200)
            ->assertJsonPath('versions.terms', config('legal.terms_version'))
            ->assertJsonPath('versions.privacy', config('legal.privacy_version'));
    }
}
