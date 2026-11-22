<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\ParentLink;
use App\Models\ParentLinkCode;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\StudyTimeDay;
use App\Models\User;
use App\Notifications\ParentLinkRevokedNotification;
use App\Notifications\ParentWeeklyReportNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « فضاء الوليّ » (docs/architecture/PARENT_SPACE.md) : le compte parent, le
 * code de liaison né du consentement de l'élève, le temps d'étude mesuré, le
 * rapport (le même pour le parent et pour l'élève), la rupture jamais
 * silencieuse et le courriel du dimanche.
 */
class ParentSpaceTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function parent(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => User::ROLE_PARENT, 'grade' => null], $attributes));
    }

    private function as(User $user, string $method, string $uri, array $body = [])
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($this->tokenOf($user))->json($method, "/api/v1{$uri}", $body);
    }

    /** Un élève et un parent liés par le vrai chemin : consentement, code, saisie. */
    private function linked(): array
    {
        $student = $this->student(['first_name' => 'أمين', 'last_name' => 'بن علي']);
        $parent = $this->parent();
        $code = $this->as($student, 'POST', '/student/parents/code', ['consent' => true])->json('code.code');
        $this->as($parent, 'POST', '/parent/children/link', ['code' => $code])->assertCreated();

        return [$student, $parent];
    }

    public function test_a_parent_account_can_no_longer_self_register(): void
    {
        // Depuis le 2026-10-23, le parent lit par le « رابط الوليّ » (ParentAccessLinkTest) ;
        // le rôle reste pour plus tard, hors de la liste blanche d'inscription.
        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'فاطمة',
            'lastName' => 'حداد',
            'email' => 'wali@example.com',
            'password' => 'secret123',
            'accept_legal' => true,
            'accountType' => 'parent',
        ])->assertStatus(422);

        $this->assertFalse(User::where('email', 'wali@example.com')->exists());
    }

    public function test_the_code_is_born_only_from_the_students_consent(): void
    {
        $student = $this->student();

        $this->as($student, 'POST', '/student/parents/code', [])
            ->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->assertSame(0, ParentLinkCode::count());

        $code = $this->as($student, 'POST', '/student/parents/code', ['consent' => true])
            ->assertCreated()->json('code.code');
        $this->assertSame(8, strlen($code));
        $this->assertSame(config('family.consent_version'), ParentLinkCode::first()->consent_version);

        // Un seul code vivant : en créer un autre remplace le premier.
        $this->as($student, 'POST', '/student/parents/code', ['consent' => true])->assertCreated();
        $this->assertSame(1, ParentLinkCode::count());
    }

    public function test_a_parent_links_with_the_code_once_and_never_sees_an_email(): void
    {
        $student = $this->student(['first_name' => 'سارة', 'last_name' => 'منصوري']);
        $parent = $this->parent(['first_name' => 'كريم', 'last_name' => 'منصوري']);
        $code = $this->as($student, 'POST', '/student/parents/code', ['consent' => true])->json('code.code');

        // Saisi en minuscules, avec un tiret : normalisé.
        $spaced = strtolower(substr($code, 0, 4).'-'.substr($code, 4));
        $this->as($parent, 'POST', '/parent/children/link', ['code' => $spaced])
            ->assertCreated()->assertJsonPath('child.firstName', 'سارة');

        // Usage unique.
        $this->as($this->parent(), 'POST', '/parent/children/link', ['code' => $code])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid_code');

        $children = $this->as($parent, 'GET', '/parent/children')->assertOk();
        $children->assertJsonPath('children.0.id', $student->id);
        $this->assertStringNotContainsString($student->email, $children->getContent());
        $this->assertStringNotContainsString('"email"', $children->getContent());

        $report = $this->as($parent, 'GET', "/parent/children/{$student->id}/report")->assertOk();
        $this->assertStringNotContainsString($student->email, $report->getContent());

        // L'élève voit qui le suit.
        $this->as($student, 'GET', '/student/parents')
            ->assertOk()->assertJsonPath('parents.0.parent.firstName', 'كريم')->assertJsonPath('code', null);
    }

    public function test_expired_and_already_linked_codes_are_refused_by_reason(): void
    {
        [$student, $parent] = $this->linked();

        $code = $this->as($student, 'POST', '/student/parents/code', ['consent' => true])->json('code.code');
        $this->as($parent, 'POST', '/parent/children/link', ['code' => $code])
            ->assertStatus(422)->assertJsonPath('reason', 'already_linked');

        Carbon::setTestNow(now()->addHours(73));
        $this->as($this->parent(), 'POST', '/parent/children/link', ['code' => $code])
            ->assertStatus(422)->assertJsonPath('reason', 'expired_code');
    }

    public function test_reads_go_through_an_active_link_and_the_role_gate(): void
    {
        [$student, $parent] = $this->linked();
        $stranger = $this->student();

        $this->as($parent, 'GET', "/parent/children/{$stranger->id}/report")->assertNotFound();
        $this->as($this->parent(), 'GET', "/parent/children/{$student->id}/report")->assertNotFound();

        $this->as($student, 'GET', '/parent/children')->assertForbidden();
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $this->as($teacher, 'GET', '/parent/children')->assertForbidden();
        $this->as($teacher, 'GET', '/student/parents')->assertForbidden();
        $this->as($parent, 'POST', '/student/study-time', ['segments' => [['surface' => 'lesson', 'active' => 10, 'idle' => 0, 'away' => 0, 'leaves' => 0]]])
            ->assertForbidden()->assertJsonPath('reason', 'not_a_learner');
    }

    public function test_study_time_is_recorded_per_day_and_surface_and_bounded_by_elapsed_time(): void
    {
        Cache::flush();
        Carbon::setTestNow(Carbon::parse('2026-10-21 09:00:00', 'UTC'));
        $student = $this->student();

        $this->as($student, 'POST', '/student/study-time', ['segments' => [
            ['surface' => 'lesson', 'active' => 50, 'idle' => 5, 'away' => 0, 'leaves' => 0],
            ['surface' => 'practice', 'active' => 20, 'idle' => 0, 'away' => 30, 'leaves' => 2],
        ]])->assertOk();

        $lesson = StudyTimeDay::where('user_id', $student->id)->where('surface', 'lesson')->first();
        $this->assertSame('2026-10-21', $lesson->day);
        $this->assertSame(50, $lesson->active_seconds);
        $practice = StudyTimeDay::where('surface', 'practice')->first();
        $this->assertSame(30, $practice->away_seconds);
        $this->assertSame(2, $practice->leave_count);

        // Dix secondes plus tard, un battement qui prétend 3 minutes ne
        // couvre que l'écoulé + la marge (25 s).
        Carbon::setTestNow(Carbon::parse('2026-10-21 09:00:10', 'UTC'));
        $this->travelTo(Carbon::now());
        $this->as($student, 'POST', '/student/study-time', ['segments' => [
            ['surface' => 'lesson', 'active' => 180, 'idle' => 0, 'away' => 0, 'leaves' => 0],
        ]])->assertOk();
        $this->assertLessThanOrEqual(50 + 25, $lesson->fresh()->active_seconds);

        $this->as($student, 'POST', '/student/study-time', ['segments' => [
            ['surface' => 'facebook', 'active' => 10, 'idle' => 0, 'away' => 0, 'leaves' => 0],
        ]])->assertStatus(422);
    }

    public function test_the_student_reads_exactly_the_report_the_parent_reads(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-21 12:00:00', 'UTC')); // un mercredi
        [$student, $parent] = $this->linked();
        StudyTimeDay::create(['user_id' => $student->id, 'day' => '2026-10-19', 'surface' => 'lesson', 'active_seconds' => 1500, 'away_seconds' => 120, 'leave_count' => 3]);
        StudyTimeDay::create(['user_id' => $student->id, 'day' => '2026-10-19', 'surface' => 'game', 'active_seconds' => 600]);
        StudyTimeDay::create(['user_id' => $student->id, 'day' => '2026-10-20', 'surface' => 'practice', 'active_seconds' => 900]);
        // La semaine précédente ne compte pas.
        StudyTimeDay::create(['user_id' => $student->id, 'day' => '2026-10-17', 'surface' => 'lesson', 'active_seconds' => 999]);

        $forParent = $this->as($parent, 'GET', "/parent/children/{$student->id}/report")->assertOk()->json('report');
        $forStudent = $this->as($student, 'GET', '/student/parents/report')->assertOk()->json('report');

        $this->assertSame($forParent, $forStudent);
        $this->assertSame('2026-10-18', $forParent['weekStart']);
        $this->assertSame('2026-10-24', $forParent['weekEnd']);
        $this->assertSame(2400, $forParent['time']['studySeconds']);
        $this->assertSame(600, $forParent['time']['gameSeconds']);
        $this->assertSame(120, $forParent['time']['awaySeconds']);
        $this->assertSame(3, $forParent['time']['leaves']);
        $this->assertSame(2, $forParent['time']['activeDays']);
        $this->assertSame(1500, $forParent['time']['days'][1]['studySeconds']);
        $this->assertSame(['answered' => 0, 'correct' => 0, 'partial' => 0], $forParent['practice']);

        $children = $this->as($parent, 'GET', '/parent/children')->json('children.0');
        $this->assertSame(2400, $children['weekStudySeconds']);
    }

    public function test_a_student_can_unlink_and_the_parent_is_always_told(): void
    {
        Notification::fake();
        [$student, $parent] = $this->linked();
        $linkId = ParentLink::first()->id;

        $this->as($student, 'DELETE', "/student/parents/{$linkId}")->assertOk();

        Notification::assertSentTo($parent, ParentLinkRevokedNotification::class);
        $this->assertSame('student', ParentLink::first()->revoked_by);
        $this->as($parent, 'GET', "/parent/children/{$student->id}/report")->assertNotFound();

        // Un nouveau code relie à nouveau : la même ligne revit.
        $code = $this->as($student, 'POST', '/student/parents/code', ['consent' => true])->json('code.code');
        $this->as($parent, 'POST', '/parent/children/link', ['code' => $code])->assertCreated();
        $this->assertSame(1, ParentLink::count());
        $this->assertSame('active', ParentLink::first()->status);
    }

    public function test_the_parent_unlinks_and_sets_the_weekly_email(): void
    {
        [$student, $parent] = $this->linked();

        $this->as($parent, 'PATCH', "/parent/children/{$student->id}", ['weeklyEmail' => false])
            ->assertOk()->assertJsonPath('child.weeklyEmail', false);
        $this->as($parent, 'DELETE', "/parent/children/{$student->id}")->assertOk();
        $this->assertSame('parent', ParentLink::first()->revoked_by);
        $this->as($parent, 'GET', '/parent/children')->assertJsonCount(0, 'children');
    }

    public function test_the_sunday_email_goes_once_per_week_and_respects_the_switch(): void
    {
        Notification::fake();
        Carbon::setTestNow(Carbon::parse('2026-10-25 07:00:00', 'UTC')); // dimanche 08:00 à Alger
        [$student, $parent] = $this->linked();
        [$muted, $mutedParent] = $this->linked();
        ParentLink::where('parent_id', $mutedParent->id)->update(['weekly_email' => false]);

        $this->artisan('smarter:family:weekly-reports')->assertSuccessful();
        $this->artisan('smarter:family:weekly-reports')->assertSuccessful();

        Notification::assertSentToTimes($parent, ParentWeeklyReportNotification::class, 1);
        Notification::assertNotSentTo($mutedParent, ParentWeeklyReportNotification::class);
        $this->assertSame('2026-10-18', ParentLink::where('parent_id', $parent->id)->value('last_weekly_report_week'));
    }

    public function test_the_detailed_progress_is_lesson_by_lesson_and_identical_for_the_student(): void
    {
        [$student, $parent] = $this->linked();
        $lesson = Lesson::factory()->create(['title' => 'القاسم المشترك']);
        $strong = $this->point($lesson, 1);
        $weak = $this->point($lesson, 2);
        $this->answers($student, $lesson, $strong, 'correct', 6);
        $this->answers($student, $lesson, $weak, 'incorrect', 4);
        StudentLessonProgress::create([
            'user_id' => $student->id, 'lesson_id' => $lesson->id, 'status' => 'in_progress',
            'current_module' => 3, 'completed_modules' => [1, 2], 'last_activity_at' => now(),
        ]);

        $forParent = $this->as($parent, 'GET', "/parent/children/{$student->id}/progress")->assertOk()->json('progress');
        $forStudent = $this->as($student, 'GET', '/student/parents/progress')->assertOk()->json('progress');
        $this->assertSame($forParent, $forStudent);

        $row = collect($forParent['lessons'])->firstWhere('code', $lesson->code);
        $this->assertSame('القاسم المشترك', $row['title']);
        $this->assertSame(2, $row['modulesCompleted']);
        $this->assertSame([$strong->code, $weak->code], array_column($row['learningPoints'], 'code'));

        $weakStatus = StudentLearningPointProgress::where('user_id', $student->id)->where('learning_point_id', $weak->id)->value('status');
        $this->assertSame($weakStatus, collect($row['learningPoints'])->firstWhere('code', $weak->code)['status']);
        if (in_array($weakStatus, ['gap', 'reinforce'], true)) {
            $this->assertContains($weak->code, array_column($forParent['needsSupport'], 'code'));
        }
        $this->assertSame(1, $forParent['summary']['lessonsStarted']);
        $this->assertSame(2, array_sum($forParent['summary']['masteryCounts']));
        foreach ($forParent['timeline'] as $event) {
            $this->assertArrayNotHasKey('detail', $event);
        }
        $this->assertStringNotContainsString($student->email, json_encode($forParent));

        $this->as($this->parent(), 'GET', "/parent/children/{$student->id}/progress")->assertNotFound();
    }
}
