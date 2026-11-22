<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\ActivationCodes\ActivationCodeFormat;
use App\Domain\Access\ActivationCodes\ActivationCodeGenerator;
use App\Domain\Access\EntitlementService;
use App\Domain\Admin\ActivityLogger;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\Entitlement;
use App\Models\User;
use Database\Factories\ActivationCodeFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * La gestion des codes côté administration : produire, consulter, filtrer,
 * révoquer, exporter — et la frontière qui empêche un élève d'y toucher.
 */
class AdminActivationCodeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->adminToken = $this->admin->createToken('t')->plainTextToken;
    }

    private function asAdmin(): self
    {
        return $this->withToken($this->adminToken);
    }

    private function entitlements(): EntitlementService
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    public function test_generer_un_lot_rend_les_codes_une_seule_fois(): void
    {
        $response = $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', [
                'label' => 'Cartes Alger janvier',
                'quantity' => 5,
                'accessDays' => 365,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('codesShownOnce', true)
            ->assertJsonCount(5, 'codes');

        $this->assertDatabaseCount('activation_codes', 5);
        $this->assertDatabaseHas('activation_code_batches', [
            'label' => 'Cartes Alger janvier',
            'quantity' => 5,
            'access_days' => 365,
            'created_by' => $this->admin->id,
        ]);

        // Les codes rendus sont utilisables, et tous distincts.
        $codes = collect($response->json('codes'))->pluck('code');
        $this->assertCount(5, $codes->unique());

        foreach ($codes as $code) {
            $this->assertNotNull(ActivationCodeFormat::normalize($code));
        }
    }

    /**
     * La base ne contient AUCUN code en clair — la garantie centrale du
     * modèle. On vérifie que l'empreinte stockée n'est pas le code, et que
     * le code ne se retrouve dans aucune colonne.
     */
    public function test_aucun_code_en_clair_n_est_stocke(): void
    {
        $plain = $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'L', 'quantity' => 1])
            ->json('codes.0.code');

        $symbols = ActivationCodeFormat::normalize($plain);
        $row = (array) \DB::table('activation_codes')->first();

        foreach ($row as $column => $value) {
            if (is_string($value)) {
                $this->assertNotSame($symbols, $value, "La colonne {$column} contient le code en clair.");
                $this->assertNotSame($plain, $value, "La colonne {$column} contient le code en clair.");
            }
        }

        // L'indice, lui, est bien les 4 derniers symboles : c'est voulu.
        $this->assertSame(substr($symbols, -4), $row['code_hint']);
    }

    /** Le journal trace le lot, jamais ses codes. */
    public function test_la_generation_est_journalisee_sans_les_codes(): void
    {
        $response = $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', [
                'label' => 'Lot tracé', 'quantity' => 2, 'accessDays' => 90,
            ])->assertCreated();

        $log = \App\Models\AdminActivityLog::where('action', ActivityLogger::ACTIVATION_CODES_GENERATED)->firstOrFail();

        $this->assertSame($this->admin->id, $log->user_id);
        $this->assertSame('activation_code_batch', $log->entity_type);
        $this->assertSame(2, $log->after['quantity']);
        $this->assertSame('Lot tracé', $log->after['label']);

        $serialized = json_encode($log->after);
        foreach ($response->json('codes') as $code) {
            $this->assertStringNotContainsString(
                ActivationCodeFormat::normalize($code['code']), $serialized
            );
        }
    }

    public function test_les_bornes_de_quantite_sont_tenues(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'L', 'quantity' => 0])
            ->assertStatus(422);

        $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', [
                'label' => 'L', 'quantity' => ActivationCodeGenerator::MAX_QUANTITY + 1,
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('activation_codes', 0);
    }

    /** Durée glissante et date fixe sont exclusives : le refus est explicite. */
    public function test_duree_et_date_de_fin_sont_exclusives(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', [
                'label' => 'L',
                'quantity' => 1,
                'accessDays' => 365,
                'accessEndsAt' => Carbon::now()->addYear()->toIso8601String(),
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('activation_code_batches', 0);
    }

    public function test_une_date_passee_est_refusee(): void
    {
        foreach (['accessEndsAt', 'redeemBy'] as $field) {
            $this->asAdmin()
                ->postJson('/api/v1/admin/activation-codes/batches', [
                    'label' => 'L', 'quantity' => 1,
                    $field => Carbon::now()->subDay()->toIso8601String(),
                ])
                ->assertStatus(422);
        }

        $this->assertDatabaseCount('activation_code_batches', 0);
    }

    public function test_la_liste_se_filtre_et_se_compte(): void
    {
        $batch = ActivationCodeBatch::factory()->create(['label' => 'Lot Oran']);
        ActivationCode::factory()->count(3)->create(['batch_id' => $batch->id]);
        ActivationCode::factory()->create([
            'batch_id' => $batch->id,
            'status' => ActivationCode::STATUS_ACTIVATED,
            'activated_by' => $this->student->id,
        ]);
        ActivationCode::factory()->revoked()->create(['batch_id' => $batch->id]);
        ActivationCode::factory()->expired()->create(['batch_id' => $batch->id]);

        $response = $this->asAdmin()->getJson('/api/v1/admin/activation-codes')->assertOk();

        $this->assertSame(6, $response->json('counts.total'));
        $this->assertSame(3, $response->json('counts.available'));
        $this->assertSame(1, $response->json('counts.activated'));
        $this->assertSame(1, $response->json('counts.revoked'));
        $this->assertSame(1, $response->json('counts.expired'));

        $this->asAdmin()->getJson('/api/v1/admin/activation-codes?status=activated')
            ->assertOk()
            ->assertJsonCount(1, 'codes.data')
            ->assertJsonPath('codes.data.0.status', ActivationCode::STATUS_ACTIVATED);

        // « Expiré » est DÉRIVÉ : aucune ligne ne porte ce statut en base.
        $this->asAdmin()->getJson('/api/v1/admin/activation-codes?status=expired')
            ->assertOk()
            ->assertJsonCount(1, 'codes.data')
            ->assertJsonPath('codes.data.0.status', ActivationCode::STATUS_EXPIRED);
        $this->assertDatabaseMissing('activation_codes', ['status' => 'expired']);
    }

    /** L'indice de 4 symboles est le pont entre une carte et une ligne. */
    public function test_la_recherche_par_indice_retrouve_un_code(): void
    {
        $code = ActivationCode::factory()->create();
        ActivationCode::factory()->count(3)->create();

        $this->asAdmin()->getJson('/api/v1/admin/activation-codes?search='.$code->code_hint)
            ->assertOk()
            ->assertJsonPath('codes.data.0.id', $code->id);
    }

    public function test_la_recherche_retrouve_par_eleve(): void
    {
        $code = ActivationCode::factory()->create([
            'status' => ActivationCode::STATUS_ACTIVATED,
            'activated_by' => $this->student->id,
        ]);
        ActivationCode::factory()->count(2)->create();

        $this->asAdmin()->getJson('/api/v1/admin/activation-codes?search='.$this->student->email)
            ->assertOk()
            ->assertJsonCount(1, 'codes.data')
            ->assertJsonPath('codes.data.0.id', $code->id);
    }

    public function test_le_detail_montre_l_historique(): void
    {
        $code = ActivationCode::factory()->create();

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", [
            'reason' => 'Carte perdue',
        ])->assertOk();

        $detail = $this->asAdmin()->getJson("/api/v1/admin/activation-codes/{$code->id}")->assertOk();

        $this->assertSame(ActivationCode::STATUS_REVOKED, $detail->json('code.status'));
        $this->assertSame('Carte perdue', $detail->json('code.revokeReason'));
        $this->assertNotEmpty($detail->json('history'));
        $this->assertSame(ActivityLogger::ACTIVATION_CODE_REVOKED, $detail->json('history.0.action'));
    }

    public function test_un_code_introuvable_rend_404(): void
    {
        $this->asAdmin()->getJson('/api/v1/admin/activation-codes/99999')->assertStatus(404);
    }

    /** Révoquer un code disponible le neutralise, sans fermer aucun accès. */
    public function test_revoquer_un_code_disponible(): void
    {
        $code = ActivationCode::factory()->create();

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", [
            'reason' => 'Lot mal imprimé',
        ])
            ->assertOk()
            ->assertJsonPath('code.status', ActivationCode::STATUS_REVOKED);

        $this->assertDatabaseHas('activation_codes', [
            'id' => $code->id,
            'status' => ActivationCode::STATUS_REVOKED,
            'revoked_by' => $this->admin->id,
        ]);
    }

    /**
     * LE cas qui compte : révoquer un code DÉJÀ activé ferme aussi l'accès
     * qu'il avait ouvert. Sans cela, une carte volée resterait payante à vie.
     */
    public function test_revoquer_un_code_active_ferme_l_acces(): void
    {
        $batch = ActivationCodeBatch::factory()->create();
        $code = ActivationCode::factory()->create(['batch_id' => $batch->id]);
        $plain = ActivationCodeFactory::plainCodeOf($code);

        // Le test change d'identité en cours de route (administrateur →
        // élève). Le garde retient l'utilisateur résolu au premier appel :
        // sans cet oubli, la requête élève serait évaluée avec le compte
        // administrateur encore en mémoire. Idiome déjà employé par
        // AdminStudentManagementTest.
        $studentToken = $this->student->createToken('s')->plainTextToken;
        $this->app['auth']->forgetGuards();

        $this->withToken($studentToken)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => $plain])
            ->assertOk();

        $this->app['auth']->forgetGuards();

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", [
            'reason' => 'Carte revendue deux fois',
        ])->assertOk();

        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Le droit est RÉVOQUÉ, pas supprimé : « cet élève a eu accès du 3 au
        // 12 » reste lisible.
        $this->assertDatabaseHas('entitlements', [
            'reference' => 'activation_code:'.$code->id,
            'status' => Entitlement::STATUS_REVOKED,
            'revoked_by' => $this->admin->id,
            'reason' => 'Carte revendue deux fois',
        ]);

        $log = \App\Models\AdminActivityLog::where('action', ActivityLogger::ACTIVATION_CODE_REVOKED)->firstOrFail();
        $this->assertTrue($log->after['entitlement_revoked']);
    }

    public function test_le_motif_de_revocation_est_obligatoire(): void
    {
        $code = ActivationCode::factory()->create();

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('reason');

        $this->assertDatabaseHas('activation_codes', [
            'id' => $code->id, 'status' => ActivationCode::STATUS_AVAILABLE,
        ]);
    }

    public function test_revoquer_deux_fois_est_refuse(): void
    {
        $code = ActivationCode::factory()->revoked()->create();

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", ['reason' => 'x'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * La révocation en lot ne touche QUE les codes encore disponibles :
     * fermer d'un clic l'accès de trente élèves qui ont payé serait un geste
     * bien trop lourd pour être groupé.
     */
    public function test_revoquer_un_lot_epargne_les_codes_actives(): void
    {
        $batch = ActivationCodeBatch::factory()->create();
        ActivationCode::factory()->count(3)->create(['batch_id' => $batch->id]);
        $activated = ActivationCode::factory()->create([
            'batch_id' => $batch->id,
            'status' => ActivationCode::STATUS_ACTIVATED,
            'activated_by' => $this->student->id,
        ]);

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/batches/{$batch->id}/revoke", [
            'reason' => 'Lot égaré',
        ])
            ->assertOk()
            ->assertJsonPath('revoked', 3);

        $this->assertSame(ActivationCode::STATUS_ACTIVATED, $activated->refresh()->status);
        $this->assertSame(3, ActivationCode::where('batch_id', $batch->id)
            ->where('status', ActivationCode::STATUS_REVOKED)->count());
    }

    public function test_revoquer_un_lot_sans_code_disponible_est_refuse(): void
    {
        $batch = ActivationCodeBatch::factory()->create();
        ActivationCode::factory()->revoked()->create(['batch_id' => $batch->id]);

        $this->asAdmin()->postJson("/api/v1/admin/activation-codes/batches/{$batch->id}/revoke", ['reason' => 'x'])
            ->assertStatus(422);
    }

    public function test_les_lots_affichent_leurs_decomptes(): void
    {
        $batch = ActivationCodeBatch::factory()->create(['label' => 'Lot Constantine', 'quantity' => 4]);
        ActivationCode::factory()->count(2)->create(['batch_id' => $batch->id]);
        ActivationCode::factory()->revoked()->create(['batch_id' => $batch->id]);
        ActivationCode::factory()->expired()->create(['batch_id' => $batch->id]);

        $response = $this->asAdmin()->getJson('/api/v1/admin/activation-codes/batches')->assertOk();

        $this->assertSame('Lot Constantine', $response->json('batches.data.0.label'));
        $this->assertSame(2, $response->json('batches.data.0.codeCounts.available'));
        $this->assertSame(1, $response->json('batches.data.0.codeCounts.revoked'));
        $this->assertSame(1, $response->json('batches.data.0.codeCounts.expired'));
    }

    /** L'export sort des métadonnées, et jamais un code. */
    public function test_l_export_csv_ne_contient_aucun_code(): void
    {
        $plain = $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'Export', 'quantity' => 2])
            ->json('codes.0.code');

        $response = $this->asAdmin()->get('/api/v1/admin/activation-codes/export');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $csv = $response->streamedContent();

        $this->assertStringContainsString('id,lot,indice,statut', $csv);
        $this->assertStringNotContainsString(ActivationCodeFormat::normalize($plain), $csv);
        $this->assertStringNotContainsString($plain, $csv);

        $this->assertDatabaseHas('admin_activity_logs', [
            'action' => ActivityLogger::ACTIVATION_CODES_EXPORTED,
            'user_id' => $this->admin->id,
        ]);
    }

    /**
     * La frontière : un élève n'atteint AUCUN de ces points d'entrée, et
     * surtout pas celui qui produit des codes.
     */
    public function test_un_eleve_est_refuse_partout(): void
    {
        $code = ActivationCode::factory()->create();
        $token = $this->student->createToken('s')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/admin/activation-codes')->assertStatus(403);
        $this->withToken($token)->getJson('/api/v1/admin/activation-codes/batches')->assertStatus(403);
        $this->withToken($token)->getJson('/api/v1/admin/activation-codes/export')->assertStatus(403);
        $this->withToken($token)->getJson("/api/v1/admin/activation-codes/{$code->id}")->assertStatus(403);
        $this->withToken($token)
            ->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'Pirate', 'quantity' => 100])
            ->assertStatus(403);
        $this->withToken($token)
            ->postJson("/api/v1/admin/activation-codes/{$code->id}/revoke", ['reason' => 'x'])
            ->assertStatus(403);

        $this->assertSame(1, ActivationCode::count());
        $this->assertSame(ActivationCode::STATUS_AVAILABLE, $code->refresh()->status);
    }

    public function test_un_visiteur_anonyme_est_refuse(): void
    {
        $this->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'L', 'quantity' => 1])
            ->assertStatus(401);
    }

    /** Un administrateur SUSPENDU suit la politique de compte existante. */
    public function test_un_administrateur_suspendu_est_refuse(): void
    {
        $this->admin->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->asAdmin()
            ->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'L', 'quantity' => 1])
            ->assertStatus(403);

        $this->assertDatabaseCount('activation_codes', 0);
    }
}
