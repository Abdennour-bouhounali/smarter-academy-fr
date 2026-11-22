<?php

namespace Tests\Feature;

use App\Domain\Access\AccessDecision;
use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Classroom\TeacherCapacityService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\School\SchoolCapacityService;
use App\Models\Classroom;
use App\Models\SchoolLicence;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * Phase 7 de « فضاء الإدارة » : la LICENCE d'établissement (SCHOOL_ADMIN_SPACE.md, D1).
 *
 *   - une licence qui court couvre chaque élève membre actif d'une classe active
 *     de l'établissement (motif `school_licence`), dynamiquement ;
 *   - ses élèves occupent les sièges de l'établissement, plus ceux de l'enseignant ;
 *   - suspendue, finie ou annulée, elle ne couvre plus rien et les sièges de
 *     l'enseignant reprennent.
 */
class SchoolLicenceTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    private function decide(User $student): AccessDecision
    {
        $access = $this->app->make(EntitlementService::class);
        $access->forget();

        return $access->decide($student, AccessTier::PREMIUM);
    }

    public function test_the_admin_grants_a_licence_and_its_students_get_full_access(): void
    {
        $this->freeSeatsPlan(5);
        $this->grade4am(1);
        $adminToken = $this->tokenOf($this->admin());
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school));
        $student = $this->student();
        $this->enrol($classroom, [$student]);
        $outsider = $this->student();

        $this->assertFalse($this->decide($student)->allowed);

        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 40, 'endsAt' => now()->addYear()->toDateString(), 'note' => 'دفع نقدي'])
            ->assertCreated()
            ->assertJsonPath('licence.seats', 40)
            ->assertJsonPath('licence.current', 1)
            ->assertJsonPath('licence.running', true);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'school.licence_granted']);

        $decision = $this->decide($student);
        $this->assertTrue($decision->allowed);
        $this->assertSame(AccessDecision::VIA_SCHOOL_LICENCE, $decision->reason);
        $this->assertFalse($this->decide($outsider)->allowed);

        $this->withToken($directorToken)->getJson('/api/v1/school/overview')
            ->assertOk()->assertJsonPath('licence.seats', 40)->assertJsonPath('licence.current', 1);

        // Suspendue : plus de couverture, à la requête suivante.
        $this->withToken($adminToken)->patchJson("/api/v1/admin/schools/{$school->id}/licence/status", ['status' => 'suspended'])
            ->assertOk()->assertJsonPath('licence.running', false);
        $this->assertFalse($this->decide($student)->allowed);
        $this->withToken($directorToken)->getJson('/api/v1/school/overview')->assertJsonPath('licence', null);

        // Reprise, puis une licence FINIE ne couvre plus.
        $this->withToken($adminToken)->patchJson("/api/v1/admin/schools/{$school->id}/licence/status", ['status' => 'active'])->assertOk();
        $this->assertTrue($this->decide($student)->allowed);
        SchoolLicence::where('school_id', $school->id)->update(['ends_at' => now()->subMinute()]);
        $this->assertFalse($this->decide($student)->allowed);
    }

    public function test_covered_students_use_the_schools_seats_not_the_teachers(): void
    {
        $this->freeSeatsPlan(5);
        $this->grade4am(1);
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $teacher = $this->teacherInSchool($school);
        $schoolClass = $this->schoolClassroom($school, $teacher);
        $licence = new SchoolLicence(['student_seats' => 12, 'starts_at' => now()->subDay()]);
        $licence->school_id = $school->id;
        $licence->save();

        // 10 élèves importés dans la classe couverte : bien plus que les 5 sièges gratuits du professeur.
        $rows = collect(range(1, 10))->map(fn ($i) => ['firstName' => 'تلميذ', 'lastName' => 'رقم'.str_repeat('ا', $i), 'birthDate' => sprintf('2012-02-%02d', $i)])->all();
        $this->withToken($directorToken)->postJson('/api/v1/school/roster/preview', ['classroomId' => $schoolClass->id, 'rows' => $rows])
            ->assertOk()->assertJsonPath('seatsFrom', 'school')->assertJsonPath('seatsRemaining', 12);
        $this->withToken($directorToken)->postJson('/api/v1/school/roster', ['classroomId' => $schoolClass->id, 'rows' => $rows])
            ->assertCreated()->assertJsonCount(10, 'cards');

        // Le professeur garde ses 5 sièges pour SES classes hors établissement.
        $capacity = $this->app->make(TeacherCapacityService::class);
        $this->app->make(PlanEntitlementResolver::class)->forget();
        $this->assertSame(0, $capacity->currentStudentCount($teacher));
        $own = Classroom::factory()->ownedBy($teacher)->create();
        $this->enrol($own, [$this->student()]);

        // Sièges de l'établissement épuisés : 3 lignes pour les 2 sièges restants.
        $more = collect(range(11, 13))->map(fn ($i) => ['firstName' => 'تلميذ', 'lastName' => 'آخر'.str_repeat('ا', $i - 10), 'birthDate' => sprintf('2012-03-%02d', $i)])->all();
        $this->withToken($directorToken)->postJson('/api/v1/school/roster', ['classroomId' => $schoolClass->id, 'rows' => $more])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');

        // Licence annulée : la classe revient sur les sièges du professeur (11 > 5 — rien n'est retiré).
        $licence->forceFill(['status' => SchoolLicence::STATUS_CANCELLED])->save();
        $this->app->make(PlanEntitlementResolver::class)->forget();
        $this->assertSame(11, $capacity->currentStudentCount($teacher));
    }

    public function test_licence_refusals(): void
    {
        $this->freeSeatsPlan(5);
        $this->grade4am(1);
        $adminToken = $this->tokenOf($this->admin());
        ['school' => $school] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school));
        $this->enrol($classroom, [$this->student(), $this->student()]);

        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 1])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_below_usage');
        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 5, 'endsAt' => now()->subDays(3)->toDateString()])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid_licence');
        $this->withToken($adminToken)->patchJson("/api/v1/admin/schools/{$school->id}/licence/status", ['status' => 'suspended'])
            ->assertStatus(422)->assertJsonPath('reason', 'no_licence');

        // Renouveler annule la précédente : une seule licence active.
        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 5])->assertCreated();
        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 8])->assertCreated()->assertJsonPath('licence.seats', 8);
        $this->assertSame(1, SchoolLicence::where('school_id', $school->id)->where('status', 'active')->count());

        // Le directeur n'accorde pas de licence.
        ['token' => $directorToken] = $this->schoolWithDirector('متوسطة أخرى');
        $this->withToken($directorToken)->postJson("/api/v1/admin/schools/{$school->id}/licence", ['studentSeats' => 50])->assertForbidden();
    }

    public function test_a_teacher_joining_by_the_link_brings_every_student_even_past_the_seats(): void
    {
        ['school' => $school] = $this->schoolWithDirector();
        $licence = new SchoolLicence(['student_seats' => 1, 'starts_at' => now()->subDay()]);
        $licence->school_id = $school->id;
        $licence->save();
        $teacher = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $this->enrol($classroom, [$this->student(), $this->student(), $this->student()]);

        // Comme le rattachement à la main : on dépasse, on ne refuse ni ne retire personne.
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/teacher/school/join', ['token' => $school->teacher_join_token, 'consent' => true])
            ->assertOk();
        $this->assertSame($school->id, $classroom->fresh()->school_id);
        $this->assertSame(3, $this->app->make(SchoolCapacityService::class)->currentStudentCount($school));
    }
}
