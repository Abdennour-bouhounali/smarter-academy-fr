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
 * « الاسم و اللقب » — le nom de chaque compte, et les trois portes qui l'écrivent
 * (inscription, fin d'inscription Google, profil). Une seule règle pour les
 * trois : PersonName.
 */
class PersonNameTest extends TestCase
{
    use RefreshDatabase;

    private function registerPayload(array $overrides = []): array
    {
        return array_merge([
            'firstName' => 'أمين',
            'lastName' => 'بن علي',
            'email' => 'amine@example.dz',
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

        $this->assertDatabaseMissing('users', ['email' => 'amine@example.dz']);
    }

    public function test_l_inscription_enregistre_le_nom_normalise(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', $this->registerPayload([
            'firstName' => '  محمد   أمين ',
            'lastName' => 'بن  علي',
        ]))
            ->assertCreated()
            ->assertJsonPath('user.firstName', 'محمد أمين')
            ->assertJsonPath('user.lastName', 'بن علي')
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

        $this->patchJson('/api/v1/auth/profile', ['firstName' => ' سارة ', 'lastName' => 'آيت-يحيى'])
            ->assertOk()
            ->assertJsonPath('user.firstName', 'سارة')
            ->assertJsonPath('user.lastName', 'آيت-يحيى')
            ->assertJsonPath('user.nameComplete', true);

        $this->assertSame('سارة', $user->fresh()->first_name);
    }

    public function test_un_enseignant_modifie_aussi_son_nom(): void
    {
        Sanctum::actingAs($this->verifiedUser(['role' => User::ROLE_TEACHER]));

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'كريمة', 'lastName' => 'بوزيد'])
            ->assertOk()
            ->assertJsonPath('user.firstName', 'كريمة');
    }

    /** Lettres ARABES seulement : ni latin, ni chiffres (même ٠-٩), ni ponctuation, ni balises. */
    public function test_le_profil_refuse_ce_qui_n_est_pas_un_nom_arabe(): void
    {
        Sanctum::actingAs($this->verifiedUser(['first_name' => 'علي', 'last_name' => 'قاسي']));

        foreach (['Ali', 'Léa', 'علي Ali', 'ب', 'علي3', 'علي٣', 'علي،', '<b>علي</b>', '😀😀', '-علي', 'علي-', 'بن - علي', str_repeat('ب', 51)] as $bad) {
            $this->patchJson('/api/v1/auth/profile', ['firstName' => $bad, 'lastName' => 'قاسي'])
                ->assertStatus(422)
                ->assertJsonValidationErrors('firstName');
        }

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'علي'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('lastName');
    }

    public function test_les_harakat_et_la_tatweel_sont_acceptees(): void
    {
        Sanctum::actingAs($this->verifiedUser());

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'مُحَمَّد', 'lastName' => 'الجزائـري'])
            ->assertOk()
            ->assertJsonPath('user.firstName', 'مُحَمَّد');
    }

    /** Un nom latin d'avant la règle arabe ne compte pas : le compte repasse par l'étape. */
    public function test_un_nom_latin_existant_rend_le_compte_incomplet(): void
    {
        Sanctum::actingAs($this->verifiedUser(['first_name' => 'Amine', 'last_name' => 'Kaci']));

        $this->getJson('/api/v1/auth/me')->assertJsonPath('user.nameComplete', false);
    }

    public function test_l_inscription_refuse_un_nom_latin(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registerPayload(['firstName' => 'Amine']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('firstName');
    }

    public function test_le_profil_exige_une_adresse_verifiee(): void
    {
        Sanctum::actingAs($this->verifiedUser(['email_verified_at' => null]));

        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'علي', 'lastName' => 'قاسي'])
            ->assertStatus(403);
    }

    public function test_le_profil_exige_une_session(): void
    {
        $this->patchJson('/api/v1/auth/profile', ['firstName' => 'علي', 'lastName' => 'قاسي'])
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
            'firstName' => 'ليا',
            'lastName' => 'مرابط',
        ])->assertCreated()->assertJsonPath('user.nameComplete', true);

        $user = User::where('email', 'lea@gmail.com')->firstOrFail();
        $this->assertSame('ليا', $user->first_name);
        $this->assertSame('مرابط', $user->last_name);
    }

    public function test_google_refuse_le_nom_latin_de_google(): void
    {
        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $this->handoff(),
            'accept_legal' => true,
            'password' => 'Secret123',
            'firstName' => 'Léa',
            'lastName' => 'M',
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
