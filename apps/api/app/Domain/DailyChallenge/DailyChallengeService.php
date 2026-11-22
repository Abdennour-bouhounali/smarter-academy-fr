<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Classroom\StudyContextService;
use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\ProgressEngine;
use App\Models\Classroom;
use App\Models\DailyChallenge;
use App\Models\DailyChallengeAnswer;
use App\Models\DailyChallengeAttempt;
use App\Models\DailyChallengeQuestion;
use App\Models\DailyChallengeStanding;
use App\Models\User;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Le cycle de vie du défi quotidien, côté élève.
 *
 * Ce que le SERVEUR possède, sans exception : la portée (classe ou élève), le
 * défi du jour et ses questions, l'ordre des questions, l'instant où chaque
 * question est servie et celui où sa réponse arrive, la justesse, le score,
 * la série, le cumul et le rang. Le client envoie une position et une
 * réponse brute ; rien d'autre n'est lu.
 *
 *   today()   → le défi du jour (généré une fois par portée et par jour)
 *   start()   → LA tentative (unique par défi et élève : second onglet ou
 *               rechargement retrouvent la même)
 *   next()    → sert la question suivante et fige son `started_at`
 *               (une seule question ouverte à la fois : pas de coup d'œil)
 *   answer()  → juge, score, preuve (ProgressEngine), sous verrou
 *   finalize()→ série, score du jour, cumul, rang avant/après — une fois
 *
 * La maîtrise et le jeu restent séparés : la preuve passe par la SEULE porte
 * (ProgressEngine::recordEvidence, poids de pratique, item du registre) ; les
 * points ne touchent jamais l'état de maîtrise.
 */
class DailyChallengeService
{
    public function __construct(
        private DailyChallengeConfig $config,
        private ChallengeQuestionSelector $selector,
        private ChallengeQuestionPresenter $presenter,
        private DailyChallengeScoringService $scoring,
        private DailyChallengeLeaderboard $leaderboard,
        private StudyContextService $studyContext,
        private AnswerEvaluator $evaluator,
        private ProgressEngine $progress,
    ) {}

    // ── Contexte ────────────────────────────────────────────────────────────

    /**
     * La portée du défi de cet élève aujourd'hui.
     *
     * Élève d'une classe dont l'enseignant a activé le défi → le défi de la
     * CLASSE (mêmes questions pour tous). Sinon — indépendant, ou classe où
     * le défi est désactivé — un défi PERSONNEL, sans aucune donnée de classe.
     *
     * @return array{scopeType: string, scopeId: int, classroom: ?Classroom, class: ?array}
     */
    public function context(User $student): array
    {
        $primary = $this->studyContext->resolve($student)['primary'] ?? null;
        if ($primary !== null) {
            $classroom = Classroom::find($primary['id']);
            if ($classroom !== null && $classroom->isActive()) {
                $class = $this->config->forClassroom($classroom);
                if ($class['enabled']) {
                    return ['scopeType' => DailyChallenge::SCOPE_CLASSROOM, 'scopeId' => $classroom->id, 'classroom' => $classroom, 'class' => $class];
                }
            }
        }

        return ['scopeType' => DailyChallenge::SCOPE_STUDENT, 'scopeId' => $student->id, 'classroom' => null, 'class' => null];
    }

    public function calendar(): ChallengeCalendar
    {
        return ChallengeCalendar::fromConfig($this->config);
    }

    // ── Aujourd'hui ─────────────────────────────────────────────────────────

    /** Ce que l'écran d'accueil du défi affiche. */
    public function today(User $student): array
    {
        $this->expireStale($student);

        $calendar = $this->calendar();
        $date = $calendar->today();
        $ctx = $this->context($student);
        $streak = $this->streak($student, $date);
        $standing = $this->leaderboard->rankOf($ctx['scopeType'], $ctx['scopeId'], $student->id, $date);
        $best = (int) DailyChallengeAttempt::where('user_id', $student->id)->where('status', '!=', DailyChallengeAttempt::STATUS_IN_PROGRESS)->max('total_score');

        $base = [
            'date' => $date,
            'scope' => $this->scopeView($ctx),
            'streak' => $streak,
            'cumulativeScore' => $standing['score'] ?? 0,
            'personalBest' => $best,
            'competition' => $this->competitionView($ctx, $student, $date),
        ];

        $reason = null;
        if (! $this->config->get('challenge.enabled', true)) {
            $reason = ChallengeException::DISABLED;
        } elseif (! $calendar->isChallengeDay($date)) {
            $reason = ChallengeException::REST_DAY;
        }
        if ($reason !== null) {
            return $base + ['available' => false, 'reason' => $reason, 'challenge' => null, 'attempt' => null];
        }

        $challenge = $this->challengeFor($ctx, $date, $student);
        $attempt = DailyChallengeAttempt::where('daily_challenge_id', $challenge->id)->where('user_id', $student->id)->first();
        $count = $challenge->questions()->count();
        [$from, $until] = $this->window($ctx);

        if ($count === 0) {
            $reason = ChallengeException::NOTHING_TO_REVIEW;
        } elseif ($attempt === null && ! $calendar->windowOpen($from, $until)) {
            $reason = ChallengeException::WINDOW_CLOSED;
        }

        $scoring = $challenge->config_snapshot['scoring'];

        return $base + [
            'available' => $reason === null,
            'reason' => $reason,
            'window' => ['from' => $from, 'until' => $until],
            'challenge' => [
                'questionCount' => $count,
                'estimatedMinutes' => max(1, (int) ceil($count * (int) $this->config->get('challenge.estimated_seconds_per_question', 45) / 60)),
                'maxPossible' => $this->scoring->maxPossible($count, $streak['current'] + ($attempt?->isFinished() ? 0 : 1), $scoring),
                'basePoints' => (int) $scoring['base_points'],
                'maxSpeedBonus' => $this->scoring->maxSpeedBonusFor(max(1, $count), $scoring),
                'attemptWindowMinutes' => (int) $challenge->config_snapshot['attemptWindowMinutes'],
            ],
            'attempt' => $attempt ? $this->attemptSummary($attempt) : null,
        ];
    }

    /**
     * Le défi (portée, jour) — créé une fois. Deux requêtes simultanées ne
     * peuvent pas en créer deux : la contrainte unique tranche, la perdante
     * relit celui de la gagnante.
     */
    public function challengeFor(array $ctx, string $date, ?User $student = null): DailyChallenge
    {
        $existing = DailyChallenge::where('scope_type', $ctx['scopeType'])->where('scope_id', $ctx['scopeId'])->where('challenge_date', $date)->first();
        if ($existing !== null) {
            return $existing;
        }

        $count = $this->config->clampCount($ctx['class']['questionCount'] ?? null);
        $snapshot = $this->config->snapshot($ctx['class'], $count);
        $picked = $this->selector->select($ctx['scopeType'], $ctx['scopeId'], $date, $snapshot, $student);

        try {
            return DB::transaction(function () use ($ctx, $date, $snapshot, $picked) {
                $challenge = DailyChallenge::create([
                    'scope_type' => $ctx['scopeType'],
                    'scope_id' => $ctx['scopeId'],
                    'challenge_date' => $date,
                    'config_snapshot' => $snapshot,
                    'status' => $picked === [] ? DailyChallenge::STATUS_EMPTY : DailyChallenge::STATUS_GENERATED,
                ]);
                foreach ($picked as $i => $q) {
                    DailyChallengeQuestion::create([
                        'daily_challenge_id' => $challenge->id,
                        'position' => $i + 1,
                        'lesson_id' => $q['lessonId'],
                        'exercise_code' => $q['exerciseCode'],
                        'question_id' => $q['questionId'],
                        'item_key' => $q['itemKey'],
                        'learning_point_id' => $q['learningPointId'],
                        'template_key' => $q['templateKey'],
                        'difficulty' => $q['difficulty'],
                        'answer_type' => $q['answerType'],
                        'reason' => $q['reason'],
                    ]);
                }

                return $challenge;
            });
        } catch (QueryException $e) {
            $again = DailyChallenge::where('scope_type', $ctx['scopeType'])->where('scope_id', $ctx['scopeId'])->where('challenge_date', $date)->first();
            if ($again === null) {
                throw $e;
            }

            return $again;
        }
    }

    // ── Tentative ───────────────────────────────────────────────────────────

    /** Ouvre (ou retrouve) LA tentative d'aujourd'hui. */
    public function start(User $student): DailyChallengeAttempt
    {
        $this->expireStale($student);
        if (! $this->config->get('challenge.enabled', true)) {
            throw new ChallengeException(ChallengeException::DISABLED);
        }
        $calendar = $this->calendar();
        $date = $calendar->today();
        if (! $calendar->isChallengeDay($date)) {
            throw new ChallengeException(ChallengeException::REST_DAY);
        }

        $ctx = $this->context($student);
        $challenge = $this->challengeFor($ctx, $date, $student);

        $existing = DailyChallengeAttempt::where('daily_challenge_id', $challenge->id)->where('user_id', $student->id)->first();
        if ($existing !== null) {
            return $existing;
        }

        $count = $challenge->questions()->count();
        if ($count === 0) {
            throw new ChallengeException(ChallengeException::NOTHING_TO_REVIEW);
        }
        [$from, $until] = $this->window($ctx);
        if (! $calendar->windowOpen($from, $until)) {
            throw new ChallengeException(ChallengeException::WINDOW_CLOSED);
        }

        try {
            return DailyChallengeAttempt::create([
                'uuid' => (string) Str::uuid(),
                'daily_challenge_id' => $challenge->id,
                'user_id' => $student->id,
                'scope_type' => $challenge->scope_type,
                'scope_id' => $challenge->scope_id,
                'challenge_date' => $date,
                'status' => DailyChallengeAttempt::STATUS_IN_PROGRESS,
                'started_at' => now(),
                'expires_at' => now()->addMinutes((int) $challenge->config_snapshot['attemptWindowMinutes']),
                'question_count' => $count,
            ]);
        } catch (QueryException $e) {
            // Deux onglets au même instant : la contrainte unique garde une seule tentative.
            return DailyChallengeAttempt::where('daily_challenge_id', $challenge->id)->where('user_id', $student->id)->firstOrFail();
        }
    }

    /** La tentative de CET élève, ou 404 — jamais celle d'un autre. */
    public function owned(User $student, string $uuid): DailyChallengeAttempt
    {
        $attempt = DailyChallengeAttempt::where('uuid', $uuid)->first();
        if ($attempt === null || $attempt->user_id !== $student->id) {
            throw new ChallengeException(ChallengeException::NOT_FOUND);
        }
        $this->expireIfDue($attempt);

        return $attempt->fresh();
    }

    /** L'état d'une tentative : réponses déjà données (avec correction) et question courante. */
    public function state(DailyChallengeAttempt $attempt): array
    {
        $challenge = $attempt->challenge()->with('questions.lesson:id,code', 'questions.learningPoint:id,code,title')->first();
        $answers = $attempt->answers()->get()->keyBy('position');

        $done = [];
        $current = null;
        foreach ($challenge->questions as $q) {
            $a = $answers->get($q->position);
            if ($a !== null && $a->submitted_at !== null) {
                $done[] = $this->answerView($q, $a, reveal: true);
            } elseif ($a !== null && $current === null && ! $attempt->isFinished()) {
                $current = $this->openView($attempt, $q, $a);
            }
        }

        return [
            'attempt' => $this->attemptSummary($attempt),
            'answered' => $done,
            'current' => $current,
            'serverNow' => now()->format('Y-m-d\TH:i:s.vP'),
        ];
    }

    /**
     * Sert la question suivante. Idempotent : une question déjà ouverte et
     * non répondue est RENVOYÉE, avec son `started_at` d'origine — recharger
     * la page ne remet pas le chronomètre à zéro.
     */
    public function next(DailyChallengeAttempt $attempt): ?array
    {
        if ($attempt->isFinished()) {
            throw new ChallengeException(ChallengeException::FINISHED);
        }

        return DB::transaction(function () use ($attempt) {
            $locked = DailyChallengeAttempt::whereKey($attempt->id)->lockForUpdate()->first();
            if ($locked->isFinished()) {
                throw new ChallengeException(ChallengeException::FINISHED);
            }
            $questions = DailyChallengeQuestion::where('daily_challenge_id', $locked->daily_challenge_id)->orderBy('position')
                ->with('lesson:id,code', 'learningPoint:id,code,title')->get();
            $answers = DailyChallengeAnswer::where('daily_challenge_attempt_id', $locked->id)->get()->keyBy('position');

            foreach ($questions as $q) {
                $a = $answers->get($q->position);
                if ($a === null) {
                    $a = DailyChallengeAnswer::create([
                        'daily_challenge_attempt_id' => $locked->id,
                        'daily_challenge_question_id' => $q->id,
                        'position' => $q->position,
                        'started_at' => now(),
                        'evidence_attempt_id' => (string) Str::uuid(),
                    ]);

                    return $this->openView($locked, $q, $a);
                }
                if ($a->submitted_at === null) {
                    return $this->openView($locked, $q, $a);
                }
            }

            return null;
        });
    }

    /**
     * Enregistre la réponse à la question ouverte.
     *
     * Rejeu du MÊME envoi (réseau, double appui) → le verdict enregistré ;
     * une AUTRE réponse à une question déjà répondue → 409. Une réponse ne
     * change jamais après sa soumission.
     */
    public function answer(User $student, DailyChallengeAttempt $attempt, int $position, mixed $answer): array
    {
        if ($attempt->status === DailyChallengeAttempt::STATUS_EXPIRED) {
            throw new ChallengeException(ChallengeException::EXPIRED);
        }

        $result = DB::transaction(function () use ($student, $attempt, $position, $answer) {
            $locked = DailyChallengeAttempt::whereKey($attempt->id)->lockForUpdate()->first();
            $row = DailyChallengeAnswer::where('daily_challenge_attempt_id', $locked->id)->where('position', $position)->lockForUpdate()->first();

            if ($row === null) {
                throw new ChallengeException(ChallengeException::NOT_OPENED);
            }
            $question = DailyChallengeQuestion::with('lesson:id,code', 'learningPoint:id,code,title')->find($row->daily_challenge_question_id);

            if ($row->submitted_at !== null) {
                if ($row->answer == $answer) {
                    return ['duplicate' => true, 'answer' => $this->answerView($question, $row, reveal: true)];
                }
                throw new ChallengeException(ChallengeException::ALREADY_ANSWERED);
            }
            if ($locked->isFinished()) {
                throw new ChallengeException(ChallengeException::FINISHED);
            }

            $submittedAt = now();
            if ($submittedAt->greaterThan($locked->expires_at)) {
                throw new ChallengeException(ChallengeException::EXPIRED);
            }

            $snapshot = $locked->challenge->config_snapshot;
            $content = $this->presenter->content($question, $question->lesson->code);
            if ($content === null) {
                // Contenu retiré depuis la génération : la question ne compte pas contre l'élève.
                $evaluation = ['outcome' => Outcome::Abandoned->value, 'misconceptionId' => null];
            } else {
                $evaluation = $this->evaluator->evaluate($answer, $content);
            }

            $responseMs = max(0, (int) $row->started_at->diffInMilliseconds($submittedAt, false));
            $score = $this->scoring->calculateQuestionScore($evaluation['outcome'], $responseMs, (int) $locked->question_count, $snapshot['scoring']);

            $row->fill([
                'submitted_at' => $submittedAt,
                'response_time_ms' => $responseMs,
                'answer' => $answer,
                'outcome' => $evaluation['outcome'],
                'is_correct' => in_array($evaluation['outcome'], Outcome::successValues(), true),
                'base_score' => $score['base'],
                'speed_bonus' => $score['speed'],
                'final_score' => $score['total'],
            ])->save();

            $locked->increment('answered_count');

            if ($content !== null) {
                $this->recordEvidence($student, $locked, $question, $row, $content, $evaluation);
            }

            return ['duplicate' => false, 'answer' => $this->answerView($question, $row, reveal: true)];
        });

        $attempt = $attempt->fresh();
        $remaining = DailyChallengeQuestion::where('daily_challenge_id', $attempt->daily_challenge_id)->count()
            - DailyChallengeAnswer::where('daily_challenge_attempt_id', $attempt->id)->whereNotNull('submitted_at')->count();
        if ($remaining <= 0 && ! $attempt->isFinished()) {
            $attempt = $this->finalize($attempt, DailyChallengeAttempt::STATUS_COMPLETED);
        }

        return $result + ['attempt' => $this->attemptSummary($attempt), 'remaining' => max(0, $remaining)];
    }

    /**
     * La preuve d'apprentissage : par la SEULE porte, comme une question de
     * pratique (même item du registre, même poids), la provenance « défi »
     * dans `source_id`. Une preuve qui échoue ne casse pas le jeu : elle est
     * journalisée.
     */
    private function recordEvidence(User $student, DailyChallengeAttempt $attempt, DailyChallengeQuestion $question, DailyChallengeAnswer $row, array $content, array $evaluation): void
    {
        $refs = array_values(array_map(
            fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
            $content['learningPoints'] ?? [],
        ));
        if ($refs === []) {
            return;
        }

        try {
            $this->progress->recordEvidence($student, $question->lesson->code, [
                'questionCode' => "{$question->exercise_code}:{$question->question_id}",
                'exerciseCode' => $question->exercise_code,
                'questionId' => $question->question_id,
                'attemptId' => $row->evidence_attempt_id,
                'outcome' => $evaluation['outcome'],
                'learningPointRefs' => $refs,
                'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
                'difficulty' => $question->difficulty,
                'templateKey' => $question->template_key,
                'hintsUsed' => 0,
                'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
                'misconceptionId' => $evaluation['misconceptionId'] ?? null,
                'sourceId' => self::evidenceSourceId($attempt),
                'answer' => is_array($row->answer) ? $row->answer : null,
                'submittedAt' => $row->submitted_at?->toIso8601String(),
            ]);
        } catch (DomainException $e) {
            Log::channel(config('mastery.log_channel', 'mastery'))->warning('daily_challenge.evidence_failed', [
                'attempt' => $attempt->uuid, 'position' => $row->position, 'error' => $e->getMessage(),
            ]);
        }
    }

    /** La provenance d'une preuve de défi, dans `learning_evidence.source_id`. */
    public static function evidenceSourceId(DailyChallengeAttempt $attempt): string
    {
        return 'daily_challenge:'.$attempt->uuid;
    }

    /** Clôt explicitement (idempotent). */
    public function complete(DailyChallengeAttempt $attempt): DailyChallengeAttempt
    {
        return $attempt->isFinished() ? $attempt : $this->finalize($attempt, DailyChallengeAttempt::STATUS_COMPLETED);
    }

    /**
     * LA clôture : score du jour, série, cumul, rang. Une seule fois, sous
     * verrou — deux onglets qui terminent ensemble ne comptent pas deux fois.
     */
    public function finalize(DailyChallengeAttempt $attempt, string $status): DailyChallengeAttempt
    {
        return DB::transaction(function () use ($attempt, $status) {
            $locked = DailyChallengeAttempt::whereKey($attempt->id)->lockForUpdate()->first();
            if ($locked->isFinished()) {
                return $locked;
            }
            $challenge = $locked->challenge;
            $snapshot = $challenge->config_snapshot;
            $scoring = $snapshot['scoring'];
            $date = $locked->challenge_date->format('Y-m-d');
            $student = $locked->user;

            // Ouverte mais sans réponse : abandonnée — 0 point, preuve inerte.
            $open = DailyChallengeAnswer::where('daily_challenge_attempt_id', $locked->id)->whereNull('submitted_at')->with('question.lesson:id,code')->get();
            foreach ($open as $row) {
                $row->fill(['outcome' => Outcome::Abandoned->value, 'is_correct' => false])->save();
                $content = $this->presenter->content($row->question, $row->question->lesson->code);
                if ($content !== null) {
                    $this->recordEvidence($student, $locked, $row->question, $row, $content, ['outcome' => Outcome::Abandoned->value]);
                }
            }

            $answers = DailyChallengeAnswer::where('daily_challenge_attempt_id', $locked->id)->whereNotNull('submitted_at')->get();
            $correct = $answers->where('is_correct', true)->count();
            $partial = $answers->where('outcome', Outcome::PartiallyCorrect->value)->count();
            $answered = $answers->count();
            $totalMs = (int) $answers->sum('response_time_ms');
            $participated = $answered > 0;

            $calendar = ChallengeCalendar::fromSnapshot($snapshot);
            $streakBefore = $calendar->streakEndingBefore($date, $this->playedDates($locked->user_id, $locked->id));
            $streakAfter = $participated ? $streakBefore + 1 : 0;
            $streakBonus = $participated ? $this->scoring->calculateContinuityBonus($streakAfter, $correct, $scoring) : 0;
            $daily = $this->scoring->calculateChallengeScore(
                $answers->map(fn ($a) => ['base' => (int) $a->base_score, 'speed' => (int) $a->speed_bonus])->all(),
                $streakBonus,
                $scoring,
            );

            $rankBefore = null;
            $rankAfter = null;
            $penalty = 0;
            if ($participated) {
                $rankBefore = $this->leaderboard->rankOf($locked->scope_type, $locked->scope_id, $locked->user_id, $date)['rank'] ?? null;

                $standing = DailyChallengeStanding::where('scope_type', $locked->scope_type)->where('scope_id', $locked->scope_id)
                    ->where('user_id', $locked->user_id)->lockForUpdate()->first()
                    ?? new DailyChallengeStanding(['scope_type' => $locked->scope_type, 'scope_id' => $locked->scope_id, 'user_id' => $locked->user_id]);

                $previous = (int) ($standing->cumulative_score ?? 0);
                $last = $standing->last_completed_date?->format('Y-m-d');
                if ($last !== null) {
                    $missed = $calendar->challengeDaysBetween($last, $date);
                    $penalty = min($previous, $this->scoring->calculateMissedDayAdjustment($missed, $scoring));
                }

                $standing->fill([
                    'cumulative_score' => $this->scoring->calculateCumulativeScore($previous, $daily['total'], $penalty),
                    'challenges_completed' => (int) $standing->challenges_completed + 1,
                    'total_correct' => (int) $standing->total_correct + $correct,
                    'total_answered' => (int) $standing->total_answered + $answered,
                    'total_response_ms' => (int) $standing->total_response_ms + $totalMs,
                    'penalties_total' => (int) $standing->penalties_total + $penalty,
                    'last_completed_date' => $date,
                    'penalty_settled_through' => $date,
                    'score_reached_at' => ($daily['total'] > 0 || $penalty > 0) ? now() : ($standing->score_reached_at ?? now()),
                ])->save();
            }

            $locked->fill([
                'status' => $status,
                'completed_at' => now(),
                'answered_count' => $answered,
                'correct_count' => $correct,
                'partial_count' => $partial,
                'base_score' => $daily['base'],
                'speed_score' => $daily['speed'],
                'streak_bonus' => $daily['streak'],
                'total_score' => $daily['total'],
                'penalty_applied' => $penalty,
                'total_response_ms' => $totalMs,
                'average_response_time_ms' => $answered > 0 ? (int) round($totalMs / $answered) : null,
                'streak_before' => $streakBefore,
                'streak_after' => $streakAfter,
                'rank_before' => $rankBefore,
            ])->save();

            if ($participated) {
                $locked->rank_after = $this->leaderboard->rankOf($locked->scope_type, $locked->scope_id, $locked->user_id, $date)['rank'] ?? null;
                $locked->save();
            }

            return $locked;
        });
    }

    /** Une tentative dont le temps est écoulé est close (idempotent). */
    public function expireIfDue(DailyChallengeAttempt $attempt): void
    {
        if (! $attempt->isFinished() && now()->greaterThan($attempt->expires_at)) {
            $this->finalize($attempt, DailyChallengeAttempt::STATUS_EXPIRED);
        }
    }

    /** Les tentatives de l'élève laissées ouvertes et échues — closes à sa prochaine visite. */
    private function expireStale(User $student): void
    {
        DailyChallengeAttempt::where('user_id', $student->id)
            ->where('status', DailyChallengeAttempt::STATUS_IN_PROGRESS)
            ->where('expires_at', '<', now())
            ->get()
            ->each(fn ($a) => $this->finalize($a, DailyChallengeAttempt::STATUS_EXPIRED));
    }

    // ── Série ───────────────────────────────────────────────────────────────

    /** @return array<string, true> les jours où l'élève a joué (au moins une réponse) */
    private function playedDates(int $userId, ?int $exceptAttemptId = null): array
    {
        $dates = DailyChallengeAttempt::where('user_id', $userId)
            ->where('status', '!=', DailyChallengeAttempt::STATUS_IN_PROGRESS)
            ->where('answered_count', '>', 0)
            ->when($exceptAttemptId, fn ($q) => $q->where('id', '!=', $exceptAttemptId))
            ->where('challenge_date', '>=', now()->subDays(400)->format('Y-m-d'))
            ->pluck('challenge_date')
            ->map(fn ($d) => $d instanceof Carbon ? $d->format('Y-m-d') : substr((string) $d, 0, 10))
            ->all();

        return array_fill_keys($dates, true);
    }

    /**
     * La série de l'élève (globale : c'est SON habitude, quelle que soit la
     * portée) et la frise des 14 derniers jours.
     */
    public function streak(User $student, string $today): array
    {
        $calendar = $this->calendar();
        $played = $this->playedDates($student->id);
        $playedToday = isset($played[$today]);
        $current = $playedToday
            ? $calendar->streakEndingBefore($today, $played) + 1
            : $calendar->streakEndingBefore($today, $played);
        $best = (int) DailyChallengeAttempt::where('user_id', $student->id)->max('streak_after');

        $first = $played === [] ? null : min(array_keys($played));
        $days = array_map(function ($d) use ($played, $today, $first) {
            $state = match (true) {
                ! $d['challengeDay'] => 'rest',
                isset($played[$d['date']]) => 'completed',
                $d['date'] === $today => 'today',
                $first !== null && $d['date'] > $first && $d['date'] < $today => 'missed',
                default => 'none',
            };

            return ['date' => $d['date'], 'weekday' => $d['weekday'], 'state' => $state];
        }, $calendar->lastDays($today, 14));

        return ['current' => $current, 'best' => max($best, $current), 'playedToday' => $playedToday, 'days' => $days];
    }

    // ── Historique et revue ──────────────────────────────────────────────────

    /** Les N derniers jours de défi : score, ou « manqué ». */
    public function history(User $student, int $days = 30): array
    {
        $this->expireStale($student);
        $calendar = $this->calendar();
        $today = $calendar->today();
        $attempts = DailyChallengeAttempt::where('user_id', $student->id)
            ->where('challenge_date', '>=', now()->subDays($days + 1)->format('Y-m-d'))
            ->orderByDesc('challenge_date')->get();
        $byDate = $attempts->groupBy(fn ($a) => $a->challenge_date->format('Y-m-d'));
        $firstEver = DailyChallengeAttempt::where('user_id', $student->id)->min('challenge_date');
        $firstEver = $firstEver ? substr((string) $firstEver, 0, 10) : null;

        $rows = [];
        foreach (array_reverse($calendar->lastDays($today, $days)) as $d) {
            if (! $d['challengeDay']) {
                continue;
            }
            $attempt = $byDate->get($d['date'])?->sortByDesc('total_score')->first();
            if ($attempt !== null) {
                $rows[] = ['date' => $d['date'], 'status' => $attempt->status] + $this->attemptSummary($attempt);
            } elseif ($firstEver !== null && $d['date'] >= $firstEver && $d['date'] < $today) {
                $rows[] = ['date' => $d['date'], 'status' => 'missed'];
            }
        }

        $ctx = $this->context($student);

        return [
            'days' => $rows,
            'streak' => $this->streak($student, $today),
            'cumulativeScore' => $this->leaderboard->rankOf($ctx['scopeType'], $ctx['scopeId'], $student->id, $today)['score'] ?? 0,
            'personalBest' => (int) $attempts->max('total_score'),
        ];
    }

    /** La revue d'une tentative CLOSE — jamais rejouable pour des points. */
    public function review(DailyChallengeAttempt $attempt): array
    {
        if (! $attempt->isFinished()) {
            throw new ChallengeException(ChallengeException::NOT_FOUND);
        }
        $challenge = $attempt->challenge()->with('questions.lesson:id,code,title', 'questions.learningPoint:id,code,title')->first();
        $answers = $attempt->answers()->get()->keyBy('position');

        $items = [];
        foreach ($challenge->questions as $q) {
            $a = $answers->get($q->position);
            $public = $this->presenter->public($q, $q->lesson->code);
            $items[] = [
                'position' => $q->position,
                'content' => $public,
                'learningPoint' => ['code' => $q->learningPoint?->code, 'title' => $q->learningPoint?->title],
                'lesson' => ['code' => $q->lesson->code, 'title' => $q->lesson->title],
                'answer' => $a?->answer,
                'outcome' => $a?->outcome ?? 'unanswered',
                'isCorrect' => (bool) $a?->is_correct,
                'responseTimeMs' => $a?->response_time_ms,
                'score' => ['base' => (int) $a?->base_score, 'speed' => (int) $a?->speed_bonus, 'total' => (int) $a?->final_score],
                'reveal' => $this->presenter->reveal($q, $q->lesson->code),
            ];
        }

        return ['attempt' => $this->attemptSummary($attempt), 'questions' => $items, 'insights' => $this->insights($attempt)];
    }

    /**
     * Après le défi : le point le plus fragile du jour, les réussites lentes,
     * et UNE suite proposée (une pratique ciblée de la banque existante).
     * Point d'intégration du futur « Next Best Action » : une donnée, pas un
     * second moteur de recommandation.
     */
    public function insights(DailyChallengeAttempt $attempt): array
    {
        $rows = DailyChallengeAnswer::where('daily_challenge_attempt_id', $attempt->id)
            ->with('question.learningPoint:id,code,title', 'question.lesson:id,code,title')->orderBy('position')->get();

        $point = fn ($row) => [
            'code' => $row->question->learningPoint?->code,
            'title' => $row->question->learningPoint?->title,
            'lessonCode' => $row->question->lesson?->code,
            'lessonTitle' => $row->question->lesson?->title,
        ];

        $weak = $rows->filter(fn ($r) => $r->submitted_at !== null && ! $r->is_correct)->map($point)->unique('code')->values()->all();
        $slowCut = 45000;
        $slow = $rows->filter(fn ($r) => $r->is_correct && (int) $r->response_time_ms > $slowCut)->map($point)->unique('code')->values()->all();

        $target = $weak[0] ?? $slow[0] ?? null;

        return [
            'weakest' => $weak,
            'slowCorrect' => $slow,
            'suggestion' => $target === null ? null : [
                'kind' => 'practice',
                'lessonCode' => $target['lessonCode'],
                'learningPointCode' => $target['code'],
                'learningPointTitle' => $target['title'],
            ],
        ];
    }

    // ── Vues ────────────────────────────────────────────────────────────────

    public function attemptSummary(DailyChallengeAttempt $attempt): array
    {
        return [
            'id' => $attempt->uuid,
            'date' => $attempt->challenge_date->format('Y-m-d'),
            'status' => $attempt->status,
            'scopeType' => $attempt->scope_type,
            'questionCount' => (int) $attempt->question_count,
            'answeredCount' => (int) $attempt->answered_count,
            'correctCount' => (int) $attempt->correct_count,
            'score' => [
                'base' => (int) $attempt->base_score,
                'speed' => (int) $attempt->speed_score,
                'streak' => (int) $attempt->streak_bonus,
                'total' => (int) $attempt->total_score,
                'penalty' => (int) $attempt->penalty_applied,
            ],
            'averageResponseTimeMs' => $attempt->average_response_time_ms,
            'streakBefore' => (int) $attempt->streak_before,
            'streakAfter' => (int) $attempt->streak_after,
            // Le mouvement n'est donné que s'il a VRAIMENT eu lieu et que le rang est montrable.
            'rankBefore' => $attempt->rank_before,
            'rankAfter' => $attempt->rank_after,
            'startedAt' => $attempt->started_at?->toIso8601String(),
            'expiresAt' => $attempt->expires_at?->toIso8601String(),
            'completedAt' => $attempt->completed_at?->toIso8601String(),
        ];
    }

    private function openView(DailyChallengeAttempt $attempt, DailyChallengeQuestion $q, DailyChallengeAnswer $a): array
    {
        return [
            'position' => $q->position,
            'total' => (int) $attempt->question_count,
            'startedAt' => $a->started_at->format('Y-m-d\TH:i:s.vP'),
            'serverNow' => now()->format('Y-m-d\TH:i:s.vP'),
            'expiresAt' => $attempt->expires_at->toIso8601String(),
            'content' => $this->presenter->public($q, $q->lesson->code),
            'learningPoint' => ['code' => $q->learningPoint?->code, 'title' => $q->learningPoint?->title],
        ];
    }

    private function answerView(DailyChallengeQuestion $q, DailyChallengeAnswer $a, bool $reveal): array
    {
        return [
            'position' => $q->position,
            'outcome' => $a->outcome,
            'isCorrect' => (bool) $a->is_correct,
            'responseTimeMs' => $a->response_time_ms,
            'score' => ['base' => (int) $a->base_score, 'speed' => (int) $a->speed_bonus, 'total' => (int) $a->final_score],
            'learningPoint' => ['code' => $q->learningPoint?->code, 'title' => $q->learningPoint?->title],
        ] + ($reveal ? ['reveal' => $this->presenter->reveal($q, $q->lesson->code), 'answer' => $a->answer] : []);
    }

    private function scopeView(array $ctx): array
    {
        return [
            'type' => $ctx['scopeType'],
            'classroom' => $ctx['classroom'] ? ['id' => $ctx['classroom']->id, 'name' => $ctx['classroom']->name] : null,
        ];
    }

    /**
     * Ce que l'élève voit de la classe — UNIQUEMENT ce que l'enseignant a
     * ouvert. Compétition coupée → rien. Top 3 masqué → pas de noms.
     */
    public function competitionView(array $ctx, User $student, string $date): ?array
    {
        if ($ctx['scopeType'] !== DailyChallenge::SCOPE_CLASSROOM) {
            return null;
        }
        $class = $ctx['class'];
        $view = ['enabled' => (bool) $class['competitionEnabled'], 'showTop3' => false, 'top3' => null, 'myRank' => null, 'classStatus' => null];

        if ($class['competitionEnabled']) {
            if ($this->config->get('competition.show_own_rank_to_students', true)) {
                $mine = $this->leaderboard->rankOf($ctx['scopeType'], $ctx['scopeId'], $student->id, $date);
                $view['myRank'] = $mine ? ['rank' => $mine['rank'], 'score' => $mine['score']] : null;
            }
            if ($class['showTop3']) {
                $view['showTop3'] = true;
                $view['top3'] = $this->leaderboard->publicTop($ctx['scopeType'], $ctx['scopeId'], 3, $student->id);
            }
        }
        if ($class['showResultsToClass']) {
            $challengeId = DailyChallenge::where('scope_type', $ctx['scopeType'])->where('scope_id', $ctx['scopeId'])->where('challenge_date', $date)->value('id');
            $view['classStatus'] = [
                'members' => $ctx['classroom']->activeMemberships()->count(),
                'completed' => $challengeId ? DailyChallengeAttempt::where('daily_challenge_id', $challengeId)
                    ->where('status', '!=', DailyChallengeAttempt::STATUS_IN_PROGRESS)
                    ->whereIn('user_id', $ctx['classroom']->activeMemberships()->select('student_id'))->count() : 0,
            ];
        }

        return $view;
    }

    /** @return array{0: string, 1: string} */
    private function window(array $ctx): array
    {
        if ($ctx['class'] !== null) {
            return [$ctx['class']['availableFrom'], $ctx['class']['availableUntil']];
        }

        return [(string) $this->config->get('challenge.available_from'), (string) $this->config->get('challenge.available_until')];
    }
}
