<?php

namespace App\Domain\Madar;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\DailyChallenge\ChallengeQuestionPresenter;
use App\Models\AssessmentItem;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Lesson;
use App\Models\MadarClassSetting;
use App\Models\MadarHeartAdjustment;
use App\Models\MadarItemTimeLimit;
use App\Models\MadarLevelProgress;
use App\Models\MadarMathProgress;
use App\Models\MadarProfile;
use App\Models\MadarRefuel;
use App\Models\MadarRun;
use App\Models\MadarStudentGameBlock;
use App\Models\User;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * « مدار » vu par l'ENSEIGNANT d'une classe : ses réglages (dont les délais
 * de réponse), la semaine de la classe (classement, parties, approvisionnement,
 * ce qui « mérite un regard »), les questions servies et leur délai, les
 * cœurs donnés ou retirés, et l'écran d'affichage au tableau.
 *
 * Toujours derrière `can:teacher` + ClassroomPolicy. Tout agrégat ne compte
 * que les membres ACTIFS, en requêtes groupées (coût constant).
 */
class ClassMadarService
{
    /** Signal « écart » : justesse au jeu − justesse en pratique sur les mêmes كفاءات. */
    public const GAP_THRESHOLD = 0.4;

    public const GAP_MIN_REFUEL = 6;

    public const GAP_MIN_PRACTICE = 4;

    /** À partir de combien de réponses signalées dans la semaine un élève « mérite un regard ». */
    public const FLAG_ALERT = 3;

    public function __construct(
        private MadarConfig $config,
        private MadarLeaderboard $leaderboard,
        private ClassroomProgressService $classProgress,
        private MadarService $madar,
        private ChallengeQuestionPresenter $presenter,
    ) {}

    // ── Réglages ────────────────────────────────────────────────────────────

    public function settings(Classroom $classroom): array
    {
        $lessonIds = $this->classProgress->effectiveLessonIds($classroom);

        return [
            'settings' => $this->config->forClassroom($classroom),
            'options' => [
                'maxHearts' => $this->config->maxHearts(),
                'runCapRange' => [5, 100],
                'timeLimitRange' => array_values($this->config->get('refuel.time_limit_range', [15, 600])),
                'defaultTimeLimits' => $this->config->defaultTimeLimits(),
                'maxAdjustment' => (int) $this->config->get('adjustments.max_delta', 5),
                'lessons' => Lesson::whereIn('id', $lessonIds)->orderBy('order')->get(['code', 'title'])
                    ->map(fn ($l) => ['code' => $l->code, 'title' => $l->title])->all(),
                'globallyEnabled' => $this->config->enabled(),
                'games' => MadarRun::GAMES,
                'gameCategories' => MadarRun::CATEGORIES,
                'freeGames' => MadarRun::FREE_GAMES,
            ],
        ];
    }

    /** @param  array<string, mixed>  $data  champs camelCase validés par le contrôleur */
    public function updateSettings(User $teacher, Classroom $classroom, array $data): array
    {
        $current = $this->config->forClassroom($classroom);
        $map = [
            'enabled' => 'enabled', 'competitionEnabled' => 'competition_enabled',
            'dailyFreeHearts' => 'daily_free_hearts', 'dailyRunCap' => 'daily_run_cap', 'lessonCodes' => 'lesson_codes',
            'timeLimits' => 'time_limits', 'disabledGames' => 'disabled_games',
        ];
        $values = [];
        foreach ($map as $camel => $column) {
            $values[$column] = array_key_exists($camel, $data) ? $data[$camel] : $current[$camel];
        }

        if ((int) $values['daily_free_hearts'] > $this->config->maxHearts()) {
            throw new DomainException('daily_free_hearts');
        }
        $lessonIds = $this->classProgress->effectiveLessonIds($classroom);
        $values['lesson_codes'] = array_values(array_unique($values['lesson_codes'] ?? []));
        if ($values['lesson_codes'] !== [] && Lesson::whereIn('id', $lessonIds)->whereIn('code', $values['lesson_codes'])->count() !== count($values['lesson_codes'])) {
            throw new DomainException('lesson_out_of_scope');
        }
        [$min, $max] = $this->config->get('refuel.time_limit_range', [15, 600]);
        $limits = [];
        foreach ((array) $values['time_limits'] as $difficulty => $seconds) {
            if (! array_key_exists((string) $difficulty, $this->config->defaultTimeLimits())) {
                throw new DomainException('time_limit_difficulty');
            }
            if ((int) $seconds < $min || (int) $seconds > $max) {
                throw new DomainException('time_limit_range');
            }
            $limits[(string) $difficulty] = (int) $seconds;
        }
        $values['time_limits'] = $limits;
        $values['disabled_games'] = array_values(array_unique($values['disabled_games'] ?? []));
        if (array_diff($values['disabled_games'], MadarRun::GAMES) !== []) {
            throw new DomainException('unknown_game');
        }

        MadarClassSetting::updateOrCreate(['classroom_id' => $classroom->id], $values + ['updated_by' => $teacher->id]);
        $this->config->forget();

        return $this->settings($classroom);
    }

