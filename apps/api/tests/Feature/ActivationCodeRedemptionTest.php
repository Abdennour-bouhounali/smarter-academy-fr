<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\ActivationCodes\ActivationCodeException;
use App\Domain\Access\ActivationCodes\ActivationCodeFormat;
use App\Domain\Access\ActivationCodes\ActivationCodeRedemptionService;
use App\Domain\Access\EntitlementService;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\Entitlement;
use App\Models\User;
use Database\Factories\ActivationCodeFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * La saisie d'un code d'activation : ce qui ouvre l'accès, et tout ce qui
 * doit le refuser.
 */
class ActivationCodeRedemptionTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->token = $this->student->createToken('t')->plainTextToken;
    }

    private function entitlements(): EntitlementService
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    /** @return array{0: ActivationCode, 1: string} le code et son clair */
    private function makeCode(array $state = [], array $batchState = []): array
    {
        $batch = ActivationCodeBatch::factory()->create($batchState);
        $code = ActivationCode::factory()->create([...$state, 'batch_id' => $batch->id]);

        return [$code, ActivationCodeFactory::plainCodeOf($code)];
    }

    private function redeem(string $code)
    {
        return $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => $code]);
    }

    public function test_un_code_valide_ouvre_l_acces_premium(): void
    {
        [$code, $plain] = $this->makeCode(batchState: ['access_days' => 365]);

        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $this->redeem($plain)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('access.premiumAccess', true)
            ->assertJsonPath('access.activationCodeActive', true);

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Le droit porte la référence STABLE du code : c'est elle qui, via
        // l'index unique, interdit un second droit pour le même code.
        $this->assertDatabaseHas('entitlements', [
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_ACTIVATION_CODE,
            'reference' => 'activation_code:'.$code->id,
            'status' => Entitlement::STATUS_ACTIVE,
        ]);

        $code->refresh();
        $this->assertSame(ActivationCode::STATUS_ACTIVATED, $code->status);
        $this->assertSame($this->student->id, $code->activated_by);
        $this->assertNotNull($code->entitlement_id);
    }

    /**
     * La saisie est tolérante : minuscules, espaces, tirets absents ou en
     * trop. Une carte lue au téléphone ne se tape pas au caractère près.
     */
    public function test_la_saisie_tolere_casse_espaces_et_tirets(): void
    {
        [, $plain] = $this->makeCode();
        $symbols = ActivationCodeFormat::normalize($plain);

        $messy = '  '.strtolower(substr($symbols, 0, 4)).' - '
            .strtolower(substr($symbols, 4, 4)).'  '
            .strtolower(substr($symbols, 8, 4)).' ';

        $this->redeem($messy)->assertOk()->assertJsonPath('access.premiumAccess', true);
    }

    public function test_un_code_inconnu_est_refuse(): void
    {
        $this->redeem('ZZZZ-ZZZZ-ZZZZ')
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('reason', ActivationCodeException::INVALID);

        $this->assertDatabaseCount('entitlements', 0);
    }

    /**
     * Un code mal FORMÉ rend exactement le même motif qu'un code inconnu :
     * distinguer les deux dirait à qui tâtonne s'il a trouvé la bonne forme.
     */
    public function test_un_code_mal_forme_est_indiscernable_d_un_inconnu(): void
    {
        $this->redeem('pas-un-code')
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::INVALID);
    }

    public function test_un_code_deja_active_est_refuse(): void
    {
        $other = User::factory()->create(['role' => User::ROLE_STUDENT]);
        [, $plain] = $this->makeCode(['status' => ActivationCode::STATUS_ACTIVATED, 'activated_by' => $other->id]);

        $this->redeem($plain)
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::ALREADY_ACTIVATED);

        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    public function test_un_code_expire_est_refuse(): void
    {
        [, $plain] = $this->makeCode(['expires_at' => Carbon::now()->subDay()]);

        $this->redeem($plain)
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::EXPIRED);

        $this->assertDatabaseCount('entitlements', 0);
    }

    public function test_un_code_revoque_est_refuse(): void
    {
        [, $plain] = $this->makeCode(['status' => ActivationCode::STATUS_REVOKED]);

        $this->redeem($plain)
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::REVOKED);
    }

    /**
     * Un code révoqué ET périmé annonce « révoqué » : le plus définitif des
     * deux. Dire « expiré » laisserait croire qu'un remplacement arrangerait
     * tout.
     */
    public function test_revoque_l_emporte_sur_expire(): void
    {
        [, $plain] = $this->makeCode([
            'status' => ActivationCode::STATUS_REVOKED,
            'expires_at' => Carbon::now()->subDay(),
        ]);

        $this->redeem($plain)->assertJsonPath('reason', ActivationCodeException::REVOKED);
    }

    /** Le même code, deux fois, par le même élève : refusé la seconde fois. */
    public function test_saisir_deux_fois_le_meme_code_ne_donne_qu_un_droit(): void
    {
        [, $plain] = $this->makeCode();

        $this->redeem($plain)->assertOk();
        $this->redeem($plain)
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::ALREADY_ACTIVATED);

        $this->assertDatabaseCount('entitlements', 1);
    }

    /**
     * DEUX ÉLÈVES, LE MÊME CODE — le scénario que toute cette conception
     * existe pour rendre impossible.
     *
     * La transition étant une mise à jour CONDITIONNELLE (`where status =
     * available`), une seule des deux saisies touche une ligne, même si le
     * verrou pessimiste ne fait rien (c'est le cas sous SQLite, où tourne
     * cette suite). Le perdant repart avec « déjà utilisé », qui est la
     * stricte vérité.
     */
    public function test_deux_eleves_sur_le_meme_code_un_seul_droit(): void
    {
        [$code, $plain] = $this->makeCode();
        $second = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $service = app(ActivationCodeRedemptionService::class);

        $service->redeem($this->student, $plain);

        try {
            $service->redeem($second, $plain);
            $this->fail('La seconde saisie aurait dû être refusée.');
        } catch (ActivationCodeException $e) {
            $this->assertSame(ActivationCodeException::ALREADY_ACTIVATED, $e->reason);
        }

        $this->assertSame(1, Entitlement::where('reference', 'activation_code:'.$code->id)->count());
        $this->assertSame($this->student->id, $code->refresh()->activated_by);
    }

    /**
     * Le FILET : même si la transition passait deux fois, l'index unique
     * (type, reference) refuserait le second droit. Simulé en posant le droit
     * AVANT la saisie.
     */
    public function test_l_index_unique_empeche_un_second_droit(): void
    {
        [$code, $plain] = $this->makeCode();

        Entitlement::factory()->activationCode($code->id)->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $this->redeem($plain)
            ->assertStatus(422)
            ->assertJsonPath('reason', ActivationCodeException::ALREADY_ACTIVATED);

        $this->assertSame(1, Entitlement::where('reference', 'activation_code:'.$code->id)->count());
    }

    /** L'accès se ferme tout seul, sans qu'aucune tâche n'ait à passer. */
    public function test_l_acces_se_ferme_a_l_echeance_du_lot(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-19 12:00:00'));
        [, $plain] = $this->makeCode(batchState: ['access_days' => 30]);

        $this->redeem($plain)->assertOk();
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        Carbon::setTestNow(Carbon::parse('2026-10-15 12:00:00'));
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        Carbon::setTestNow(Carbon::parse('2026-10-25 12:00:00'));
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // La ligne reste : l'historique ne s'efface pas.
        $this->assertDatabaseCount('entitlements', 1);
        Carbon::setTestNow();
    }

    /** Un lot à date fixe ferme à cette date, quelle que soit la saisie. */
    public function test_un_lot_a_date_fixe_ferme_a_cette_date(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-19 12:00:00'));
        [, $plain] = $this->makeCode(batchState: ['access_ends_at' => Carbon::parse('2027-06-30 00:00:00')]);

        $this->redeem($plain)
            ->assertOk()
            ->assertJsonPath('activatedUntil', '2027-06-30T00:00:00+00:00');

        Carbon::setTestNow();
    }

    /** Un lot sans durée ouvre un accès sans terme. */
    public function test_un_lot_sans_duree_ouvre_sans_terme(): void
    {
        [, $plain] = $this->makeCode();

        $this->redeem($plain)
            ->assertOk()
            ->assertJsonPath('activatedUntil', null)
            ->assertJsonPath('access.expiresAt', null);
    }

    /**
     * Deux cartes empilées PROLONGENT l'accès, et c'est la date la plus
     * lointaine qui est annoncée — annoncer la première ferait craindre une
     * coupure qui n'aura pas lieu.
     */
    public function test_deux_codes_empiles_annoncent_la_fin_la_plus_lointaine(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-19 12:00:00'));

        [, $first] = $this->makeCode(batchState: ['access_days' => 30]);
        [, $second] = $this->makeCode(batchState: ['access_days' => 365]);

        $this->redeem($first)->assertOk();
        $response = $this->redeem($second)->assertOk();

        $this->assertSame(
            Carbon::parse('2027-09-19 12:00:00')->toIso8601String(),
            $response->json('access.expiresAt'),
        );

        Carbon::setTestNow();
    }

    public function test_un_visiteur_anonyme_est_refuse(): void
    {
        [, $plain] = $this->makeCode();

        $this->postJson('/api/v1/activation-codes/redeem', ['code' => $plain])
            ->assertStatus(401);

        $this->assertDatabaseCount('entitlements', 0);
    }

    /** Un compte suspendu n'active rien, même avec un jeton encore en main. */
    public function test_un_compte_suspendu_est_refuse(): void
    {
        [, $plain] = $this->makeCode();
        $this->student->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->redeem($plain)->assertStatus(403);

        $this->assertDatabaseCount('entitlements', 0);
    }

    /** L'adresse doit être prouvée : le groupe de routes l'exige. */
    public function test_une_adresse_non_verifiee_est_refusee(): void
    {
        [, $plain] = $this->makeCode();
        $this->student->forceFill(['email_verified_at' => null])->save();

        $this->redeem($plain)->assertStatus(403);

        $this->assertDatabaseCount('entitlements', 0);
    }

    public function test_un_code_absent_est_une_erreur_de_validation(): void
    {
        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('code');
    }

    /**
     * Le code saisi n'apparaît JAMAIS dans la réponse — ni en écho, ni dans
     * un message d'erreur. Une réponse qui renvoie le secret le dépose dans
     * les journaux de tout ce qui est entre le serveur et l'élève.
     */
    public function test_la_reponse_ne_renvoie_jamais_le_code(): void
    {
        [, $plain] = $this->makeCode();
        $symbols = ActivationCodeFormat::normalize($plain);

        $ok = $this->redeem($plain)->assertOk();
        $this->assertStringNotContainsString($symbols, $ok->getContent());

        $ko = $this->redeem($plain)->assertStatus(422);
        $this->assertStringNotContainsString($symbols, $ko->getContent());
    }
}
