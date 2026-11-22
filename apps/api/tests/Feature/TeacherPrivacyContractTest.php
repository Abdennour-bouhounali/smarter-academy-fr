<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\NotebookNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * LE contrat de confidentialité de l'espace enseignant.
 *
 *   1. Aucune réponse /teacher ne porte le courriel d'un élève — ni clé
 *      `email`, ni sa valeur, à aucune profondeur.
 *   2. Un élève qui a quitté la classe, qui en a été retiré, ou dont la
 *      classe est archivée n'est plus lisible élève par élève (404).
 *   3. Aucun enseignant ne lit la classe d'un autre, ni un élève hors de sa
 *      classe, en changeant un identifiant.
 *
 * Toute nouvelle route /teacher qui renvoie des élèves s'ajoute à
 * `teacherReads()` : c'est ce test qui garde la règle produit « rejoindre un
 * قسم partage l'apprentissage, pas le courriel ».
 */
class TeacherPrivacyContractTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    /** @return array{classroom: Classroom, token: string, student: User, other: User, lesson: Lesson, point: LearningPoint, intervention: int} */
    private function scene(): array
    {
        config(['mastery.engine_version' => 2]);
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);
        $classroom = Classroom::factory()->create();
        $student = $this->student(['email' => 'eleve.secret@example.dz']);
        $other = $this->student(['email' => 'autre.secret@example.dz']);
        $this->enrol($classroom, [$student, $other]);
        $this->answers($student, $lesson, $point, 'incorrect', 4, 1);
        $this->answers($other, $lesson, $point, 'incorrect', 4, 1);
        NotebookNote::create(['user_id' => $student->id, 'lesson_id' => $lesson->id, 'learning_point_id' => $point->id, 'content' => 'mon erreur', 'note_type' => 'erreur']);

        $token = $this->tokenOf($classroom->teacher);
        $intervention = $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'recommend_practice', 'studentIds' => [$student->id, $other->id], 'learningPointCode' => $point->code,
        ])->assertCreated()->json('intervention.id');

        return compact('classroom', 'token', 'student', 'other', 'lesson', 'point', 'intervention');
    }

    /** @return array<string, string> toutes les lectures /teacher qui parlent d'élèves */
    private function teacherReads(array $s): array
    {
        $c = $s['classroom']->id;
        $sid = $s['student']->id;
        $code = $s['point']->code;

        return [
            'students' => "/api/v1/teacher/classrooms/{$c}/students",
            'dossier' => "/api/v1/teacher/classrooms/{$c}/students/{$sid}/progress",
            'notebook' => "/api/v1/teacher/classrooms/{$c}/students/{$sid}/notebook",
            'map' => "/api/v1/teacher/classrooms/{$c}/learning-points",
            'lessonMap' => "/api/v1/teacher/classrooms/{$c}/learning-points?lesson={$s['lesson']->code}",
            'point' => "/api/v1/teacher/classrooms/{$c}/learning-points/{$code}",
            'evidence' => "/api/v1/teacher/classrooms/{$c}/students/{$sid}/learning-points/{$code}/explanation",
            'attention' => "/api/v1/teacher/classrooms/{$c}/attention",
            'interventions' => "/api/v1/teacher/classrooms/{$c}/interventions",
            'intervention' => "/api/v1/teacher/classrooms/{$c}/interventions/{$s['intervention']}",
            'dashboard' => '/api/v1/teacher/dashboard',
            // « التحدّي اليومي » : résultats, affichage, réglages.
            'dailyChallengeResults' => "/api/v1/teacher/classrooms/{$c}/daily-challenge/results",
            'dailyChallengeDisplay' => "/api/v1/teacher/classrooms/{$c}/daily-challenge/display",
            'dailyChallengeSettings' => "/api/v1/teacher/classrooms/{$c}/daily-challenge/settings",
            // « تصحيح الإجابات » (photos de copie, 2026-10-06) : la file et son compteur.
            'reviews' => '/api/v1/teacher/reviews',
            'reviewsOfClass' => "/api/v1/teacher/reviews?classroom={$c}",
            'reviewsCount' => '/api/v1/teacher/reviews/count',
        ];
    }

    private function assertNoEmail(TestResponse $response, array $emails, string $label): void
    {
        $json = $response->json();
        $walk = function ($node, string $path) use (&$walk, $label) {
            if (is_array($node)) {
                foreach ($node as $k => $v) {
                    $this->assertNotSame('email', $k, "{$label}: clé « email » à {$path}");
                    $walk($v, "{$path}.{$k}");
                }
            }
        };
        $walk($json, '$');
        foreach ($emails as $email) {
            $this->assertStringNotContainsString($email, $response->getContent(), "{$label}: courriel d'un élève dans la réponse");
        }
    }

    public function test_no_teacher_response_carries_a_student_email(): void
    {
        $s = $this->scene();
        foreach ($this->teacherReads($s) as $label => $url) {
            $response = $this->withToken($s['token'])->getJson($url)->assertOk();
            $this->assertNoEmail($response, [$s['student']->email, $s['other']->email], $label);
        }
    }

    public function test_a_student_who_left_or_was_removed_is_no_longer_readable_one_by_one(): void
    {
        $s = $this->scene();
        $c = $s['classroom']->id;
        $perStudent = fn (int $sid) => [
            "/api/v1/teacher/classrooms/{$c}/students/{$sid}/progress",
            "/api/v1/teacher/classrooms/{$c}/students/{$sid}/notebook",
            "/api/v1/teacher/classrooms/{$c}/students/{$sid}/learning-points/{$s['point']->code}/explanation",
        ];

        // L'élève s'en va de lui-même.
        $this->withToken($this->tokenOf($s['student']))->postJson("/api/v1/student/classrooms/{$c}/leave")->assertOk();
        foreach ($perStudent($s['student']->id) as $url) {
            $this->withToken($s['token'])->getJson($url)->assertNotFound();
        }
        $note = NotebookNote::where('user_id', $s['student']->id)->first();
        $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$s['student']->id}/notebook/{$note->id}")->assertNotFound();

        // L'enseignant retire l'autre.
        $this->withToken($s['token'])->deleteJson("/api/v1/teacher/classrooms/{$c}/students/{$s['other']->id}")->assertOk();
        foreach ($perStudent($s['other']->id) as $url) {
            $this->withToken($s['token'])->getJson($url)->assertNotFound();
        }

        // Ils sortent aussi de la mesure de l'intervention.
        $this->assertSame([], $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/interventions/{$s['intervention']}")->json('intervention.outcome.students'));

        // Leur histoire n'est pas effacée.
        $this->assertSame(2, ClassroomMembership::where('classroom_id', $c)->count());
    }

    public function test_an_archived_class_no_longer_opens_its_students_one_by_one(): void
    {
        $s = $this->scene();
        $c = $s['classroom']->id;
        $this->withToken($s['token'])->postJson("/api/v1/teacher/classrooms/{$c}/archive")->assertOk();

        $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$s['student']->id}/progress")->assertNotFound();
        $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$s['student']->id}/notebook")->assertNotFound();
    }

    public function test_another_teacher_reaches_nothing_by_changing_ids(): void
    {
        $s = $this->scene();
        $intruder = $this->teacher();
        $own = Classroom::factory()->create(['teacher_id' => $intruder->id]);
        $token = $this->tokenOf($intruder);

        foreach ($this->teacherReads($s) as $label => $url) {
            // Lectures globales de l'enseignant (pas d'identifiant de classe) :
            // l'intrus n'y trouve que ses propres élèves — ici, personne.
            if (in_array($label, ['dashboard', 'reviews', 'reviewsCount'], true)) {
                continue;
            }
            $this->withToken($token)->getJson($url)->assertForbidden();
        }
        $this->withToken($token)->getJson('/api/v1/teacher/reviews')->assertOk()->assertJsonPath('total', 0);
        $this->withToken($token)->getJson('/api/v1/teacher/reviews/count')->assertOk()->assertJsonPath('pending', 0);

        // Par SA propre classe, un élève qui n'y est pas reste introuvable.
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$own->id}/students/{$s['student']->id}/progress")->assertNotFound();
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$own->id}/students/{$s['student']->id}/learning-points/{$s['point']->code}/explanation")->assertNotFound();
        // L'intervention d'un autre, par sa propre classe : 404.
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$own->id}/interventions/{$s['intervention']}")->assertNotFound();
        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$own->id}/interventions/{$s['intervention']}", ['status' => 'closed'])->assertNotFound();
    }

    public function test_a_student_cannot_use_teacher_routes(): void
    {
        $s = $this->scene();
        $token = $this->tokenOf($s['student']);
        foreach ($this->teacherReads($s) as $url) {
            $this->withToken($token)->getJson($url)->assertForbidden();
        }
    }

    public function test_archived_notes_stay_private_to_the_student(): void
    {
        $s = $this->scene();
        $c = $s['classroom']->id;
        $sid = $s['student']->id;
        $note = NotebookNote::where('user_id', $sid)->first();
        $note->forceFill(['archived_at' => now()])->save();

        $r = $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$sid}/notebook")->assertOk();
        $this->assertSame([], $r->json('notes'));
        $this->assertSame(0, $r->json('counts.archived'));
        $this->assertSame([], $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$sid}/notebook?view=archived")->json('notes'));
        $this->withToken($s['token'])->getJson("/api/v1/teacher/classrooms/{$c}/students/{$sid}/notebook/{$note->id}")->assertNotFound();
    }

    public function test_the_join_link_preview_reveals_no_address_no_id_and_no_roster(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $member = $this->student(['email' => 'membre.secret@example.dz']);
        $this->withToken($this->tokenOf($member))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();

        $preview = $this->getJson("/api/v1/join-links/{$classroom->join_link_token}")->assertOk();
        $body = $preview->getContent();
        $this->assertStringNotContainsString('membre.secret@example.dz', $body);
        $this->assertStringNotContainsString((string) $classroom->teacher->email, $body);
        // `schoolName` (2026-10-26) : le NOM de l'établissement d'une classe
        // d'établissement, que le texte de partage doit nommer — ni id ni adresse.
        $this->assertSame(['classroomName', 'grade', 'teacherName', 'schoolName', 'joiningOpen', 'alreadyMember', 'currentClassroomName'], array_keys($preview->json('joinLink')));
    }
}
