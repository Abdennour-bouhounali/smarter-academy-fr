<?php

namespace Tests\Feature;

use App\Domain\Identity\EmailVerificationLink;
use App\Models\User;
use App\Notifications\VerifyEmailAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * LA VÉRIFICATION D'ADRESSE — le lien, et la porte qu'il ouvre.
 *
 * Deux sujets distincts, et les deux comptent :
 *   - le LIEN doit être infalsifiable (signature, expiration, lien à
 *     l'adresse visée) ;
 *   - la PORTE doit être fermée côté serveur tant que le lien n'a pas été
 *     suivi — sinon l'écran « vérifiez votre adresse » n'est qu'une
 *     décoration que l'on contourne en tapant une URL.
 */
class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function registerStudent(string $email = 'eleve@example.com'): array
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => $email,
            'password' => 'password123',
            'accept_legal' => true,
        ]);

        $response->assertStatus(201);

        return [User::where('email', $email)->firstOrFail(), $response->json('token')];
    }

    public function test_l_inscription_envoie_le_courriel_de_verification(): void
    {
        Notification::fake();

        [$user] = $this->registerStudent();

        Notification::assertSentTo($user, VerifyEmailAddress::class);
        $this->assertNull($user->email_verified_at);
    }

    public function test_un_lien_valide_verifie_le_compte(): void
    {
        [$user] = $this->registerStudent();

        $this->get(EmailVerificationLink::for($user))
            ->assertRedirect(config('app.frontend_url').'/verification-email?statut=succes');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    /**
     * Le lien devinable — l'attaque que la signature existe pour empêcher.
     */
    public function test_un_lien_sans_signature_est_refuse(): void
    {
        [$user] = $this->registerStudent();

        $nu = '/api/v1/auth/email/verify/'.$user->id.'/'.EmailVerificationLink::hashFor($user);

        $this->get($nu)->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_une_signature_alteree_est_refusee(): void
    {
        [$user] = $this->registerStudent();

        $url = EmailVerificationLink::for($user);

        // On retourne le DERNIER caractère de la signature vers une autre
        // valeur — en s'assurant qu'il change réellement, sinon le test
        // vérifierait une URL intacte et passerait pour de mauvaises raisons.
        preg_match('/signature=([0-9a-f]+)/', $url, $m);
        $signature = $m[1];
        $dernier = substr($signature, -1);
        $remplacant = $dernier === 'a' ? 'b' : 'a';
        $altere = str_replace(
            'signature='.$signature,
            'signature='.substr($signature, 0, -1).$remplacant,
            $url
        );

        $this->assertNotSame($url, $altere, 'la signature doit réellement différer');

        $this->get($altere)->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    /**
     * Changer l'identifiant dans l'URL, c'est tenter de vérifier le compte
     * d'un autre. La signature couvre l'identifiant : elle tombe.
     */
    public function test_on_ne_peut_pas_verifier_le_compte_d_un_autre(): void
    {
        [$victime] = $this->registerStudent('victime@example.com');
        [$attaquant] = $this->registerStudent('attaquant@example.com');

        $url = EmailVerificationLink::for($attaquant);
        $detourne = str_replace(
            '/verify/'.$attaquant->id.'/',
            '/verify/'.$victime->id.'/',
            $url
        );

        $this->get($detourne)->assertStatus(403);
        $this->assertNull($victime->fresh()->email_verified_at);
    }

    public function test_un_lien_expire_est_refuse(): void
    {
        [$user] = $this->registerStudent();

        $url = EmailVerificationLink::for($user);

        $this->travel(EmailVerificationLink::EXPIRES_AFTER_MINUTES + 1)->minutes();

        $this->get($url)->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    /**
     * Le condensat lie le lien à l'ADRESSE. Si l'adresse change, les liens
     * déjà envoyés ne certifient plus rien — sinon ils certifieraient une
     * adresse que personne n'a prouvé posséder.
     */
    public function test_un_lien_emis_pour_une_ancienne_adresse_ne_verifie_pas_la_nouvelle(): void
    {
        [$user] = $this->registerStudent('avant@example.com');

        $url = EmailVerificationLink::for($user);

        $user->forceFill(['email' => 'apres@example.com'])->save();

        $this->get($url)->assertRedirect(config('app.frontend_url').'/verification-email?statut=invalide');
        $this->assertNull($user->fresh()->email_verified_at);
    }

    /**
     * Cliquer deux fois n'est pas une faute.
     */
    public function test_verifier_deux_fois_est_sans_danger(): void
    {
        [$user] = $this->registerStudent();

        $url = EmailVerificationLink::for($user);

        $this->get($url)->assertRedirect(config('app.frontend_url').'/verification-email?statut=succes');
        $premier = $user->fresh()->email_verified_at;

        $this->travel(5)->minutes();

        $this->get($url)->assertRedirect(config('app.frontend_url').'/verification-email?statut=deja-verifie');

        // La date du PREMIER passage est conservée.
        $this->assertTrue($premier->equalTo($user->fresh()->email_verified_at));
    }

    public function test_un_lien_designant_un_compte_disparu_est_refuse_proprement(): void
    {
        [$user] = $this->registerStudent();

        $url = EmailVerificationLink::for($user);
        $user->delete();

        $this->get($url)->assertRedirect(config('app.frontend_url').'/verification-email?statut=invalide');
    }

    // ── LA PORTE ────────────────────────────────────────────────────────

    public function test_un_eleve_non_verifie_ne_peut_pas_entrer_dans_l_espace(): void
    {
        [, $token] = $this->registerStudent();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/me/access')
            ->assertStatus(403)
            ->assertJsonPath('emailVerified', false);
    }

    public function test_un_eleve_verifie_entre_normalement(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $token = $user->createToken('student-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/me/access')
            ->assertStatus(200);
    }

    /**
     * Les trois portes de secours restent ouvertes : sans elles, un élève non
     * vérifié serait enfermé dehors sans aucun moyen d'en sortir.
     */
    public function test_les_routes_de_sortie_restent_accessibles_sans_verification(): void
    {
        [, $token] = $this->registerStudent();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('user.emailVerified', false);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/resend')
            ->assertStatus(200);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200);
    }

    /**
     * Non-régression : un administrateur n'est pas créé par le formulaire
     * public et ne reçoit aucun courriel. Lui imposer la vérification
     * l'enfermerait dehors.
     */
    public function test_un_administrateur_n_est_pas_soumis_a_la_verification(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => null,
        ]);
        $token = $admin->createToken('admin-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(200);
    }

    // ── LE RENVOI ───────────────────────────────────────────────────────

    public function test_le_renvoi_envoie_un_nouveau_courriel(): void
    {
        Notification::fake();

        [$user, $token] = $this->registerStudent();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/resend')
            ->assertStatus(200)
            ->assertJsonPath('alreadyVerified', false);

        Notification::assertSentToTimes($user, VerifyEmailAddress::class, 2);
    }

    public function test_le_renvoi_exige_une_authentification(): void
    {
        $this->postJson('/api/v1/auth/email/resend')->assertStatus(401);
    }

    public function test_le_renvoi_a_un_compte_deja_verifie_ne_renvoie_rien(): void
    {
        Notification::fake();

        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('student-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/resend')
            ->assertStatus(200)
            ->assertJsonPath('alreadyVerified', true);

        Notification::assertNothingSent();
    }

    /**
     * Sans limite, ce point d'entrée enverrait mille courriels à la même
     * adresse — et ce serait NOTRE serveur qui la harcèlerait.
     */
    public function test_le_renvoi_est_limite_en_debit(): void
    {
        Notification::fake();

        [, $token] = $this->registerStudent();

        for ($i = 0; $i < 5; $i++) {
            $this->withHeader('Authorization', "Bearer {$token}")
                ->postJson('/api/v1/auth/email/resend')
                ->assertStatus(200);
        }

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/email/resend')
            ->assertStatus(429);
    }

    public function test_la_verification_est_limitee_en_debit(): void
    {
        [$user] = $this->registerStudent();

        // Des liens non signés, donc refusés : c'est le tâtonnement que la
        // limite doit arrêter.
        $nu = '/api/v1/auth/email/verify/'.$user->id.'/mauvais';

        for ($i = 0; $i < 12; $i++) {
            $this->get($nu);
        }

        $this->get($nu)->assertStatus(429);
    }
}
