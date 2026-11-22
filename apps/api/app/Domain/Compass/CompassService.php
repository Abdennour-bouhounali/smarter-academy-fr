<?php

namespace App\Domain\Compass;

use App\Domain\DailyChallenge\ChallengeQuestionPresenter;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\Support\AnswerEvaluator;
use App\Models\CompassAnswer;
use App\Models\CompassItemState;
use App\Models\CompassProfile;
use App\Models\CompassSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * « بوصلتي » côté serveur (P1). Contrat : docs/architecture/YEAR_COMPASS.md.
 *
 * Partage des rôles :
 *  - le CLIENT calcule la portée (calendrier + réseau, packages/core/compass/scope.js)
 *    et choisit la prochaine كفاءة / le prochain niveau (engine.js, pur, rejouable) ;
 *  - le SERVEUR choisit la question (fraîche), la sert SANS clé de réponse
 *    (ChallengeQuestionPresenter::publicRef), la corrige (AnswerEvaluator),
 *    stocke la réponse et recalcule lui-même les bandes (ItemBand) à la fin.
 *
 * Jamais une preuve de maîtrise : rien n'est écrit dans learning_evidence.
 */
final class CompassService
{
    private const ITEM_ID = '/^[1-4]am\.m\d+\.[rx]\d+$/';

    public function __construct(
        private CompassBank $bank,
        private ExerciseRepository $exercises,
        private AnswerEvaluator $evaluator,
        private ChallengeQuestionPresenter $presenter,
    ) {}

    public function enabledFor(User $user): bool
    {
        return in_array($user->grade, (array) config('compass.grades'), true);
    }

    /** Tout ce que la page et la carte d'accueil doivent savoir. */
    public function state(User $user): array
    {
        $profile = CompassProfile::where('user_id', $user->id)->first();
        $active = $this->activeSession($user);
        $last = CompassSession::where('user_id', $user->id)->where('status', CompassSession::FINISHED)
            ->orderByDesc('finished_at')->orderByDesc('id')->first();

        return [
            'enabled' => $this->enabledFor($user),
            'grade' => $user->grade,
            'profile' => $profile ? [
                'mode' => $profile->pointer_mode,
                'lesson' => $profile->pointer_lesson,
                'setAt' => $profile->pointer_set_at?->toIso8601String(),
            ] : null,
            'active' => $active ? $this->sessionPayload($active) : null,
            'last' => $last ? $this->finishedPayload($last) : null,
            'nextRetakeAt' => $this->nextRetakeAt($last),
            'availability' => $this->enabledFor($user) ? $this->bank->availability() : (object) [],
        ];
    }

    public function setPointer(User $user, string $mode, ?string $lesson): CompassProfile
    {
        return CompassProfile::updateOrCreate(['user_id' => $user->id], [
            'pointer_mode' => $mode,
            'pointer_lesson' => $mode === CompassProfile::MODE_LESSON ? $lesson : null,
            'pointer_set_at' => now(),
        ]);
    }

