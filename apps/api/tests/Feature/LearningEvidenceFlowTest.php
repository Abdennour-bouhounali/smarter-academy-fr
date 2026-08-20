<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningEvidenceFlowTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private Lesson $otherLesson;

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
        LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '6e_resolution-problemes_P2', 'title' => 'Extraire', 'order' => 2]);

        $this->otherLesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions',
            'title' => 'Fractions', 'status' => 'available', 'order' => 1,
        ]);
        LearningPoint::create(['lesson_id' => $this->otherLesson->id, 'code' => '6e_fractions_P1', 'title' => 'Construire une fraction', 'order' => 1]);
    }

    private function studentToken(array $attributes = []): array
    {
        $user = User::factory()->create(array_merge(['role' => 'student', 'grade' => '6e'], $attributes));
        $token = $user->createToken('student-token')->plainTextToken;

        return [$user, $token];
    }

    private function submitEvidence(string $token, array $overrides = [], string $lessonCode = 'resolution-problemes')
    {
        return $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/lessons/{$lessonCode}/evidence", array_merge([
                'questionCode' => 'rp-flash-01',
                'attemptId' => 'attempt-0001',
                'isCorrect' => true,
                'learningPointCodes' => ['6e_resolution-problemes_P1'],
            ], $overrides));
    }

    public function test_valid_evidence_is_stored_and_updates_learning_point_progress(): void
    {
        [$user, $token] = $this->studentToken();

        $this->submitEvidence($token)->assertStatus(201)->assertJsonPath('success', true);

        $this->assertDatabaseHas('learning_evidence', [
            'user_id' => $user->id,
            'lesson_id' => $this->lesson->id,
            'question_code' => 'rp-flash-01',
            'is_correct' => true,
        ]);
        $this->assertDatabaseHas('student_learning_point_progress', [
            'user_id' => $user->id,
            'attempts' => 1,
            'correct_count' => 1,
        ]);
    }

    public function test_a_learning_point_code_from_another_lesson_is_rejected_with_422(): void
    {
        [$user, $token] = $this->studentToken();

        // '6e_fractions_P1' is a real learning point — but of a DIFFERENT
        // lesson, so submitting it against resolution-problemes must fail:
        // this is the "validate the relationship server-side" requirement.
        $this->submitEvidence($token, ['learningPointCodes' => ['6e_fractions_P1']])
            ->assertStatus(422);

        $this->assertDatabaseCount('learning_evidence', 0);
        $this->assertDatabaseCount('student_learning_point_progress', 0);
    }

    public function test_an_unknown_learning_point_code_is_rejected_with_422(): void
    {
        [, $token] = $this->studentToken();

        $this->submitEvidence($token, ['learningPointCodes' => ['6e_resolution-problemes_P99']])
            ->assertStatus(422);
    }

    public function test_a_retired_learning_point_no_longer_accepts_new_evidence(): void
    {
        [, $token] = $this->studentToken();
        LearningPoint::where('code', '6e_resolution-problemes_P1')->update(['retired_at' => now()]);

        $this->submitEvidence($token)->assertStatus(422);
    }

    public function test_an_unknown_lesson_code_is_a_404(): void
    {
        [, $token] = $this->studentToken();

        $this->submitEvidence($token, [], 'not-a-lesson')->assertStatus(404);
    }

    public function test_unauthenticated_submission_is_rejected(): void
    {
        $this->postJson('/api/v1/lessons/resolution-problemes/evidence', [
            'questionCode' => 'rp-flash-01',
            'attemptId' => 'attempt-0001',
            'isCorrect' => true,
            'learningPointCodes' => ['6e_resolution-problemes_P1'],
        ])->assertStatus(401);
    }

    public function test_a_duplicate_attempt_id_is_idempotent_and_never_double_counts(): void
    {
        [$user, $token] = $this->studentToken();

        $this->submitEvidence($token)->assertStatus(201)->assertJsonPath('duplicate', false);
        // Same attemptId replayed (dropped connection, queue flushing twice).
        $this->submitEvidence($token)->assertStatus(200)->assertJsonPath('duplicate', true);

        $this->assertDatabaseCount('learning_evidence', 1);
        $this->assertDatabaseHas('student_learning_point_progress', [
            'user_id' => $user->id,
            'attempts' => 1, // not 2 — the replay added no evidence
        ]);
    }

    public function test_non_assessment_types_are_rejected_server_side(): void
    {
        [, $token] = $this->studentToken();

        // Defense in depth: even if a misconfigured client tags a practice
        // question as submittable, the server refuses to turn it into
        // authoritative mastery evidence.
        foreach (['practice', 'discovery'] as $type) {
            $this->submitEvidence($token, ['assessmentType' => $type, 'attemptId' => "attempt-{$type}"])
                ->assertStatus(422);
        }

        $this->assertDatabaseCount('learning_evidence', 0);
    }

    public function test_a_student_cannot_replay_another_students_attempt_id(): void
    {
        // The owner's evidence is seeded directly rather than via a real HTTP
        // request: Sanctum's RequestGuard caches the resolved user across
        // calls within one test method (see the identical caveat in
        // DiagnosticFlowTest / AuthenticationFlowTest), so authenticating as
        // two users in one method would pass for the wrong reason.
        $owner = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        \App\Models\LearningEvidence::create([
            'user_id' => $owner->id,
            'lesson_id' => $this->lesson->id,
            'question_code' => 'rp-flash-01',
            'attempt_id' => 'attempt-0001',
            'is_correct' => true,
            'assessment_type' => 'assessment',
            'submitted_at' => now(),
        ]);

        [, $intruderToken] = $this->studentToken(['email' => 'intruder@student.test']);

        // The intruder reusing the owner's attemptId must not read the
        // owner's evidence back as their own "duplicate".
        $this->submitEvidence($intruderToken)->assertStatus(422);

        $this->assertDatabaseCount('learning_evidence', 1);
    }

    public function test_incorrect_evidence_lowers_confidence_and_correct_evidence_raises_it(): void
    {
        [$user, $token] = $this->studentToken();

        $this->submitEvidence($token, ['attemptId' => 'a1', 'isCorrect' => false]);
        $afterMiss = (float) \App\Models\StudentLearningPointProgress::where('user_id', $user->id)->first()->confidence;
        $this->assertLessThan(0.5, $afterMiss);

        $this->submitEvidence($token, ['attemptId' => 'a2', 'isCorrect' => true]);
        $afterHit = (float) \App\Models\StudentLearningPointProgress::where('user_id', $user->id)->first()->confidence;
        $this->assertGreaterThan($afterMiss, $afterHit);
    }

    public function test_a_duplicated_lesson_code_across_grades_resolves_to_the_lesson_owning_the_learning_points(): void
    {
        // Lesson codes are NOT globally unique — 'resolution-problemes'
        // exists for both 6e and 3e. The learning-point codes (globally
        // unique, grade-embedded) are what disambiguate.
        $grade3e = Grade::create(['code' => '3e', 'name' => '3ème', 'level' => 'college']);
        $chapter3e = Chapter::create(['grade_id' => $grade3e->id, 'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0]);
        $lesson3e = Lesson::create([
            'chapter_id' => $chapter3e->id, 'code' => 'resolution-problemes',
            'title' => 'Résolution de problèmes (3e)', 'status' => 'coming_soon', 'order' => 0,
        ]);
        LearningPoint::create(['lesson_id' => $lesson3e->id, 'code' => '3e_resolution-problemes_P1', 'title' => 'Comprendre (3e)', 'order' => 1]);

        [$user, $token] = $this->studentToken();

        // Submitting the 6e learning point lands on the 6e lesson...
        $this->submitEvidence($token)->assertStatus(201);
        $this->assertDatabaseHas('learning_evidence', ['user_id' => $user->id, 'lesson_id' => $this->lesson->id]);

        // ...and mixing learning points from the two same-code lessons is rejected.
        $this->submitEvidence($token, [
            'attemptId' => 'attempt-mixed',
            'learningPointCodes' => ['6e_resolution-problemes_P1', '3e_resolution-problemes_P1'],
        ])->assertStatus(422);
    }

    public function test_one_evidence_event_can_credit_multiple_learning_points(): void
    {
        [$user, $token] = $this->studentToken();

        $this->submitEvidence($token, [
            'learningPointCodes' => ['6e_resolution-problemes_P1', '6e_resolution-problemes_P2'],
        ])->assertStatus(201);

        $this->assertDatabaseCount('learning_evidence', 1);
        $this->assertDatabaseCount('learning_evidence_learning_point', 2);
        $this->assertSame(2, \App\Models\StudentLearningPointProgress::where('user_id', $user->id)->count());
    }
}
