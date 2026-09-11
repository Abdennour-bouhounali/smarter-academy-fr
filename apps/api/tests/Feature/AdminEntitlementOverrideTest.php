<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Admin\ActivityLogger;
use App\Models\Entitlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * La dérogation d'administration : accorder, expirer, retirer, tracer.
 */
class AdminEntitlementOverrideTest extends TestCase
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

    private function entitlements(): EntitlementService
    {
        // Résolu à neuf : le service mémorise par requête, et ce test observe
        // plusieurs états successifs dans un même processus.
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    public function test_grant_opens_premium_access(): void
    {
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
                'reason' => 'Test interne',
            ])
            ->assertCreated()
            ->assertJsonPath('access.adminOverrideActive', true)
            ->assertJsonPath('access.premiumAccess', true);

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    public function test_grant_with_expiry_opens_then_closes(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-11 12:00:00'));

        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
                'expiresAt' => Carbon::now()->addDays(7)->toIso8601String(),
            ])
            ->assertCreated();

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Six jours plus tard : encore ouvert.
        Carbon::setTestNow(Carbon::parse('2026-09-17 12:00:00'));
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Huit jours plus tard : fermé, SANS qu'aucune tâche planifiée
        // n'ait eu à passer marquer la ligne expirée.
        Carbon::setTestNow(Carbon::parse('2026-09-19 12:00:00'));
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Et la ligne est TOUJOURS là : l'historique ne s'efface pas.
        $this->assertDatabaseCount('entitlements', 1);

        Carbon::setTestNow();
    }

    public function test_revoke_closes_access_and_keeps_the_row(): void
    {
        $entitlement = Entitlement::factory()->adminOverride()->create(['user_id' => $this->student->id]);
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $this->withToken($this->adminToken)
            ->deleteJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
                'reason' => 'Fin du test',
            ])
            ->assertOk()
            ->assertJsonPath('access.premiumAccess', false);

        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Révoquée, pas supprimée (spec §36).
        $this->assertDatabaseHas('entitlements', [
            'id' => $entitlement->id,
            'status' => Entitlement::STATUS_REVOKED,
            'revoked_by' => $this->admin->id,
        ]);
    }

    public function test_grant_and_revoke_are_logged(): void
    {
        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertCreated();
        $this->withToken($this->adminToken)
            ->deleteJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertOk();

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => ActivityLogger::ENTITLEMENT_GRANTED,
            'entity_type' => 'user',
            'entity_id' => (string) $this->student->id,
        ]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => ActivityLogger::ENTITLEMENT_REVOKED,
        ]);
    }

    /** Une seule dérogation active : la nouvelle remplace l'ancienne. */
    public function test_granting_twice_replaces_rather_than_accumulates(): void
    {
        foreach ([1, 2] as $_) {
            $this->withToken($this->adminToken)
                ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
                ->assertCreated();
        }

        $this->assertSame(2, Entitlement::where('user_id', $this->student->id)->count());
        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)
            ->where('status', Entitlement::STATUS_ACTIVE)->count());
    }

    public function test_expiry_in_the_past_is_refused(): void
    {
        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
                'expiresAt' => Carbon::now()->subDay()->toIso8601String(),
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('entitlements', 0);
    }

    public function test_revoking_nothing_is_refused(): void
    {
        $this->withToken($this->adminToken)
            ->deleteJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertStatus(422);
    }

    /** Un élève n'atteint aucun de ces points d'entrée. */
    public function test_student_is_forbidden(): void
    {
        $token = $this->student->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->getJson("/api/v1/admin/students/{$this->student->id}/entitlements")
            ->assertStatus(403);
        $this->withToken($token)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertStatus(403);
        $this->withToken($token)
            ->deleteJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertStatus(403);

        $this->assertDatabaseCount('entitlements', 0);
    }

    public function test_guest_is_unauthenticated(): void
    {
        $this->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertStatus(401);
    }

    /** Un administrateur SUSPENDU suit la politique de compte existante. */
    public function test_suspended_admin_is_refused(): void
    {
        $this->admin->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [])
            ->assertStatus(403);

        $this->assertDatabaseCount('entitlements', 0);
    }

    /** L'historique répond à « pourquoi cet élève a-t-il accès ? ». */
    public function test_history_explains_access(): void
    {
        $this->withToken($this->adminToken)
            ->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
                'reason' => 'Geste commercial', 'expiresAt' => Carbon::now()->addMonth()->toIso8601String(),
            ])->assertCreated();

        $response = $this->withToken($this->adminToken)
            ->getJson("/api/v1/admin/students/{$this->student->id}/entitlements")
            ->assertOk();

        $this->assertTrue($response->json('access.adminOverrideActive'));
        $row = $response->json('entitlements.0');
        $this->assertSame(Entitlement::TYPE_ADMIN_OVERRIDE, $row['type']);
        $this->assertTrue($row['valid']);
        $this->assertSame('Geste commercial', $row['reason']);
        $this->assertNotNull($row['expiresAt']);
    }
}
