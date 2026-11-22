<?php

namespace Tests\Feature;

use App\Domain\Classroom\TeacherCapacityService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * LA CAPACITÉ EN SIÈGES — l'unité de vente est l'élève distinct, jamais la
 * classe. Classes illimitées ; un élève dans deux classes (adhésions
 * antérieures à la règle « une classe par élève ») = un siège ; les
 * liens de classe passent par la même porte ; rien n'est supprimé en
 * dépassement.
 */
class TeacherCapacityTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function join(User $student, Classroom $classroom)
    {
        return $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code]);
    }

    public function test_le_gratuit_donne_des_sieges_et_des_classes_illimitees(): void
    {
        $this->freeSeatsPlan(5);
        $this->grade4am(0);
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        for ($i = 1; $i <= 10; $i++) {
            $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => "Classe {$i}", 'grade' => '4am'])->assertCreated();
        }
        $this->assertSame(10, Classroom::ownedBy($teacher)->count());

        $this->withToken($token)->getJson('/api/v1/teacher/capacity')->assertOk()
            ->assertJsonPath('capacity.limit', 5)->assertJsonPath('capacity.current', 0)->assertJsonPath('capacity.remaining', 5)->assertJsonPath('capacity.canAdd', true);
        $this->withToken($token)->getJson('/api/v1/teacher/entitlements')->assertOk()
            ->assertJsonPath('entitlements.classes.maximum', null)->assertJsonPath('entitlements.classes.canCreate', true)
            ->assertJsonPath('entitlements.students.maximum', 5);
    }

    public function test_les_sieges_se_comptent_par_eleve_distinct(): void
    {
        $this->freeSeatsPlan(3);
        $teacher = $this->teacher();
        $a = Classroom::factory()->ownedBy($teacher)->create();
        $b = Classroom::factory()->ownedBy($teacher)->create();
        $c = Classroom::factory()->ownedBy($teacher)->create();

        [$s1, $s2, $s3] = [$this->student(), $this->student(), $this->student()];
        $this->join($s1, $a)->assertCreated();
        $this->join($s2, $a)->assertCreated();
        // Même élève, deuxième classe : une adhésion d'AVANT la règle « une
        // classe par élève » (2026-10-24) — elle ne compte qu'un siège.
        ClassroomMembership::factory()->in($b)->of($s2)->create();
        $this->join($s3, $c)->assertCreated();

        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/capacity')->assertOk()
            ->assertJsonPath('capacity.current', 3)->assertJsonPath('capacity.remaining', 0)->assertJsonPath('capacity.canAdd', false);

        // À capacité pleine : un nouveau est refusé.
        $this->join($this->student(), $c)->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
        $this->assertSame(3, app(TeacherCapacityService::class)->currentStudentCount($teacher->fresh()));
    }

    public function test_ajouter_jusqu_a_la_capacite_puis_refus_par_code_et_par_lien(): void
    {
        $this->freeSeatsPlan(5);
        $teacher = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $teacherToken = $this->tokenOf($teacher);

        for ($i = 0; $i < 4; $i++) {
            $this->join($this->student(), $classroom)->assertCreated();
        }
        // 4 + 1 = 5 : passe. 5 + 1 = 6 : refusé.
        $this->join($this->student(), $classroom)->assertCreated();
        $this->join($this->student(), $classroom)->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');

        // Le LIEN de classe passe par la même capacité que le code.
        $viaLink = $this->student();
        $this->withToken($this->tokenOf($viaLink))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'link' => $classroom->join_link_token])->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');

        // Un siège libéré rouvre la porte — pour le lien aussi.
        $gone = $classroom->activeMemberships()->first();
        $this->withToken($teacherToken)->deleteJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$gone->student_id}")->assertOk();
        $this->withToken($this->tokenOf($viaLink))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'link' => $classroom->join_link_token])->assertCreated();
    }

    public function test_une_expiration_met_en_depassement_sans_rien_supprimer(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $admin = $this->admin();
        $teacher = $this->teacher();
        $a = Classroom::factory()->ownedBy($teacher)->create();
        $b = Classroom::factory()->ownedBy($teacher)->create();

        $sub = $this->withToken($this->tokenOf($admin))->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 30])->assertCreated()->json('subscription');
        $students = [];
        for ($i = 0; $i < 8; $i++) {
            $students[] = $s = $this->student();
            $this->join($s, $i % 2 ? $a : $b)->assertCreated();
        }

        $this->withToken($this->tokenOf($admin))->postJson("/api/v1/admin/subscriptions/{$sub['id']}/cancel", ['reason' => 'Fin de période'])->assertOk();
        $this->forgetAll();

        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/capacity')->assertOk()
            ->assertJsonPath('capacity.limit', 5)->assertJsonPath('capacity.current', 8)->assertJsonPath('capacity.remaining', 0)->assertJsonPath('capacity.overLimit', true);

        // Rien n'a bougé : classes, adhésions. Un nouvel élève est refusé ; un élève déjà assis garde sa classe.
        $this->assertSame(2, Classroom::ownedBy($teacher)->count());
        $this->assertSame(8, ClassroomMembership::active()->count());
        $this->join($this->student(), $a)->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
        $this->join($students[0], $students[0]->classroomMemberships()->first()->classroom_id === $a->id ? $b : $a)
            ->assertStatus(422)->assertJsonPath('reason', 'already_in_class');
        // Et une nouvelle classe reste possible : les classes ne sont pas l'unité de vente.
        $this->grade4am(0);
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/teacher/classrooms', ['name' => 'C', 'grade' => '4am'])->assertCreated();
        $this->assertSame('cancelled', Subscription::find($sub['id'])->status);
    }

    public function test_un_enseignant_ne_peut_pas_se_donner_des_sieges(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 50])->assertCreated();
        $this->withToken($token)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 50])->assertStatus(403);
        $this->withToken($token)->postJson("/api/v1/admin/teachers/{$teacher->id}/entitlements/overrides", ['key' => 'students_total.max', 'value' => 50])->assertStatus(403);
        $this->forgetAll();
        $this->withToken($token)->getJson('/api/v1/teacher/capacity')->assertOk()->assertJsonPath('capacity.limit', 5);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_une_limite_technique_de_classes_reste_possible_si_configuree(): void
    {
        $this->freeSeatsPlan(5, ['classrooms.max' => 2]);
        $this->grade4am(0);
        $token = $this->tokenOf($this->teacher());

        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'A', 'grade' => '4am'])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'B', 'grade' => '4am'])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'C', 'grade' => '4am'])->assertStatus(422)->assertJsonPath('reason', 'limit_reached');
    }

    public function test_la_fiche_administrateur_montre_la_capacite(): void
    {
        $this->freeSeatsPlan(5);
        $teacher = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $this->join($this->student(), $classroom)->assertCreated();
        $this->join($this->student(), $classroom)->assertCreated();

        $this->withToken($this->tokenOf($this->admin()))->getJson("/api/v1/admin/teachers/{$teacher->id}")->assertOk()
            ->assertJsonPath('capacity.limit', 5)->assertJsonPath('capacity.current', 2)->assertJsonPath('capacity.remaining', 3);
        $this->withToken($this->tokenOf($this->admin()))->getJson("/api/v1/admin/teachers/{$teacher->id}/subscription")->assertOk()
            ->assertJsonPath('capacity.current', 2);
    }

    public function test_changer_de_classe_chez_le_meme_enseignant_libere_puis_reprend_le_siege(): void
    {
        $this->freeSeatsPlan(1);
        $teacher = $this->teacher();
        $a = Classroom::factory()->ownedBy($teacher)->create();
        $b = Classroom::factory()->ownedBy($teacher)->create();
        $student = $this->student();
        $this->join($student, $a)->assertCreated();

        // Une classe à la fois : il quitte A, son siège se libère, il rejoint B.
        $link = fn () => $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'link' => $b->join_link_token]);
        $link()->assertStatus(422)->assertJsonPath('reason', 'already_in_class');
        $this->withToken($this->tokenOf($student))->postJson("/api/v1/student/classrooms/{$a->id}/leave")->assertOk();
        $link()->assertCreated();
    }
}
