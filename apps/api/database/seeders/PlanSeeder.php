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
 * centimes de dinar, INFORMATIFS : la plateforme n'encaisse rien
 * (ALGERIA_PLATFORM_MASTER_SPEC.md §17/§18).
 */
class PlanSeeder extends Seeder
{
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
        K::CONTENT_ALLOWED_GRADES => ['4am'],
    ];

    /** La grille de départ : [min, max (null = sans borne), prix par élève en centimes]. */
    private const INITIAL_TIERS = [
        [1, 5, 0],
        [6, 20, 100000],
        [21, 30, 80000],
        [31, 50, 70000],
        [51, 100, 60000],
        [101, null, 50000],
    ];

    public function run(): void
    {
        $this->seed('teacher-free', [
            // Les NOMS et descriptions sont ce que l'enseignant et l'élève lisent
            // dans leur espace (arabe) ; l'administration les modifie depuis le panneau.
            'name' => 'الأستاذ — مجاني',
            'description' => 'حتى 5 تلاميذ وعدد غير محدود من الأقسام. العرض الافتراضي لكل حساب أستاذ.',
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
            K::CONTENT_ALLOWED_GRADES => ['4am'],
        ], ['amount_cents' => 0, 'billing_interval' => PlanPrice::INTERVAL_ONE_TIME, 'duration_days' => null]);

        $this->seed('teacher-seats', [
            'name' => 'الأستاذ — حسب عدد التلاميذ',
            'description' => 'اختر عدد التلاميذ الذين تريد تأطيرهم؛ يقلّ سعر التلميذ الواحد كلّما زاد العدد. الأقسام غير محدودة، ويحصل تلاميذك على المحتوى المدفوع عبر عرضك.',
            'type' => Plan::TYPE_TEACHER,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 1,
            'is_public' => true,
            'is_default' => false,
            'allows_requests' => true,
        ], self::PAID_TEACHER_FEATURES,
            ['amount_cents' => 0, 'billing_interval' => PlanPrice::INTERVAL_YEAR, 'duration_days' => 365],
            self::INITIAL_TIERS);

        // L'offre ÉLÈVE payante : ce à quoi l'administration lie un lot de
        // codes ou une activation directe. Le gratuit élève reste une règle
        // (EntitlementService), pas une offre : aucune offre élève par défaut.
        $this->seed('student-premium', [
            'name' => 'التلميذ — وصول كامل',
            'description' => 'كل دروس السنة وتمارينها.',
            'type' => Plan::TYPE_STUDENT,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 0,
            'is_public' => true,
            'is_default' => false,
            'allows_requests' => true,
        ], [], ['amount_cents' => 300000, 'billing_interval' => PlanPrice::INTERVAL_YEAR, 'duration_days' => 365]);
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

        PlanPrice::create(['plan_version_id' => $version->id, 'currency' => 'DZD'] + $price);

        foreach ($tiers as $i => [$min, $max, $cents]) {
            PlanPricingTier::create([
                'plan_version_id' => $version->id,
                'min_students' => $min,
                'max_students' => $max,
                'price_per_student_cents' => $cents,
                'currency' => 'DZD',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $this->command?->info("Offre créée : {$slug}");
    }
}
