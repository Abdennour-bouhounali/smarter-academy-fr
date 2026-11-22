<?php

namespace Tests\Feature;

use App\Domain\Access\EntitlementService;
use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Domain\MathLab\MathLabTools;
use App\Models\AdminActivityLog;
use App\Models\Entitlement;
use App\Models\FeatureAccessPolicy;
use App\Models\MathLabDocument;
use App\Models\NotebookNote;
use App\Models\UsageEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\FeatureAccessFixtures;
use Tests\TestCase;

/**
 * « الوصول والحدود » : le palier (free / premium) décide de l'accès aux
 * instruments du مختبر, au cahier, et des quotas de travaux et de notes —
 * CÔTÉ SERVEUR, avec des valeurs que l'administration change sans
 * déploiement. Voir docs/architecture/ACCESS_AND_LIMITS.md.
 */
class FeatureAccessTest extends TestCase
{
    use FeatureAccessFixtures;
    use RefreshDatabase;

    private const FREE_TOOL = 'math_lab.tool.whiteboard';

    private const PREMIUM_TOOL = 'math_lab.tool.logic';

    private function student(): User
    {
        return User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function premiumStudent(): User
    {
        $user = $this->student();
        Entitlement::create([
            'user_id' => $user->id,
            'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
            'status' => Entitlement::STATUS_ACTIVE,
            'starts_at' => now()->subDay(),
            'expires_at' => null,
            'source' => 'test',
            'reason' => 'test',
        ]);
        app(EntitlementService::class)->forget();

        return $user;
    }

    private function createDocument(User $user, string $tool = 'whiteboard')
    {
        return $this->actingAs($user)->postJson('/api/v1/math-lab/documents', [
            'tool' => $tool,
            'title' => 'عمل',
            'schemaVersion' => 1,
            'data' => ['elements' => []],
        ]);
    }

    private function createNote(User $user)
    {
        return $this->actingAs($user)->postJson('/api/v1/practice/notes', ['content' => 'ملاحظة']);
    }

    private function quotas(string $key, ?int $free, ?int $premium): void
    {
        $this->setPolicy($key, ['free_allowed' => true, 'premium_allowed' => true, 'is_enabled' => true, 'free_quota' => $free, 'premium_quota' => $premium]);
    }

    // ── Les valeurs initiales ──────────────────────────────────────────────

    public function test_chaque_instrument_du_laboratoire_a_une_ligne_de_configuration(): void
    {
        $keys = FeatureAccessPolicy::pluck('feature_key')->all();
        foreach (MathLabTools::ids() as $tool) {
            $this->assertContains(FeatureRegistry::toolKey($tool), $keys, "Instrument sans configuration : {$tool}");
        }
        $this->assertContains(FeatureRegistry::NOTEBOOK, $keys);
        $this->assertContains(FeatureRegistry::MATH_LAB_DOCUMENTS, $keys);
    }

    // ── Accès aux instruments ─────────────────────────────────────────────

    public function test_matrice_palier_par_instrument(): void
    {
        $free = $this->student();
        $premium = $this->premiumStudent();
        $service = app(FeatureAccessService::class);

        $this->assertTrue($service->decide($free, self::FREE_TOOL)->allowed, 'free + outil gratuit');
        $denied = $service->decide($free, self::PREMIUM_TOOL);
        $this->assertFalse($denied->allowed, 'free + outil premium');
        $this->assertSame('premium_required', $denied->reason);
        $this->assertTrue($service->decide($premium, self::FREE_TOOL)->allowed, 'premium + outil gratuit');
        $this->assertTrue($service->decide($premium, self::PREMIUM_TOOL)->allowed, 'premium + outil premium');
    }

    public function test_un_eleve_gratuit_ne_passe_pas_par_l_api_directe_d_un_outil_premium(): void
    {
        $free = $this->student();

        $this->createDocument($free, 'logic')
            ->assertForbidden()
            ->assertJsonPath('code', 'premium_required')
            ->assertJsonPath('access.feature', self::PREMIUM_TOOL);
        $this->assertSame(0, MathLabDocument::count());
        $this->assertSame(0, UsageEvent::count(), 'un refus ne consomme rien');

        // Un travail d'un outil devenu premium (créé quand il était gratuit) :
        // ni ouverture, ni modification de l'état, ni copie, ni pièce jointe…
        $doc = MathLabDocument::create(['user_id' => $free->id, 'tool' => 'logic', 'title' => 'x', 'schema_version' => 1, 'data' => ['a' => 1], 'data_bytes' => 7, 'is_favorite' => false]);
        $this->actingAs($free)->getJson("/api/v1/math-lab/documents/{$doc->id}")->assertForbidden();
        $this->actingAs($free)->patchJson("/api/v1/math-lab/documents/{$doc->id}", ['data' => ['a' => 2]])->assertForbidden();
        $this->actingAs($free)->postJson("/api/v1/math-lab/documents/{$doc->id}/duplicate")->assertForbidden();
        $this->actingAs($free)->postJson("/api/v1/math-lab/documents/{$doc->id}/files", [])->assertForbidden();
        $this->assertSame(['a' => 1], $doc->fresh()->data);

        // … mais le travail reste À LUI : listé, renommé, supprimé.
        $this->actingAs($free)->getJson('/api/v1/math-lab/documents')->assertOk()->assertJsonCount(1, 'documents');
        $this->actingAs($free)->patchJson("/api/v1/math-lab/documents/{$doc->id}", ['title' => 'جديد'])->assertOk();
        $this->actingAs($free)->deleteJson("/api/v1/math-lab/documents/{$doc->id}")->assertOk();
    }

    public function test_un_outil_coupe_globalement_est_ferme_a_tous_enseignant_compris(): void
    {
        $this->setPolicy(self::FREE_TOOL, ['is_enabled' => false]);
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);

        $this->createDocument($this->premiumStudent())->assertForbidden()->assertJsonPath('code', 'feature_disabled');
        $this->createDocument($teacher)->assertForbidden()->assertJsonPath('code', 'feature_disabled');
    }

