<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ParentAccessLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « رابط الوليّ » (docs/architecture/PARENT_SPACE.md §2) : le lien privé, sans
 * compte, que l'élève crée (consentement) ou que l'enseignant imprime en QR ;
 * le rapport qu'il ouvre est celui que l'élève lit ; un nouveau lien révoque
 * l'ancien ; le code à 4 chiffres du parent et son verrou.
 */
class ParentAccessLinkTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(User $user, string $method, string $uri, array $body = [])
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($this->tokenOf($user))->json($method, "/api/v1{$uri}", $body);
    }

    /** Un appel PUBLIC, sans aucun jeton de session. */
    private function guest(string $method, string $uri, array $body = [], array $headers = [])
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        return $this->withHeaders($headers)->json($method, "/api/v1{$uri}", $body);
    }

    private function tokenFrom(string $url): string
    {
        return substr($url, strrpos($url, '/w/') + 3);
    }

    private function linkOf(User $student): string
    {
        return $this->tokenFrom($this->as($student, 'POST', '/student/parent-link', ['consent' => true])->assertCreated()->json('link.url'));
    }

    public function test_the_student_creates_the_link_only_by_consenting_and_the_parent_reads_without_an_account(): void
    {
        $student = $this->student(['first_name' => 'سارة', 'last_name' => 'منصوري']);

        $this->as($student, 'POST', '/student/parent-link', [])->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->assertSame(0, ParentAccessLink::count());

        $token = $this->linkOf($student);
        $this->assertSame(32, strlen($token));
        $this->assertNotSame($token, ParentAccessLink::first()->getRawOriginal('token_hash'));

        $show = $this->guest('GET', "/parent-link/{$token}")->assertOk()
            ->assertJsonPath('child.firstName', 'سارة')->assertJsonPath('unlocked', true)->assertJsonPath('pinSet', false)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->assertStringContainsString('no-store', $show->headers->get('Cache-Control'));
        $this->assertStringNotContainsString($student->email, $show->getContent());

        // Le rapport et le détail sont EXACTEMENT ceux que l'élève lit.
        $this->assertSame(
            $this->as($student, 'GET', '/student/parents/report')->json('report'),
            $this->guest('GET', "/parent-link/{$token}/report")->assertOk()->json('report'),
        );
        $this->assertSame(
            $this->as($student, 'GET', '/student/parents/progress')->json('progress'),
            $this->guest('GET', "/parent-link/{$token}/progress")->assertOk()->json('progress'),
        );

        // L'élève voit que le lien a été ouvert — une fois par tranche de 10 minutes.
        $this->guest('GET', "/parent-link/{$token}");
        $this->as($student, 'GET', '/student/parent-link')->assertJsonPath('link.openCount', 1)->assertJsonPath('link.createdBy', 'student');
    }

    public function test_a_new_link_replaces_the_old_one_and_revoking_closes_it(): void
    {
        $student = $this->student();
        $old = $this->linkOf($student);
        $new = $this->linkOf($student);

        $this->guest('GET', "/parent-link/{$old}")->assertStatus(410)->assertJsonPath('reason', 'link_revoked');
        $this->guest('GET', "/parent-link/{$new}")->assertOk();
        $this->guest('GET', '/parent-link/'.str_repeat('a', 32))->assertNotFound()->assertJsonPath('reason', 'link_invalid');

        $this->as($student, 'DELETE', '/student/parent-link')->assertOk();
        $this->guest('GET', "/parent-link/{$new}/report")->assertStatus(410);
        $this->as($student, 'GET', '/student/parent-link')->assertJsonPath('link', null);
    }

    public function test_the_parent_pin_guards_the_link_and_locks_after_five_failures(): void
    {
        $token = $this->linkOf($this->student());

        $pass = $this->guest('POST', "/parent-link/{$token}/pin", ['pin' => '4821'])->assertOk()->json('pass');
        $this->guest('POST', "/parent-link/{$token}/pin", ['pin' => '0000'])->assertStatus(409)->assertJsonPath('reason', 'pin_already_set');
        $this->guest('POST', "/parent-link/{$token}/pin", ['pin' => 'abcd'])->assertStatus(422);

        $this->guest('GET', "/parent-link/{$token}")->assertOk()->assertJsonPath('unlocked', false)->assertJsonPath('pinSet', true);
        $this->guest('GET', "/parent-link/{$token}/report")->assertStatus(401)->assertJsonPath('reason', 'pin_required');
        $this->guest('GET', "/parent-link/{$token}/report", [], ['X-Parent-Pass' => $pass])->assertOk();
        $this->guest('GET', "/parent-link/{$token}/progress", [], ['X-Parent-Pass' => 'forged'])->assertStatus(401);

        $fresh = $this->guest('POST', "/parent-link/{$token}/unlock", ['pin' => '4821'])->assertOk()->json('pass');
        $this->guest('GET', "/parent-link/{$token}/progress", [], ['X-Parent-Pass' => $fresh])->assertOk();

        for ($i = 0; $i < 4; $i++) {
            $this->guest('POST', "/parent-link/{$token}/unlock", ['pin' => '1111'])->assertStatus(422)->assertJsonPath('reason', 'pin_wrong');
        }
        $this->guest('POST', "/parent-link/{$token}/unlock", ['pin' => '1111'])->assertStatus(429)->assertJsonPath('reason', 'pin_locked');
        $this->guest('POST', "/parent-link/{$token}/unlock", ['pin' => '4821'])->assertStatus(429);

        Carbon::setTestNow(now()->addMinutes(16));
        $this->guest('POST', "/parent-link/{$token}/unlock", ['pin' => '4821'])->assertOk();
    }

    public function test_the_teacher_prints_parent_cards_without_breaking_an_existing_link(): void
    {
        $classroom = Classroom::factory()->create(['grade' => '4am']);
        $teacher = $classroom->teacher;
        $withLink = $this->student(['first_name' => 'أمين']);
        $without = $this->student(['first_name' => 'ياسين']);
        $outsider = $this->student();
        $this->enrol($classroom, [$withLink, $without]);
        $existing = $this->linkOf($withLink);

        $response = $this->as($teacher, 'POST', "/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$withLink->id, $without->id]])
            ->assertOk();
        $cards = collect($response->json('cards'))->keyBy('id');
        $this->assertSame($existing, $this->tokenFrom($cards[$withLink->id]['url']));
        $this->assertStringNotContainsString($withLink->email, $response->getContent());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        // Le lien créé par l'enseignant est visible, et révocable, par l'élève.
        $this->as($without, 'GET', '/student/parent-link')->assertJsonPath('link.createdBy', 'teacher');
        $this->guest('GET', '/parent-link/'.$this->tokenFrom($cards[$without->id]['url']))->assertOk()->assertJsonPath('child.firstName', 'ياسين');

        // Réimprimer redonne les mêmes liens.
        $again = collect($this->as($teacher, 'POST', "/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$without->id]])->json('cards'));
        $this->assertSame($cards[$without->id]['url'], $again->first()['url']);

        $this->as($teacher, 'POST', "/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$outsider->id]])
            ->assertStatus(422)->assertJsonPath('reason', 'not_member');
        $other = Classroom::factory()->create(['grade' => '4am'])->teacher;
        $this->assertContains(
            $this->as($other, 'POST', "/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$without->id]])->status(),
            [403, 404],
        );
        $this->as($withLink, 'POST', "/teacher/classrooms/{$classroom->id}/students/parent-cards", ['studentIds' => [$without->id]])->assertForbidden();
    }
}