    /** @param string[] $targets */
    public function start(User $user, array $targets, ?string $pointerLesson, string $pointerSource, string $schoolYear): CompassSession
    {
        if (! $this->enabledFor($user)) {
            throw new CompassError('compass_grade_unavailable', 403);
        }
        $active = $this->activeSession($user);
        if ($active) {
            return $active; // idempotent : on reprend
        }
        $last = CompassSession::where('user_id', $user->id)->where('status', CompassSession::FINISHED)
            ->orderByDesc('finished_at')->first();
        $next = $this->nextRetakeAt($last);
        if ($next !== null && now()->lt($next)) {
            throw new CompassError('compass_retake_too_early', 409, ['nextRetakeAt' => $next]);
        }
        $clean = array_values(array_unique(array_filter($targets, fn ($t) => is_string($t) && preg_match(self::ITEM_ID, $t))));
        if ($clean === []) {
            throw new CompassError('compass_empty_scope');
        }

        return CompassSession::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'grade' => $user->grade,
            'school_year' => $schoolYear,
            'pointer_lesson' => $pointerLesson,
            'pointer_source' => $pointerSource,
            'targets' => array_slice($clean, 0, (int) config('compass.max_targets')),
            'status' => CompassSession::ACTIVE,
        ]);
    }

    /** Sert une question (ou rend celle qui attend encore sa réponse). */
    public function serve(CompassSession $session, string $itemId, int $level): array
    {
        $this->assertActive($session);
        $pending = $session->answers()->whereNull('answered_at')->first();
        if ($pending) {
            return $this->pendingPayload($pending);
        }
        if (! preg_match(self::ITEM_ID, $itemId) || ! in_array($level, [1, 2], true) || ! $this->bank->has($itemId)) {
            throw new CompassError('compass_no_question');
        }
        if ($session->answers()->count() >= (int) config('compass.max_questions')) {
            throw new CompassError('compass_limit_reached');
        }
        $served = CompassAnswer::where('user_id', $session->user_id)->get(['lesson_code', 'exercise_id', 'question_id'])
            ->mapWithKeys(fn ($a) => ["{$a->lesson_code}/{$a->exercise_id}/{$a->question_id}" => true])->all();
        $ref = $this->bank->pick($itemId, $level, $served);
        if ($ref === null) {
            throw new CompassError('compass_no_question');
        }
        $row = CompassAnswer::create([
            'compass_session_id' => $session->id,
            'user_id' => $session->user_id,
            'item_id' => $itemId,
            'level' => $level,
            'lesson_code' => $ref['lesson'],
            'exercise_id' => $ref['exercise'],
            'question_id' => $ref['question'],
        ]);

        return $this->pendingPayload($row);
    }

    /** Corrige côté serveur. Ne renvoie QUE ✓ / pas encore — jamais la bonne réponse. */
    public function answer(CompassSession $session, int $answerId, mixed $answer, bool $unsure): array
    {
        $this->assertActive($session);
        $row = CompassAnswer::where('compass_session_id', $session->id)->where('id', $answerId)->first();
        if (! $row || $row->answered_at !== null) {
            throw new CompassError('compass_answer_not_pending', 409);
        }
        $question = $this->exercises->findQuestion($row->lesson_code, $row->exercise_id, $row->question_id);
        if ($question === null) {
            throw new CompassError('compass_no_question');
        }
        $correct = $answer === null ? false : (bool) ($this->evaluator->evaluate($answer, $question)['isCorrect'] ?? false);
        $row->forceFill([
            'answer' => $answer === null ? null : ['value' => $answer],
            'correct' => $correct,
            'unsure' => $unsure,
            'answered_at' => now(),
        ])->save();

        return ['correct' => $correct && ! $unsure, 'unsure' => $unsure];
    }

    /** Clôt la jauge : le SERVEUR recalcule les bandes depuis les réponses (ItemBand). */
    public function finish(CompassSession $session): array
    {
        $this->assertActive($session);
        $bands = DB::transaction(function () use ($session) {
            $session->answers()->whereNull('answered_at')->delete();
            $bands = $this->bandsOf($session);
            foreach ($bands as $itemId => $band) {
                CompassItemState::updateOrCreate(
                    ['user_id' => $session->user_id, 'item_id' => $itemId],
                    ['band' => $band, 'compass_session_id' => $session->id, 'measured_at' => now()],
                );
            }
            $session->forceFill(['status' => CompassSession::FINISHED, 'finished_at' => now()])->save();

            return $bands;
        });

        return ['bands' => (object) $bands, 'finishedAt' => $session->finished_at->toIso8601String()];
    }

    /** @return array<string, string> item → bande, pour les items TERMINÉS */
    public function bandsOf(CompassSession $session): array
    {
        $byItem = [];
        foreach ($session->answers()->whereNotNull('answered_at')->get() as $a) {
            $byItem[$a->item_id][] = ['correct' => $a->correct, 'unsure' => $a->unsure];
        }
        $out = [];
        foreach ($byItem as $itemId => $answers) {
            $r = ItemBand::of($answers);
            if ($r['done']) {
                $out[$itemId] = $r['band'];
            }
        }

        return $out;
    }

    public function findOwned(User $user, string $uuid): CompassSession
    {
        $s = CompassSession::where('uuid', $uuid)->where('user_id', $user->id)->first();
        if (! $s) {
            throw new CompassError('compass_not_found', 404);
        }

        return $s;
    }

    private function activeSession(User $user): ?CompassSession
    {
        return CompassSession::where('user_id', $user->id)->where('status', CompassSession::ACTIVE)->latest('id')->first();
    }

    private function assertActive(CompassSession $session): void
    {
        if ($session->status !== CompassSession::ACTIVE) {
            throw new CompassError('compass_session_closed', 409);
        }
    }

    private function nextRetakeAt(?CompassSession $last): ?string
    {
        if (! $last?->finished_at) {
            return null;
        }
        $next = $last->finished_at->copy()->addDays((int) config('compass.retake_days'));

        return now()->lt($next) ? $next->toIso8601String() : null;
    }

    private function sessionPayload(CompassSession $s): array
    {
        $answered = $s->answers()->whereNotNull('answered_at')->get();
        $pending = $s->answers()->whereNull('answered_at')->first();

        return [
            'uuid' => $s->uuid,
            'targets' => $s->targets,
            'pointerLesson' => $s->pointer_lesson,
            'pointerSource' => $s->pointer_source,
            'startedAt' => $s->created_at?->toIso8601String(),
            'answers' => $answered->map(fn ($a) => [
                'itemId' => $a->item_id, 'level' => $a->level, 'correct' => (bool) $a->correct, 'unsure' => (bool) $a->unsure,
            ])->values()->all(),
            'pending' => $pending ? $this->pendingPayload($pending) : null,
        ];
    }

    private function finishedPayload(CompassSession $s): array
    {
        return [
            'uuid' => $s->uuid,
            'finishedAt' => $s->finished_at?->toIso8601String(),
            'targets' => $s->targets,
            'pointerLesson' => $s->pointer_lesson,
            'answers' => $s->answers()->whereNotNull('answered_at')->get()->map(fn ($a) => [
                'itemId' => $a->item_id, 'level' => $a->level, 'correct' => (bool) $a->correct, 'unsure' => (bool) $a->unsure,
            ])->values()->all(),
            'bands' => (object) $this->bandsOf($s),
        ];
    }

    private function pendingPayload(CompassAnswer $row): array
    {
        return [
            'id' => $row->id,
            'itemId' => $row->item_id,
            'level' => $row->level,
            'content' => $this->presenter->publicRef($row->lesson_code, $row->exercise_id, $row->question_id),
        ];
    }
}
