<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\DiagnosticSession;
use App\Models\DiagnosticSkillAssessment;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentLearningProfileTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => '6ème', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'resolution-problemes',
            'title' => 'Résolution de problèmes', 'status' => 'available', 'order' => 0,
        ]);
        LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '6e_resolution-problemes_P1', 'title' => 'Comprendre', 'order' => 1]);
    }

    private function studentToken(array $attributes = []): array
    {
        $user = User::factory()->create(array_merge(['role' => 'student', 'grade' => '6e'], $attributes));
        $token = $user->createToken('student-token')->plainTextToken;

        return [$user, $token];
    }

    private function completedDiagnostic(User $user): DiagnosticSession
    {
        $session = DiagnosticSession::create([
            'user_id' => $user->id,
            'grade' => '6e',
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'completed_at' => now(),
            'profile_summary' => [
                'strengths' => [['skillId' => 'nombres.lecture-ecriture', 'label' => 'Lire et écrire les nombres']],
                'reinforce' => [],
                'gaps' => [['skillId' => 'problemes.une-etape', 'label' => 'Problèmes à une étape']],
                'recommendation' => ['lessonId' => 'resolution-problemes', 'moduleNumber' => 2],
            ],
        ]);

        DiagnosticSkillAssessment::create([
            'session_id' => $session->id,
            'skill_id' => 'problemes.une-etape',
            'status' => 'gap',
            'confidence' => 0.25,
            'attempts' => 3,
            'correct_count' => 0,
        ]);

        return $session;
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/students/me/learning-profile')->assertStatus(401);
    }

    public function test_profile_separates_initial_knowledge_from_current_mastery(): void
    {
        [$user, $token] = $this->studentToken();
        $this->completedDiagnostic($user);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/lessons/resolution-problemes/evidence', [
                'questionCode' => 'rp-flash-01',
                'attemptId' => 'attempt-0001',
                'isCorrect' => true,
                'learningPointCodes' => ['6e_resolution-problemes_P1'],
            ])->assertStatus(201);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/students/me/learning-profile');

        $response->assertStatus(200)
            ->assertJsonPath('profile.initialKnowledge.0.source', 'diagnostic')
            ->assertJsonPath('profile.initialKnowledge.0.grade', '6e')
            ->assertJsonPath('profile.initialKnowledge.0.profile.recommendation.lessonId', 'resolution-problemes')
            ->assertJsonPath('profile.currentMastery.0.grade', '6e')
            ->assertJsonPath('profile.currentMastery.0.lessons.0.lesson', 'resolution-problemes')
            ->assertJsonPath('profile.currentMastery.0.lessons.0.learningPoints.0.code', '6e_resolution-problemes_P1')
            ->assertJsonPath('profile.currentMastery.0.lessons.0.learningPoints.0.attempts', 1);
    }

    public function test_lesson_evidence_never_touches_the_diagnostic_baseline(): void
    {
        // THE non-overwrite guarantee: initial knowledge (diagnostic) and
        // current mastery (lesson evidence) live in disjoint tables — submit
        // lesson evidence, then assert the diagnostic rows are byte-identical.
        [$user, $token] = $this->studentToken();
        $session = $this->completedDiagnostic($user);

        $baselineSession = DiagnosticSession::find($session->id)->getAttributes();
        $baselineAssessment = DiagnosticSkillAssessment::where('session_id', $session->id)->first()->getAttributes();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/lessons/resolution-problemes/evidence', [
                'questionCode' => 'rp-flash-01',
                'attemptId' => 'attempt-0001',
                'isCorrect' => false, // even a WRONG answer must not dent the baseline
                'learningPointCodes' => ['6e_resolution-problemes_P1'],
            ])->assertStatus(201);

        $this->assertSame($baselineSession, DiagnosticSession::find($session->id)->getAttributes());
        $this->assertSame(
            $baselineAssessment,
            DiagnosticSkillAssessment::where('session_id', $session->id)->first()->getAttributes()
        );

        // And the profile still reports the untouched baseline alongside the
        // new (lower) current mastery.
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/students/me/learning-profile');
        $response->assertJsonPath('profile.initialKnowledge.0.profile.gaps.0.skillId', 'problemes.une-etape')
            ->assertJsonPath('profile.currentMastery.0.lessons.0.learningPoints.0.correctCount', 0);
    }

    public function test_an_in_progress_diagnostic_is_not_a_baseline(): void
    {
        [$user, $token] = $this->studentToken();
        DiagnosticSession::create([
            'user_id' => $user->id, 'grade' => '6e', 'status' => 'in_progress', 'started_at' => now(),
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/students/me/learning-profile')
            ->assertStatus(200)
            ->assertJsonPath('profile.initialKnowledge', [])
            ->assertJsonPath('profile.currentMastery', []);
    }

    public function test_a_student_only_ever_sees_their_own_profile(): void
    {
        // The other student's data is seeded directly rather than via HTTP
        // requests as that student: Sanctum's RequestGuard caches the
        // resolved user across calls within one test method (see the
        // identical caveat in DiagnosticFlowTest), so authenticating as two
        // users in one method would pass for the wrong reason.
        $owner = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $this->completedDiagnostic($owner);
        \App\Models\StudentLearningPointProgress::create([
            'user_id' => $owner->id,
            'learning_point_id' => LearningPoint::where('code', '6e_resolution-problemes_P1')->first()->id,
            'status' => 'mastered',
            'confidence' => 0.8,
            'attempts' => 3,
            'correct_count' => 3,
            'last_evidence_at' => now(),
        ]);

        [, $otherToken] = $this->studentToken(['email' => 'other@student.test']);

        // The other student sees an empty profile — none of the owner's data leaks.
        $this->withHeader('Authorization', "Bearer {$otherToken}")
            ->getJson('/api/v1/students/me/learning-profile')
            ->assertStatus(200)
            ->assertJsonPath('profile.initialKnowledge', [])
            ->assertJsonPath('profile.currentMastery', []);
    }
}
