<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Domain\School\SchoolService;
use App\Models\AdminActivityLog;
use App\Models\School;
use App\Models\SchoolStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * « Établissements » : l'administration crée un établissement et en nomme le
 * directeur ; le directeur entre dans « فضاء الإدارة » (SCHOOL_ADMIN_SPACE.md §2, §5).
 */
class SchoolAdminTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private const DIRECTOR = ['firstName' => 'كريم', 'lastName' => 'بن علي', 'email' => 'Directeur@Ecole.dz'];

    private function createSchool(string $adminToken, array $attrs = []): int
    {
        return $this->withToken($adminToken)->postJson('/api/v1/admin/schools', array_merge([
            'name' => 'متوسطة الأمير عبد القادر',
            'wilaya' => 'الجزائر',
            'code' => '160123',
            'currentAcademicYear' => '2026-2027',
        ], $attrs))->assertCreated()->json('school.id');
    }

    public function test_only_the_admin_manages_schools(): void
    {
        foreach ([$this->teacher(), $this->student(), User::factory()->create(['role' => User::ROLE_SCHOOL_ADMIN])] as $user) {
            $token = $this->tokenOf($user);
            $this->withToken($token)->getJson('/api/v1/admin/schools')->assertForbidden();
            $this->withToken($token)->postJson('/api/v1/admin/schools', ['name' => 'X'])->assertForbidden();
        }
    }

    public function test_admin_creates_a_school_and_it_is_logged(): void
    {
        $admin = $this->admin();
        $id = $this->createSchool($this->tokenOf($admin));

        $this->withToken($this->tokenOf($admin))->getJson('/api/v1/admin/schools')
            ->assertOk()
            ->assertJsonPath('schools.data.0.name', 'متوسطة الأمير عبد القادر')
            ->assertJsonPath('schools.data.0.director', null)
            ->assertJsonPath('counts.active', 1);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::SCHOOL_CREATED, 'entity_id' => (string) $id]);
    }

    public function test_appointing_the_director_creates_a_verified_account_and_shows_the_password_once(): void
    {
        $admin = $this->admin();
        $token = $this->tokenOf($admin);
        $id = $this->createSchool($token);

        $response = $this->withToken($token)->postJson("/api/v1/admin/schools/{$id}/director", self::DIRECTOR)
            ->assertCreated();
        $this->assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
        $password = $response->json('password');
        $this->assertMatchesRegularExpression('/^[a-z]{4}\d{4}-[a-z]{4}\d{4}$/', $password);

        $director = User::where('email', 'directeur@ecole.dz')->firstOrFail();
        $this->assertSame(User::ROLE_SCHOOL_ADMIN, $director->role);
        $this->assertNotNull($director->email_verified_at);
        $this->assertNotSame($password, $director->password);
        $this->assertDatabaseHas('school_staff', ['school_id' => $id, 'user_id' => $director->id, 'status' => SchoolStaff::STATUS_ACTIVE]);

        // Le journal nomme le directeur, jamais le mot de passe.
        $log = AdminActivityLog::where('action', ActivityLogger::SCHOOL_DIRECTOR_APPOINTED)->firstOrFail();
        $this->assertStringNotContainsString($password, json_encode($log->toArray()));

        // Relire l'établissement ne rend jamais le mot de passe.
        $this->withToken($token)->getJson("/api/v1/admin/schools/{$id}")
            ->assertOk()
            ->assertJsonPath('school.director.email', 'directeur@ecole.dz')
            ->assertJsonMissingPath('password');
    }

    public function test_appointment_refusals(): void
    {
        $admin = $this->admin();
        $token = $this->tokenOf($admin);
        $id = $this->createSchool($token);

        // Une adresse qui a déjà un compte n'est jamais transformée en directeur.
        $this->teacher(['email' => 'prof@ecole.dz']);
        $this->withToken($token)->postJson("/api/v1/admin/schools/{$id}/director", [...self::DIRECTOR, 'email' => 'prof@ecole.dz'])
            ->assertStatus(422)->assertJsonPath('reason', 'email_taken');

        // Le nom est en lettres arabes, comme pour tout compte.
        $this->withToken($token)->postJson("/api/v1/admin/schools/{$id}/director", [...self::DIRECTOR, 'firstName' => 'Karim'])
            ->assertStatus(422)->assertJsonValidationErrors('firstName');

        $this->withToken($token)->postJson("/api/v1/admin/schools/{$id}/director", self::DIRECTOR)->assertCreated();
        $this->withToken($token)->postJson("/api/v1/admin/schools/{$id}/director", [...self::DIRECTOR, 'email' => 'autre@ecole.dz'])
            ->assertStatus(422)->assertJsonPath('reason', 'director_exists');

        $other = $this->createSchool($token, ['code' => '160999']);
        $this->withToken($token)->patchJson("/api/v1/admin/schools/{$other}/status", ['status' => School::STATUS_SUSPENDED])->assertOk();
        $this->withToken($token)->postJson("/api/v1/admin/schools/{$other}/director", [...self::DIRECTOR, 'email' => 'trois@ecole.dz'])
            ->assertStatus(422)->assertJsonPath('reason', 'school_inactive');
    }

    public function test_the_director_logs_in_and_reads_the_school_overview(): void
    {
        // Semé par le service, sans requête authentifiée : la connexion qui suit
        // passe par la garde de session, pas par celle de Sanctum.
        $admin = $this->admin();
        $service = $this->app->make(SchoolService::class);
        $id = $service->create($admin, ['name' => 'متوسطة الأمير عبد القادر'])->id;
        ['password' => $password] = $service->appointDirector($admin, School::find($id), self::DIRECTOR);

        $login = $this->postJson('/api/v1/auth/login', ['email' => 'directeur@ecole.dz', 'password' => $password])
            ->assertOk()
            ->assertJsonPath('user.role', User::ROLE_SCHOOL_ADMIN);

        $this->withToken($login->json('token'))->getJson('/api/v1/school/overview')
            ->assertOk()
            ->assertJsonPath('school.id', $id)
            ->assertJsonPath('school.name', 'متوسطة الأمير عبد القادر')
            ->assertJsonPath('counts.classes', 0)
            ->assertJsonPath('counts.students', 0);
    }

    public function test_revoking_the_director_or_suspending_the_school_closes_the_space(): void
    {
        $admin = $this->admin();
        $adminToken = $this->tokenOf($admin);
        $id = $this->createSchool($adminToken);
        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$id}/director", self::DIRECTOR)->assertCreated();
        $director = User::where('email', 'directeur@ecole.dz')->firstOrFail();

        // Suspendu : la nomination reste, l'espace se ferme.
        $this->withToken($adminToken)->patchJson("/api/v1/admin/schools/{$id}/status", ['status' => School::STATUS_SUSPENDED])->assertOk();
        $this->withToken($this->tokenOf($director))->getJson('/api/v1/school/overview')
            ->assertForbidden()->assertJsonPath('reason', 'no_school');
        $this->withToken($adminToken)->patchJson("/api/v1/admin/schools/{$id}/status", ['status' => School::STATUS_ACTIVE])->assertOk();
        $this->withToken($this->tokenOf($director))->getJson('/api/v1/school/overview')->assertOk();

        // Retiré : ses jetons sont révoqués, et un nouveau jeton ne passe plus.
        $old = $this->tokenOf($director);
        $this->withToken($adminToken)->deleteJson("/api/v1/admin/schools/{$id}/director")
            ->assertOk()->assertJsonPath('school.director', null);
        $this->assertSame(0, $director->tokens()->count());
        $this->withToken($old)->getJson('/api/v1/school/overview')->assertUnauthorized();
        $this->withToken($this->tokenOf($director))->getJson('/api/v1/school/overview')
            ->assertForbidden()->assertJsonPath('reason', 'no_school');
        $this->assertDatabaseHas('users', ['id' => $director->id]);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::SCHOOL_DIRECTOR_REVOKED]);

        // Un nouveau directeur peut être nommé.
        $this->withToken($adminToken)->postJson("/api/v1/admin/schools/{$id}/director", [...self::DIRECTOR, 'email' => 'nouveau@ecole.dz'])->assertCreated();
    }
}
