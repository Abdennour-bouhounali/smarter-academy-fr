<?php

namespace Tests\Feature;

use App\Domain\Access\AccessDecision;
use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Admin\ActivityLogger;
use App\Domain\Billing\PaymentGate;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\AdminActivityLog;
use App\Models\Chapter;
use App\Models\Classroom;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\PlatformSetting;
use App\Models\ProviderEvent;
use App\Models\SchoolLicence;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\UsageEvent;
use App\Models\User;
use Database\Factories\ActivationCodeFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\Support\CommercialFixtures;
use Tests\Support\FeatureAccessFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

// Les faux fournisseurs vivent à côté des suites qui les ont introduits.
require_once __DIR__.'/ProviderWebhookIdempotencyTest.php';
require_once __DIR__.'/CheckoutFlowTest.php';

/**
 * L'interrupteur du paiement en ligne (docs/FRANCE_REBUILD_PLAN.md §4ter). La suite tourne paiement OUVERT
 * (phpunit.xml) ; chaque test ici le FERME lui-même, par la configuration ou par la ligne de l'administrateur.
 */
class PaymentGateTest extends TestCase
{
    use CommercialFixtures;
    use FeatureAccessFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    private const CLOSED = ['success' => false, 'code' => 'payments_closed', 'message' => 'Le paiement en ligne n’est pas ouvert.'];

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'billing.payments.open' => false,
            'billing.provider' => 'sandbox',
            'billing.plans' => [
                'annual' => [
                    'key' => 'annual', 'name' => 'Premium annuel', 'price_id' => 'price_annuel_test',
                    'amount_cents' => 3500, 'currency' => 'EUR', 'interval' => 'year', 'active' => true,
                ],
            ],
        ]);
        $this->gate()->forget();
    }

    private function gate(): PaymentGate
    {
        return app(PaymentGate::class);
    }

    /** Ouvre (true) ou ferme (false) par la configuration, et oublie ce qui a été lu. */
    private function payments(bool $open): void
    {
        config(['billing.payments.open' => $open]);
        $this->gate()->forget();
        $this->forgetAll();
        app(EntitlementService::class)->forget();
    }

    private function premiumLesson(string $status = Lesson::PUB_PUBLISHED): Lesson
    {
        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);

        return Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde', 'title' => 'Fonction affine',
            'status' => 'available', 'order' => 0, 'tier' => AccessTier::PREMIUM, 'publication_status' => $status,
        ]);
    }

    // ── L'interrupteur ──────────────────────────────────────────────────

    public function test_closed_by_default(): void
    {
        // Le défaut du DÉPÔT, sans la variable de phpunit.xml : fermé.
        $saved = $_ENV['PAYMENTS_OPEN'] ?? null;
        $savedServer = $_SERVER['PAYMENTS_OPEN'] ?? null;
        putenv('PAYMENTS_OPEN');
        unset($_ENV['PAYMENTS_OPEN'], $_SERVER['PAYMENTS_OPEN']);
        try {
            $config = require base_path('config/billing.php');
            $this->assertFalse($config['payments']['open']);
        } finally {
            if ($saved !== null) {
                $_ENV['PAYMENTS_OPEN'] = $saved;
                putenv("PAYMENTS_OPEN={$saved}");
            }
            if ($savedServer !== null) {
                $_SERVER['PAYMENTS_OPEN'] = $savedServer;
            }
        }

        $this->assertFalse($this->gate()->isOpen());
        $this->getJson('/api/v1/billing/status')->assertOk()->assertExactJson(['success' => true, 'open' => false]);
    }

    public function test_billing_status_follows_the_switch(): void
    {
        $this->payments(true);
        $this->getJson('/api/v1/billing/status')->assertOk()->assertExactJson(['success' => true, 'open' => true]);
    }

    // ── Commencer un paiement : refusé ─────────────────────────────────

    public function test_checkout_is_refused_while_closed(): void
    {
        $student = $this->student();

        $this->actingAs($student)->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(403)->assertExactJson(self::CLOSED);
        // Même une entrée invalide : il n'y a rien à corriger.
        $this->actingAs($student)->postJson('/api/v1/billing/checkout', [])
            ->assertStatus(403)->assertJsonPath('code', 'payments_closed');

        $this->payments(true);
        $this->actingAs($student)->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertCreated();
    }

    public function test_a_subscription_request_is_refused_for_the_student_and_the_teacher(): void
    {
        $this->defaultTeacherPlan();
        $teacherPlan = $this->paidTeacherPlan();
        $studentPlan = $this->studentPlan();

        $this->withToken($this->tokenOf($this->student()))
            ->postJson('/api/v1/me/subscription-requests', ['planId' => $studentPlan->id])
            ->assertStatus(403)->assertExactJson(self::CLOSED);
        $this->withToken($this->tokenOf($this->teacher()))
            ->postJson('/api/v1/teacher/subscription-requests', ['planId' => $teacherPlan->id])
            ->assertStatus(403)->assertExactJson(self::CLOSED);

        $this->assertSame(0, SubscriptionRequest::count());
    }

    public function test_a_plan_quote_is_refused(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $token = $this->tokenOf($this->teacher());

        $this->withToken($token)->getJson("/api/v1/teacher/plans/{$plan->id}/quote?seats=10")
            ->assertStatus(403)->assertExactJson(self::CLOSED);

        $this->payments(true);
        $this->withToken($token)->getJson("/api/v1/teacher/plans/{$plan->id}/quote?seats=10")->assertOk();
    }

    public function test_the_plan_lists_are_empty_while_closed(): void
    {
        $this->studentPlan();
        $student = $this->student();

        $this->actingAs($student)->getJson('/api/v1/billing/plans')->assertOk()
            ->assertJsonPath('plans', [])
            ->assertJsonPath('status.canSubscribe', false)
            ->assertJsonPath('status.reason', 'payments_closed')
            ->assertJsonStructure(['success', 'plans', 'status', 'mode']);
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/me/plans')->assertOk()
            ->assertJsonPath('plans', [])
            ->assertJsonStructure(['success', 'plans', 'freeSeats']);

        // Rouvrir rend le catalogue tel quel.
        $this->payments(true);
        $this->actingAs($student)->getJson('/api/v1/billing/plans')->assertOk()->assertJsonCount(1, 'plans');
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/me/plans')->assertOk()->assertJsonCount(1, 'plans');
    }

    // ── L'accès : personne n'est enfermé ───────────────────────────────

    public function test_a_free_student_opens_a_premium_lesson_while_closed_and_meets_the_paywall_once_opened(): void
    {
        $lesson = $this->premiumLesson();
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        $token = $student->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson("/api/v1/lessons/{$lesson->code}/exercises")->assertOk()
            ->assertJsonMissingPath('reason');
        $this->withToken($token)->getJson('/api/v1/me/access')->assertOk()
            ->assertJsonPath('access.premiumAccess', true)
            ->assertJsonPath('access.reason', 'payments_closed')
            ->assertJsonPath('access.paymentsOpen', false)
            ->assertJsonPath('access.subscriptionActive', false);
        // Rien n'est « Premium » ni verrouillé dans l'inventaire.
        $this->withToken($token)->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.premium', [])
            ->assertJsonPath('closed.locked', []);
        // Le visiteur aussi : le palier payant vaut le gratuit.
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/content/availability/public')->assertOk()->assertJsonPath('closed.locked', []);

        $this->payments(true);

        $this->withToken($token)->getJson("/api/v1/lessons/{$lesson->code}/exercises")->assertOk()
            ->assertJsonPath('available', false)
            ->assertJsonPath('reason', 'premium_required');
        $this->withToken($token)->getJson('/api/v1/me/access')->assertOk()
            ->assertJsonPath('access.premiumAccess', false)
            ->assertJsonPath('access.reason', 'premium_required')
            ->assertJsonPath('access.paymentsOpen', true);
        $this->withToken($token)->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.locked', [$lesson->code]);
    }

    public function test_a_draft_lesson_stays_closed_while_payments_are_closed(): void
    {
        $lesson = $this->premiumLesson(Lesson::PUB_DRAFT);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);

        $this->withToken($student->createToken('t')->plainTextToken)
            ->getJson("/api/v1/lessons/{$lesson->code}/exercises")->assertOk()
            ->assertJsonPath('available', false)
            ->assertJsonPath('reason', 'lesson_unavailable');
    }

    public function test_a_real_entitlement_keeps_its_own_reason(): void
    {
        $student = $this->student();
        Entitlement::factory()->subscription()->create(['user_id' => $student->id]);

        $this->assertSame(AccessDecision::VIA_SUBSCRIPTION, app(EntitlementService::class)->decide($student, AccessTier::PREMIUM)->reason);
    }

    public function test_a_feature_limit_that_blocks_a_free_account_when_open_does_not_block_it_when_closed(): void
    {
        $this->setPolicy('math_lab.tool.logic', ['is_enabled' => true, 'free_allowed' => false, 'premium_allowed' => true, 'free_quota' => null, 'premium_quota' => null]);
        $this->setPolicy('notebook', ['is_enabled' => true, 'free_allowed' => true, 'premium_allowed' => true, 'free_quota' => 0, 'premium_quota' => null]);
        $student = $this->student();
        $service = app(FeatureAccessService::class);

        $decision = $service->decide($student, 'math_lab.tool.logic');
        $this->assertTrue($decision->allowed);
        $this->assertSame(AccessTier::PREMIUM, $decision->tier);
        $this->actingAs($student)->postJson('/api/v1/practice/notes', ['content' => 'note'])->assertSuccessful();
        $this->actingAs($student)->getJson('/api/v1/me/feature-access')->assertOk()
            ->assertJsonPath('tierReason', 'payments_closed')
            ->assertJsonPath('paymentsOpen', false);

        $this->payments(true);

        $this->assertSame('premium_required', $service->decide($student, 'math_lab.tool.logic')->reason);
        $this->actingAs($student)->postJson('/api/v1/practice/notes', ['content' => 'note'])
            ->assertForbidden()->assertJsonPath('code', 'quota_exceeded');
        $this->assertSame(1, UsageEvent::count());
    }

    public function test_a_teacher_seat_cap_does_not_block_while_closed(): void
    {
        $this->freeSeatsPlan(1);
        $teacher = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $join = fn (User $s) => $this->withToken($this->tokenOf($s))
            ->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code]);

        $join($this->student())->assertCreated();
        $join($this->student())->assertCreated();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/capacity')->assertOk()
            ->assertJsonPath('capacity.limit', null)->assertJsonPath('capacity.canAdd', true);

        $this->payments(true);
        $join($this->student())->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
    }

    public function test_a_school_licence_seat_cap_does_not_block_while_closed(): void
    {
        $this->freeSeatsPlan(5);
        $this->grade3e(1);
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school));
        $licence = new SchoolLicence(['student_seats' => 1, 'starts_at' => now()->subDay()]);
        $licence->school_id = $school->id;
        $licence->save();
        $rows = fn (int $from) => collect(range($from, $from + 1))->map(fn ($i) => [
            // Les noms sont encore en lettres arabes tant que l'étape 1C n'est pas faite (PersonName).
            'firstName' => 'Élève', 'lastName' => 'Numéro'.str_repeat('a', $i), 'birthDate' => sprintf('2012-02-%02d', $i),
        ])->all();

        $this->withToken($directorToken)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => $rows(1)])
            ->assertCreated()->assertJsonCount(2, 'cards');

        $this->payments(true);
        $this->withToken($directorToken)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => $rows(5)])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
    }

    // ── Jamais bloqués ──────────────────────────────────────────────────

    public function test_a_webhook_is_recorded_and_processed_while_closed(): void
    {
        app(PaymentProviderRegistry::class)->register(new FakePaymentProvider);
        $student = $this->student();
        $body = json_encode([
            'id' => 'evt_closed', 'type' => 'customer.subscription.updated', 'subscription_id' => 'sub_closed',
            'customer_id' => 'cus_closed', 'status' => 'active',
            'period_start' => Carbon::now()->subDay()->timestamp, 'period_end' => Carbon::now()->addMonth()->timestamp,
            'cancel_at_period_end' => false, 'occurred_at' => Carbon::now()->timestamp,
            'client_reference_id' => (string) $student->id,
        ]);

        $this->call('POST', '/api/v1/webhooks/fake', [], [], [], [
            'HTTP_X-Provider-Signature' => FakePaymentProvider::GOOD_SIGNATURE, 'CONTENT_TYPE' => 'application/json',
        ], $body)->assertOk();

        $this->assertDatabaseHas('provider_events', ['provider' => 'fake', 'status' => ProviderEvent::STATUS_PROCESSED]);
        $this->assertSame(Subscription::STATUS_ACTIVE, Subscription::where('external_reference', 'sub_closed')->value('status'));
    }

    public function test_cancelling_an_existing_subscription_still_works_while_closed(): void
    {
        config(['billing.provider' => 'fake_checkout', 'billing.return_urls.portal' => 'https://exemple.test/abonnement']);
        app(PaymentProviderRegistry::class)->register(new FakeCheckoutProvider);
        $student = $this->student();
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout', providerSubscriptionId: 'sub_'.$student->id, providerCustomerId: 'cus_'.$student->id,
            providerStatus: 'active', providerPriceId: 'price_annuel_test',
            currentPeriodStart: Carbon::now()->subDay(), currentPeriodEnd: Carbon::now()->addMonth(),
            cancelAtPeriodEnd: false, occurredAt: Carbon::now(), clientReferenceId: (string) $student->id,
        ));

        $this->actingAs($student)->getJson('/api/v1/billing/subscription')->assertOk();
        $this->actingAs($student)->postJson('/api/v1/billing/subscription/cancel')->assertOk()
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', true);
        $this->actingAs($student)->postJson('/api/v1/billing/subscription/resume')->assertOk()
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', false);
    }

    public function test_an_activation_code_is_redeemed_while_closed(): void
    {
        $student = $this->student();
        $batch = ActivationCodeBatch::factory()->create(['access_days' => 365]);
        $code = ActivationCode::factory()->create(['batch_id' => $batch->id]);

        $this->withToken($this->tokenOf($student))
            ->postJson('/api/v1/activation-codes/redeem', ['code' => ActivationCodeFactory::plainCodeOf($code)])
            ->assertOk()
            ->assertJsonPath('access.activationCodeActive', true)
            ->assertJsonPath('access.reason', 'activation_code');
        $this->assertSame(ActivationCode::STATUS_ACTIVATED, $code->fresh()->status);
    }

    // ── L'administrateur ────────────────────────────────────────────────

    public function test_a_non_admin_cannot_read_or_toggle(): void
    {
        foreach ([$this->student(), $this->teacher()] as $user) {
            $token = $this->tokenOf($user);
            $this->withToken($token)->getJson('/api/v1/admin/payments/switch')->assertForbidden();
            $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])->assertForbidden();
        }
        $this->assertFalse(PlatformSetting::where('key', PlatformSetting::PAYMENTS_KEY)->exists());
    }

    public function test_the_admin_reads_the_switch_without_any_secret_value(): void
    {
        config(['billing.provider' => 'stripe', 'services.stripe.secret' => 'sk_test_SECRET_VALUE', 'services.stripe.webhook_secret' => null]);

        $response = $this->withToken($this->tokenOf($this->admin()))->getJson('/api/v1/admin/payments/switch')->assertOk()
            ->assertJsonPath('payments.open', false)
            ->assertJsonPath('payments.default', false)
            ->assertJsonPath('payments.provider', 'stripe')
            ->assertJsonPath('payments.configured', false)
            ->assertJsonPath('payments.missing', ['STRIPE_WEBHOOK_SECRET'])
            ->assertJsonPath('payments.lastChange', null);
        $this->assertStringNotContainsString('sk_test_SECRET_VALUE', $response->getContent());
    }

    public function test_the_admin_toggles_and_the_log_holds_old_and_new(): void
    {
        $admin = $this->admin();
        $token = $this->tokenOf($admin);

        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])->assertOk()
            ->assertJsonPath('payments.open', true)
            ->assertJsonPath('payments.lastChange.by.id', $admin->id);
        $this->getJson('/api/v1/billing/status')->assertJson(['open' => true]);

        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => false])->assertOk()
            ->assertJsonPath('payments.open', false);
        $this->getJson('/api/v1/billing/status')->assertJson(['open' => false]);

        $logs = AdminActivityLog::where('action', ActivityLogger::PAYMENTS_SETTINGS_CHANGED)->orderBy('id')->get();
        $this->assertCount(2, $logs);
        $this->assertSame(['open' => false], $logs[0]->before);
        $this->assertSame(['open' => true], $logs[0]->after);
        $this->assertSame(['open' => true], $logs[1]->before);
        $this->assertSame(['open' => false], $logs[1]->after);
        $this->assertSame($admin->id, $logs[0]->user_id);

        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', [])->assertStatus(422);
    }

    public function test_opening_is_refused_while_stripe_lacks_its_secret_or_its_price(): void
    {
        $token = $this->tokenOf($this->admin());
        config([
            'billing.provider' => 'stripe',
            'services.stripe.secret' => null,
            'services.stripe.webhook_secret' => 'whsec_test',
            'billing.plans.annual.price_id' => 'price_annuel_test',
        ]);

        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])
            ->assertStatus(422)
            ->assertJsonPath('code', 'payments_not_configured')
            ->assertJsonPath('missing', ['STRIPE_SECRET']);

        config(['services.stripe.secret' => 'sk_test_x', 'billing.plans.annual.price_id' => null]);
        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])
            ->assertStatus(422)
            ->assertJsonPath('code', 'payments_not_configured')
            ->assertJsonPath('missing', ['STRIPE_PRICE_ANNUAL']);

        $this->assertFalse($this->gate()->isOpen());
        $this->assertSame(0, AdminActivityLog::where('action', ActivityLogger::PAYMENTS_SETTINGS_CHANGED)->count());

        // Configuré : accepté.
        config(['billing.plans.annual.price_id' => 'price_annuel_test']);
        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])->assertOk()
            ->assertJsonPath('payments.open', true)
            ->assertJsonPath('payments.configured', true)
            ->assertJsonPath('payments.missing', []);
    }

    public function test_closing_is_always_allowed_even_when_not_configured(): void
    {
        PlatformSetting::create(['key' => PlatformSetting::PAYMENTS_KEY, 'values' => ['open' => true]]);
        config(['billing.provider' => 'stripe', 'services.stripe.secret' => null]);
        $this->gate()->forget();

        $this->withToken($this->tokenOf($this->admin()))->patchJson('/api/v1/admin/payments/switch', ['open' => false])->assertOk()
            ->assertJsonPath('payments.open', false);
    }

    public function test_the_admin_row_wins_over_the_env_default_in_both_directions(): void
    {
        $row = PlatformSetting::create(['key' => PlatformSetting::PAYMENTS_KEY, 'values' => ['open' => true]]);
        $this->payments(false);
        $this->assertTrue($this->gate()->isOpen());

        $row->update(['values' => ['open' => false]]);
        $this->payments(true);
        $this->assertFalse($this->gate()->isOpen());
        $this->getJson('/api/v1/billing/status')->assertJson(['open' => false]);
    }

    public function test_closing_and_reopening_changes_no_subscription_and_no_entitlement(): void
    {
        $student = $this->student();
        Entitlement::factory()->subscription()->create(['user_id' => $student->id]);
        Subscription::create([
            'user_id' => $student->id, 'plan' => 'annual', 'status' => Subscription::STATUS_ACTIVE,
            'started_at' => Carbon::now()->subDay(), 'ends_at' => Carbon::now()->addYear(),
        ]);
        $snapshot = fn () => [
            DB::table('subscriptions')->orderBy('id')->get()->map(fn ($r) => (array) $r)->all(),
            DB::table('entitlements')->orderBy('id')->get()->map(fn ($r) => (array) $r)->all(),
        ];
        $before = $snapshot();
        $token = $this->tokenOf($this->admin());

        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])->assertOk();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/me/access')->assertOk();
        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => false])->assertOk();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/me/access')->assertOk();
        $this->withToken($token)->patchJson('/api/v1/admin/payments/switch', ['open' => true])->assertOk();

        $this->assertSame($before, $snapshot());
    }
}
