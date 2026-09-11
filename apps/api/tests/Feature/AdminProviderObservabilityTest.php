<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Admin\ActivityLogger;
use App\Models\Entitlement;
use App\Models\ProviderEvent;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * L'administration voit tout, et ne fabrique rien.
 *
 * Les deux moitiés de cette phrase sont testées ici : l'observabilité doit
 * suffire à diagnostiquer « j'ai payé et je n'ai pas accès », et le seul
 * geste offert — le rejeu — ne doit jamais pouvoir inventer un abonnement.
 */
class AdminProviderObservabilityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function subscribe(string $status = 'active'): Subscription
    {
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'test',
            providerSubscriptionId: 'sub_obs',
            providerCustomerId: 'cus_obs',
            providerStatus: $status,
            providerPriceId: 'price_1',
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: Carbon::now()->addMonth(),
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $this->student->id,
        ));

        return Subscription::firstOrFail();
    }

    private function event(array $overrides = []): ProviderEvent
    {
        return ProviderEvent::create(array_merge([
            'provider' => 'test',
            'event_id' => 'evt_'.uniqid(),
            'type' => 'customer.subscription.updated',
            'status' => ProviderEvent::STATUS_PROCESSED,
            'occurred_at' => Carbon::now(),
            'received_at' => Carbon::now(),
            'processed_at' => Carbon::now(),
        ], $overrides));
    }

    // ── L'observabilité ─────────────────────────────────────────────────

    public function test_an_admin_sees_the_provider_state_next_to_the_local_one(): void
    {
        // `past_due` : le fournisseur signale un impayé, mais l'accès local
        // reste ouvert jusqu'au terme payé. C'est EXACTEMENT l'écart qu'un
        // administrateur doit pouvoir constater.
        $this->subscribe('past_due');

        Sanctum::actingAs($this->admin);

        $this->getJson("/api/v1/admin/students/{$this->student->id}/entitlements")
            ->assertOk()
            ->assertJsonPath('subscriptions.0.status', Subscription::STATUS_ACTIVE)
            ->assertJsonPath('subscriptions.0.providerStatus', 'past_due')
            ->assertJsonPath('subscriptions.0.providerReference', 'sub_obs');
    }

    public function test_the_subscription_list_carries_provider_columns(): void
    {
        $this->subscribe();

        Sanctum::actingAs($this->admin);

        $this->getJson('/api/v1/admin/subscriptions')
            ->assertOk()
            ->assertJsonPath('subscriptions.data.0.providerStatus', 'active')
            ->assertJsonPath('subscriptions.data.0.providerCustomerId', 'cus_obs')
            ->assertJsonPath('subscriptions.data.0.cancelAtPeriodEnd', false);
    }

    public function test_the_event_journal_lists_and_filters(): void
    {
        $this->event(['type' => 'invoice.paid']);
        $this->event(['status' => ProviderEvent::STATUS_FAILED, 'failure_reason' => 'base indisponible']);
        $this->event(['status' => ProviderEvent::STATUS_IGNORED, 'failure_reason' => 'stale']);

        Sanctum::actingAs($this->admin);

        $this->getJson('/api/v1/admin/provider-events')
            ->assertOk()
            ->assertJsonPath('summary.total', 3)
            ->assertJsonPath('summary.failed', 1)
            ->assertJsonPath('summary.ignored', 1);

        // Le filtre par statut : « que reste-t-il en échec ? »
        $this->getJson('/api/v1/admin/provider-events?status=failed')
            ->assertOk()
            ->assertJsonCount(1, 'events.data')
            ->assertJsonPath('events.data.0.failureReason', 'base indisponible');

        $this->getJson('/api/v1/admin/provider-events?type=invoice.paid')
            ->assertOk()
            ->assertJsonCount(1, 'events.data');
    }

    public function test_the_journal_never_exposes_the_payload_hash(): void
    {
        $this->event(['payload_hash' => hash('sha256', 'secret')]);

        Sanctum::actingAs($this->admin);
        $body = $this->getJson('/api/v1/admin/provider-events')->assertOk()->getContent();

        // Une empreinte n'apprend rien à un humain, et l'exposer laisserait
        // croire que le corps de l'évènement est conservé.
        $this->assertStringNotContainsString('payload', $body);
        $this->assertStringNotContainsString(hash('sha256', 'secret'), $body);
    }

    public function test_a_stale_event_shows_why_it_was_ignored(): void
    {
        $this->event(['status' => ProviderEvent::STATUS_IGNORED, 'failure_reason' => 'stale']);

        Sanctum::actingAs($this->admin);

        $this->getJson('/api/v1/admin/provider-events?status=ignored')
            ->assertOk()
            ->assertJsonPath('events.data.0.failureReason', 'stale');
    }

    // ── Le rejeu ────────────────────────────────────────────────────────

    public function test_replay_passes_through_the_normal_chain(): void
    {
        $subscription = $this->subscribe();
        $event = $this->event(['subscription_id' => $subscription->id]);

        // Un droit disparu « à la main » (incident, correction en base).
        Entitlement::query()->delete();
        app(EntitlementService::class)->forget();
        $this->assertFalse(app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM));

        Sanctum::actingAs($this->admin);

        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")
            ->assertOk()
            ->assertJsonPath('action', 'created');

        // Le droit est reconstruit par le synchroniseur, la porte habituelle.
        app(EntitlementService::class)->forget();
        $this->assertTrue(app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM));
    }

    public function test_replay_is_idempotent(): void
    {
        $subscription = $this->subscribe();
        $event = $this->event(['subscription_id' => $subscription->id]);

        Sanctum::actingAs($this->admin);

        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")->assertOk();
        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")->assertOk();
        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")->assertOk();

        // Trois rejeux, UN droit. C'est la référence stable du synchroniseur.
        $this->assertSame(1, Entitlement::count());
        $this->assertSame(1, Subscription::count());
    }

    public function test_replay_cannot_fabricate_a_subscription(): void
    {
        // Un évènement qui n'a touché aucun abonnement local — par exemple
        // parce que son client était inconnu.
        $event = $this->event([
            'status' => ProviderEvent::STATUS_IGNORED,
            'failure_reason' => 'unknown_customer',
        ]);

        Sanctum::actingAs($this->admin);

        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")
            ->assertStatus(422);

        // Rien n'a été inventé : ni abonnement, ni droit.
        $this->assertSame(0, Subscription::count());
        $this->assertSame(0, Entitlement::count());
    }

    public function test_replay_is_logged(): void
    {
        $subscription = $this->subscribe();
        $event = $this->event(['subscription_id' => $subscription->id]);

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/v1/admin/provider-events/{$event->id}/replay")->assertOk();

        // Un geste humain qui peut ouvrir ou fermer un accès laisse le nom de
        // qui l'a fait.
        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => ActivityLogger::PROVIDER_EVENT_REPLAYED,
        ]);
    }

    // ── Les limites de l'administration ─────────────────────────────────

    public function test_an_admin_cannot_create_or_edit_a_provider_event(): void
    {
        $event = $this->event();

        Sanctum::actingAs($this->admin);

        // Un évènement est ce que le fournisseur a envoyé : l'administration
        // n'a pas à réécrire l'histoire.
        $this->postJson('/api/v1/admin/provider-events', ['type' => 'invoice.paid'])
            ->assertStatus(405);
        $this->patchJson("/api/v1/admin/provider-events/{$event->id}", ['status' => 'processed'])
            ->assertStatus(405);
        $this->deleteJson("/api/v1/admin/provider-events/{$event->id}")
            ->assertStatus(405);
    }

    public function test_a_student_cannot_read_the_event_journal(): void
    {
        $this->event();

        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/admin/provider-events')->assertStatus(403);
        $this->postJson('/api/v1/admin/provider-events/1/replay')->assertStatus(403);
    }
}
