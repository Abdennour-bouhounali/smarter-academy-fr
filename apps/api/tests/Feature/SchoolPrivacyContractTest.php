<?php

namespace Tests\Feature;

use App\Domain\School\SchoolAccess;
use App\Domain\School\SchoolReportService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\School;
use App\Models\SchoolStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * LE contrat de confidentialité de « فضاء الإدارة » (SCHOOL_ADMIN_SPACE.md §4).
 *
 *   1. Aucune réponse /school ne porte le courriel d'un élève — ni clé
 *      `email`, ni sa valeur, à aucune profondeur.
 *   2. Toute route /school répond 403 à un administrateur, un enseignant, un
 *      élève, un parent, et au directeur retiré ou d'un établissement suspendu.
 *   3. L'établissement ne lit (ni ne compte) que les élèves qui y ont consenti,
 *      membres actifs d'une classe active de CET établissement.
 *
 * Toute nouvelle route /school s'ajoute à `schoolReads()`.
 */
class SchoolPrivacyContractTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    /** @return array{school: School, director: User, token: string, readable: User, notConsented: User, elsewhere: User} */
    private function scene(): array
    {
        $this->defaultTeacherPlan();
        $school = School::create(['name' => 'متوسطة النور']);
        $director = User::factory()->create(['role' => User::ROLE_SCHOOL_ADMIN]);
        $staff = new SchoolStaff(['appointed_at' => now()]);
        $staff->school_id = $school->id;
        $staff->user_id = $director->id;
        $staff->save();

        $classroom = Classroom::factory()->create();
        $classroom->school_id = $school->id;
        $classroom->save();
        $otherSchoolClass = Classroom::factory()->create();
        $otherSchoolClass->school_id = School::create(['name' => 'متوسطة أخرى'])->id;
        $otherSchoolClass->save();

        $readable = $this->student(['email' => 'lisible.secret@example.dz']);
        $notConsented = $this->student(['email' => 'prof.seulement@example.dz']);
        $elsewhere = $this->student(['email' => 'ailleurs.secret@example.dz']);
        $this->enrol($classroom, [$readable, $notConsented]);
        $this->enrol($otherSchoolClass, [$elsewhere]);
        ClassroomMembership::whereIn('student_id', [$readable->id, $elsewhere->id])
            ->update(['school_consent_at' => now(), 'school_consent_by' => 'student']);

        // Un rapport de classe FIGÉ : il porte des noms d'élèves, jamais une adresse.
        $report = app(SchoolReportService::class)->generate($director, $school, 'class', (string) $classroom->id, null)->id;

        return [
            'school' => $school,
            'director' => $director,
            'token' => $this->tokenOf($director),
            'readable' => $readable,
            'notConsented' => $notConsented,
            'elsewhere' => $elsewhere,
            'report' => $report,
        ];
    }

    /** @return array<string, string> toutes les lectures /school */
    private function schoolReads(array $s): array
    {
        return [
            'overview' => '/api/v1/school/overview',
            'terms' => '/api/v1/school/terms',
            'teachers' => '/api/v1/school/teachers',
            'classrooms' => '/api/v1/school/classrooms',
            'students' => '/api/v1/school/students',
            'learningMap' => '/api/v1/school/learning-map',
            'studentFile' => "/api/v1/school/students/{$s['readable']->id}/progress",
            'reports' => '/api/v1/school/reports',
            'classReport' => "/api/v1/school/reports/{$s['report']}",
        ];
    }

    private function assertNoEmail(TestResponse $response, string $label): void
    {
        $json = $response->json();
        $walk = function ($node, string $path) use (&$walk, $label) {
            if (! is_array($node)) {
                return;
            }
            foreach ($node as $key => $value) {
                $this->assertNotSame('email', $key, "{$label}: clé email à {$path}");
                $walk($value, "{$path}.{$key}");
            }
        };
        $walk($json, '$');
        $this->assertDoesNotMatchRegularExpression('/[\w.+-]+@example\.dz/', $response->getContent(), "{$label}: une adresse d'élève a fuité");
    }

    public function test_no_school_read_carries_a_student_email(): void
    {
        $s = $this->scene();
        foreach ($this->schoolReads($s) as $label => $url) {
            $this->assertNoEmail($this->withToken($s['token'])->getJson($url)->assertOk(), $label);
        }
    }

    public function test_every_school_route_is_closed_to_other_roles(): void
    {
        $s = $this->scene();
        $parent = User::factory()->create(['role' => User::ROLE_PARENT]);
        foreach ([$this->admin(), $this->teacher(), $s['readable'], $parent] as $user) {
            $token = $this->tokenOf($user);
            foreach ($this->schoolReads($s) as $label => $url) {
                $this->withToken($token)->getJson($url)->assertForbidden();
            }
        }
        foreach ($this->schoolReads($s) as $url) {
            $this->app['auth']->forgetGuards();
            $this->withoutToken()->getJson($url)->assertUnauthorized();
        }
    }

    public function test_a_revoked_director_or_a_suspended_school_reads_nothing(): void
    {
        $s = $this->scene();
        $s['school']->update(['status' => School::STATUS_SUSPENDED]);
        foreach ($this->schoolReads($s) as $url) {
            $this->withToken($s['token'])->getJson($url)->assertForbidden()->assertJsonPath('reason', 'no_school');
        }

        $s['school']->update(['status' => School::STATUS_ACTIVE]);
        SchoolStaff::where('user_id', $s['director']->id)->update(['status' => SchoolStaff::STATUS_REVOKED]);
        foreach ($this->schoolReads($s) as $url) {
            $this->withToken($s['token'])->getJson($url)->assertForbidden()->assertJsonPath('reason', 'no_school');
        }
    }

    public function test_only_consented_members_of_this_school_are_counted_and_readable(): void
    {
        $s = $this->scene();
        $this->withToken($s['token'])->getJson('/api/v1/school/overview')
            ->assertOk()
            ->assertJsonPath('counts.classes', 1)
            ->assertJsonPath('counts.students', 1);

        $this->assertSame($s['readable']->id, SchoolAccess::activeStudent($s['school'], $s['readable']->id)->id);
        foreach (['notConsented', 'elsewhere'] as $who) {
            try {
                SchoolAccess::activeStudent($s['school'], $s[$who]->id);
                $this->fail("{$who} ne devrait pas être lisible par l'établissement.");
            } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
                $this->assertSame(404, $e->getStatusCode());
            }
        }

        // La liste des élèves : le seul qui a consenti, sans courriel ni identifiant de connexion personnel.
        $this->withToken($s['token'])->getJson('/api/v1/school/students')
            ->assertOk()
            ->assertJsonCount(1, 'students')
            ->assertJsonPath('students.0.id', $s['readable']->id)
            ->assertJsonPath('students.0.login', null);

        // Quitter la classe, ou l'archiver, retire l'élève de l'établissement.
        ClassroomMembership::where('student_id', $s['readable']->id)->update(['status' => ClassroomMembership::STATUS_LEFT]);
        $this->withToken($s['token'])->getJson('/api/v1/school/overview')->assertJsonPath('counts.students', 0);
    }
}
