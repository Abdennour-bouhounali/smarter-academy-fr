<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Registration\ManagedAccountsGate;
use App\Models\AdminActivityLog;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\PlatformSetting;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\Support\SchoolFixtures;
use Tests\TestCase;

/**
 * Les comptes élèves créés par un établissement ou un enseignant (propriétaire, 2026-11-22) : fermés tant que les
 * pages légales ne les couvrent pas. La suite tourne l'interrupteur OUVERT (phpunit.xml) ; chaque test ici le FERME
 * lui-même, par la configuration ou par la ligne de l'administrateur.
 */
class ManagedAccountsGateTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;
    use SchoolFixtures;

    private const CLOSED = [
        'success' => false,
        'code' => 'managed_accounts_closed',
        'message' => 'La création de comptes élèves par un établissement ou un enseignant n’est pas ouverte pour le moment : chaque élève crée son compte lui-même.',
    ];

    private const ROWS = [
        ['firstName' => 'Inès', 'lastName' => 'Moreau', 'birthDate' => '2012-03-14'],
        ['firstName' => 'Théo', 'lastName' => 'Lefèvre', 'birthDate' => '2012-11-02'],
    ];

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        config(['registration.managed_accounts' => false]);
        $this->freeSeatsPlan(30);
        $this->grade3e(1);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function asAdmin(): self
    {
        return $this->withToken($this->tokenOf($this->admin));
    }

    /** @return array{school: School, token: string, classroom: Classroom} */
    private function school(): array
    {
        ['school' => $school, 'token' => $token] = $this->schoolWithDirector();
        $classroom = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '3e B']);

        return compact('school', 'token', 'classroom');
    }

    /** Un élève créé par l'établissement pendant que c'était ouvert, puis l'interrupteur refermé. */
    private function schoolStudentCreatedWhileOpen(string $token, Classroom $classroom): int
    {
        config(['registration.managed_accounts' => true]);
        $id = $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => [self::ROWS[0]]])
            ->assertCreated()->json('cards.0.id');
        config(['registration.managed_accounts' => false]);

        return $id;
    }

    private function teacherUrl(Classroom $classroom): string
    {
        return "/api/v1/teacher/classrooms/{$classroom->id}/students/credentials";
    }

    // ── L'interrupteur ──────────────────────────────────────────────────

    public function test_closed_by_default(): void
    {
        // Le défaut du DÉPÔT, sans la variable de phpunit.xml : fermé.
        $saved = $_ENV['MANAGED_ACCOUNTS_OPEN'] ?? null;
        $savedServer = $_SERVER['MANAGED_ACCOUNTS_OPEN'] ?? null;
        putenv('MANAGED_ACCOUNTS_OPEN');
        unset($_ENV['MANAGED_ACCOUNTS_OPEN'], $_SERVER['MANAGED_ACCOUNTS_OPEN']);
        try {
            $config = require base_path('config/registration.php');
            $this->assertFalse($config['managed_accounts']);
        } finally {
            if ($saved !== null) {
                $_ENV['MANAGED_ACCOUNTS_OPEN'] = $saved;
                putenv("MANAGED_ACCOUNTS_OPEN={$saved}");
            }
            if ($savedServer !== null) {
                $_SERVER['MANAGED_ACCOUNTS_OPEN'] = $savedServer;
            }
        }

        $this->assertFalse(app(ManagedAccountsGate::class)->isOpen());
        $this->withToken($this->tokenOf($this->teacher()))->getJson('/api/v1/managed-accounts/status')
            ->assertOk()->assertExactJson(['success' => true, 'open' => false]);
    }

    public function test_the_status_read_needs_an_account_and_follows_the_switch(): void
    {
        $this->getJson('/api/v1/managed-accounts/status')->assertStatus(401);

        config(['registration.managed_accounts' => true]);
        ['token' => $token] = $this->schoolWithDirector();
        $this->withToken($token)->getJson('/api/v1/managed-accounts/status')
            ->assertOk()->assertExactJson(['success' => true, 'open' => true]);
    }

    // ── Refusé tant que c'est fermé ─────────────────────────────────────

    public function test_closed_the_school_roster_import_is_refused_preview_and_commit(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->school();
        $users = User::count();

        $this->withToken($token)->postJson('/api/v1/school/roster/preview', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertStatus(403)->assertExactJson(self::CLOSED);
        $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertStatus(403)->assertExactJson(self::CLOSED);
        // Même une entrée invalide : il n'y a rien à corriger.
        $this->withToken($token)->postJson('/api/v1/school/roster', [])
            ->assertStatus(403)->assertJsonPath('code', 'managed_accounts_closed');

        $this->assertSame($users, User::count());
        $this->assertSame(0, ClassroomMembership::count());
    }

    public function test_closed_the_school_cannot_reissue_credentials(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->school();
        $id = $this->schoolStudentCreatedWhileOpen($token, $classroom);
        $before = User::findOrFail($id)->password;

        $this->withToken($token)->postJson('/api/v1/school/students/credentials', ['studentIds' => [$id]])
            ->assertStatus(403)->assertExactJson(self::CLOSED);

        $this->assertSame($before, User::findOrFail($id)->password);
    }

    public function test_closed_the_teacher_cannot_issue_credential_cards(): void
    {
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->enrol($classroom, [$student]);
        $before = $student->fresh()->password;

        $this->withToken($this->tokenOf($classroom->teacher))
            ->postJson($this->teacherUrl($classroom), ['studentIds' => [$student->id]])
            ->assertStatus(403)->assertExactJson(self::CLOSED);

        $this->assertSame($before, $student->fresh()->password);
        $this->assertDatabaseMissing('admin_activity_logs', ['action' => ActivityLogger::TEACHER_STUDENT_CREDENTIALS_ISSUED]);
    }

    public function test_closed_another_teacher_still_gets_the_ownership_refusal_not_the_switch(): void
    {
        $classroom = Classroom::factory()->create();

        $response = $this->withToken($this->tokenOf($this->teacher()))
            ->postJson($this->teacherUrl($classroom), ['studentIds' => [1]]);

        $this->assertContains($response->status(), [403, 404]);
        $this->assertNotSame('managed_accounts_closed', $response->json('code'));
    }

    // ── Jamais bloqué ───────────────────────────────────────────────────

    public function test_closed_the_admin_still_creates_a_student(): void
    {
        $this->asAdmin()->postJson('/api/v1/admin/students', [
            'firstName' => 'Yanis', 'lastName' => 'Bernard', 'grade' => '3e',
        ])->assertStatus(201)->assertJsonPath('success', true);

        $this->assertSame(1, User::where('role', User::ROLE_STUDENT)->count());
    }

    public function test_closed_a_student_still_registers_himself_and_joins_with_the_class_link(): void
    {
        $classroom = Classroom::factory()->create();

        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'Yanis', 'lastName' => 'Bernard', 'email' => 'eleve@example.test',
            'password' => 'motdepasse1', 'accept_legal' => true,
            'classJoinLink' => $classroom->join_link_token, 'classJoinConsent' => true,
        ])->assertSuccessful();
        $this->assertSame(1, User::where('email', 'eleve@example.test')->count());

        $other = $this->student();
        $this->withToken($this->tokenOf($other))
            ->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'link' => $classroom->join_link_token])
            ->assertCreated();
    }

    public function test_closed_the_parent_link_and_parent_cards_still_work(): void
    {
        $classroom = Classroom::factory()->create(['grade' => '3e']);
        $student = $this->student();
        $this->enrol($classroom, [$student]);

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/parent-link', ['consent' => true])
            ->assertCreated();
        $this->withToken($this->tokenOf($classroom->teacher))
            ->postJson("/api/v1/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$student->id]])
            ->assertOk();
    }

    public function test_closed_existing_accounts_are_still_read_and_moved(): void
    {
        ['school' => $school, 'token' => $token, 'classroom' => $classroom] = $this->school();
        $id = $this->schoolStudentCreatedWhileOpen($token, $classroom);
        $other = $this->schoolClassroom($school, $this->teacherInSchool($school), ['name' => '3e C']);

        $this->withToken($token)->getJson('/api/v1/school/students')->assertOk()->assertJsonPath('students.0.id', $id);
        $this->withToken($token)->patchJson("/api/v1/school/students/{$id}/classroom", ['classroomId' => $other->id])
            ->assertOk()->assertJsonPath('students.0.classroom.name', '3e C');
        $this->withToken($this->tokenOf($other->teacher))->getJson("/api/v1/teacher/classrooms/{$other->id}/students")
            ->assertOk();
    }

    // ── L'administrateur ────────────────────────────────────────────────

    public function test_without_a_row_the_admin_reads_the_env_default(): void
    {
        $this->asAdmin()->getJson('/api/v1/admin/managed-accounts')
            ->assertOk()
            ->assertExactJson(['success' => true, 'managedAccounts' => ['open' => false, 'default' => false, 'lastChange' => null]]);
    }

    public function test_the_admin_opens_and_every_path_is_restored(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->school();

        $response = $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => true])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('managedAccounts.open', true)
            ->assertJsonPath('managedAccounts.default', false)
            ->assertJsonPath('managedAccounts.lastChange.by.id', $this->admin->id);
        $this->assertNotNull($response->json('managedAccounts.lastChange.at'));

        // L'établissement : aperçu, import, cartes.
        $this->withToken($token)->postJson('/api/v1/school/roster/preview', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertOk()->assertJsonPath('counts.new', 2);
        $cards = $this->withToken($token)->postJson('/api/v1/school/roster', ['classroomId' => $classroom->id, 'rows' => self::ROWS])
            ->assertCreated()->assertJsonCount(2, 'cards')->json('cards');
        $this->withToken($token)->postJson('/api/v1/school/students/credentials', ['studentIds' => [$cards[0]['id']]])
            ->assertOk()->assertJsonPath('cards.0.id', $cards[0]['id']);

        // L'enseignant : les cartes de connexion.
        $own = Classroom::factory()->create();
        $student = $this->student();
        $this->enrol($own, [$student]);
        $issued = $this->withToken($this->tokenOf($own->teacher))
            ->postJson($this->teacherUrl($own), ['studentIds' => [$student->id]])
            ->assertOk()->json('credentials.0');
        $this->assertTrue(Hash::check($issued['password'], $student->fresh()->password));

        $this->withToken($token)->getJson('/api/v1/managed-accounts/status')->assertExactJson(['success' => true, 'open' => true]);
    }

    public function test_the_row_wins_over_the_env_default_both_ways(): void
    {
        ['token' => $token, 'classroom' => $classroom] = $this->school();
        $body = ['classroomId' => $classroom->id, 'rows' => self::ROWS];

        // Env fermé, ligne ouverte → ouvert.
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => true])->assertOk();
        $this->withToken($token)->postJson('/api/v1/school/roster/preview', $body)->assertOk();

        // Env ouvert, ligne fermée → fermé.
        config(['registration.managed_accounts' => true]);
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => false])
            ->assertOk()
            ->assertJsonPath('managedAccounts.open', false)
            ->assertJsonPath('managedAccounts.default', true);
        $this->withToken($token)->postJson('/api/v1/school/roster/preview', $body)
            ->assertStatus(403)->assertJsonPath('code', 'managed_accounts_closed');

        $row = PlatformSetting::where('key', PlatformSetting::MANAGED_ACCOUNTS_KEY)->sole();
        $this->assertSame(['open' => false], $row->values);
        $this->assertSame($this->admin->id, $row->updated_by);
    }

    public function test_the_change_is_logged_old_to_new(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => true])->assertOk();
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => false])->assertOk();

        $logs = AdminActivityLog::where('action', ActivityLogger::MANAGED_ACCOUNTS_SETTINGS_CHANGED)->orderBy('id')->get();
        $this->assertCount(2, $logs);
        $this->assertSame($this->admin->id, $logs[0]->user_id);
        $this->assertSame(['open' => false], $logs[0]->before);
        $this->assertSame(['open' => true], $logs[0]->after);
        $this->assertSame(['open' => true], $logs[1]->before);
        $this->assertSame(['open' => false], $logs[1]->after);
    }

    public function test_the_body_needs_a_boolean(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', [])->assertStatus(422);
        $this->asAdmin()->patchJson('/api/v1/admin/managed-accounts', ['open' => 'peut-être'])->assertStatus(422);
        $this->assertSame(0, PlatformSetting::count());
    }

    public function test_a_non_admin_cannot_read_or_change_the_switch(): void
    {
        ['director' => $director] = $this->schoolWithDirector();
        foreach ([$this->student(), $this->teacher(), $director] as $user) {
            $this->withToken($this->tokenOf($user))->getJson('/api/v1/admin/managed-accounts')->assertStatus(403);
            $this->withToken($this->tokenOf($user))->patchJson('/api/v1/admin/managed-accounts', ['open' => true])->assertStatus(403);
        }
        $this->assertSame(0, PlatformSetting::count());
        $this->assertFalse(app(ManagedAccountsGate::class)->isOpen());
    }
}
