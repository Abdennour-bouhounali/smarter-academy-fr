<?php

namespace Tests\Feature;

use App\Domain\Plans\EntitlementKeys as K;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\PlanEntitlement;
use App\Models\PlanEntitlementOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La résolution : offre par défaut → version de l'abonnement → dérogations.
 * Tout vient de la base ; un changement en base se voit sans déploiement.
 */
class PlanEntitlementResolverTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function resolver(): PlanEntitlementResolver
    {
        $this->forgetAll();

        return app(PlanEntitlementResolver::class);
    }

    public function test_sans_offre_par_defaut_tout_est_au_plus_restrictif(): void
    {
        $teacher = $this->teacher();
        // La capacité commerciale ferme (0 siège) ; les limites techniques
        // sont sans valeur = illimitées (les classes ne sont pas l'unité de vente).
        $this->assertSame(0, $this->resolver()->limit($teacher, K::STUDENTS_TOTAL_MAX));
        $this->assertNull($this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        $this->assertFalse($this->resolver()->allows($teacher, K::LESSONS_VISIBILITY));
        $this->assertSame('none', $this->resolver()->summaryFor($teacher)['plan']['status']);
    }

    public function test_l_offre_par_defaut_puis_l_abonnement_puis_la_derogation(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $pro = $this->paidTeacherPlan([K::CLASSROOMS_MAX => 5]);
        $teacher = $this->teacher();
        $admin = $this->admin();

        $this->assertSame(1, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        $this->assertSame('default', $this->resolver()->summaryFor($teacher)['plan']['source']);

        app(SubscriptionActivationService::class)->activate($admin, $teacher, $pro);
        $this->assertSame(5, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        $this->assertSame('subscription', $this->resolver()->summaryFor($teacher)['plan']['source']);

        PlanEntitlementOverride::factory()->create(['user_id' => $teacher->id, 'key' => K::CLASSROOMS_MAX, 'value' => 7, 'created_by' => $admin->id]);
        $this->assertSame(7, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        $explain = collect($this->resolver()->explain($teacher))->firstWhere('key', K::CLASSROOMS_MAX);
        $this->assertSame('override', $explain['source']);
    }

    public function test_une_derogation_s_applique_aussi_sur_l_offre_gratuite_et_expire(): void
    {
        Carbon::setTestNow('2026-09-26 12:00:00');
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $teacher = $this->teacher();
        PlanEntitlementOverride::factory()->create(['user_id' => $teacher->id, 'value' => 3, 'ends_at' => Carbon::now()->addDays(7)]);

        $this->assertSame(3, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));

        Carbon::setTestNow('2026-10-10 12:00:00');
        $this->assertSame(1, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        Carbon::setTestNow();
    }

    public function test_une_derogation_ne_touche_pas_un_autre_enseignant(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $a = $this->teacher();
        $b = $this->teacher();
        PlanEntitlementOverride::factory()->create(['user_id' => $a->id, 'value' => 9]);

        $this->assertSame(9, $this->resolver()->limit($a, K::CLASSROOMS_MAX));
        $this->assertSame(1, $this->resolver()->limit($b, K::CLASSROOMS_MAX));
    }

    public function test_changer_l_offre_en_base_change_l_evaluation_sans_deploiement(): void
    {
        $free = $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $teacher = $this->teacher();
        $this->assertSame(1, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));

        PlanEntitlement::where('plan_version_id', $free->currentVersion->id)->where('key', K::CLASSROOMS_MAX)->update(['value' => json_encode(2)]);
        $this->assertSame(2, $this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
    }

    public function test_illimite_est_un_choix_explicite(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => null]);
        $teacher = $this->teacher();
        $this->assertNull($this->resolver()->limit($teacher, K::CLASSROOMS_MAX));
        $this->assertTrue($this->resolver()->summaryFor($teacher)['classes']['canCreate']);
    }

    public function test_le_resume_client_ne_porte_aucune_cle_interne_de_plus_que_les_fonctionnalites(): void
    {
        $this->defaultTeacherPlan();
        $summary = $this->resolver()->summaryFor($this->teacher());
        $this->assertSame(['plan', 'request', 'classes', 'students', 'studentsPerClass', 'features', 'allowedGrades'], array_keys($summary));
        $this->assertSame(['current', 'maximum', 'remaining', 'overLimit', 'canCreate'], array_keys($summary['classes']));
    }
}