    // ── Un jeu fermé pour UN élève ──────────────────────────────────────────

    /**
     * Les jeux fermés pour un élève ACTIF de la classe — la liste entière est
     * remplacée ([] = tous ses jeux rouverts). Ce qui est fermé pour la classe
     * entière reste fermé : ce réglage-ci s'y AJOUTE.
     *
     * @param  string[]  $games
     */
    public function setStudentGames(User $teacher, Classroom $classroom, int $studentId, array $games): array
    {
        $games = array_values(array_unique($games));
        if (array_diff($games, MadarRun::GAMES) !== []) {
            throw new DomainException('unknown_game');
        }
        $isMember = ClassroomMembership::where('classroom_id', $classroom->id)->where('student_id', $studentId)->active()->exists();
        if (! $isMember) {
            throw new DomainException('student_not_in_class');
        }

        DB::transaction(function () use ($teacher, $classroom, $studentId, $games) {
            MadarStudentGameBlock::where('classroom_id', $classroom->id)->where('student_id', $studentId)->whereNotIn('game', $games ?: [''])->delete();
            foreach ($games as $game) {
                MadarStudentGameBlock::firstOrCreate(
                    ['classroom_id' => $classroom->id, 'student_id' => $studentId, 'game' => $game],
                    ['teacher_id' => $teacher->id],
                );
            }
        });

        return ['studentId' => $studentId, 'disabledGames' => $this->studentBlocks($classroom, [$studentId])[$studentId] ?? []];
    }

    /**
     * @param  int[]  $studentIds
     * @return array<int, string[]>
     */
    private function studentBlocks(Classroom $classroom, array $studentIds): array
    {
        $out = [];
        foreach (MadarStudentGameBlock::where('classroom_id', $classroom->id)->whereIn('student_id', $studentIds ?: [0])->orderBy('game')->get(['student_id', 'game']) as $row) {
            $out[(int) $row->student_id][] = $row->game;
        }

        return $out;
    }

    // ── Les questions et leur délai ─────────────────────────────────────────

    /**
     * Les questions de la « محطة التزوّد » servies à la classe ces 30 jours :
     * l'énoncé (court), la كفاءة, la difficulté, combien de fois servie /
     * répondue juste / hors délai, le temps médian — et le délai EFFECTIF,
     * que l'enseignant peut changer question par question.
     */
    public function items(Classroom $classroom, int $limit = 60): array
    {
        $since = now()->subDays(30);
        $stats = MadarRefuel::where('classroom_id', $classroom->id)->where('served_at', '>=', $since)
            ->groupBy('item_key')
            ->selectRaw('item_key, MAX(id) as sample_id, COUNT(*) as served, MAX(served_at) as last_served')
            ->selectRaw('SUM(CASE WHEN answered_at IS NOT NULL THEN 1 ELSE 0 END) as answered')
            ->selectRaw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct')
            ->selectRaw("SUM(CASE WHEN flag = 'timeout' THEN 1 ELSE 0 END) as timeouts")
            ->selectRaw('AVG(CASE WHEN answered_at IS NOT NULL THEN response_ms END) as avg_ms')
            ->orderByDesc('last_served')->limit($limit)->get();
        if ($stats->isEmpty()) {
            return ['items' => []];
        }

        $samples = MadarRefuel::whereIn('id', $stats->pluck('sample_id'))->with('lesson:id,code,title', 'learningPoint:id,code,title')->get()->keyBy('item_key');
        $overrides = MadarItemTimeLimit::where('classroom_id', $classroom->id)->whereIn('item_key', $stats->pluck('item_key'))->pluck('seconds', 'item_key');
        $classLimits = $this->config->forClassroom($classroom)['timeLimits'];

        $items = [];
        foreach ($stats as $row) {
            $sample = $samples->get($row->item_key);
            if ($sample === null) {
                continue;
            }
            $public = $this->presenter->public($sample, $sample->lesson->code);
            $byDifficulty = (int) ($classLimits[(string) $sample->difficulty] ?? $this->config->get('refuel.default_time_limit', 90));
            $items[] = [
                'itemKey' => $row->item_key,
                'lesson' => ['code' => $sample->lesson->code, 'title' => $sample->lesson->title],
                'learningPoint' => $sample->learningPoint?->title,
                'statement' => $public['question']['statement'] ?? null,
                'context' => mb_substr((string) ($public['statement']['content'] ?? ''), 0, 160),
                'difficulty' => $sample->difficulty,
                'served' => (int) $row->served,
                'answered' => (int) $row->answered,
                'correct' => (int) $row->correct,
                'timeouts' => (int) $row->timeouts,
                'avgSeconds' => $row->avg_ms !== null ? (int) round($row->avg_ms / 1000) : null,
                'timeLimit' => $overrides->has($row->item_key) ? (int) $overrides->get($row->item_key) : $byDifficulty,
                'customized' => $overrides->has($row->item_key),
                'difficultyLimit' => $byDifficulty,
            ];
        }

        return ['items' => $items];
    }

