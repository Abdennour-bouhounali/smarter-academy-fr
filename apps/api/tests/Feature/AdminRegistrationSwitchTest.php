<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\AdminActivityLog;
use App\Models\Classroom;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * « التسجيل » du tableau de bord (propriétaire, 2026-11-21) : l'administrateur ouvre et ferme les inscriptions ; la
 * ligne `platform_settings.registration` l'emporte sur config/registration.php, aussitôt.
 */
class AdminRegistrationSwitchTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private const PAYLOAD = [
        'firstName' => 'Yanis',
        'lastName' => 'Bernard',
        'email' => 'eleve@example.test',
        'password' => 'motdepasse1',
        'accept_legal' => true,
    ];

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_without_a_row_the_admin_reads_the_env_defaults(): void
    {
        config(['registration.open' => false, 'registration.class_links' => true]);

        $this->asAdmin()->getJson('/api/v1/admin/registration')
            ->assertOk()
            ->assertExactJson(['success' => true, 'registration' => ['open' => false, 'classLinks' => true]]);
    }

    public function test_the_admin_closes_the_sign_up_over_an_open_env(): void
    {
        config(['registration.open' => true]);

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['open' => false])
            ->assertOk()
            ->assertJson(['success' => true, 'registration' => ['open' => false, 'classLinks' => true]]);

        $this->getJson('/api/v1/registration')->assertOk()->assertJson(['open' => false]);
        $this->postJson('/api/v1/auth/register', self::PAYLOAD)
            ->assertStatus(403)
            ->assertJson(['success' => false, 'code' => 'registration_closed']);
        $this->assertSame(0, User::where('role', User::ROLE_STUDENT)->count());
    }

    public function test_the_admin_opens_the_sign_up_over_a_closed_env(): void
    {
        config(['registration.open' => false]);

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['open' => true])
            ->assertOk()
            ->assertJsonPath('registration.open', true);

        $this->getJson('/api/v1/registration')->assertJson(['open' => true]);
        $this->postJson('/api/v1/auth/register', self::PAYLOAD)->assertSuccessful();
        $this->assertSame(1, User::where('role', User::ROLE_STUDENT)->count());
    }

    public function test_the_class_links_switch_closes_and_reopens_the_class_link_path(): void
    {
        config(['registration.open' => false, 'registration.class_links' => true]);
        $this->defaultTeacherPlan();
        $this->grade3e(1);
        $classroom = Classroom::factory()->create();
        $viaLink = [...self::PAYLOAD, 'classJoinLink' => $classroom->join_link_token, 'classJoinConsent' => true];

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['classLinks' => false])
            ->assertOk()
            ->assertJson(['registration' => ['open' => false, 'classLinks' => false]]);
        $this->getJson('/api/v1/registration')->assertJson(['open' => false, 'classLinks' => false]);
        $this->postJson('/api/v1/auth/register', $viaLink)->assertStatus(403)->assertJsonPath('code', 'registration_closed');

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['classLinks' => true])
            ->assertOk()
            ->assertJson(['registration' => ['open' => false, 'classLinks' => true]]);
        $this->getJson('/api/v1/registration')->assertJson(['classLinks' => true]);
        $this->postJson('/api/v1/auth/register', $viaLink)->assertSuccessful();
    }

    public function test_one_value_changed_keeps_the_other(): void
    {
        config(['registration.open' => false, 'registration.class_links' => true]);

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['open' => true])->assertOk();
        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['classLinks' => false])
            ->assertJson(['registration' => ['open' => true, 'classLinks' => false]]);

        $row = PlatformSetting::where('key', 'registration')->sole();
        $this->assertSame(['open' => true, 'class_links' => false], $row->values);
        $this->assertSame($this->admin->id, $row->updated_by);
    }

    public function test_the_body_needs_at_least_one_boolean(): void
    {
        $this->asAdmin()->patchJson('/api/v1/admin/registration', [])->assertStatus(422);
        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['open' => 'peut-être'])->assertStatus(422);
        $this->assertSame(0, PlatformSetting::count());
    }

    public function test_the_change_is_logged_old_to_new(): void
    {
        config(['registration.open' => false, 'registration.class_links' => true]);

        $this->asAdmin()->patchJson('/api/v1/admin/registration', ['open' => true])->assertOk();

        $log = AdminActivityLog::where('action', ActivityLogger::REGISTRATION_SETTINGS_CHANGED)->sole();
        $this->assertSame($this->admin->id, $log->user_id);
        $this->assertSame(['open' => false, 'classLinks' => true], $log->before);
        $this->assertSame(['open' => true, 'classLinks' => true], $log->after);
    }

    public function test_a_non_admin_cannot_read_or_change_the_switch(): void
    {
        foreach ([User::ROLE_STUDENT, User::ROLE_TEACHER] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/registration')->assertStatus(403);
            $this->actingAs($user, 'sanctum')->patchJson('/api/v1/admin/registration', ['open' => true])->assertStatus(403);
        }
        $this->assertSame(0, PlatformSetting::count());
    }
}
