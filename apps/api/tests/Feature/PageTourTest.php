<?php

namespace Tests\Feature;

use App\Models\PageTour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * « جولة تعريفية » (2026-10-07) : une visite guidée par page, montrée une fois
 * par compte. Le serveur garde les visites CLOSES (terminées ou passées), par
 * compte et par rôle.
 */
class PageTourTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_student_has_no_closed_tour_and_is_eligible(): void
    {
        $student = User::factory()->create(['role' => 'student', 'grade' => '4am']);

        $this->actingAs($student)->getJson('/api/v1/me/tours')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('eligible', true)
            ->assertJsonPath('tours', []);
    }

    public function test_finishing_or_skipping_closes_the_tour_for_this_account_only(): void
    {
        $student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $other = User::factory()->create(['role' => 'student', 'grade' => '4am']);

        $this->actingAs($student)->postJson('/api/v1/me/tours/student.home', ['status' => 'completed', 'step' => 4])
            ->assertOk()->assertJsonPath('status', 'completed');
        $this->actingAs($student)->postJson('/api/v1/me/tours/student.notebook', ['status' => 'skipped', 'step' => 0])
            ->assertOk()->assertJsonPath('status', 'skipped');

        // Les clés portent un point (`student.home`) : lues dans le tableau décodé.
        $tours = $this->actingAs($student)->getJson('/api/v1/me/tours')->assertOk()->json('tours');
        $this->assertSame(['student.home', 'student.notebook'], array_keys($tours));
        $this->assertSame('completed', $tours['student.home']['status']);
        $this->assertSame(4, $tours['student.home']['step']);
        $this->assertSame('skipped', $tours['student.notebook']['status']);
        $this->actingAs($other)->getJson('/api/v1/me/tours')->assertJsonPath('tours', []);
    }

    public function test_replaying_a_tour_keeps_one_row_and_the_last_outcome(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)->postJson('/api/v1/me/tours/teacher.classes', ['status' => 'skipped'])->assertOk();
        $this->actingAs($teacher)->postJson('/api/v1/me/tours/teacher.classes', ['status' => 'completed', 'step' => 3])->assertOk();

        $this->assertSame(1, PageTour::where('user_id', $teacher->id)->count());
        $this->assertSame('completed', PageTour::where('user_id', $teacher->id)->value('status'));
    }

    public function test_a_tour_of_another_role_or_a_malformed_key_is_refused(): void
    {
        $student = User::factory()->create(['role' => 'student', 'grade' => '4am']);

        $this->actingAs($student)->postJson('/api/v1/me/tours/teacher.home', ['status' => 'completed'])->assertForbidden();
        $this->actingAs($student)->postJson('/api/v1/me/tours/admin.home', ['status' => 'completed'])->assertNotFound();
        $this->actingAs($student)->postJson('/api/v1/me/tours/student.Home!', ['status' => 'completed'])->assertNotFound();
        $this->actingAs($student)->postJson('/api/v1/me/tours/student.home', ['status' => 'seen'])->assertUnprocessable();
        $this->assertSame(0, PageTour::count());
    }

    public function test_admins_and_guests_have_no_tours(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->getJson('/api/v1/me/tours')->assertUnauthorized();
        $this->actingAs($admin)->getJson('/api/v1/me/tours')->assertForbidden();
    }

    public function test_an_unverified_account_cannot_reach_the_tours(): void
    {
        $student = User::factory()->unverified()->create(['role' => 'student', 'grade' => '4am']);

        $this->actingAs($student)->getJson('/api/v1/me/tours')->assertForbidden();
    }

    public function test_eligible_since_limits_automatic_tours_to_newer_accounts(): void
    {
        config(['tours.eligible_since' => '2026-10-07']);
        $older = User::factory()->create(['role' => 'student', 'grade' => '4am', 'created_at' => '2026-09-20 10:00:00']);
        $newer = User::factory()->create(['role' => 'student', 'grade' => '4am', 'created_at' => '2026-10-07 08:00:00']);

        $this->actingAs($older)->getJson('/api/v1/me/tours')->assertJsonPath('eligible', false);
        $this->actingAs($newer)->getJson('/api/v1/me/tours')->assertJsonPath('eligible', true);
        // Le rejeu reste possible pour tous : la clôture s'enregistre.
        $this->actingAs($older)->postJson('/api/v1/me/tours/student.home', ['status' => 'completed'])->assertOk();
    }
}
