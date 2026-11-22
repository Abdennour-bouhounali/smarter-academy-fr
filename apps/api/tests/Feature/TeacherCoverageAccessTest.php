<?php

namespace Tests\Feature;

use App\Domain\Access\AccessDecision;
use App\Domain\Access\AccessTier;
use App\Domain\Access\ContentAccess;
use App\Domain\Access\EntitlementService;
use App\Domain\Plans\EntitlementKeys as K;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\Classroom;
use App\Models\Entitlement;
use App\Models\Lesson;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Le modèle B : l'élève d'une classe dont l'enseignant couvre ses élèves
 * ouvre le contenu payant — tant que tout tient : adhésion, classe, offre,
 * abonnement. Et jamais du contenu non publié.
 */
class TeacherCoverageAccessTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function entitlements(): EntitlementService
    {
        $this->forgetAll();

        return app(EntitlementService::class);
    }

    /** @return array{teacher: User, student: User, classroom: Classroom, lesson: Lesson} */
    private function coveredStudent(): array
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan([K::STUDENTS_COVERED => true]);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $lesson->update(['tier' => 'premium']);
        $teacher = $this->teacher();
        app(SubscriptionActivationService::class)->activate($this->admin(), $teacher, $pro);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();

        return ['teacher' => $teacher, 'student' => $student, 'classroom' => $classroom, 'lesson' => $lesson];
    }

    public function test_un_eleve_couvert_ouvre_le_contenu_payant_par_son_enseignant(): void
    {
        ['student' => $student, 'lesson' => $lesson] = $this->coveredStudent();

        $decision = $this->entitlements()->decide($student, AccessTier::PREMIUM);
        $this->assertTrue($decision->allowed);
        $this->assertSame(AccessDecision::VIA_TEACHER_SUBSCRIPTION, $decision->reason);
        ContentAccess::assertLessonAvailable($lesson->code, $student);

        $summary = $this->entitlements()->summarize($student);
        $this->assertTrue($summary['teacherCoverageActive']);
        $this->assertFalse($summary['subscriptionActive']);
        $this->assertNotNull($summary['expiresAt']);

        $this->withToken($this->tokenOf($student))->getJson('/api/v1/content/availability')
            ->assertJsonPath('access.teacherCoverageActive', true)->assertJsonPath('closed.locked', []);
        $this->assertDatabaseCount('entitlements', 1); // celui de l'enseignant ; aucune ligne pour l'élève
    }

    public function test_la_carte_de_l_eleve_explique_son_acces_avant_la_couverture(): void
    {
        ['student' => $student] = $this->coveredStudent();
        Entitlement::factory()->activationCode()->create(['user_id' => $student->id]);

        $this->assertSame(AccessDecision::VIA_ACTIVATION_CODE, $this->entitlements()->decide($student, AccessTier::PREMIUM)->reason);
    }

    public function test_la_couverture_se_ferme_avec_l_adhesion_la_classe_ou_l_abonnement(): void
    {
        ['teacher' => $teacher, 'student' => $student, 'classroom' => $classroom] = $this->coveredStudent();
        $admin = $this->admin();
        $this->assertTrue($this->entitlements()->satisfies($student, AccessTier::PREMIUM));

        // L'abonnement de l'enseignant est suspendu : la couverture tombe.
        $subscription = $teacher->subscriptions()->first();
        app(SubscriptionActivationService::class)->suspend($admin, $subscription);
        $this->assertFalse($this->entitlements()->satisfies($student, AccessTier::PREMIUM));
        app(SubscriptionActivationService::class)->resume($admin, $subscription);
        $this->assertTrue($this->entitlements()->satisfies($student, AccessTier::PREMIUM));

        // La classe est archivée : la couverture tombe.
        $classroom->update(['status' => Classroom::STATUS_ARCHIVED]);
        $this->assertFalse($this->entitlements()->satisfies($student, AccessTier::PREMIUM));
        $classroom->update(['status' => Classroom::STATUS_ACTIVE]);
        $this->assertTrue($this->entitlements()->satisfies($student, AccessTier::PREMIUM));

        // L'élève quitte : la couverture tombe.
        $this->withToken($this->tokenOf($student))->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")->assertOk()
            ->assertJsonPath('access.teacherCoverageActive', false)->assertJsonPath('access.premiumAccess', false);
    }

    public function test_l_offre_gratuite_ne_couvre_personne_et_l_offre_seule_sans_abonnement_non_plus(): void
    {
        $this->defaultTeacherPlan([K::STUDENTS_COVERED => true]); // même réglée ainsi, sans abonnement : rien
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();

        $this->assertFalse($this->entitlements()->satisfies($student, AccessTier::PREMIUM));
    }

    public function test_la_couverture_n_ouvre_jamais_du_contenu_non_publie(): void
    {
        ['student' => $student, 'lesson' => $lesson] = $this->coveredStudent();
        $lesson->update(['publication_status' => Lesson::PUB_DRAFT]);

        $this->expectException(DomainException::class);
        ContentAccess::assertLessonAvailable($lesson->code, $student);
    }
}
