<?php

namespace App\Domain\Diagnostic;

use App\Domain\Diagnostic\Contracts\GradeDiagnosticProvider;
use App\Domain\Diagnostic\Grades\SixiemeDiagnosticProvider;
use App\Domain\Diagnostic\Support\AdaptiveSelector;
use App\Domain\Diagnostic\Support\AnswerChecker;
use App\Domain\Diagnostic\Support\MasteryModel;
use App\Domain\Diagnostic\Support\ProfileBuilder;
use App\Models\DiagnosticSession;
use App\Models\DiagnosticSkillAssessment;
use App\Models\User;
use DomainException;
use InvalidArgumentException;

/**
 * The one thing DiagnosticController talks to. Owns session lifecycle and
 * every assessment decision server-side (§17: the client renders and
 * submits, it never decides correctness or mastery). Grade-specific content
 * always comes from a GradeDiagnosticProvider (see PROVIDERS below) — this
 * class itself has no 6e-specific knowledge, which is what makes adding a
 * 5e diagnostic later a matter of registering a new provider, not touching
 * this file (see docs/architecture/DIAGNOSTIC_6E.md).
 */
class DiagnosticEngine
{
    /** @var array<string, class-string<GradeDiagnosticProvider>> */
    private const PROVIDERS = [
        '6e' => SixiemeDiagnosticProvider::class,
    ];

    public static function isAvailableFor(string $grade): bool
    {
        return array_key_exists($grade, self::PROVIDERS);
    }

    public static function providerFor(string $grade): GradeDiagnosticProvider
    {
        if (! self::isAvailableFor($grade)) {
            throw new InvalidArgumentException("No diagnostic is available for grade \"{$grade}\".");
        }

        $class = self::PROVIDERS[$grade];

        return new $class;
    }