    /** Le délai d'une question pour la classe ; `null` revient au délai de sa difficulté. */
    public function setItemLimit(User $teacher, Classroom $classroom, string $itemKey, ?int $seconds): array
    {
        if (! AssessmentItem::where('item_key', $itemKey)->exists()) {
            throw new DomainException('item_not_found');
        }
        if ($seconds === null) {
            MadarItemTimeLimit::where('classroom_id', $classroom->id)->where('item_key', $itemKey)->delete();
        } else {
            [$min, $max] = $this->config->get('refuel.time_limit_range', [15, 600]);
            if ($seconds < $min || $seconds > $max) {
                throw new DomainException('time_limit_range');
            }
            MadarItemTimeLimit::updateOrCreate(
                ['classroom_id' => $classroom->id, 'item_key' => $itemKey],
                ['seconds' => $seconds, 'updated_by' => $teacher->id],
            );
        }

        return ['itemKey' => $itemKey, 'seconds' => $seconds];
    }

    // ── Cœurs donnés / retirés ──────────────────────────────────────────────

    /**
     * Donner (effort montré, travail fait hors de la plateforme) ou retirer
     * (triche) des cœurs à un élève ACTIF de la classe. Le plafond et le
     * plancher (0) s'appliquent ; le journal garde le demandé ET l'appliqué.
     */
    public function adjustHearts(User $teacher, Classroom $classroom, int $studentId, int $delta, string $reason, ?string $note): array
    {
        $max = (int) $this->config->get('adjustments.max_delta', 5);
        if ($delta === 0 || abs($delta) > $max) {
            throw new DomainException('adjustment_range');
        }
        if (! in_array($reason, MadarHeartAdjustment::REASONS, true)) {
            throw new DomainException('adjustment_reason');
        }
        $isMember = ClassroomMembership::where('classroom_id', $classroom->id)->where('student_id', $studentId)->active()->exists();
        $student = $isMember ? User::find($studentId) : null;
        if ($student === null) {
            throw new DomainException('student_not_in_class');
        }

        return DB::transaction(function () use ($teacher, $classroom, $student, $delta, $reason, $note) {
            $profile = $this->madar->profile($student, $this->madar->context($student), lock: true);
            $before = (int) $profile->hearts;
            $after = max(0, min($this->config->maxHearts(), $before + $delta));
            $profile->hearts = $after;
            $profile->save();

            $row = MadarHeartAdjustment::create([
                'classroom_id' => $classroom->id,
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'delta' => $delta,
                'applied' => $after - $before,
                'reason' => $reason,
                'note' => $note !== null && trim($note) !== '' ? mb_substr(trim($note), 0, 200) : null,
            ]);

            return ['adjustment' => $this->adjustmentView($row, $student), 'hearts' => $after, 'maxHearts' => $this->config->maxHearts()];
        });
    }

    private function adjustmentView(MadarHeartAdjustment $row, ?User $student): array
    {
        return [
            'id' => $row->id,
            'student' => ClassroomAccess::identity($student, $row->student_id),
            'delta' => (int) $row->delta,
            'applied' => (int) $row->applied,
            'reason' => $row->reason,
            'note' => $row->note,
            'at' => $row->created_at->toIso8601String(),
            'seen' => $row->seen_at !== null,
        ];
    }

