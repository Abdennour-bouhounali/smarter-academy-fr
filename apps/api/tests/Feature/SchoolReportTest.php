<?php

namespace Tests\Feature;

use App\Models\ClassroomMembership;
use App\Models\SchoolReportSnapshot;
use App\Models\SchoolTerm;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * Phase 5 de « فضاء الإدارة » : les rapports FIGÉS (SCHOOL_ADMIN_SPACE.md §7).
 */
class SchoolReportTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    /** @return array{school: \App\Models\School, token: string, classroom: \App\Models\Classroom, student: \App\Models\User, term: SchoolTerm} */
    private function scene(): array
    {
        config(['mastery.engine_version' => 2]);
        $this->freeSeatsPlan(30);
        ['lessons' => $lessons] = $this->grade4am(1);
        $point = $this->point($lessons[0], 1);
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '4م1']);
        $student = $this->student(['first_name' => 'أمين', 'last_name' => 'بوعلام']);
        $this->enrol($classroom, [$student]);
        ClassroomMembership::where('student_id', $student->id)->update(['school_consent_at' => now(), 'school_consent_by' => 'school']);
        $this->answers($student, $lessons[0], $point, 'incorrect', 4, 1);
        $term = new SchoolTerm(['academic_year' => '2026-2027', 'term' => 1, 'starts_on' => '2026-09-21', 'ends_on' => '2026-12-17']);
        $term->school_id = $school->id;
        $term->save();

        return compact('school', 'token', 'classroom', 'student', 'term');
    }

    public function test_each_report_type_is_generated_frozen_and_listed(): void
    {
        ['token' => $token, 'classroom' => $classroom, 'student' => $student, 'term' => $term] = $this->scene();

        $requests = [
            ['type' => 'class', 'scope' => (string) $classroom->id, 'termId' => $term->id],
            ['type' => 'grade', 'scope' => '4am'],
            ['type' => 'student', 'scope' => (string) $student->id],
            ['type' => 'school_term', 'termId' => $term->id],
            ['type' => 'teachers'],
        ];
        foreach ($requests as $body) {
            $this->withToken($token)->postJson('/api/v1/school/reports', $body)
                ->assertCreated()
                ->assertJsonPath('report.type', $body['type'])
                ->assertJsonPath('report.schemaVersion', 1)
                ->assertJsonPath('report.school.name', 'متوسطة النور');
        }

        $class = SchoolReportSnapshot::where('type', 'class')->firstOrFail();
        $this->assertSame('4م1', $class->title);
        $this->assertSame(1, $class->payload['students']);
        $this->assertSame($student->id, $class->payload['studentsToWatch'][0]['id']);
        $this->assertSame(1, $class->term->term);

        $this->withToken($token)->getJson('/api/v1/school/reports')
            ->assertOk()->assertJsonCount(5, 'reports')->assertJsonMissingPath('reports.0.payload');

        // Figé : un élève de plus ne change pas le rapport déjà généré.
        $late = $this->student();
        $this->enrol($classroom, [$late]);
        ClassroomMembership::where('student_id', $late->id)->update(['school_consent_at' => now(), 'school_consent_by' => 'school']);
        $this->withToken($token)->getJson("/api/v1/school/reports/{$class->id}")
            ->assertOk()->assertJsonPath('report.payload.students', 1);

        $this->assertStringNotContainsStringIgnoringCase('average', json_encode(SchoolReportSnapshot::pluck('payload')));
    }

    public function test_refusals_and_isolation_between_schools(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->scene();
        $outsider = $this->student();

        $this->withToken($token)->postJson('/api/v1/school/reports', ['type' => 'student', 'scope' => (string) $outsider->id])
            ->assertStatus(422)->assertJsonPath('reason', 'student_not_in_school');
        $this->withToken($token)->postJson('/api/v1/school/reports', ['type' => 'grade', 'scope' => '1am'])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid_report');
        $this->withToken($token)->postJson('/api/v1/school/reports', ['type' => 'nope'])->assertStatus(422);

        $id = $this->withToken($token)->postJson('/api/v1/school/reports', ['type' => 'class', 'scope' => (string) $classroom->id])
            ->assertCreated()->json('report.id');

        // Le directeur d'un autre établissement ne voit ni ne supprime ce rapport.
        ['token' => $other] = $this->schoolWithDirector('متوسطة أخرى');
        $this->withToken($other)->getJson("/api/v1/school/reports/{$id}")->assertNotFound();
        $this->withToken($other)->deleteJson("/api/v1/school/reports/{$id}")->assertNotFound();
        $this->withToken($other)->getJson('/api/v1/school/reports')->assertOk()->assertJsonCount(0, 'reports');

        $this->withToken($token)->deleteJson("/api/v1/school/reports/{$id}")->assertOk()->assertJsonCount(0, 'reports');
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'school_report.deleted']);
    }
}
