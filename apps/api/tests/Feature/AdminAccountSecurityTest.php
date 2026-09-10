<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Le compte administrateur : changer ses identifiants exige de prouver qu'on
 * les connaît, chasse les autres sessions, et ne laisse aucune valeur en
 * clair — ni en base, ni dans une réponse, ni dans le journal.
 */
class AdminAccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'password' => 'AncienMotDePasse@2026',
        ]);
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_le_profil_ne_renvoie_jamais_le_mot_de_passe(): void
    {
        $response = $this->asAdmin()->getJson('/api/v1/admin/account')->assertStatus(200);

        $body = $response->getContent();
        $this->assertStringNotContainsString('AncienMotDePasse', $body);
        $this->assertStringNotContainsString('password', strtolower($body));
    }

    public function test_changer_le_mot_de_passe_exige_l_ancien(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'ceNestPasLeBon',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'NouveauMotDePasse@2026',
        ])->assertStatus(422)->assertJsonPath('success', false);

        $this->assertTrue(Hash::check('AncienMotDePasse@2026', $this->admin->fresh()->password));
    }

    public function test_le_mot_de_passe_change_et_reste_hache(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'NouveauMotDePasse@2026',
        ])->assertStatus(200)->assertJsonPath('success', true);

        $stored = $this->admin->fresh()->password;
        $this->assertNotSame('NouveauMotDePasse@2026', $stored, 'jamais en clair');
        $this->assertTrue(Hash::check('NouveauMotDePasse@2026', $stored));
    }

    public function test_la_confirmation_doit_correspondre(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'AutreChose@2026',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_un_mot_de_passe_trop_faible_est_refuse(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'motdepasse',
            'password_confirmation' => 'motdepasse',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_le_nouveau_mot_de_passe_doit_differer_de_l_ancien(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'AncienMotDePasse@2026',
            'password_confirmation' => 'AncienMotDePasse@2026',
        ])->assertStatus(422);
    }

    /**
     * Un changement d'identifiant chasse les autres appareils — mais pas
     * celui qui vient de le faire.
     */
    public function test_changer_le_mot_de_passe_revoque_les_autres_sessions(): void
    {
        $this->admin->createToken('vieux-portable');
        $this->admin->createToken('vieille-tablette');
        $this->assertSame(2, $this->admin->tokens()->count());

        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'NouveauMotDePasse@2026',
        ])->assertStatus(200)->assertJsonPath('revokedSessions', 2);

        $this->assertSame(0, $this->admin->fresh()->tokens()->count());
    }

    public function test_changer_l_email_exige_le_mot_de_passe(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/email', [
            'currentPassword' => 'ceNestPasLeBon',
            'email' => 'nouveau@example.com',
        ])->assertStatus(422);

        $this->assertNotSame('nouveau@example.com', $this->admin->fresh()->email);
    }

    public function test_l_email_change_avec_le_bon_mot_de_passe(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/email', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'email' => 'nouveau@example.com',
        ])->assertStatus(200)->assertJsonPath('email', 'nouveau@example.com');

        $this->assertSame('nouveau@example.com', $this->admin->fresh()->email);
    }

    public function test_un_email_deja_pris_est_refuse(): void
    {
        User::factory()->create(['email' => 'occupe@example.com']);

        $this->asAdmin()->patchJson('/api/v1/admin/account/email', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'email' => 'occupe@example.com',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    /**
     * La règle la plus importante du journal : on retient QUE le mot de passe
     * a changé, jamais sa valeur — ni l'ancienne, ni la nouvelle.
     */
    public function test_le_journal_ne_contient_aucun_mot_de_passe(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'AncienMotDePasse@2026',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'NouveauMotDePasse@2026',
        ])->assertStatus(200);

        $log = AdminActivityLog::where('action', 'admin.password_changed')->first();
        $this->assertNotNull($log, 'le changement doit être tracé');

        $serialized = json_encode($log->toArray());
        $this->assertStringNotContainsString('AncienMotDePasse', $serialized);
        $this->assertStringNotContainsString('NouveauMotDePasse', $serialized);
        $this->assertNull($log->before);
        $this->assertNull($log->after);
    }

    /** Défense en profondeur : même passée par erreur, une valeur sensible est caviardée. */
    public function test_le_journal_caviarde_toute_valeur_sensible_qu_on_lui_passerait(): void
    {
        app(ActivityLogger::class)->log(
            $this->admin,
            'test.action',
            'admin',
            $this->admin->id,
            null,
            ['password' => 'SecretEnClair', 'token' => 'abc123', 'email' => 'ok@example.com'],
        );

        $log = AdminActivityLog::where('action', 'test.action')->first();
        $this->assertSame('[redacted]', $log->after['password']);
        $this->assertSame('[redacted]', $log->after['token']);
        $this->assertSame('ok@example.com', $log->after['email'], 'un email n\'est pas un secret');
    }

    public function test_un_eleve_ne_peut_pas_toucher_au_compte_admin(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->actingAs($student, 'sanctum')->patchJson('/api/v1/admin/account/password', [
            'currentPassword' => 'password',
            'password' => 'NouveauMotDePasse@2026',
            'password_confirmation' => 'NouveauMotDePasse@2026',
        ])->assertStatus(403);
    }
}