    public function test_l_enseignant_recoit_le_palier_premium_explicitement(): void
    {
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);

        $response = $this->actingAs($teacher)->getJson('/api/v1/me/feature-access')
            ->assertOk()
            ->assertJsonPath('tier', 'premium')
            ->assertJsonPath('tierReason', 'teacher_role');
        $this->assertTrue($response->json('features')[self::PREMIUM_TOOL]['allowed']);
        $this->createDocument($teacher, 'logic')->assertCreated();
    }

    // ── Le cahier (notebook_copy) ─────────────────────────────────────────

    public function test_quota_du_cahier_par_palier(): void
    {
        $this->quotas(FeatureRegistry::NOTEBOOK, 2, 3);
        $free = $this->student();
        $premium = $this->premiumStudent();

        $this->createNote($free)->assertCreated();                       // free, sous la limite
        $this->createNote($free)->assertCreated();
        $this->createNote($free)->assertForbidden()                      // free, à la limite
            ->assertJsonPath('code', 'quota_exceeded')
            ->assertJsonPath('access.quota.used', 2)
            ->assertJsonPath('access.quota.limit', 2)
            ->assertJsonPath('access.quota.remaining', 0);

        foreach (range(1, 3) as $i) {
            $this->createNote($premium)->assertCreated();                // premium, sous la limite
        }
        $this->createNote($premium)->assertForbidden()->assertJsonPath('code', 'quota_exceeded'); // premium, à la limite

        $this->assertSame(2, NotebookNote::where('user_id', $free->id)->count());
        $this->assertSame(['notebook_copy'], UsageEvent::distinct()->pluck('usage_type')->all());
    }

    public function test_modifier_reviser_une_note_ne_consomme_pas_et_supprimer_ne_rembourse_pas(): void
    {
        $this->quotas(FeatureRegistry::NOTEBOOK, 1, null);
        $free = $this->student();

        $id = $this->createNote($free)->assertCreated()->json('note.id');
        $this->actingAs($free)->patchJson("/api/v1/practice/notes/{$id}", ['content' => 'تعديل'])->assertOk();
        $this->actingAs($free)->postJson("/api/v1/practice/notes/{$id}/review", ['outcome' => 'known'])->assertOk();
        $this->assertSame(1, UsageEvent::count());

        $this->actingAs($free)->deleteJson("/api/v1/practice/notes/{$id}")->assertOk();
        $this->createNote($free)->assertForbidden()->assertJsonPath('code', 'quota_exceeded');
    }

    public function test_cahier_ferme_au_palier_gratuit_bloque_l_ecriture_mais_pas_la_lecture(): void
    {
        $free = $this->student();
        $id = $this->createNote($free)->assertCreated()->json('note.id');
        $this->setPolicy(FeatureRegistry::NOTEBOOK, ['free_allowed' => false, 'premium_allowed' => true]);

        $this->createNote($free)->assertForbidden()->assertJsonPath('code', 'premium_required');
        $this->actingAs($free)->patchJson("/api/v1/practice/notes/{$id}", ['content' => 'x'])->assertForbidden();
        $this->actingAs($free)->getJson("/api/v1/practice/notes/{$id}")->assertOk();
        $this->actingAs($free)->deleteJson("/api/v1/practice/notes/{$id}")->assertOk();

        $this->createNote($this->premiumStudent())->assertCreated();
    }

    // ── Les travaux du مختبر (document_generation) ────────────────────────

    public function test_quota_des_travaux_par_palier(): void
    {
        $this->quotas(FeatureRegistry::MATH_LAB_DOCUMENTS, 1, 2);
        $free = $this->student();
        $premium = $this->premiumStudent();

        $this->createDocument($free)->assertCreated();                   // free, sous la limite
        $this->createDocument($free)->assertForbidden()->assertJsonPath('code', 'quota_exceeded'); // free, à la limite
        $this->createDocument($premium)->assertCreated();                // premium, sous la limite
        $this->createDocument($premium)->assertCreated();
        $this->createDocument($premium)->assertForbidden()->assertJsonPath('code', 'quota_exceeded'); // premium, à la limite

        $this->assertSame(1, MathLabDocument::where('user_id', $free->id)->count(), 'un refus ne crée rien');
    }

    public function test_la_sauvegarde_automatique_ne_compte_pas_mais_une_copie_compte(): void
    {
        $this->quotas(FeatureRegistry::MATH_LAB_DOCUMENTS, 2, null);
        $free = $this->student();

        $id = $this->createDocument($free)->assertCreated()->json('document.id');
        foreach (range(1, 5) as $i) {
            $this->actingAs($free)->patchJson("/api/v1/math-lab/documents/{$id}", ['data' => ['elements' => [$i]]])->assertOk();
        }
        $this->assertSame(1, UsageEvent::count());

        $this->actingAs($free)->postJson("/api/v1/math-lab/documents/{$id}/duplicate")->assertCreated();
        $this->actingAs($free)->postJson("/api/v1/math-lab/documents/{$id}/duplicate")->assertForbidden()->assertJsonPath('code', 'quota_exceeded');
        $this->assertSame(['whiteboard'], UsageEvent::distinct()->pluck('context')->all());
    }

    public function test_les_deux_ressources_sont_comptees_separement(): void
    {
        $this->quotas(FeatureRegistry::MATH_LAB_DOCUMENTS, 1, null);
        $this->quotas(FeatureRegistry::NOTEBOOK, 1, null);
        $free = $this->student();

        $this->createDocument($free)->assertCreated();
        $this->createNote($free)->assertCreated();   // un travail n'a pas mangé la note
        $this->createNote($free)->assertForbidden();
        $this->createDocument($free)->assertForbidden();
    }

    public function test_la_periode_mensuelle_se_remet_a_zero_au_mois_suivant(): void
    {
        $this->quotas(FeatureRegistry::NOTEBOOK, 1, null);
        $free = $this->student();

        Carbon::setTestNow('2026-10-31 23:30:00');
        $this->createNote($free)->assertCreated();
        $this->createNote($free)->assertForbidden();

        Carbon::setTestNow('2026-11-01 00:10:00');
        $this->createNote($free)->assertCreated();
        Carbon::setTestNow();
    }

    public function test_la_periode_a_vie_ne_se_remet_jamais_a_zero(): void
    {
        $this->setPolicy(FeatureRegistry::NOTEBOOK, ['free_quota' => 1, 'quota_period' => 'lifetime']);
        $free = $this->student();

        Carbon::setTestNow('2026-10-15 10:00:00');
        $this->createNote($free)->assertCreated();
        Carbon::setTestNow('2027-03-15 10:00:00');
        $this->createNote($free)->assertForbidden()->assertJsonPath('access.quota.resetsAt', null);
        Carbon::setTestNow();
    }

    // ── Le résumé servi au client ─────────────────────────────────────────

    public function test_le_resume_donne_utilise_limite_et_restant(): void
    {
        $this->quotas(FeatureRegistry::MATH_LAB_DOCUMENTS, 3, null);
        $free = $this->student();
        $this->createDocument($free)->assertCreated();

        $features = $this->actingAs($free)->getJson('/api/v1/me/feature-access')
            ->assertOk()
            ->assertJsonPath('tier', 'free')
            ->json('features');
        $this->assertSame(
            ['usageType' => 'document_generation', 'used' => 1, 'limit' => 3, 'remaining' => 2, 'unlimited' => false, 'period' => 'month'],
            array_intersect_key($features['math_lab.documents']['quota'], array_flip(['usageType', 'used', 'limit', 'remaining', 'unlimited', 'period'])),
        );
        $this->assertFalse($features[self::PREMIUM_TOOL]['allowed']);
        $this->assertSame('premium_required', $features[self::PREMIUM_TOOL]['reason']);
    }

    // ── L'administration ──────────────────────────────────────────────────

    public function test_seul_l_administrateur_lit_et_modifie_la_configuration(): void
    {
        $student = $this->student();
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $body = ['enabled' => true, 'free' => ['allowed' => true], 'premium' => ['allowed' => true]];

        foreach ([$student, $teacher] as $user) {
            $this->actingAs($user)->getJson('/api/v1/admin/access-policies')->assertForbidden();
            $this->actingAs($user)->putJson('/api/v1/admin/access-policies/'.self::PREMIUM_TOOL, $body)->assertForbidden();
            $this->actingAs($user)->getJson('/api/v1/admin/access-usage')->assertForbidden();
        }
        $this->assertFalse(app(FeatureAccessService::class)->policy(self::PREMIUM_TOOL)['free_allowed']);
    }

    public function test_l_administrateur_passe_un_outil_de_gratuit_a_premium(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $free = $this->student();
        $premium = $this->premiumStudent();
        $this->createDocument($free)->assertCreated();

        $this->actingAs($admin)->putJson('/api/v1/admin/access-policies/'.self::FREE_TOOL, [
            'enabled' => true,
            'free' => ['allowed' => false],
            'premium' => ['allowed' => true],
        ])->assertOk()->assertJsonPath('feature.free.allowed', false)->assertJsonPath('feature.configured', true);

        $this->createDocument($free)->assertForbidden()->assertJsonPath('code', 'premium_required');
        $this->createDocument($premium)->assertCreated();
        $this->assertSame(1, AdminActivityLog::where('action', 'access_policy.updated')->where('entity_id', self::FREE_TOOL)->count());
    }

    public function test_l_administrateur_change_une_limite_et_elle_s_applique_aussitot(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $free = $this->student();
        $this->quotas(FeatureRegistry::NOTEBOOK, 1, null);
        $this->createNote($free)->assertCreated();
        $this->createNote($free)->assertForbidden();

        $this->actingAs($admin)->putJson('/api/v1/admin/access-policies/notebook', [
            'enabled' => true,
            'free' => ['allowed' => true, 'unlimited' => false, 'limit' => 3],
            'premium' => ['allowed' => true, 'unlimited' => true],
            'period' => 'month',
        ])->assertOk()
            ->assertJsonPath('feature.free.limit', 3)
            ->assertJsonPath('feature.premium.unlimited', true)
            ->assertJsonPath('feature.premium.limit', null);

        $this->assertSame(3, FeatureAccessPolicy::where('feature_key', 'notebook')->value('free_quota'));
        $this->createNote($free)->assertCreated();
        $this->assertSame(1, $this->actingAs($free)->getJson('/api/v1/me/feature-access')->json('features')['notebook']['quota']['remaining']);
    }

    public function test_l_administration_refuse_les_valeurs_invalides(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $ok = ['allowed' => true, 'unlimited' => true];
        $put = fn (string $key, array $body) => $this->actingAs($admin)->putJson("/api/v1/admin/access-policies/{$key}", $body);

        // Limite négative, limite absente sans « illimité », palier manquant.
        $put('notebook', ['enabled' => true, 'free' => ['allowed' => true, 'unlimited' => false, 'limit' => -1], 'premium' => $ok])->assertStatus(422);
        $put('notebook', ['enabled' => true, 'free' => ['allowed' => true], 'premium' => $ok])->assertStatus(422);
        $put('notebook', ['enabled' => true, 'free' => ['allowed' => true, 'unlimited' => false, 'limit' => '5'], 'premium' => $ok])->assertStatus(422);
        $put('notebook', ['enabled' => true, 'free' => $ok])->assertStatus(422);
        // Une limite sur un instrument (qui n'a pas de quota), une clé inconnue, une période inconnue.
        $put(self::FREE_TOOL, ['enabled' => true, 'free' => ['allowed' => true, 'limit' => 4], 'premium' => ['allowed' => true]])->assertStatus(422);
        $put('math_lab.tool.inexistant', ['enabled' => true, 'free' => $ok, 'premium' => $ok])->assertStatus(422);
        $put('notebook', ['enabled' => true, 'free' => $ok, 'premium' => $ok, 'period' => 'decade'])->assertStatus(422);

        $this->assertSame(50, FeatureAccessPolicy::where('feature_key', 'notebook')->value('free_quota'), 'rien n\'a changé');
        $this->assertSame(0, AdminActivityLog::where('action', 'access_policy.updated')->count());
    }

    public function test_la_liste_d_administration_couvre_tout_le_registre(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        FeatureAccessPolicy::where('feature_key', self::FREE_TOOL)->delete();
        app(FeatureAccessService::class)->forget();

        $features = collect($this->actingAs($admin)->getJson('/api/v1/admin/access-policies')->assertOk()->json('features'))->keyBy('key');

        $this->assertCount(count(FeatureRegistry::all()), $features);
        // Une ligne absente vaut le défaut : ouvert, et marqué « non configuré ».
        $this->assertFalse($features[self::FREE_TOOL]['configured']);
        $this->assertTrue($features[self::FREE_TOOL]['free']['allowed']);
        $this->assertNull($features[self::FREE_TOOL]['free']['unlimited'], 'un instrument n\'a pas de quota');
        $this->assertTrue($features['notebook']['hasQuota']);
    }

    public function test_rapport_d_usage_par_palier_et_par_compte(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->openAllFeatures();
        $free = $this->student();
        $premium = $this->premiumStudent();
        $this->createDocument($free, 'algebra')->assertCreated();
        $this->createNote($free)->assertCreated();
        $this->createDocument($premium, 'logic')->assertCreated();

        $this->actingAs($admin)->getJson('/api/v1/admin/access-usage')
            ->assertOk()
            ->assertJsonPath('usage.totals.free.document_generation.total', 1)
            ->assertJsonPath('usage.totals.free.notebook_copy.total', 1)
            ->assertJsonPath('usage.totals.premium.document_generation.total', 1)
            ->assertJsonPath('usage.totals.premium.notebook_copy.total', 0)
            ->assertJsonPath('usage.documentsByTool.algebra.free', 1)
            ->assertJsonPath('usage.documentsByTool.logic.premium', 1);

        $this->actingAs($admin)->getJson("/api/v1/admin/users/{$free->id}/feature-usage")
            ->assertOk()
            ->assertJsonPath('usage.tier', 'free')
            ->assertJsonPath('usage.quotas.notebook.quota.used', 1)
            ->assertJsonPath('usage.documentsByToolAllTime.algebra', 1);
        $this->actingAs($admin)->getJson("/api/v1/admin/users/{$admin->id}/feature-usage")->assertNotFound();
    }
}
