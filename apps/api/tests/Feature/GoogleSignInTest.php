<?php

namespace Tests\Feature;

use App\Domain\Identity\GoogleAccountLinker;
use App\Domain\Identity\GoogleIdentity;
use App\Domain\Identity\GoogleIdentityRejected;
use App\Domain\Identity\GoogleLinkOutcome;
use App\Domain\Identity\LegalConsent;
use App\Models\User;
use App\Models\UserIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * « CONTINUER AVEC GOOGLE » — et surtout, la règle de liaison.
 *
 * C'est la suite la plus importante du lot : une erreur ici ne produit pas un
 * bug mais un DÉTOURNEMENT DE COMPTE. Chaque test nomme l'attaque qu'il
 * empêche plutôt que la fonction qu'il appelle.
 *
 * Les tests portent sur GoogleAccountLinker, et non sur le contrôleur :
 * la règle vit là, et l'y éprouver directement évite de simuler Google pour
 * vérifier une décision qui ne dépend pas de lui.
 */
class GoogleSignInTest extends TestCase
{
    use RefreshDatabase;

    private function linker(): GoogleAccountLinker
    {
        return app(GoogleAccountLinker::class);
    }

    private function identity(array $o = []): GoogleIdentity
    {
        return new GoogleIdentity(
            providerUserId: $o['sub'] ?? '1000000000000000001',
            email: $o['email'] ?? 'eleve@gmail.com',
            emailVerified: $o['verified'] ?? true,
            firstName: $o['first'] ?? 'Léa',
            lastName: $o['last'] ?? 'Martin',
        );
    }

    // ── CRÉATION ────────────────────────────────────────────────────────

    public function test_une_identite_inconnue_ne_cree_rien_et_demande_le_consentement(): void
    {
        $outcome = $this->linker()->resolve($this->identity());

        $this->assertSame(GoogleLinkOutcome::NEEDS_CONSENT, $outcome->kind);
        $this->assertNull($outcome->user);

        // §22 : RIEN n'a été créé avant le consentement.
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('user_identities', 0);
    }

    public function test_le_compte_cree_est_verifie_sans_mot_de_passe_et_a_consenti(): void
    {
        $user = $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());

        $this->assertSame('eleve@gmail.com', $user->email);
        $this->assertSame(User::ROLE_STUDENT, $user->role);
        $this->assertSame('Léa', $user->first_name);

        // L'adresse est prouvée par Google : pas de courriel de vérification.
        $this->assertNotNull($user->email_verified_at);

        // PAS de mot de passe fabriqué.
        $this->assertNull($user->password);
        $this->assertFalse($user->hasPassword());

        // Le consentement est enregistré, aux versions du SERVEUR.
        $this->assertSame(config('legal.terms_version'), $user->terms_accepted_version);
        $this->assertSame(config('legal.privacy_version'), $user->privacy_policy_accepted_version);
        $this->assertNotNull($user->legal_consent_at);

