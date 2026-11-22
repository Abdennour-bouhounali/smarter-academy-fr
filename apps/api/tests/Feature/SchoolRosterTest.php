<?php

namespace Tests\Feature;

use App\Domain\School\SchoolAccess;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * L'import d'une liste de classe par la direction (SCHOOL_ADMIN_SPACE.md §7,
 * décisions D2 et « معرّف الدخول ») : aperçu sans écriture, création tout ou
 * rien, identifiants générés sans courriel, changement de classe, cartes.
 */
class SchoolRosterTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    private const ROWS = [
        ['firstName' => 'أمين', 'lastName' => 'بوعلام', 'birthDate' => '2012-03-14'],
        ['firstName' => 'ليلى', 'lastName' => 'حداد', 'birthDate' => '2012-11-02'],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->freeSeatsPlan(30);
        $this->grade4am(1);
    }

    /** @return array{school: \App\Models\School, token: string, classroom: \App\Models\Classroom} */
    private function scene(): array
    {
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '4م2']);

        return compact('school', 'token', 'classroom');
    }

    public function test_preview_says_what_would_happen_and_creates_nothing(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->scene();
        $users = User::count();

        $rows = [
            ...self::ROWS,
            ['firstName' => 'Karim', 'lastName' => 'بن علي', 'birthDate' => '2012-01-01'],
            ['firstName' => 'أمين', 'lastName' => 'بوعلام', 'birthDate' => '2012-03-14'],
            ['firstName' => 'سارة', 'lastName' => 'قاسم', 'birthDate' => '2012-02-30'],
        ];
        $this->withToken($token)->postJson('/api/v1/school/roster/preview', ['classroomId' => $classroom->id, 'rows' => $rows])
            ->assertOk()
            ->assertJsonPath('rows.0.status', 'new')
            ->assertJsonPath('rows.2.status', 'invalid')
            ->assertJsonPath('rows.2.problem', 'firstName_not_arabic')
            ->assertJsonPath('rows.3.status', 'duplicate_in_file')
            ->assertJsonPath('rows.4.problem', 'birthDate_invalid')
            ->assertJsonPath('counts.new', 2)
            ->assertJsonPath('seatsRemaining', 30);

        $this->assertSame($users, User::count());
    }

    public function test_commit_creates_school_logins_enrolled_and_readable_by_the_school(): void
    {
        ['school' => $school, 'token' => $token, 'classroom' => $classroom] = $this->scene();

        $response = $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertCreated()
            ->assertJsonCount(2, 'cards')
            ->assertJsonPath('classroomName', '4م2');
        $this->assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));

        $card = $response->json('cards.0');
        $this->assertMatchesRegularExpression('/^s'.$school->id.'\.[a-z2-9]{6}@eleve\.smarter-academy\.com$/', $card['login']);
        $student = User::findOrFail($card['id']);
        $this->assertTrue($student->hasSchoolLogin());
        $this->assertNotNull($student->email_verified_at);
        $this->assertSame('2012-03-14', $student->birth_date->format('Y-m-d'));
        $this->assertSame('4am', $student->grade);

        $membership = ClassroomMembership::where('student_id', $student->id)->firstOrFail();
        $this->assertSame('school_enrolment', $membership->joined_via);
        $this->assertSame('school', $membership->school_consent_by);
        $this->assertNull($membership->consented_at, 'le partage avec l\'enseignant reste à confirmer par l\'élève');
        $this->assertSame($student->id, SchoolAccess::activeStudent($school, $student->id)->id);

        // Le journal ne porte ni mot de passe ni date de naissance.
        $log = json_encode(\App\Models\AdminActivityLog::where('action', 'school.roster_imported')->firstOrFail()->toArray());
        $this->assertStringNotContainsString($card['password'], $log);
        $this->assertStringNotContainsString('2012-03-14', $log);

        // Rejouer le même import ne double personne.
        $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertCreated()->assertJsonCount(0, 'cards');

        // Aucun courriel vers un identifiant d'établissement : le canal mail saute
        // un destinataire sans route (User::routeNotificationForMail).
        $this->assertNull($student->routeNotificationForMail());
        $this->assertSame($personal = $this->student()->email, User::where('email', $personal)->first()->routeNotificationForMail());

        // EN DERNIER — l'élève entre avec son identifiant et sa carte. Les
        // requêtes précédentes ont laissé Sanctum comme garde par défaut ; la
        // connexion passe, elle, par la garde de session.
        $this->app['auth']->forgetGuards();
        $this->app['auth']->setDefaultDriver('web');
        $this->withoutToken()->postJson('/api/v1/auth/login', ['email' => $card['login'], 'password' => $card['password']])->assertOk();
    }

    public function test_an_invalid_row_or_missing_seats_creates_nothing(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->scene();
        $users = User::count();

        $this->withToken($token)->postJson('/api/v1/school/roster', [
            'classroomId' => $classroom->id,
            'rows' => [...self::ROWS, ['firstName' => 'Karim', 'lastName' => 'x', 'birthDate' => '2012-01-01']],
        ])->assertStatus(422)->assertJsonPath('reason', 'invalid_roster');
        $this->assertSame($users, User::count());

        // 31 lignes pour 30 sièges : tout est annulé.
        $rows = collect(range(1, 31))->map(fn ($i) => ['firstName' => 'تلميذ', 'lastName' => 'رقم'.str_repeat('ا', $i % 5 + 1), 'birthDate' => sprintf('2012-01-%02d', $i)])->all();
        $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => $rows])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');
        $this->assertSame($users, User::count());
    }

    public function test_the_director_transfers_a_student_and_reissues_cards_for_school_logins_only(): void
    {
        ['school' => $school, 'token' => $token, 'classroom' => $classroom] = $this->scene();
        $other = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '4م3']);
        $id = $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => [self::ROWS[0]]])
            ->assertCreated()->json('cards.0.id');

        $this->withToken($token)->patchJson("/api/v1/school/students/{$id}/classroom", ['classroomId' => $other->id])
            ->assertOk()->assertJsonPath('students.0.classroom.name', '4م3');
        $this->assertSame(1, ClassroomMembership::where('student_id', $id)->active()->count());

        $this->withToken($token)->postJson('/api/v1/school/students/credentials', ['studentIds' => [$id]])
            ->assertOk()->assertJsonPath('cards.0.id', $id);

        // Un compte PERSONNEL : son mot de passe n'appartient qu'à l'élève.
        $personal = $this->student();
        $this->enrol($other, [$personal]);
        ClassroomMembership::where('student_id', $personal->id)->update(['school_consent_at' => now(), 'school_consent_by' => 'student']);
        $this->withToken($token)->postJson('/api/v1/school/students/credentials', ['studentIds' => [$personal->id]])
            ->assertStatus(422)->assertJsonPath('reason', 'not_school_login');

        // Un élève hors de l'établissement n'est ni déplacé ni lu.
        $stranger = $this->student();
        $this->withToken($token)->patchJson("/api/v1/school/students/{$stranger->id}/classroom", ['classroomId' => $other->id])
            ->assertStatus(422)->assertJsonPath('reason', 'student_not_in_school');
    }
}
