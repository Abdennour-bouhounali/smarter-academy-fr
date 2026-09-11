<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Models\Entitlement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Les bornes de validité, au sens strict.
 *
 * Les dates sont le seul endroit où une erreur d'accès est SILENCIEUSE : un
 * abonnement qui ouvre un jour de trop ne provoque aucune plainte, et ne se
 * découvre qu'en comptant les revenus. D'où des tests sur l'instant PILE.
 */
class EntitlementServiceTest extends TestCase
{
    use RefreshDatabase;

    private EntitlementService $service;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(EntitlementService::class);
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    public function test_free_needs_no_row_at_all(): void
    {
        $this->assertTrue($this->service->satisfies($this->student, AccessTier::FREE));
        $this->assertDatabaseCount('entitlements', 0);
    }

    public function test_anonymous_keeps_free_access_without_any_query(): void
    {
        $this->assertTrue($this->service->satisfies(null, AccessTier::FREE));
        $this->assertFalse($this->service->satisfies(null, AccessTier::PREMIUM));
    }

    public function test_suspended_account_loses_even_free_access(): void
    {
        $this->student->update(['account_status' => User::STATUS_SUSPENDED]);
        Entitlement::factory()->subscription()->create(['user_id' => $this->student->id]);

        $this->service->forget($this->student);

        $this->assertFalse($this->service->satisfies($this->student, AccessTier::FREE));
        $this->assertFalse($this->service->satisfies($this->student, AccessTier::PREMIUM));
    }

    /**
     * L'INSTANT PILE de l'expiration ferme l'accès (`expires_at <= now`).
     *
     * Choisi ainsi plutôt que l'inverse parce que `expires_at` se lit
     * naturellement « valide JUSQU'À », borne exclue : un abonnement qui finit
     * le 1er à minuit ne couvre pas le 1er à minuit.
     */
    public function test_expiry_boundary_is_exclusive(): void
    {
        $now = Carbon::parse('2026-09-11 12:00:00');
        Carbon::setTestNow($now);

        $entitlement = Entitlement::factory()->subscription()->create([
            'user_id' => $this->student->id,
            'starts_at' => $now->copy()->subDay(),
            'expires_at' => $now->copy(),
        ]);

        $this->assertFalse($entitlement->isValid(), 'expires_at == now doit être expiré.');

        $entitlement->update(['expires_at' => $now->copy()->addSecond()]);
        $this->assertTrue($entitlement->fresh()->isValid(), 'une seconde plus tard doit être valide.');

        Carbon::setTestNow();
    }

    /** L'instant pile du DÉBUT ouvre l'accès (`starts_at <= now`). */
    public function test_start_boundary_is_inclusive(): void
    {
        $now = Carbon::parse('2026-09-11 12:00:00');
        Carbon::setTestNow($now);

        $entitlement = Entitlement::factory()->subscription()->create([
            'user_id' => $this->student->id,
            'starts_at' => $now->copy(),
            'expires_at' => null,
        ]);

        $this->assertTrue($entitlement->isValid(), 'starts_at == now doit être valide.');

        $entitlement->update(['starts_at' => $now->copy()->addSecond()]);
        $this->assertFalse($entitlement->fresh()->isValid(), 'commençant plus tard : pas encore valide.');

        Carbon::setTestNow();
    }

    /**
     * Le scope SQL et la méthode PHP appliquent les MÊMES bornes.
     *
     * Ils sont écrits deux fois — une fois en requête pour l'efficacité, une
     * fois en PHP pour l'autorité — et deux écritures d'une même règle sont
     * exactement ce qui dérive. Ce test est ce qui les tient ensemble.
     */
    public function test_sql_scope_and_php_agree(): void
    {
        $now = Carbon::now();
        foreach ([
            ['starts_at' => $now->copy()->subDay(), 'expires_at' => null],
            ['starts_at' => $now->copy()->subDay(), 'expires_at' => $now->copy()->addDay()],
            ['starts_at' => $now->copy()->subDay(), 'expires_at' => $now->copy()->subHour()],
            ['starts_at' => $now->copy()->addDay(), 'expires_at' => null],
            ['starts_at' => null, 'expires_at' => null],
        ] as $dates) {
            Entitlement::factory()->subscription()->create($dates + ['user_id' => $this->student->id]);
        }
        Entitlement::factory()->subscription()->revoked()->create(['user_id' => $this->student->id]);

        $bySql = Entitlement::where('user_id', $this->student->id)->validNow()->pluck('id')->sort()->values();
        $byPhp = Entitlement::where('user_id', $this->student->id)->get()
            ->filter(fn (Entitlement $e) => $e->isValid())->pluck('id')->sort()->values();

        $this->assertEquals($byPhp->all(), $bySql->all());
        $this->assertCount(3, $bySql);
    }

    /** Droits qui se chevauchent : il suffit qu'UN seul ouvre (spec §33). */
    public function test_overlapping_entitlements_any_one_grants(): void
    {
        Entitlement::factory()->subscription()->expired()->create(['user_id' => $this->student->id]);
        Entitlement::factory()->adminOverride()->create(['user_id' => $this->student->id]);

        $this->service->forget($this->student);
        $this->assertTrue($this->service->satisfies($this->student, AccessTier::PREMIUM));

        // Les deux tombés : l'accès se referme.
        Entitlement::where('user_id', $this->student->id)
            ->update(['status' => Entitlement::STATUS_REVOKED]);
        $this->service->forget($this->student);

        $this->assertFalse($this->service->satisfies($this->student, AccessTier::PREMIUM));
    }

    /**
     * Un palier inconnu ou absent est GRATUIT, jamais payant.
     *
     * Le sens de ce défaut est la protection principale de tout ce chantier :
     * il garantit qu'aucune donnée manquante ne peut fermer la plateforme.
     */
    public function test_unknown_tier_defaults_to_free(): void
    {
        foreach ([null, '', 'gratuit', 'PREMIUM', 'premuim'] as $raw) {
            $this->assertSame(AccessTier::FREE, AccessTier::normalize($raw), "palier « {$raw} »");
        }

        $this->assertSame(AccessTier::PREMIUM, AccessTier::normalize('premium'));
    }

    /** Le résumé n'expose aucune donnée interne. */
    public function test_summary_exposes_no_internal_references(): void
    {
        Entitlement::factory()->subscription()->create([
            'user_id' => $this->student->id,
            'reference' => 'sub_secret_12345',
            'source' => 'stripe',
        ]);

        $summary = $this->service->summarize($this->student);

        $this->assertTrue($summary['premiumAccess']);
        $this->assertStringNotContainsString('sub_secret_12345', json_encode($summary));
        $this->assertArrayNotHasKey('reference', $summary);
    }
}