        $this->assertDatabaseHas('user_identities', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '1000000000000000001',
        ]);
    }

    public function test_une_identite_deja_liee_reconnecte_le_meme_compte(): void
    {
        $user = $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());

        $outcome = $this->linker()->resolve($this->identity());

        $this->assertSame(GoogleLinkOutcome::SIGNED_IN, $outcome->kind);
        $this->assertSame($user->id, $outcome->user->id);

        // Aucun doublon.
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('user_identities', 1);
    }

    /**
     * L'identité fait foi, pas l'adresse : un élève qui change d'adresse chez
     * Google retrouve SON compte, et ne s'en fabrique pas un second.
     */
    public function test_un_changement_d_adresse_chez_google_ne_cree_pas_de_second_compte(): void
    {
        $user = $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());

        $outcome = $this->linker()->resolve($this->identity(['email' => 'nouvelle@gmail.com']));

        $this->assertSame(GoogleLinkOutcome::SIGNED_IN, $outcome->kind);
        $this->assertSame($user->id, $outcome->user->id);
        $this->assertDatabaseCount('users', 1);

        // L'archive suit ; le courriel du COMPTE ne bouge pas tout seul.
        $this->assertDatabaseHas('user_identities', ['provider_email' => 'nouvelle@gmail.com']);
        $this->assertSame('eleve@gmail.com', $user->fresh()->email);
    }

    // ── LIAISON À UN COMPTE EXISTANT (§16) ──────────────────────────────

    /**
     * Le cas nommé dans la consigne : student@gmail.com existe déjà avec un
     * mot de passe, et la même personne arrive par Google.
     */
    public function test_un_compte_existant_verifie_est_lie_sans_doublon(): void
    {
        $existant = User::factory()->create([
            'email' => 'eleve@gmail.com',
            'role' => 'student',
            'grade' => '3e',
        ]);
        $jeton = $existant->createToken('student-token')->plainTextToken;

        $outcome = $this->linker()->resolve($this->identity());

        $this->assertSame(GoogleLinkOutcome::LINKED, $outcome->kind);
        $this->assertSame($existant->id, $outcome->user->id);

        // UN seul compte : c'est tout l'enjeu (la facturation, la
        // progression et les droits d'accès suivent le même user_id).
        $this->assertDatabaseCount('users', 1);
        $this->assertSame('3e', $outcome->user->grade);

        // Le compte était déjà vérifié de NOTRE côté : les deux preuves
        // désignent la même personne, la session en cours n'est pas coupée.
        $this->assertSame(1, $existant->fresh()->tokens()->count());
        $this->assertNotEmpty($jeton);
    }

    /**
     * Le compte local n'a jamais prouvé son adresse : il a pu être créé par
     * un tiers avec l'adresse d'autrui. Google prouve la possession, donc on
     * lie — ET on coupe les sessions ouvertes sans preuve.
     */
    public function test_un_compte_local_non_verifie_est_lie_mais_ses_jetons_sont_revoques(): void
    {
        $imposteur = User::factory()->unverified()->create([
            'email' => 'eleve@gmail.com',
            'role' => 'student',
        ]);
        $imposteur->createToken('student-token');
        $this->assertSame(1, $imposteur->tokens()->count());

        $outcome = $this->linker()->resolve($this->identity());

        $this->assertSame(GoogleLinkOutcome::LINKED, $outcome->kind);
        $this->assertSame($imposteur->id, $outcome->user->id);

        // Les jetons de qui n'avait rien prouvé sont révoqués.
        $this->assertSame(0, $imposteur->fresh()->tokens()->count());
        // Et l'adresse est désormais prouvée.
        $this->assertNotNull($imposteur->fresh()->email_verified_at);
    }

    // ── REFUS ───────────────────────────────────────────────────────────

    /**
     * Sans preuve de possession de l'adresse, la rapprocher d'un compte local
     * laisserait n'importe qui revendiquer l'adresse d'autrui.
     */
    public function test_une_adresse_non_verifiee_chez_google_est_refusee(): void
    {
        User::factory()->create(['email' => 'eleve@gmail.com', 'role' => 'student']);

        $this->expectException(GoogleIdentityRejected::class);

        $this->linker()->resolve($this->identity(['verified' => false]));
    }

    public function test_une_adresse_non_verifiee_ne_peut_pas_creer_de_compte(): void
    {
        $this->expectException(GoogleIdentityRejected::class);

        $this->linker()->createFromIdentity(
            $this->identity(['verified' => false]),
            LegalConsent::current()
        );
    }

    /**
     * Deux identités Google différentes pour un même compte local : la
     * seconde donnerait une clé de plus à une autre personne. On refuse.
     */
    public function test_un_compte_deja_lie_refuse_une_seconde_identite_google(): void
    {
        $user = $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());
        $this->assertNotNull($user->id);

        $this->expectException(GoogleIdentityRejected::class);

        // Même adresse, AUTRE identifiant Google.
        $this->linker()->resolve($this->identity(['sub' => '9999999999999999999']));
    }

    /**
     * Une identité Google ne peut appartenir qu'à un seul compte local — et
     * c'est la BASE qui le garantit, pas seulement le code.
     */
    public function test_une_identite_google_ne_peut_pas_appartenir_a_deux_comptes(): void
    {
        $premier = $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());
        $second = User::factory()->create(['email' => 'autre@example.com', 'role' => 'student']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        UserIdentity::create([
            'user_id' => $second->id,
            'provider' => 'google',
            'provider_user_id' => '1000000000000000001',
            'provider_email' => 'eleve@gmail.com',
        ]);

        $this->assertNotNull($premier);
    }

    // ── LE MOT DE PASSE D'UN COMPTE GOOGLE ──────────────────────────────

    /**
     * Un compte Google n'a pas de mot de passe. Aucun mot de passe ne doit
     * donc pouvoir l'ouvrir — surtout pas la chaîne vide.
     */
    public function test_aucun_mot_de_passe_n_ouvre_un_compte_google(): void
    {
        $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());

        // La chaîne vide est arrêtée plus tôt encore, par la validation
        // (422) : le champ est obligatoire. Les autres arrivent jusqu'à la
        // vérification du mot de passe et sont refusées (401). Dans les deux
        // cas, ce qui compte est qu'AUCUNE ne délivre de jeton.
        foreach (['', 'password', 'password123', '0'] as $tentative) {
            $reponse = $this->postJson('/api/v1/auth/login', [
                'email' => 'eleve@gmail.com',
                'password' => $tentative,
            ]);

            $this->assertContains($reponse->getStatusCode(), [401, 422]);
            $this->assertNull($reponse->json('token'));
        }
    }

    public function test_la_connexion_oriente_vers_google_plutot_que_de_mentir(): void
    {
        $this->linker()->createFromIdentity($this->identity(), LegalConsent::current());

        $this->postJson('/api/v1/auth/login', [
            'email' => 'eleve@gmail.com',
            'password' => 'peu-importe',
        ])
            ->assertStatus(401)
            ->assertJsonPath('message', 'Ce compte se connecte avec Google. Utilisez « Continuer avec Google ».');
    }

    // ── LE POINT D'ENTRÉE ───────────────────────────────────────────────

    public function test_la_creation_google_exige_le_consentement(): void
    {
        $handoff = \App\Domain\Identity\PendingGoogleSignup::issue($this->identity());

        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $handoff,
            'accept_legal' => false,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('accept_legal');

        $this->assertDatabaseCount('users', 0);
    }

    public function test_la_creation_google_enregistre_les_versions_du_serveur(): void
    {
        $handoff = \App\Domain\Identity\PendingGoogleSignup::issue($this->identity());

        $response = $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $handoff,
            'accept_legal' => true,
            // Le client tente d'imposer sa version : ignorée.
            'terms_accepted_version' => '1999-01-01',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['token'])
            ->assertJsonPath('user.emailVerified', true)
            ->assertJsonPath('user.hasPassword', false)
            ->assertJsonPath('user.termsAcceptedVersion', config('legal.terms_version'));
    }

    /**
     * Le jeton d'attente est chiffré : le navigateur ne peut pas y glisser
     * l'adresse de quelqu'un d'autre.
     */
    public function test_un_jeton_d_attente_falsifie_est_refuse(): void
    {
        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => base64_encode(json_encode(['sub' => '1', 'email' => 'victime@example.com', 'verified' => true, 'exp' => time() + 600])),
            'accept_legal' => true,
        ])->assertStatus(422);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_un_jeton_d_attente_expire_est_refuse(): void
    {
        $handoff = \App\Domain\Identity\PendingGoogleSignup::issue($this->identity());

        $this->travel(\App\Domain\Identity\PendingGoogleSignup::TTL_SECONDS + 60)->seconds();

        $this->postJson('/api/v1/auth/google/complete', [
            'handoff' => $handoff,
            'accept_legal' => true,
        ])->assertStatus(422);

        $this->assertDatabaseCount('users', 0);
    }

    /**
     * Le secret client ne doit jamais franchir la frontière du serveur.
     */
    public function test_le_secret_google_n_est_jamais_rendu_au_client(): void
    {
        config()->set('services.google', [
            'client_id' => 'id-public.apps.googleusercontent.com',
            'client_secret' => 'SECRET-QUI-NE-DOIT-PAS-SORTIR',
            'redirect' => 'http://localhost:3000/api/v1/auth/google/callback',
        ]);

        $reponses = [
            $this->getJson('/api/v1/legal/versions')->getContent(),
            $this->postJson('/api/v1/auth/google/complete', ['handoff' => 'x', 'accept_legal' => true])->getContent(),
        ];

        foreach ($reponses as $contenu) {
            $this->assertStringNotContainsString('SECRET-QUI-NE-DOIT-PAS-SORTIR', $contenu);
        }
    }

    public function test_google_non_configure_repond_proprement(): void
    {
        config()->set('services.google', ['client_id' => null, 'client_secret' => null, 'redirect' => null]);

        $this->getJson('/api/v1/auth/google/redirect')->assertStatus(503);
    }

    public function test_un_refus_d_autorisation_revient_vers_le_frontend(): void
    {
        config()->set('services.google', [
            'client_id' => 'id.apps.googleusercontent.com',
            'client_secret' => 'secret',
            'redirect' => 'http://localhost:3000/api/v1/auth/google/callback',
        ]);

        $this->get('/api/v1/auth/google/callback?error=access_denied')
            ->assertRedirect(config('app.frontend_url').'/auth/google?erreur=annule');

        $this->assertDatabaseCount('users', 0);
    }
}