    /** Les semaines où la classe a joué, de la plus récente à la plus ancienne (+ la semaine en cours). */
    public function weeks(Classroom $classroom, int $limit = 12): array
    {
        $weeks = MadarRun::where('classroom_id', $classroom->id)->select('week_start')->distinct()
            ->orderByDesc('week_start')->limit($limit)->pluck('week_start')
            ->map(fn ($d) => $d instanceof \DateTimeInterface ? $d->format('Y-m-d') : substr((string) $d, 0, 10))->all();
        $current = $this->config->weekStart();

        return array_values(array_unique(array_merge([$current], $weeks)));
    }

    // ── La semaine ──────────────────────────────────────────────────────────

    /**
     * La semaine de la classe : participation, le classement complet, et par
     * élève ses parties, son record, son approvisionnement — et ce qui
     * « mérite un regard » (jamais une accusation : un signal pour l'enseignant) :
     *
     *   gap       juste au jeu bien plus qu'en pratique sur les mêmes كفاءات
     *   timeouts  plusieurs réponses hors délai
     *   leaves    plusieurs fois la page quittée pendant une question
     *   fast      plusieurs réponses justes plus vite qu'on ne lit
     */
    public function results(Classroom $classroom, ?string $week = null, ?string $game = null): array
    {
        $game = in_array($game, MadarRun::GAMES, true) ? $game : MadarRun::GAME_ORBIT;
        $week = $this->config->weekStart($week);
        $tz = (string) $this->config->get('timezone');
        $weekFrom = CarbonImmutable::parse($week, $tz)->utc();
        $weekTo = CarbonImmutable::parse($week, $tz)->addDays(7)->utc();
        $settings = $this->config->forClassroom($classroom);
        $memberIds = ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();
        $users = User::whereIn('id', $memberIds)->get(explode(',', ClassroomAccess::IDENTITY_COLUMNS))->keyBy('id');
        $profiles = MadarProfile::whereIn('user_id', $memberIds)->get(['user_id', 'ship', 'best_score', 'defense_best', 'hearts'])->keyBy('user_id');

        $standings = collect($this->leaderboard->standings($classroom->id, $week, $game))->keyBy('userId');
        $flagged = MadarRun::where('classroom_id', $classroom->id)->where('week_start', $week)->where('flagged', true)
            ->whereIn('user_id', $memberIds ?: [0])->groupBy('user_id')->selectRaw('user_id, COUNT(*) as n')->pluck('n', 'user_id');
        $refuels = MadarRefuel::where('classroom_id', $classroom->id)
            ->whereIn('user_id', $memberIds ?: [0])
            ->where('served_at', '>=', $weekFrom)->where('served_at', '<', $weekTo)
            ->whereNotNull('answered_at')
            ->groupBy('user_id')
            ->selectRaw('user_id, COUNT(*) as answered, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct')
            ->selectRaw("SUM(CASE WHEN flag = 'timeout' THEN 1 ELSE 0 END) as timeouts")
            ->selectRaw("SUM(CASE WHEN flag = 'left' THEN 1 ELSE 0 END) as leaves")
            ->selectRaw("SUM(CASE WHEN flag = 'fast' THEN 1 ELSE 0 END) as fast")
            ->get()->keyBy('user_id');
        $gaps = $this->gaps($classroom, $memberIds, $weekFrom, $weekTo);
        // « المستكشف » : le record et les étoiles se lisent dans la progression par niveau.
        $levels = $game === MadarRun::GAME_EXPLORER
            ? MadarLevelProgress::where('game', MadarRun::GAME_EXPLORER)->whereIn('user_id', $memberIds ?: [0])->groupBy('user_id')
                ->selectRaw('user_id, MAX(best_score) as best, SUM(stars) as stars, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed')
                ->get()->keyBy('user_id')
            : collect();
        // Un jeu de mathématiques : le record se lit dans les parties terminées.
        $mathBest = MadarRun::isMath($game)
            ? MadarRun::where('game', $game)->where('status', MadarRun::STATUS_FINISHED)->whereIn('user_id', $memberIds ?: [0])
                ->groupBy('user_id')->selectRaw('user_id, MAX(score) as best')->pluck('best', 'user_id')
            : collect();
        $blocks = $this->studentBlocks($classroom, $memberIds);
        // Un jeu de mathématiques : la position de chaque élève dans les 50 niveaux.
        $math = MadarRun::isMath($game)
            ? MadarMathProgress::where('game', $game)->whereIn('user_id', $memberIds ?: [0])->get()->keyBy('user_id')
            : collect();
        $scoring = new SniperScoring($this->config->sniper());

        $students = [];
        foreach ($memberIds as $id) {
            $s = $standings->get($id);
            $r = $refuels->get($id);
            $g = $gaps[$id] ?? null;
            $row = [
                'student' => ClassroomAccess::identity($users->get($id), $id),
                'rank' => $s['rank'] ?? null,
                'weekBest' => $s['best'] ?? null,
                'runs' => $s['runs'] ?? 0,
                'weekWave' => $s['wave'] ?? null,
                'allTimeBest' => (int) match ($game) {
                    MadarRun::GAME_DEFENSE => $profiles->get($id)?->defense_best ?? 0,
                    MadarRun::GAME_EXPLORER => $levels->get($id)?->best ?? 0,
                    MadarRun::GAME_SNIPER, MadarRun::GAME_ODD, MadarRun::GAME_MENTAL => $mathBest->get($id) ?? 0,
                    default => $profiles->get($id)?->best_score ?? 0,
                },
                'levelStars' => $game === MadarRun::GAME_EXPLORER ? (int) ($levels->get($id)?->stars ?? 0) : null,
                'levelsCompleted' => $game === MadarRun::GAME_EXPLORER ? (int) ($levels->get($id)?->completed ?? 0) : null,
                'ship' => $profiles->get($id)?->ship ?? 'sahm',
                'hearts' => (int) ($profiles->get($id)?->hearts ?? 0),
                'refuelAnswered' => (int) ($r?->answered ?? 0),
                'refuelCorrect' => (int) ($r?->correct ?? 0),
                'timeouts' => (int) ($r?->timeouts ?? 0),
                'leaves' => (int) ($r?->leaves ?? 0),
                'fast' => (int) ($r?->fast ?? 0),
                'gap' => $g,
                'flaggedRuns' => (int) ($flagged[$id] ?? 0),
                'disabledGames' => $blocks[$id] ?? [],
                'mathLevel' => ($m = $math->get($id)) !== null
                    ? ['level' => $scoring->levelOf((int) $m->position), 'sub' => $scoring->subOf((int) $m->position), 'bestLevel' => $scoring->levelOf((int) $m->best_position)]
                    : null,
            ];
            $row['alerts'] = array_values(array_filter([
                $g !== null && $g['flagged'] ? 'gap' : null,
                $row['timeouts'] >= self::FLAG_ALERT ? 'timeouts' : null,
                $row['leaves'] >= self::FLAG_ALERT ? 'leaves' : null,
                $row['fast'] >= self::FLAG_ALERT ? 'fast' : null,
                $row['flaggedRuns'] > 0 ? 'score' : null,
            ]));
            $students[] = $row;
        }
        usort($students, fn ($a, $b) => [$a['rank'] === null, $a['rank'] ?? 0, $a['student']['firstName'] ?? ''] <=> [$b['rank'] === null, $b['rank'] ?? 0, $b['student']['firstName'] ?? '']);

        $answered = array_sum(array_column($students, 'refuelAnswered'));
        $correct = array_sum(array_column($students, 'refuelCorrect'));

        return [
            'week' => $week,
            'game' => $game,
            'weeks' => $this->weeks($classroom),
            'settings' => $settings,
            'members' => count($memberIds),
            'summary' => [
                // L'enseignant joue aussi : il est classé, mais n'est pas un « joueur » de la classe.
                'players' => $standings->where('isTeacher', false)->count(),
                'runs' => (int) $standings->where('isTeacher', false)->sum('runs'),
                'refuelAnswered' => $answered,
                'refuelCorrect' => $correct,
                'refuelAccuracy' => $answered > 0 ? round($correct / $answered, 3) : null,
                'alerts' => count(array_filter($students, fn ($s) => $s['alerts'] !== [])),
            ],
            'students' => $students,
            // La place de l'enseignant dans le classement de la semaine (« نافس أستاذك »), s'il a joué.
            'teacher' => ($t = $standings->firstWhere('isTeacher', true)) ? ['rank' => $t['rank'], 'best' => $t['best'], 'wave' => $t['wave']] : null,
            'adjustments' => MadarHeartAdjustment::where('classroom_id', $classroom->id)->latest('id')->limit(20)->get()
                ->map(fn ($row) => $this->adjustmentView($row, $users->get($row->student_id)))->all(),
        ];
    }

