<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\AdminActivityLog;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * L'administrateur crée un compte élève (propriétaire, 2026-11-21) : avec une adresse ou un « معرّف الدخول » généré,
 * un mot de passe rendu une fois, que les inscriptions soient ouvertes ou fermées.
 */
class AdminStudentCreationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['registration.open' => false]);
        Grade::create(['code' => '3e', 'name' => 'Troisième', 'level' => 'college', 'is_active' => true]);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function asAdmin(): self
    {
        return $this->withToken($this->admin->createToken('admin-token')->plainTextToken);
    }

    /**
     * La vraie connexion, comme une requête neuve : `auth:sanctum` de la requête admin a fait de `sanctum` le garde
     * par défaut de l'application de test (jusque dans la config), et la connexion (Auth::attempt) attend `web`.
     */
    private function loginAs(string $login, string $password)
    {
        $this->app->forgetInstance('request');
        auth()->forgetGuards();
        auth()->shouldUse('web');

        return $this->withoutToken()->postJson('/api/v1/auth/login', ['email' => $login, 'password' => $password]);
    }

    public function test_with_an_email_the_student_is_created_verified_and_the_password_logs_in(): void
    {
        $response = $this->asAdmin()->postJson('/api/v1/admin/students', [
            'firstName' => '  ياسين ',
            'lastName' => 'بلقاسم',
            'email' => '  Yacine@Example.TEST ',
            'grade' => '3e',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('login', 'yacine@example.test')
            ->assertJsonPath('student.firstName', 'ياسين')
            ->assertJsonPath('student.email', 'yacine@example.test')
            ->assertJsonPath('student.grade', '3e')
            ->assertJsonPath('student.accountStatus', User::STATUS_ACTIVE);
        $this->assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));

        $student = User::where('email', 'yacine@example.test')->sole();
        $this->assertSame(User::ROLE_STUDENT, $student->role);
        $this->assertNotNull($student->email_verified_at);

        $password = $response->json('password');
        $this->assertMatchesRegularExpression('/^[a-z]{4}\d{4}$/', $password);
        $this->loginAs('yacine@example.test', $password)
            ->assertOk()
            ->assertJsonPath('user.email', 'yacine@example.test');
    }

    public function test_without_an_email_a_login_is_generated_and_logs_in(): void
    {
        $response = $this->asAdmin()->postJson('/api/v1/admin/students', ['firstName' => 'مريم', 'lastName' => 'سعيدي'])
            ->assertStatus(201);

        $login = $response->json('login');
        $domain = preg_quote((string) config('school.student_login_domain'), '/');
        $this->assertMatchesRegularExpression('/^a\.[a-z2-9]{6}@'.$domain.'$/', $login);
        $this->assertSame($login, $response->json('student.email'));
        $this->assertNull($response->json('student.grade'));
        $this->assertTrue(User::where('email', $login)->sole()->hasSchoolLogin());

        $this->loginAs($login, $response->json('password'))->assertOk();
    }

    public function test_an_email_already_taken_is_refused(): void
    {
        User::factory()->create(['email' => 'pris@example.test']);

        $this->asAdmin()->postJson('/api/v1/admin/students', [
            'firstName' => 'ياسين', 'lastName' => 'بلقاسم', 'email' => 'PRIS@example.test',
        ])->assertStatus(422)->assertJson(['success' => false, 'reason' => 'email_taken']);
        $this->assertSame(2, User::count());
    }

    public function test_a_latin_name_an_invalid_email_or_an_unknown_grade_is_refused(): void
    {
        $this->asAdmin()->postJson('/api/v1/admin/students', ['firstName' => 'Yacine', 'lastName' => 'بلقاسم'])
            ->assertStatus(422)->assertJsonValidationErrors('firstName');
        $this->asAdmin()->postJson('/api/v1/admin/students', ['firstName' => 'ياسين', 'lastName' => 'بلقاسم', 'email' => 'pas-une-adresse'])
            ->assertStatus(422)->assertJsonValidationErrors('email');
        $this->asAdmin()->postJson('/api/v1/admin/students', ['firstName' => 'ياسين', 'lastName' => 'بلقاسم', 'grade' => '9zz'])
            ->assertStatus(422)->assertJsonValidationErrors('grade');
        $this->assertSame(1, User::count());
    }

    public function test_it_works_while_registration_is_closed_and_is_logged_without_the_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'ياسين', 'lastName' => 'بلقاسم', 'email' => 'x@example.test', 'password' => 'motdepasse1', 'accept_legal' => true,
        ])->assertStatus(403);

        $response = $this->asAdmin()->postJson('/api/v1/admin/students', ['firstName' => 'ياسين', 'lastName' => 'بلقاسم'])
            ->assertStatus(201);

        $log = AdminActivityLog::where('action', ActivityLogger::STUDENT_CREATED)->sole();
        $this->assertSame($this->admin->id, $log->user_id);
        $this->assertSame((string) $response->json('student.id'), $log->entity_id);
        $this->assertStringNotContainsString($response->json('password'), json_encode([$log->before, $log->after]));
    }

    public function test_a_non_admin_cannot_create_a_student(): void
    {
        foreach ([User::ROLE_STUDENT, User::ROLE_TEACHER] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/admin/students', ['firstName' => 'ياسين', 'lastName' => 'بلقاسم'])
                ->assertStatus(403);
        }
        $this->assertSame(0, User::where('first_name', 'ياسين')->count());
    }
}
