<?php

namespace Database\Seeders;

use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Plan;
use App\Models\PlanEntitlement;
use App\Models\PlanPrice;
use App\Models\PlanPricingTier;
use App\Models\PlanVersion;
use Illuminate\Database\Seeder;

/**
 * Les OFFRES INITIALES — des valeurs de départ configurables, jamais des
 * règles.
 *
 * L'offre enseignant se vend PAR SIÈGES ÉLÈVES, pas par classes :
 *
 *   teacher-free    l'offre par défaut, effective sans ligne — N sièges
 *                   (students_total.max, ici 5), classes ILLIMITÉES ;
 *   teacher-seats   l'offre payante : l'enseignant choisit combien d'élèves
 *                   il veut encadrer, la GRILLE (plan_pricing_tiers) donne
 *                   le prix par élève du palier, le total en découle. Les
 *                   classes restent illimitées ; les élèves de ses classes
 *                   sont couverts par son offre (students.covered).
 *
 * La grille ci-dessous n'est qu'un point de départ : l'administration la
 * modifie depuis le panneau, en publiant une nouvelle version ; les
 * abonnements existants gardent la leur et leur capacité achetée.
 *
 * IDEMPOTENT et NON DESTRUCTIF : une offre dont le slug existe déjà n'est
 * pas touchée. Aucun abonnement n'est créé ici. Les montants sont en
 * centimes d'euro.
 *
 * LES PRIX : le propriétaire ne les a pas encore fixés (le paiement est
 * fermé par défaut — PaymentGate). Seul le prix de l'élève est connu : celui
 * de config/billing.php (35 € par an). Tout autre montant payant vaut
 * PRICE_TO_BE_DECIDED_BY_OWNER (0) ; une formule à 0 ne se demande pas et ne
 * s'achète pas (SubscriptionRequestService, PlanCatalog::purchasable). Les
 * gratuités de structure (la formule gratuite du professeur, ses 5 premiers
 * élèves) valent FREE.
 */
class PlanSeeder extends Seeder
{
    /** Un prix que le propriétaire n'a pas encore fixé : rien ne se vend à ce prix. */
    public const PRICE_TO_BE_DECIDED_BY_OWNER = 0;

    /** Une gratuité voulue par la structure de l'offre, pas un prix en attente. */
    public const FREE = 0;

    /** Les fonctionnalités de l'offre enseignant payante. */
    private const PAID_TEACHER_FEATURES = [
        K::CLASSROOMS_MAX => null,
        K::STUDENTS_PER_CLASSROOM_MAX => null,
        K::LESSONS_VISIBILITY => true,
        K::LESSONS_BULK_ACTIONS => true,
        K::PROGRESS_CLASS => true,
        K::PROGRESS_STUDENT => true,
        K::ANALYTICS_ADVANCED => true,
        K::REPORTS_EXPORT => true,
        K::STUDENTS_COVERED => true,
        K::CONTENT_ALLOWED_GRADES => ['3e'],
    ];

    /**
     * La grille de départ : [min, max (null = sans borne), prix par élève en
     * centimes d'euro]. Les paliers sont gardés ; leurs prix attendent le
     * propriétaire.
     */
    private const INITIAL_TIERS = [
        [1, 5, self::FREE],
        [6, 20, self::PRICE_TO_BE_DECIDED_BY_OWNER],
        [21, 30, self::PRICE_TO_BE_DECIDED_BY_OWNER],
        [31, 50, self::PRICE_TO_BE_DECIDED_BY_OWNER],
        [51, 100, self::PRICE_TO_BE_DECIDED_BY_OWNER],
        [101, null, self::PRICE_TO_BE_DECIDED_BY_OWNER],
    ];

