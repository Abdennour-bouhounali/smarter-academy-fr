<?php

namespace Tests\Feature;

use App\Models\ClassroomMembership;
use App\Models\StudentLearningPointProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * Phase 4 de « فضاء الإدارة » : la carte des الكفاءات d'un niveau, classe par
 * classe, et le dossier d'un élève (SCHOOL_ADMIN_SPACE.md §7).
 *
 * La carte LIT l'état de Mastery V2 : ce test ne suppose aucun seuil du
 * moteur, il compare la carte aux lignes d'état réellement écrites.
 */
class SchoolProgressTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    public function test_the_learning_map_counts_only_consented_students_class_by_class_and_never_averages(): void
    {
        config(['mastery.engine_version' => 2]);
        $this->freeSeatsPlan(30);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);

        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $a = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '4م1']);
        $b = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '4م2']);

        [$s1, $s2, $s3, $silent] = [$this->student(), $this->student(), $this->student(), $this->student()];
        $this->enrol($a, [$s1, $s2, $silent]);
        $this->enrol($b, [$s3]);
        ClassroomMembership::whereIn('student_id', [$s1->id, $s2->id, $s3->id])->update(['school_consent_at' => now(), 'school_consent_by' => 'student']);

        $this->answers($s1, $lesson, $point, 'correct', 6);
        $this->answers($s2, $lesson, $point, 'incorrect', 4, 1);
        $this->answers($silent, $lesson, $point, 'incorrect', 4, 1);

        $map = $this->withToken($token)->getJson('/api/v1/school/learning-map')
            ->assertOk()
            ->assertJsonPath('grades', ['4am'])
            ->assertJsonPath('map.classes.0.name', '4م1')
            ->assertJsonPath('map.classes.0.students', 2)
            ->assertJsonPath('map.classes.1.students', 1)
            ->json('map');

        $cell = $map['lessons'][0]['learningPoints'][0]['byClass'][(string) $a->id];
        $expected = ['mastered' => 0, 'reinforce' => 0, 'gap' => 0];
        foreach ([$s1, $s2] as $s) {
            $status = StudentLearningPointProgress::where('user_id', $s->id)->where('learning_point_id', $point->id)->value('status');
            if (isset($expected[$status])) {
                $expected[$status]++;
            }
        }
        $this->assertSame($expected + ['unassessed' => 2 - array_sum($expected)], $cell, 'la carte reflète l\'état du moteur, sans l\'élève qui n\'a pas consenti');

        $this->assertSame(['mastered' => 0, 'reinforce' => 0, 'gap' => 0, 'unassessed' => 1], $map['lessons'][0]['learningPoints'][0]['byClass'][(string) $b->id]);
        $this->assertStringNotContainsStringIgnoringCase('average', json_encode($map));
        $this->assertStringNotContainsStringIgnoringCase('mean', json_encode($map));
    }

    public function test_the_student_file_is_the_parents_shape_and_404_outside_the_school(): void
    {
        $this->freeSeatsPlan(30);
        $this->grade4am(1);
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school));
        $readable = $this->student(['first_name' => 'أمين', 'last_name' => 'بوعلام']);
        $notConsented = $this->student();
        $this->enrol($classroom, [$readable, $notConsented]);
        ClassroomMembership::where('student_id', $readable->id)->update(['school_consent_at' => now(), 'school_consent_by' => 'school']);

        $this->withToken($token)->getJson("/api/v1/school/students/{$readable->id}/progress")
            ->assertOk()
            ->assertJsonPath('student.firstName', 'أمين')
            ->assertJsonPath('student.classroom.id', $classroom->id)
            ->assertJsonStructure(['progress' => ['summary', 'needsSupport', 'lessons', 'timeline']])
            ->assertJsonMissingPath('student.email');

        $this->withToken($token)->getJson("/api/v1/school/students/{$notConsented->id}/progress")->assertNotFound();
        $this->withToken($token)->getJson('/api/v1/school/students/999999/progress')->assertNotFound();
    }
}