    /**
     * Par élève : sa justesse à la « محطة التزوّد » cette semaine, et sa
     * justesse EN PRATIQUE (preuves hors « مدار », 60 derniers jours) sur les
     * mêmes كفاءات. Un écart ≥ GAP_THRESHOLD, avec assez de réponses des deux
     * côtés, est signalé. Deux requêtes groupées pour toute la classe.
     *
     * @param  int[]  $memberIds
     * @return array<int, array{refuel: float, practice: ?float, flagged: bool}>
     */
    private function gaps(Classroom $classroom, array $memberIds, CarbonImmutable $from, CarbonImmutable $to): array
    {
        if ($memberIds === []) {
            return [];
        }
        $answers = MadarRefuel::where('classroom_id', $classroom->id)->whereIn('user_id', $memberIds)
            ->where('served_at', '>=', $from)->where('served_at', '<', $to)
            ->whereNotNull('answered_at')->whereNotIn('outcome', ['abandoned', 'syntax_error'])
            ->get(['user_id', 'learning_point_id', 'is_correct']);
        if ($answers->isEmpty()) {
            return [];
        }
        $points = $answers->pluck('learning_point_id')->unique()->values()->all();
        $practice = DB::table('learning_evidence as le')
            ->join('learning_evidence_learning_point as lelp', 'lelp.learning_evidence_id', '=', 'le.id')
            ->whereIn('le.user_id', $memberIds)
            ->whereIn('lelp.learning_point_id', $points)
            ->where(fn ($q) => $q->whereNull('le.source_id')->orWhere('le.source_id', 'not like', 'madar:%'))
            ->where('le.submitted_at', '>=', now()->subDays(60))
            ->whereIn('le.outcome', ['correct', 'equivalent_correct', 'partially_correct', 'incorrect'])
            ->groupBy('le.user_id', 'lelp.learning_point_id')
            ->selectRaw("le.user_id, lelp.learning_point_id, COUNT(*) as n, SUM(CASE WHEN le.outcome IN ('correct', 'equivalent_correct') THEN 1 ELSE 0 END) as ok")
            ->get();
        $byUser = [];
        foreach ($practice as $p) {
            $byUser[(int) $p->user_id][(int) $p->learning_point_id] = ['n' => (int) $p->n, 'ok' => (int) $p->ok];
        }

        $out = [];
        foreach ($answers->groupBy('user_id') as $userId => $rows) {
            $n = $rows->count();
            $refuelRate = $rows->where('is_correct', true)->count() / $n;
            $pn = 0;
            $pok = 0;
            foreach ($rows->pluck('learning_point_id')->unique() as $lp) {
                $pn += $byUser[(int) $userId][(int) $lp]['n'] ?? 0;
                $pok += $byUser[(int) $userId][(int) $lp]['ok'] ?? 0;
            }
            $practiceRate = $pn > 0 ? $pok / $pn : null;
            $out[(int) $userId] = [
                'refuel' => round($refuelRate, 3),
                'practice' => $practiceRate !== null ? round($practiceRate, 3) : null,
                'flagged' => $n >= self::GAP_MIN_REFUEL && $pn >= self::GAP_MIN_PRACTICE && $practiceRate !== null
                    && $refuelRate - $practiceRate >= self::GAP_THRESHOLD,
            ];
        }

        return $out;
    }

    /**
     * L'écran du tableau : les dix premiers de la semaine (prénom + initiale,
     * vaisseau, score) et la participation. Jamais un courriel, jamais un nom
     * de famille complet, jamais l'approvisionnement d'un élève.
     */
    public function display(Classroom $classroom, ?string $week = null, ?string $game = null): array
    {
        $game = in_array($game, MadarRun::GAMES, true) ? $game : MadarRun::GAME_ORBIT;
        $week = $this->config->weekStart($week);
        $view = $this->leaderboard->view($classroom->id, $week, null, 10, $game);
        $members = ClassroomMembership::where('classroom_id', $classroom->id)->active()->count();

        return [
            'classroom' => ['id' => $classroom->id, 'name' => $classroom->name],
            'week' => $week,
            'game' => $game,
            'top' => array_map(fn ($row) => array_diff_key($row, ['isMe' => true]), $view['top']),
            'participants' => $view['participants'],
            'members' => $members,
            'competitionEnabled' => (bool) $this->config->forClassroom($classroom)['competitionEnabled'],
        ];
    }
}