    /**
     * Idempotent: an existing in_progress session for this (user, grade) is
     * returned unchanged rather than starting a second, competing one —
     * this is what makes "start" safe to call again after a refresh.
     */
    public function startOrResume(User $user, string $grade): DiagnosticSession
    {
        $existing = DiagnosticSession::query()
            ->where('user_id', $user->id)
            ->where('grade', $grade)
            ->where('status', 'in_progress')
            ->latest('id')
            ->first();

        return $existing ?? DiagnosticSession::create([
            'user_id' => $user->id,
            'grade' => $grade,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function latestSessionFor(User $user, string $grade): ?DiagnosticSession
    {
        return DiagnosticSession::query()
            ->where('user_id', $user->id)
            ->where('grade', $grade)
            ->latest('id')
            ->first();
    }

    /**
     * The question currently presented to the student. Idempotent: calling
     * this repeatedly (e.g. on every page load while resuming) keeps
     * returning the SAME question until a response is recorded for it —
     * a refresh never silently skips or replaces the active question.
     * Null means there is nothing left to ask (the diagnostic is ready to
     * complete, or already completed).
     */
    public function currentQuestion(DiagnosticSession $session): ?array
    {
        if (! $session->isInProgress()) {
            return null;
        }

        $provider = self::providerFor($session->grade);
        $questions = $provider->questions();

        if ($session->current_question_id !== null && isset($questions[$session->current_question_id])) {
            return $this->toPublicQuestion($session->current_question_id, $questions[$session->current_question_id]);
        }

        $picked = $this->selectNext($session, $provider);
        if ($picked === null) {
            return null;
        }

        [$questionId, $question] = $picked;
        $session->update(['current_question_id' => $questionId, 'current_question_presented_at' => now()]);

        return $this->toPublicQuestion($questionId, $question);
    }

    /**
     * Records one response and returns what happens next. Idempotent by
     * question id: replaying an already-recorded response (a retried
     * request after a dropped connection, a double-tap) returns the exact
     * same outcome instead of double-counting evidence.
     *
     * @return array{isCorrect: bool, completed: bool, nextQuestion: ?array, profile: ?array}
     */
    public function submitResponse(DiagnosticSession $session, string $questionId, array $answer, ?int $responseTimeMs): array
    {
        if (! $session->isInProgress()) {
            throw new DomainException('Ce diagnostic est déjà terminé.');
        }

        $existing = $session->responses()->where('question_id', $questionId)->first();
        if ($existing) {
            return $this->afterResponse($session, $existing->is_correct);
        }

        if ($session->current_question_id !== $questionId) {
            throw new DomainException("Cette question n'est plus active pour ce diagnostic.");
        }

        $provider = self::providerFor($session->grade);
        $question = $provider->questions()[$questionId] ?? null;
        if ($question === null) {
            throw new DomainException('Question inconnue.');
        }

        $result = AnswerChecker::check($question['representation'], $answer, $question);

        $presentedAt = $session->current_question_presented_at;
        // Plain integer millisecond-timestamp subtraction, floored at 0 —
        // not Carbon's diffInMilliseconds(), whose sign/rounding behavior
        // could otherwise return a small negative float for a near-instant
        // answer (sub-second timestamp precision on the stored column vs.
        // the live clock), which then fails to insert into an
        // unsignedInteger column. This value is informational only (not
        // read by the mastery model), so exact precision doesn't matter —
        // never crashing the submission does.
        $computedResponseTimeMs = $responseTimeMs
            ?? ($presentedAt ? max(0, now()->getTimestampMs() - $presentedAt->getTimestampMs()) : null);

        $session->responses()->create([
            'question_id' => $questionId,
            'skill_id' => $question['skillId'],
            'representation' => $question['representation'],
            'difficulty' => $question['difficulty'],
            'is_correct' => $result['isCorrect'],
            'misconception_id' => $result['misconceptionId'],
            'answer' => $answer,
            'response_time_ms' => $computedResponseTimeMs,
        ]);

        $this->updateSkillAssessment($session, $provider, $question['skillId'], $result, $question['difficulty']);

        $session->update(['current_question_id' => null, 'current_question_presented_at' => null]);

        return $this->afterResponse($session, $result['isCorrect']);
    }

    private function afterResponse(DiagnosticSession $session, bool $isCorrect): array
    {
        $session->refresh();
        $provider = self::providerFor($session->grade);

        $picked = $this->selectNext($session, $provider);
        if ($picked === null) {
            return [
                'isCorrect' => $isCorrect,
                'completed' => true,
                'nextQuestion' => null,
                'profile' => $this->completeSession($session, $provider),
            ];
        }

        [$questionId, $question] = $picked;
        $session->update(['current_question_id' => $questionId, 'current_question_presented_at' => now()]);

        return [
            'isCorrect' => $isCorrect,
            'completed' => false,
            'nextQuestion' => $this->toPublicQuestion($questionId, $question),
            'profile' => null,
        ];
    }

    private function updateSkillAssessment(DiagnosticSession $session, GradeDiagnosticProvider $provider, string $skillId, array $result, int $difficulty): void
    {
        $assessment = DiagnosticSkillAssessment::firstOrNew(['session_id' => $session->id, 'skill_id' => $skillId]);

        $currentConfidence = $assessment->exists
            ? (float) $assessment->confidence
            : $this->seedConfidence($session, $provider, $skillId);

        $newConfidence = MasteryModel::updateConfidence($currentConfidence, $result['isCorrect'], $difficulty);

        $misconceptions = $assessment->misconceptions ?? [];
        if ($result['misconceptionId']) {
            $matched = false;
            foreach ($misconceptions as &$entry) {
                if ($entry['id'] === $result['misconceptionId']) {
                    $entry['count']++;
                    $matched = true;
                    break;
                }
            }
            unset($entry);
            if (! $matched) {
                $misconceptions[] = ['id' => $result['misconceptionId'], 'count' => 1];
            }
        }

        $assessment->fill([
            'session_id' => $session->id,
            'skill_id' => $skillId,
            'confidence' => $newConfidence,
            'attempts' => ($assessment->attempts ?? 0) + 1,
            'correct_count' => ($assessment->correct_count ?? 0) + ($result['isCorrect'] ? 1 : 0),
            'status' => MasteryModel::statusFor($newConfidence),
            'misconceptions' => $misconceptions,
            'last_assessed_at' => now(),
        ])->save();
    }

    private function seedConfidence(DiagnosticSession $session, GradeDiagnosticProvider $provider, string $skillId): float
    {
        $prereqIds = $provider->skills()[$skillId]['prerequisites'] ?? [];
        if ($prereqIds === []) {
            return MasteryModel::STARTING_CONFIDENCE;
        }

        $prereqAssessments = DiagnosticSkillAssessment::query()
            ->where('session_id', $session->id)
            ->whereIn('skill_id', $prereqIds)
            ->get(['confidence'])
            ->map(fn ($row) => ['confidence' => (float) $row->confidence])
            ->all();

        return MasteryModel::startingConfidence($prereqAssessments);
    }

    /**
     * @return array{0: string, 1: array}|null [questionId, question] or null to stop.
     */
    private function selectNext(DiagnosticSession $session, GradeDiagnosticProvider $provider): ?array
    {
        $skills = $provider->skills();
        $questions = $provider->questions();

        $responses = $session->responses()
            ->orderBy('id')
            ->get(['question_id', 'skill_id', 'difficulty', 'is_correct', 'misconception_id']);

        $lastBySkill = [];
        foreach ($responses as $response) {
            $lastBySkill[$response->skill_id] = $response; // last one wins — responses are ordered ascending
        }

        $rows = DiagnosticSkillAssessment::where('session_id', $session->id)->get()->keyBy('skill_id');

        $assessments = [];
        foreach ($skills as $skillId => $def) {
            $row = $rows->get($skillId);
            $last = $lastBySkill[$skillId] ?? null;

            $assessments[$skillId] = [
                'status' => $row->status ?? 'unassessed',
                'confidence' => $row ? (float) $row->confidence : MasteryModel::STARTING_CONFIDENCE,
                'attempts' => $row->attempts ?? 0,
                'lastDifficulty' => $last?->difficulty,
                'lastCorrect' => $last?->is_correct,
                'lastMisconceptionId' => $last?->misconception_id,
            ];
        }

        $questionsForSelector = [];
        foreach ($questions as $questionId => $question) {
            $questionsForSelector[$questionId] = [
                'skillId' => $question['skillId'],
                'difficulty' => $question['difficulty'],
                'verifies' => $question['verifies'] ?? null,
            ];
        }

        $picked = AdaptiveSelector::selectNext(
            $skills,
            $questionsForSelector,
            $assessments,
            $responses->pluck('question_id')->all(),
            $responses->count()
        );

        return $picked === null ? null : [$picked['questionId'], $questions[$picked['questionId']]];
    }

    private function completeSession(DiagnosticSession $session, GradeDiagnosticProvider $provider): array
    {
        $assessments = DiagnosticSkillAssessment::where('session_id', $session->id)->get()
            ->mapWithKeys(fn ($row) => [$row->skill_id => [
                'status' => $row->status,
                'confidence' => (float) $row->confidence,
                'attempts' => $row->attempts,
            ]])
            ->all();

        $profile = ProfileBuilder::build($provider->skills(), $assessments, $provider);

        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
            'current_question_id' => null,
            'current_question_presented_at' => null,
            'profile_summary' => $profile,
        ]);

        return $profile;
    }

    private function toPublicQuestion(string $questionId, array $question): array
    {
        $base = [
            'id' => $questionId,
            'representation' => $question['representation'],
            'prompt' => $question['prompt'],
        ];

        return match ($question['representation']) {
            'choice' => $base + ['choices' => $this->shuffled(array_map(
                fn ($c) => ['id' => $c['id'], 'label' => $c['label']],
                $question['choices']
            ))],
            'ordering' => $base + ['items' => $this->shuffled(array_map(
                fn ($i) => ['id' => $i['id'], 'label' => $i['label']],
                $question['items']
            ))],
            'classification' => $base + ['items' => $this->shuffled(array_map(
                fn ($i) => ['id' => $i['id'], 'text' => $i['text']],
                $question['items']
            ))],
            'numberline' => $base + ['numberLine' => $question['numberLine']],
            default => $base, // numeric, fraction — the prompt is the whole spec
        };
    }

    private function shuffled(array $items): array
    {
        shuffle($items);

        return $items;
    }
}
