<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Models\AssessmentItem;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * La frontière de confiance (Mastery V2, phase 4) : un client ne décide ni
 * la justesse, ni les learning points, ni la source, ni la difficulté, ni
 * les indices, ni l'élève.
 */
class EvidenceTrustBoundaryTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LearningPoint $lpFinal;

    private LearningPoint $lpClaimed;

    private LearningPoint $lpPractice;

    private User $student;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2, 'mastery.server_evaluation' => true]);
        PracticeCapability::forget();

        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان أنساب الأعداد والحساب', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'bahth-pgcd',
            'title' => 'البحث عن PGCD', 'status' => 'available', 'order' => 0,
        ]);
        $this->lpFinal = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_bahth-pgcd_P5', 'title' => 'P5', 'order' => 5]);
        $this->lpClaimed = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_bahth-pgcd_P4', 'title' => 'P4', 'order' => 4]);
        $this->lpPractice = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_bahth-pgcd_P3', 'title' => 'P3', 'order' => 3]);

        // L'item du test final au registre : la clé de réponse est la sienne.
        $item = AssessmentItem::create([
            'lesson_id' => $this->lesson->id, 'item_key' => 'final_test:bahth-pgcd:final:fa-e8',
            'source_kind' => 'final_test', 'exercise_code' => null, 'question_id' => 'fa-e8', 'difficulty' => 4,
            'answer_type' => 'choice', 'learning_points' => [['code' => $this->lpFinal->code, 'role' => 'primary']],
            'answer_key' => ['correct' => 0, 'optionCount' => 4], 'evaluation' => 'server', 'content_version' => 'v1',
        ]);
        $item->learningPointRows()->sync([$this->lpFinal->id => ['role' => 'primary']]);

        $this->student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $this->token = $this->student->createToken('t')->plainTextToken;
    }

    private function postApi(string $uri, array $body)
    {
        return $this->withToken($this->token)->postJson("/api/v1{$uri}", $body);
    }

    // ── Test final ───────────────────────────────────────────────────────────

    public function test_a_client_cannot_claim_correct_for_a_wrong_pick(): void
    {
        $r = $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-e8', 'attemptId' => 'x1', 'answer' => ['picked' => 2],
            'isCorrect' => true, 'learningPointCodes' => [$this->lpFinal->code],
        ]);
        $r->assertStatus(201)->assertJsonPath('outcome', 'incorrect');

        $e = LearningEvidence::where('attempt_id', 'x1')->first();
        $this->assertFalse((bool) $e->is_correct);
        $this->assertSame(EvidenceEvent::EVALUATED_BY_CLIENT_VERIFIED, $e->evaluated_by);
        $this->assertSame(4, (int) $e->difficulty, 'la difficulté vient de l\'item, pas de la requête');
    }

    public function test_a_client_cannot_credit_another_learning_point(): void
    {
        $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-e8', 'attemptId' => 'x2', 'answer' => ['picked' => 0],
            'isCorrect' => true, 'learningPointCodes' => [$this->lpClaimed->code],
        ])->assertStatus(201)->assertJsonPath('outcome', 'correct');

        $e = LearningEvidence::where('attempt_id', 'x2')->first();
        $this->assertSame([$this->lpFinal->id], $e->learningPoints->pluck('id')->all(), 'le registre décide du point, pas le client');
        $this->assertDatabaseMissing('student_learning_point_progress', ['user_id' => $this->student->id, 'learning_point_id' => $this->lpClaimed->id]);
    }

    public function test_the_v2_payload_is_judged_by_the_server_and_extra_fields_are_ignored(): void
    {
        $r = $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-e8', 'attemptId' => 'x3', 'answer' => ['picked' => 0],
            // Tout ce qui suit n'a aucun effet.
            'difficulty' => 1, 'hintsUsed' => 3, 'weight' => 9, 'userId' => 999, 'evaluatedBy' => 'server', 'level' => 1,
        ]);
        $r->assertStatus(201)->assertJsonPath('outcome', 'correct');

        $e = LearningEvidence::where('attempt_id', 'x3')->first();
        $this->assertSame($this->student->id, $e->user_id);
        $this->assertSame(EvidenceEvent::EVALUATED_BY_SERVER, $e->evaluated_by);
        $this->assertSame(4, (int) $e->difficulty);
        $this->assertSame(0, (int) $e->hints_used);
        $this->assertNull($e->level);
    }

    public function test_an_unanswered_final_test_question_is_abandoned_not_incorrect(): void
    {
        $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-e8', 'attemptId' => 'x4', 'answer' => ['picked' => null],
        ])->assertStatus(201)->assertJsonPath('outcome', 'abandoned');
        $this->assertDatabaseMissing('student_learning_point_progress', ['user_id' => $this->student->id]);
    }

    public function test_a_client_cannot_choose_the_source_and_unknown_items_are_refused_without_a_legacy_body(): void
    {
        $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-e8', 'attemptId' => 'x5', 'answer' => ['picked' => 0], 'assessmentType' => 'practice_exercise',
        ])->assertStatus(422);

        $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-unknown', 'attemptId' => 'x6', 'answer' => ['picked' => 0],
        ])->assertStatus(422);
    }

    public function test_legacy_payload_is_refused_once_the_transition_window_closes(): void
    {
        config(['mastery.accept_legacy_evidence_payload' => false]);
        $this->postApi('/lessons/bahth-pgcd/evidence', [
            'questionCode' => 'fa-unknown', 'attemptId' => 'x7', 'isCorrect' => true, 'learningPointCodes' => [$this->lpFinal->code],
        ])->assertStatus(422);
    }

    // ── Pratique ─────────────────────────────────────────────────────────────

    public function test_practice_answers_are_evaluated_by_the_server(): void
    {
        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 3])
            ->assertSuccessful();

        $attempt = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l3-001', 'questionId' => 'q1', 'attemptUuid' => $attempt,
        ])->assertSuccessful();

        // La bonne réponse est 90 (PGCD, 4AM) ; le client prétend « correct » pour 999.
        $r = $this->postApi("/practice/sessions/{$sessionId}/answers", [
            'attemptUuid' => $attempt, 'outcome' => 'correct', 'answer' => ['value' => '999'],
        ]);
        $r->assertStatus(201)
            ->assertJsonPath('evaluation.outcome', 'incorrect')
            ->assertJsonPath('attempt.evaluatedBy', 'server');

        $e = LearningEvidence::where('attempt_id', $attempt)->first();
        $this->assertFalse((bool) $e->is_correct);
        $this->assertSame('incorrect', $e->outcome);
        $this->assertSame([$this->lpPractice->id], $e->learningPoints->pluck('id')->all());
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $attempt, 'outcome' => 'incorrect', 'client_outcome' => 'correct']);

        // Et une vraie bonne réponse, écrite autrement, est reconnue équivalente.
        // (Banc bahth-pgcd en feuille d'examen depuis 2026-10-06 : une étape
        // répondue ne se rouvre plus — l'équivalence se vérifie sur l'étape
        // suivante, PGCD(765 ; 135) = 45 écrit « 90/2 ».)
        $attempt2 = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l3-001', 'questionId' => 'q2', 'attemptUuid' => $attempt2,
        ])->assertSuccessful();
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $attempt2, 'answer' => ['value' => '90/2']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'equivalent_correct');
    }

    /**
     * Le cas signalé le 2026-09-24 (qasim-adad-tabii l3-001 q2) : une erreur,
     * « أعِد المحاولة », puis la bonne réponse. La bonne réponse doit être
     * jugée juste ; la preuve de maîtrise, elle, ne retient que la première
     * issue.
     */
    public function test_a_retried_answer_is_judged_on_its_own_and_never_recorded_twice(): void
    {
        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 3])->assertSuccessful();
        $attempt = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l3-001', 'questionId' => 'q1', 'attemptUuid' => $attempt,
        ])->assertSuccessful();

        // 1. Faux.
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $attempt, 'answer' => ['value' => '3']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'incorrect')->assertJsonPath('recorded', true);

        // 2. « أعِد المحاولة », même tentative, bonne réponse : jugée juste, non enregistrée.
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $attempt, 'answer' => ['value' => '90']])
            ->assertStatus(200)
            ->assertJsonPath('duplicate', true)
            ->assertJsonPath('recorded', false)
            ->assertJsonPath('evaluation.outcome', 'correct')
            ->assertJsonPath('evaluation.isCorrect', true);

        // 3. Un vrai rejeu du PREMIER envoi renvoie toujours le verdict enregistré.
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $attempt, 'answer' => ['value' => '3']])
            ->assertStatus(200)->assertJsonPath('evaluation.outcome', 'incorrect');

        $this->assertSame(1, LearningEvidence::where('attempt_id', $attempt)->count());
        $this->assertSame('incorrect', LearningEvidence::where('attempt_id', $attempt)->value('outcome'));
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $attempt, 'outcome' => 'incorrect']);
    }

    /**
     * Feuille d'examen (BEM, 2026-10-06) : une étape auto-évaluée (`selfCheck`)
     * et une étape `counted: false` sont JUGÉES et enregistrées comme
     * tentatives, mais n'écrivent aucune preuve de maîtrise.
     */
    public function test_self_checked_and_uncounted_exam_steps_never_become_evidence(): void
    {
        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 2])->assertSuccessful();

        // « بيّن أن … » : l'élève se déclare juste après le corrigé type.
        $self = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l2-002', 'questionId' => 'q3', 'attemptUuid' => $self,
        ])->assertSuccessful();
        // 1. La démonstration écrite est enregistrée et VERROUILLÉE, en attente.
        $proof = 'PGCD(117 ; 91) = PGCD(91 ; 26) لأن 117 − 91 = 26';
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => $proof]])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'abandoned')->assertJsonPath('evaluation.normalized', 'self:pending');
        // 2. Le texte ne se modifie plus.
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => 'autre chose', 'selfMark' => 'correct']])
            ->assertStatus(422);
        // 3. Corrigé type lu, l'élève se note : une seule fois.
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => $proof, 'selfMark' => 'correct']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct')->assertJsonPath('recorded', true);
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => $proof, 'selfMark' => 'incorrect']])
            ->assertStatus(200)->assertJsonPath('recorded', false)->assertJsonPath('evaluation.outcome', 'correct');
        $this->assertSame($proof, QuestionAttempt::where('attempt_uuid', $self)->first()->submitted_answer['text']);

        // Le calcul de fraction d'un sujet de BEM : juste, mais hors de cette leçon.
        $uncounted = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l2-002', 'questionId' => 'q4', 'attemptUuid' => $uncounted,
        ])->assertSuccessful();
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $uncounted, 'answer' => ['value' => '9/7']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct');

        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $self, 'outcome' => 'correct']);
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $uncounted, 'outcome' => 'correct']);
        $this->assertSame(0, LearningEvidence::whereIn('attempt_id', [$self, $uncounted])->count());
        $this->assertDatabaseMissing('student_learning_point_progress', ['user_id' => $this->student->id]);
    }

    /**
     * Feuille d'examen (BEM, 2026-10-06) : une étape répondue est VERROUILLÉE.
     * La rouvrir (retour en arrière, rechargement) rend la même tentative avec
     * la réponse enregistrée — jamais une nouvelle tentative — et la séance
     * relit ses réponses depuis la base.
     */
    public function test_an_answered_exam_step_reopens_locked_with_its_saved_answer(): void
    {
        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 3])->assertSuccessful();

        $first = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l3-004', 'questionId' => 'q1', 'attemptUuid' => $first,
        ])->assertSuccessful()->assertJsonPath('attempt.answered', false);
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $first, 'answer' => ['value' => '270']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'incorrect');

        // Rouvrir avec un AUTRE identifiant : on récupère la tentative d'origine, verrouillée.
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l3-004', 'questionId' => 'q1', 'attemptUuid' => (string) Str::uuid(),
        ])->assertSuccessful()
            ->assertJsonPath('attempt.attemptUuid', $first)
            ->assertJsonPath('attempt.answered', true)
            ->assertJsonPath('attempt.answer.value', '270')
            ->assertJsonPath('attempt.outcome', 'incorrect');
        $this->assertSame(1, \App\Models\QuestionAttempt::where('user_id', $this->student->id)->where('question_id', 'q1')->count());

        $this->withToken($this->token)->getJson("/api/v1/practice/sessions/{$sessionId}/answers")
            ->assertOk()
            ->assertJsonPath('exercises.0.exerciseId', 'ex-4am-bahth-pgcd-l3-004')
            ->assertJsonPath('exercises.0.questions.0.answer.value', '270')
            ->assertJsonPath('exercises.0.questions.0.outcome', 'incorrect');
    }

    /** La « خزانة الميداليات » (2026-10-06) : déduite des réponses enregistrées. */
    public function test_medals_are_derived_from_saved_answers(): void
    {
        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 3])->assertSuccessful();

        // q1 juste, sans إرشاد, en 20 s (temps de l'étape : 210 s) → or.
        $gold = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", ['exerciseId' => 'ex-4am-bahth-pgcd-l3-004', 'questionId' => 'q1', 'attemptUuid' => $gold])->assertSuccessful();
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $gold, 'answer' => ['value' => '135', 'seconds' => 20]])->assertStatus(201);
        // q2 fausse → rien.
        $wrong = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", ['exerciseId' => 'ex-4am-bahth-pgcd-l3-004', 'questionId' => 'q2', 'attemptUuid' => $wrong])->assertSuccessful();
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $wrong, 'answer' => ['value' => '9/7', 'seconds' => 20]])->assertStatus(201);

        $this->withToken($this->token)->getJson('/api/v1/lessons/bahth-pgcd/practice/medals')
            ->assertOk()
            ->assertJsonPath('total.gold', 1)
            ->assertJsonPath('total.silver', 0)
            ->assertJsonPath('total.points', 3)
            ->assertJsonPath('levels.3.gold', 1);
    }

    public function test_a_teacher_cannot_write_evidence(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $this->withToken($teacher->createToken('t')->plainTextToken)
            ->postJson('/api/v1/lessons/bahth-pgcd/evidence', ['questionCode' => 'fa-e8', 'attemptId' => 'x9', 'answer' => ['picked' => 0]])
            ->assertStatus(403);
    }
}