    public function run(): void
    {
        $this->seed('teacher-free', [
            // Les NOMS et descriptions sont ce que le professeur et l'élève lisent
            // dans leur espace ; l'administration les modifie depuis le panneau.
            'name' => 'Professeur — gratuit',
            'description' => 'Jusqu’à 5 élèves et autant de classes que vous voulez. La formule de départ de tout compte professeur.',
            'type' => Plan::TYPE_TEACHER,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 0,
            'is_public' => true,
            'is_default' => true,
            'allows_requests' => false,
        ], [
            K::STUDENTS_TOTAL_MAX => 5,
            K::CLASSROOMS_MAX => null,
            K::STUDENTS_PER_CLASSROOM_MAX => null,
            K::LESSONS_VISIBILITY => true,
            K::LESSONS_BULK_ACTIONS => false,
            K::PROGRESS_CLASS => true,
            K::PROGRESS_STUDENT => true,
            K::ANALYTICS_ADVANCED => false,
            K::REPORTS_EXPORT => false,
            K::STUDENTS_COVERED => false,
            K::CONTENT_ALLOWED_GRADES => ['3e'],
        ], ['amount_cents' => self::FREE, 'billing_interval' => PlanPrice::INTERVAL_ONE_TIME, 'duration_days' => null]);

        $this->seed('teacher-seats', [
            'name' => 'Professeur — selon le nombre d’élèves',
            'description' => 'Choisissez le nombre d’élèves que vous suivez ; plus il est grand, plus le prix par élève baisse. Les classes sont illimitées, et vos élèves ont accès à tout le contenu grâce à votre formule.',
            'type' => Plan::TYPE_TEACHER,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 1,
            'is_public' => true,
            'is_default' => false,
            'allows_requests' => true,
        ], self::PAID_TEACHER_FEATURES,
            // Le prix se lit dans la grille (par élève) ; la ligne de prix n'est que le support de l'intervalle.
            ['amount_cents' => self::FREE, 'billing_interval' => PlanPrice::INTERVAL_YEAR, 'duration_days' => 365],
            self::INITIAL_TIERS);

        // L'offre ÉLÈVE payante : ce à quoi l'administration lie un lot de
        // codes ou une activation directe. Le gratuit élève reste une règle
        // (EntitlementService), pas une offre : aucune offre élève par défaut.
        $this->seed('student-premium', [
            'name' => 'Élève — accès complet',
            'description' => 'Toutes les leçons et tous les exercices de l’année.',
            'type' => Plan::TYPE_STUDENT,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 0,
            'is_public' => true,
            'is_default' => false,
            'allows_requests' => true,
        ], [], ['amount_cents' => (int) config('billing.plans.annual.amount_cents'), 'billing_interval' => PlanPrice::INTERVAL_YEAR, 'duration_days' => 365]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $entitlements
     * @param  array<string, mixed>  $price
     * @param  array<int, array{0: int, 1: ?int, 2: int}>  $tiers
     */
    private function seed(string $slug, array $attributes, array $entitlements, array $price, array $tiers = []): void
    {
        if (Plan::where('slug', $slug)->exists()) {
            $this->command?->line("Offre déjà présente, inchangée : {$slug}");

            return;
        }

        $plan = Plan::create(['slug' => $slug] + $attributes);

        $version = PlanVersion::create([
            'plan_id' => $plan->id,
            'version' => 1,
            'status' => PlanVersion::STATUS_CURRENT,
            'notes' => 'Version initiale (seeder).',
            'published_at' => now(),
        ]);

        foreach ($entitlements as $key => $value) {
            PlanEntitlement::create([
                'plan_version_id' => $version->id,
                'key' => $key,
                'value' => K::normalize($key, $value),
            ]);
        }

        PlanPrice::create(['plan_version_id' => $version->id, 'currency' => 'EUR'] + $price);

        foreach ($tiers as $i => [$min, $max, $cents]) {
            PlanPricingTier::create([
                'plan_version_id' => $version->id,
                'min_students' => $min,
                'max_students' => $max,
                'price_per_student_cents' => $cents,
                'currency' => 'EUR',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $this->command?->info("Offre créée : {$slug}");
    }
}
