<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\ClassroomProgressService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\DailyChallenge;
use App\Models\DailyChallengeAttempt;
use App\Models\DailyChallengeClassSetting;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Le défi quotidien vu par l'ENSEIGNANT d'une classe : ses réglages, les
 * résultats d'un jour, l'analyse par question et par point d'apprentissage,
 * le classement complet et l'écran d'affichage.
 *
 * Toujours derrière `can:teacher` + ClassroomPolicy (la classe est à lui).
 * Tout agrégat ne compte que les membres ACTIFS : un élève qui a quitté la
 * classe n'apparaît plus, ni dans un classement ni dans un pourcentage.
 *
 * Coût constant en requêtes, quelle que soit la taille de la classe : des
 * GROUP BY sur les tentatives et les réponses, jamais une requête par élève.
 */
class ClassDailyChallengeService
{
    /** En dessous : la question / le point est signalé ⚠. */
    public const DIFFICULTY_THRESHOLD = 0.6;

    public function __construct(
        private DailyChallengeConfig $config,
        private DailyChallengeLeaderboard $leaderboard,
        private DailyChallengeScoringService $scoring,
        private ClassroomProgressService $classProgress,
    ) {}

    // ── Réglages ────────────────────────────────────────────────────────────

    public function settings(Classroom $classroom): array
    {
        $effective = $this->config->forClassroom($classroom);
        $lessonIds = $this->classProgress->effectiveLessonIds($classroom);

        return [
            'settings' => $effective,
            'options' => [
                'questionCounts' => array_values($this->config->get('challenge.allowed_question_counts')),
                'difficulties' => DailyChallengeClassSetting::DIFFICULTIES,
                'lessons' => Lesson::whereIn('id', $lessonIds)->orderBy('order')->get(['code', 'title'])
                    ->map(fn ($l) => ['code' => $l->code, 'title' => $l->title])->all(),
                'globallyEnabled' => (bool) $this->config->get('challenge.enabled', true),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data  champs camelCase validés par le contrôleur
     */
    public function updateSettings(User $teacher, Classroom $classroom, array $data): array
    {
        $current = $this->config->forClassroom($classroom);
        $map = [
            'enabled' => 'enabled', 'competitionEnabled' => 'competition_enabled', 'showTop3' => 'show_top3',
            'showResultsToClass' => 'show_results_to_class', 'questionCount' => 'question_count', 'difficulty' => 'difficulty',
            'lessonCodes' => 'lesson_codes', 'learningPointCodes' => 'learning_point_codes',
            'availableFrom' => 'available_from', 'availableUntil' => 'available_until',
        ];

        // La ligne complète : l'état effectif d'avant, modifié par l'envoi.
        $values = [];
        foreach ($map as $camel => $column) {
            $values[$column] = array_key_exists($camel, $data) ? $data[$camel] : $current[$camel];
        }

        if ($values['question_count'] !== null && ! in_array((int) $values['question_count'], $this->config->get('challenge.allowed_question_counts'), true)) {
            throw new DomainException('question_count');
        }
        if ($values['available_from'] >= $values['available_until']) {
            throw new DomainException('window');
        }
        // Portée : seulement des leçons EFFECTIVES de la classe, des points de ces leçons.
        $lessonIds = $this->classProgress->effectiveLessonIds($classroom);
        $values['lesson_codes'] = array_values(array_unique($values['lesson_codes'] ?? []));
        if ($values['lesson_codes'] !== [] && Lesson::whereIn('id', $lessonIds)->whereIn('code', $values['lesson_codes'])->count() !== count($values['lesson_codes'])) {
            throw new DomainException('lesson_out_of_scope');
        }
        $values['learning_point_codes'] = array_values(array_unique($values['learning_point_codes'] ?? []));
        if ($values['learning_point_codes'] !== [] && LearningPoint::whereIn('lesson_id', $lessonIds)->whereNull('retired_at')
            ->whereIn('code', $values['learning_point_codes'])->count() !== count($values['learning_point_codes'])) {
            throw new DomainException('learning_point_out_of_scope');
        }

        DailyChallengeClassSetting::updateOrCreate(['classroom_id' => $classroom->id], $values + ['updated_by' => $teacher->id]);
        $this->config->forget();

        return $this->settings($classroom);
    }

    // ── Résultats ───────────────────────────────────────────────────────────

    /** Les jours de défi de la classe, du plus récent au plus ancien. */
    public function dates(Classroom $classroom, int $limit = 30): array
    {
        return DailyChallenge::where('scope_type', DailyChallenge::SCOPE_CLASSROOM)->where('scope_id', $classroom->id)
            ->orderByDesc('challenge_date')->limit($limit)->pluck('challenge_date')
            ->map(fn ($d) => $d instanceof \DateTimeInterface ? $d->format('Y-m-d') : substr((string) $d, 0, 10))->all();
    }

    /**
     * Le tableau de bord d'un jour : participation, précision, temps, série,
     * analyse par question et par point, résultats par élève, classement.
     */
    public function results(Classroom $classroom, ?string $date = null): array
    {
        $date ??= ChallengeCalendar::fromConfig($this->config)->today();
        $settings = $this->config->forClassroom($classroom);
        $memberIds = ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();
        $challenge = DailyChallenge::where('scope_type', DailyChallenge::SCOPE_CLASSROOM)->where('scope_id', $classroom->id)
            ->where('challenge_date', $date)->with('questions.learningPoint:id,code,title', 'questions.lesson:id,code,title')->first();

        $base = [
            'date' => $date,
            'settings' => $settings,
            'members' => count($memberIds),
            'challenge' => null,
        ];
        if ($challenge === null) {
            return $base + ['summary' => null, 'questions' => [], 'learningPoints' => [], 'students' => [], 'ranking' => $settings['competitionEnabled'] ? $this->leaderboard->teacherRanking($classroom->id, $date) : null];
        }

        $attempts = DailyChallengeAttempt::where('daily_challenge_id', $challenge->id)->whereIn('user_id', $memberIds ?: [0])->get();
        $finished = $attempts->filter(fn ($a) => $a->isFinished() && $a->answered_count > 0);

        // Par question : une requête groupée.
        $perQuestion = DB::table('daily_challenge_answers as a')
            ->join('daily_challenge_attempts as t', 't.id', '=', 'a.daily_challenge_attempt_id')
            ->where('t.daily_challenge_id', $challenge->id)
            ->whereIn('t.user_id', $memberIds ?: [0])
            ->whereNotNull('a.submitted_at')
            ->groupBy('a.daily_challenge_question_id')
            ->selectRaw('a.daily_challenge_question_id as qid, COUNT(*) as answered, SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct, AVG(a.response_time_ms) as avg_ms')
            ->get()->keyBy('qid');

        $questions = [];
        $byPoint = [];
        foreach ($challenge->questions as $q) {
            $row = $perQuestion->get($q->id);
            $answered = (int) ($row->answered ?? 0);
            $correct = (int) ($row->correct ?? 0);
            $rate = $answered > 0 ? round($correct / $answered, 3) : null;
            $questions[] = [
                'position' => $q->position,
                'answered' => $answered,
                'correct' => $correct,
                'correctRate' => $rate,
                'averageResponseMs' => $row?->avg_ms !== null ? (int) round($row->avg_ms) : null,
                'flagged' => $rate !== null && $rate < self::DIFFICULTY_THRESHOLD,
                'answerType' => $q->answer_type,
                'reason' => $q->reason,
                'learningPoint' => ['code' => $q->learningPoint?->code, 'title' => $q->learningPoint?->title],
                'lesson' => ['code' => $q->lesson?->code, 'title' => $q->lesson?->title],
            ];
            $lp = $q->learningPoint?->code;
            if ($lp !== null) {
                $byPoint[$lp] ??= ['code' => $lp, 'title' => $q->learningPoint->title, 'lessonCode' => $q->lesson?->code, 'lessonTitle' => $q->lesson?->title, 'answered' => 0, 'correct' => 0, 'positions' => []];
                $byPoint[$lp]['answered'] += $answered;
                $byPoint[$lp]['correct'] += $correct;
                $byPoint[$lp]['positions'][] = $q->position;
            }
        }

        // Les élèves qui ont échoué, par point : pour « تدخّل » (active members only).
        $failing = DB::table('daily_challenge_answers as a')
            ->join('daily_challenge_attempts as t', 't.id', '=', 'a.daily_challenge_attempt_id')
            ->join('daily_challenge_questions as q', 'q.id', '=', 'a.daily_challenge_question_id')
            ->join('learning_points as lp', 'lp.id', '=', 'q.learning_point_id')
            ->where('t.daily_challenge_id', $challenge->id)
            ->whereIn('t.user_id', $memberIds ?: [0])
            ->whereNotNull('a.submitted_at')->where('a.is_correct', false)
            ->select('lp.code', 't.user_id')->distinct()->get()
            ->groupBy('code')->map(fn ($rows) => $rows->pluck('user_id')->map(fn ($id) => (int) $id)->values()->all());

        $learningPoints = array_values(array_map(function ($p) use ($failing) {
            $rate = $p['answered'] > 0 ? round($p['correct'] / $p['answered'], 3) : null;

            return $p + [
                'correctRate' => $rate,
                'flagged' => $rate !== null && $rate < self::DIFFICULTY_THRESHOLD,
                'strugglingStudentIds' => $failing->get($p['code'], []),
            ];
        }, $byPoint));
        usort($learningPoints, fn ($a, $b) => ($a['correctRate'] ?? 2) <=> ($b['correctRate'] ?? 2));

        // Par élève (identité enseignant — jamais le courriel).
        $users = User::whereIn('id', $memberIds ?: [0])->get(explode(',', ClassroomAccess::IDENTITY_COLUMNS))->keyBy('id');
        $byUser = $attempts->keyBy('user_id');
        $students = [];
        foreach ($memberIds as $id) {
            $a = $byUser->get($id);
            $students[] = [
                'student' => ClassroomAccess::identity($users->get($id), $id),
                'status' => $a === null ? 'not_started' : $a->status,
                'score' => $a ? (int) $a->total_score : null,
                'correct' => $a ? (int) $a->correct_count : null,
                'questionCount' => $a ? (int) $a->question_count : null,
                'averageResponseMs' => $a?->average_response_time_ms,
                'streak' => $a ? (int) $a->streak_after : null,
            ];
        }
        usort($students, fn ($x, $y) => [($y['score'] ?? -1), ($x['averageResponseMs'] ?? PHP_INT_MAX), $x['student']['id']]
            <=> [($x['score'] ?? -1), ($y['averageResponseMs'] ?? PHP_INT_MAX), $y['student']['id']]);

        $count = $challenge->questions->count();
        $answeredTotal = (int) $finished->sum('answered_count');
        $maxPossible = $count > 0 ? $count * (int) $challenge->config_snapshot['scoring']['base_points'] : 0;

        return [
            'date' => $date,
            'settings' => $settings,
            'members' => count($memberIds),
            'challenge' => ['questionCount' => $count, 'status' => $challenge->status],
            'summary' => [
                'completed' => $finished->count(),
                'inProgress' => $attempts->where('status', DailyChallengeAttempt::STATUS_IN_PROGRESS)->count(),
                'participationRate' => count($memberIds) > 0 ? round($finished->count() / count($memberIds), 3) : null,
                // Réussite moyenne : les points de JUSTESSE sur le maximum de justesse (la vitesse n'y entre pas).
                'averageScoreRate' => $finished->isNotEmpty() && $maxPossible > 0 ? round($finished->avg('base_score') / $maxPossible, 3) : null,
                'averageScore' => $finished->isNotEmpty() ? (int) round($finished->avg('total_score')) : null,
                'accuracy' => $answeredTotal > 0 ? round($finished->sum('correct_count') / $answeredTotal, 3) : null,
                'averageResponseMs' => $answeredTotal > 0 ? (int) round($finished->sum('total_response_ms') / $answeredTotal) : null,
                // Parmi les participants du jour, la part qui PROLONGE une série (≥ 2 jours).
                'streakContinuationRate' => $finished->isNotEmpty() ? round($finished->filter(fn ($a) => $a->streak_after >= 2)->count() / $finished->count(), 3) : null,
            ],
            'questions' => $questions,
            'learningPoints' => $learningPoints,
            'students' => $students,
            'ranking' => $settings['competitionEnabled'] ? $this->leaderboard->teacherRanking($classroom->id, $date) : null,
        ];
    }

    /**
     * L'écran d'AFFICHAGE en classe : seulement ce qui peut être projeté —
     * noms d'affichage, scores, participation, réussite par question. Aucune
     * réponse individuelle, aucun temps d'élève, aucun courriel.
     */
    public function display(Classroom $classroom, ?string $date = null): array
    {
        $results = $this->results($classroom, $date);
        $settings = $results['settings'];

        $today = [];
        if ($settings['competitionEnabled'] && $results['challenge'] !== null) {
            $top = array_values(array_filter($results['students'], fn ($s) => ($s['score'] ?? 0) > 0));
            $ids = array_map(fn ($s) => $s['student']['id'], array_slice($top, 0, 10));
            $users = User::whereIn('id', $ids ?: [0])->get(['id', 'first_name', 'last_name'])->keyBy('id');
            foreach (array_slice($top, 0, 10) as $i => $s) {
                $today[] = ['rank' => $i + 1, 'displayName' => DailyChallengeLeaderboard::displayName($users->get($s['student']['id'])), 'score' => $s['score']];
            }
        }

        $cumulative = [];
        if ($settings['competitionEnabled']) {
            $cumulative = $this->leaderboard->publicTop(DailyChallenge::SCOPE_CLASSROOM, $classroom->id, 10);
        }

        return [
            'classroom' => ['id' => $classroom->id, 'name' => $classroom->name],
            'date' => $results['date'],
            'competitionEnabled' => (bool) $settings['competitionEnabled'],
            'members' => $results['members'],
            'participation' => $results['summary'] ? ['completed' => $results['summary']['completed'], 'rate' => $results['summary']['participationRate']] : ['completed' => 0, 'rate' => null],
            'accuracy' => $results['summary']['accuracy'] ?? null,
            'todayTop' => $today,
            'leaderboard' => $cumulative,
            'questions' => array_map(fn ($q) => [
                'position' => $q['position'], 'correctRate' => $q['correctRate'], 'answered' => $q['answered'],
                'flagged' => $q['flagged'], 'learningPoint' => $q['learningPoint']['title'],
            ], $results['questions']),
        ];
    }
}
