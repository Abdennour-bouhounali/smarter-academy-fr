<?php

namespace Tests\Feature;

use App\Domain\School\SchoolAccess;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\SchoolTeacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * Phase 3 de « فضاء الإدارة » : trimestres, enseignants (lien, consentement,
 * faits D4), classes (créer, confier, rattacher) et le consentement des
 * élèves envers l'établissement (SCHOOL_ADMIN_SPACE.md §4, §7).
 */
class SchoolStructureTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    protected function setUp(): void
    {
        parent::setUp();
        $this->freeSeatsPlan(30);
        $this->grade4am(1);
    }

    public function test_terms_are_set_as_one_ordered_block(): void
    {
        ['token' => $token] = $this->schoolWithDirector();
        $terms = [
            ['term' => 1, 'startsOn' => '2026-09-21', 'endsOn' => '2026-12-17'],
            ['term' => 2, 'startsOn' => '2027-01-04', 'endsOn' => '2027-03-18'],
            ['term' => 3, 'startsOn' => '2027-04-04', 'endsOn' => '2027-06-10'],
        ];

        $this->withToken($token)->putJson('/api/v1/school/terms', ['academicYear' => '2026-2027', 'terms' => $terms])
            ->assertOk()->assertJsonPath('terms.1.startsOn', '2027-01-04');
        $this->withToken($token)->getJson('/api/v1/school/terms')
            ->assertOk()->assertJsonPath('academicYear', '2026-2027')->assertJsonCount(3, 'terms');

        $overlap = $terms;
        $overlap[1]['startsOn'] = '2026-12-01';
        $this->withToken($token)->putJson('/api/v1/school/terms', ['academicYear' => '2026-2027', 'terms' => $overlap])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid_terms');
    }

    public function test_a_teacher_joins_by_the_link_after_consenting_and_sees_what_the_school_sees(): void
    {
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $teacher = $this->teacher(['first_name' => 'سعاد', 'last_name' => 'مراد']);
        $teacherToken = $this->tokenOf($teacher);
        $link = $this->withToken($directorToken)->getJson('/api/v1/school/teachers')->assertOk()->json('joinLinkToken');

        $this->withToken($teacherToken)->getJson("/api/v1/teacher/school-links/{$link}")
            ->assertOk()->assertJsonPath('schoolLink.name', 'متوسطة النور')->assertJsonPath('schoolLink.alreadyMember', false);
        $this->withToken($teacherToken)->postJson('/api/v1/teacher/school/join', ['token' => $link, 'consent' => false])
            ->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->withToken($teacherToken)->postJson('/api/v1/teacher/school/join', ['token' => $link, 'consent' => true])->assertOk();

        // D4 : le directeur et l'enseignant lisent EXACTEMENT les mêmes faits.
        $this->schoolClassroom($school, $teacher);
        $seenBySchool = $this->withToken($directorToken)->getJson('/api/v1/school/teachers')
            ->assertOk()->assertJsonPath('teachers.0.firstName', 'سعاد')->json('teachers.0.facts');
        $seenByTeacher = $this->withToken($teacherToken)->getJson('/api/v1/teacher/school')->assertOk()->json('facts');
        $this->assertSame($seenBySchool, $seenByTeacher);
        $this->assertSame(1, $seenByTeacher['classes']);
        $this->assertArrayNotHasKey('score', $seenByTeacher);

        // Un seul établissement à la fois.
        ['school' => $other] = $this->schoolWithDirector('متوسطة أخرى');
        $this->withToken($teacherToken)->postJson('/api/v1/teacher/school/join', ['token' => $other->teacher_join_token, 'consent' => true])
            ->assertStatus(422)->assertJsonPath('reason', 'already_in_school');

        // Renouveler le lien tue l'ancien.
        $this->withToken($directorToken)->postJson('/api/v1/school/teachers/join-link/rotate')->assertOk();
        $this->withToken($teacherToken)->getJson("/api/v1/teacher/school-links/{$link}")
            ->assertStatus(422)->assertJsonPath('reason', 'invalid_link');
    }

    public function test_leaving_the_school_gives_the_classes_back_and_clears_the_school_consent(): void
    {
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $teacher = $this->teacherInSchool($school);
        $classroom = $this->schoolClassroom($school, $teacher);
        $student = $this->student();
        $this->enrol($classroom, [$student]);
        ClassroomMembership::where('student_id', $student->id)->update(['school_consent_at' => now(), 'school_consent_by' => 'student']);

        $this->withToken($directorToken)->deleteJson("/api/v1/school/teachers/{$teacher->id}")
            ->assertOk()->assertJsonCount(0, 'teachers');

        $this->assertNull($classroom->fresh()->school_id);
        $this->assertNull(ClassroomMembership::where('student_id', $student->id)->value('school_consent_at'));
        $this->assertDatabaseHas('school_teachers', ['teacher_id' => $teacher->id, 'status' => SchoolTeacher::STATUS_LEFT]);
        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->active()->count(), 'la classe et ses élèves restent au professeur');
    }

    public function test_the_director_creates_a_class_for_a_school_teacher_and_reassigns_it(): void
    {
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $a = $this->teacherInSchool($school);
        $b = $this->teacherInSchool($school);
        $outsider = $this->teacher();

        $this->withToken($token)->postJson('/api/v1/school/classrooms', ['name' => '4م1', 'grade' => '4am', 'teacherId' => $outsider->id])
            ->assertStatus(422)->assertJsonPath('reason', 'teacher_not_in_school');

        $id = $this->withToken($token)->postJson('/api/v1/school/classrooms', ['name' => '4م1', 'grade' => '4am', 'teacherId' => $a->id])
            ->assertCreated()->assertJsonPath('classrooms.0.name', '4م1')->json('classrooms.0.id');
        $classroom = Classroom::find($id);
        $this->assertSame($a->id, $classroom->teacher_id);
        $this->assertSame($school->id, $classroom->school_id);
        $this->assertSame('2026-2027', $classroom->academic_year);

        $this->withToken($token)->patchJson("/api/v1/school/classrooms/{$id}/teacher", ['teacherId' => $b->id])
            ->assertOk()->assertJsonPath('classrooms.0.teacher.id', $b->id);
        $this->withToken($token)->patchJson("/api/v1/school/classrooms/{$id}/teacher", ['teacherId' => $outsider->id])
            ->assertStatus(422)->assertJsonPath('reason', 'teacher_not_in_school');
    }

    public function test_reassigning_respects_the_new_teachers_seats(): void
    {
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $a = $this->teacherInSchool($school);
        $full = $this->teacherInSchool($school);
        $classroom = $this->schoolClassroom($school, $a);
        $this->enrol($classroom, [$this->student(), $this->student()]);
        // L'autre enseignant a déjà rempli ses 30 sièges.
        $this->enrol(Classroom::factory()->ownedBy($full)->create(), collect(range(1, 30))->map(fn () => $this->student())->all());

        $this->withToken($token)->patchJson("/api/v1/school/classrooms/{$classroom->id}/teacher", ['teacherId' => $full->id])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
        $this->assertSame($a->id, $classroom->fresh()->teacher_id);
    }

    public function test_attaching_a_class_brings_the_students_who_accepted_the_current_text_and_asks_the_others(): void
    {
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $teacher = $this->teacherInSchool($school);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $current = $this->student();
        $older = $this->student();
        $this->enrol($classroom, [$current, $older]);
        ClassroomMembership::where('student_id', $older->id)->update(['consent_version' => '2026-09-25']);

        $this->withToken($this->tokenOf($teacher))->putJson("/api/v1/teacher/classrooms/{$classroom->id}/school", ['attached' => true])
            ->assertOk()->assertJsonPath('schoolId', $school->id);
        $this->withToken($directorToken)->getJson('/api/v1/school/classrooms')
            ->assertOk()->assertJsonPath('classrooms.0.membersCount', 2)->assertJsonPath('classrooms.0.readableCount', 1);
        $this->assertSame($current->id, SchoolAccess::activeStudent($school, $current->id)->id);

        // L'ancien texte n'annonçait pas l'établissement : « قسمي » redemande le
        // texte, et l'accepter fait entrer l'élève.
        $olderToken = $this->tokenOf($older);
        $this->withToken($olderToken)->getJson('/api/v1/student/study-context')
            ->assertOk()
            ->assertJsonPath('studyContext.classrooms.0.schoolName', 'متوسطة النور')
            ->assertJsonPath('studyContext.classrooms.0.schoolConsentRequired', true);
        $this->withToken($olderToken)->postJson("/api/v1/student/classrooms/{$classroom->id}/consent")->assertOk();
        $this->assertSame('student', ClassroomMembership::where('student_id', $older->id)->value('school_consent_by'));

        // Un enseignant hors établissement ne rattache rien.
        $loner = $this->teacher();
        $own = Classroom::factory()->ownedBy($loner)->create();
        $this->withToken($this->tokenOf($loner))->putJson("/api/v1/teacher/classrooms/{$own->id}/school", ['attached' => true])
            ->assertStatus(422)->assertJsonPath('reason', 'not_in_school');
    }

    public function test_joining_by_the_link_attaches_every_active_class_and_its_consenting_students(): void
    {
        ['school' => $school, 'token' => $directorToken] = $this->schoolWithDirector();
        $teacher = $this->teacher();
        $a = Classroom::factory()->ownedBy($teacher)->create();
        $b = Classroom::factory()->ownedBy($teacher)->create();
        $archived = Classroom::factory()->ownedBy($teacher)->archived()->create();
        [$current, $older, $none] = [$this->student(), $this->student(), $this->student()];
        $this->enrol($a, [$current, $older]);
        $this->enrol($b, [$none]);
        ClassroomMembership::where('student_id', $older->id)->update(['consent_version' => '2026-09-25']);
        ClassroomMembership::where('student_id', $none->id)->update(['consented_at' => null, 'consent_version' => null]);

        $teacherToken = $this->tokenOf($teacher);
        $this->withToken($teacherToken)->postJson('/api/v1/teacher/school/join', ['token' => $school->teacher_join_token, 'consent' => true])
            ->assertOk();

        $this->assertSame($school->id, $a->fresh()->school_id);
        $this->assertSame($school->id, $b->fresh()->school_id);
        $this->assertNull($archived->fresh()->school_id);
        $this->assertSame('student', ClassroomMembership::where('student_id', $current->id)->value('school_consent_by'));
        $this->assertNull(ClassroomMembership::where('student_id', $older->id)->value('school_consent_at'));
        $this->assertNull(ClassroomMembership::where('student_id', $none->id)->value('school_consent_at'));
        $this->assertSame(1, SchoolAccess::consentedMemberships($school)->count());
        $this->withToken($directorToken)->getJson('/api/v1/school/classrooms')
            ->assertOk()->assertJsonCount(2, 'classrooms');

        // Partir rend tout : classes et consentements.
        $this->withToken($teacherToken)->postJson('/api/v1/teacher/school/leave')->assertOk();
        $this->assertNull($a->fresh()->school_id);
        $this->assertSame(0, SchoolAccess::consentedMemberships($school)->count());
    }

    public function test_joining_a_school_class_consents_to_the_school_unless_the_code_was_accepted_on_an_older_text(): void
    {
        ['school' => $school] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school));

        $this->getJson("/api/v1/join-links/{$classroom->join_link_token}")
            ->assertOk()->assertJsonPath('joinLink.schoolName', 'متوسطة النور');

        $byLink = $this->student();
        $this->withToken($this->tokenOf($byLink))->postJson('/api/v1/student/classrooms/join', ['link' => $classroom->join_link_token, 'consent' => true])
            ->assertSuccessful();
        $this->assertSame('student', ClassroomMembership::where('student_id', $byLink->id)->value('school_consent_by'));

        $byCode = $this->student();
        $this->withToken($this->tokenOf($byCode))->postJson('/api/v1/student/classrooms/join', ['code' => $classroom->join_code, 'consent' => true])
            ->assertSuccessful();
        // Le texte partagé (lien ET code) annonce l'établissement depuis le 2026-10-28.
        $this->assertSame('student', ClassroomMembership::where('student_id', $byCode->id)->value('school_consent_by'));

        // Un texte plus ancien par le code n'enregistre rien.
        config(['classroom.consent_version' => '2026-09-25']);
        $byOldCode = $this->student();
        $this->withToken($this->tokenOf($byOldCode))->postJson('/api/v1/student/classrooms/join', ['code' => $classroom->join_code, 'consent' => true])
            ->assertSuccessful();
        $this->assertNull(ClassroomMembership::where('student_id', $byOldCode->id)->value('school_consent_at'));
    }
}
