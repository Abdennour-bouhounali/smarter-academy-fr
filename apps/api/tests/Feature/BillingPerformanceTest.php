<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\ContentAccess;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Le fournisseur est une source de facturation ASYNCHRONE, jamais une
 * dépendance d'exécution.
 *
 * Ce fichier tient les garanties de coût qui existaient AVANT la phase 5 et
 * qui ne doivent pas se dégrader :
 *
 *   - le gratuit ne pose aucune question aux droits ;
 *   - le payant coûte une requête indexée, pas une par contenu ;
 *   - ouvrir une leçon n'appelle JAMAIS le fournisseur.
 */
class BillingPerformanceTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function lesson(string $code, string $tier): Lesson
    {
        $grade = Grade::firstOrCreate(['code' => '2nde'], ['name' => '2nde', 'level' => 'lycee']);
        $chapter = Chapter::firstOrCreate(
            ['grade_id' => $grade->id, 'code' => 'fonctions'],
            ['title' => 'Fonctions', 'order' => 0],
        );

        return Lesson::create([
            'chapter_id' => $chapter->id, 'code' => $code, 'title' => 'Leçon',
            'status' => 'available', 'order' => 0, 'tier' => $tier,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
    }

    /** Les requêtes SQL émises pendant $work. */
    private function queriesDuring(callable $work): array
    {
        app(EntitlementService::class)->forget();

        $queries = [];
        DB::listen(function ($q) use (&$queries) {
            $queries[] = $q->sql;
        });

        $work();

        DB::flushQueryLog();

        return $queries;
    }

    public function test_free_content_never_queries_entitlements(): void
    {
        $this->lesson('lecon-gratuite', AccessTier::FREE);

        $queries = $this->queriesDuring(function () {
            ContentAccess::assertLessonAvailable('lecon-gratuite', $this->student);
        });

        $touched = array_filter($queries, fn ($sql) => str_contains($sql, 'entitlements'));

        $this->assertEmpty(
            $touched,
            'Le contenu gratuit a interrogé les droits. C\'est tout le catalogue actuel : '
            .'une requête ici est une requête sur chaque ouverture de chaque leçon.'
        );
    }

    public function test_an_anonymous_visitor_costs_no_entitlement_query(): void
    {
        $this->lesson('lecon-gratuite-2', AccessTier::FREE);

        $queries = $this->queriesDuring(function () {
            ContentAccess::assertLessonAvailable('lecon-gratuite-2', null);
        });

        $this->assertEmpty(array_filter($queries, fn ($sql) => str_contains($sql, 'entitlements')));
    }

    public function test_premium_content_costs_one_entitlement_query_not_one_per_lesson(): void
    {
        foreach (['p1', 'p2', 'p3', 'p4', 'p5'] as $code) {
            $this->lesson($code, AccessTier::PREMIUM);
        }

        $queries = $this->queriesDuring(function () {
            foreach (['p1', 'p2', 'p3', 'p4', 'p5'] as $code) {
                try {
                    ContentAccess::assertLessonAvailable($code, $this->student);
                } catch (\DomainException) {
                    // Le refus est attendu : ce qu'on mesure, c'est le COÛT.
                }
            }
        });

        $entitlementQueries = array_filter($queries, fn ($sql) => str_contains($sql, 'entitlements'));

        // La mémorisation par requête HTTP : cinq leçons, UNE question posée
        // aux droits. Sans elle, ce serait cinq — et quinze pour un Hub de
        // pratique.
        $this->assertLessThanOrEqual(
            1,
            count($entitlementQueries),
            'N+1 sur les droits : '.count($entitlementQueries).' requêtes pour 5 leçons.'
        );
    }

    public function test_opening_a_lesson_never_reaches_the_provider(): void
    {
        $this->lesson('lecon-payante', AccessTier::PREMIUM);

        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'test',
            providerSubscriptionId: 'sub_perf',
            providerCustomerId: 'cus_perf',
            providerStatus: 'active',
            providerPriceId: null,
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: Carbon::now()->addMonth(),
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $this->student->id,
        ));

        // Toute configuration du fournisseur est retirée : s'il était appelé,
        // l'appel échouerait. L'accès doit continuer de fonctionner.
        config(['services.stripe.secret' => null, 'services.stripe.webhook_secret' => null]);

        app(EntitlementService::class)->forget();

        ContentAccess::assertLessonAvailable('lecon-payante', $this->student->fresh());

        $this->assertTrue(
            app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM),
            'Une panne du fournisseur ne doit jamais fermer un accès déjà accordé.'
        );
    }

    public function test_the_closed_inventory_stays_a_handful_of_queries(): void
    {
        foreach (['a1', 'a2', 'a3'] as $code) {
            $this->lesson($code, AccessTier::FREE);
        }
        $this->lesson('a4', AccessTier::PREMIUM);

        $queries = $this->queriesDuring(function () {
            ContentAccess::closedInventory($this->student);
        });

        // L'inventaire est servi à CHAQUE montage de l'application élève.
        // Il doit rester un petit nombre de requêtes fixes, jamais une par
        // leçon du catalogue.
        $this->assertLessThanOrEqual(
            8,
            count($queries),
            'L\'inventaire de fermeture coûte '.count($queries).' requêtes — il est appelé à chaque montage.'
        );
    }
}
