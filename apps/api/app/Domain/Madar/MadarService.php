<?php

namespace App\Domain\Madar;

use App\Domain\Classroom\StudyContextService;
use App\Domain\DailyChallenge\ChallengeQuestionPresenter;
use App\Domain\DailyChallenge\ChallengeQuestionSelector;
use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\ProgressEngine;
use App\Models\Classroom;
use App\Models\MadarHeartAdjustment;
use App\Models\MadarLevelProgress;
use App\Models\MadarMathProgress;
use App\Models\MadarProfile;
use App\Models\MadarRefuel;
use App\Models\MadarRun;
use App\Models\MadarStudentGameBlock;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * « مدار » côté élève : les cœurs, les parties (orbite et « دفاع الكوكب »),
 * la « محطة التزوّد ».
 *
 * La boucle (docs/architecture/MADAR_GAME.md) :
 *
 *   jouer  ── une partie coûte ❤️, une reprise après un crash aussi
 *     │
 *     ▼  plus de cœurs
 *   محطة التزوّد ── une question de SES كفاءات fragiles, servie sans clé ;
 *     │             juste → +❤️ (et une preuve d'apprentissage ordinaire)
 *     ▼
 *   rejouer, battre son record, monter au classement de la semaine
 *
 * Ce que le SERVEUR possède : les cœurs, l'instant où une partie commence et
 * finit (donc la borne du score), la limite quotidienne, la question servie,
 * la justesse, les vaisseaux et tourelles débloqués, le classement. Le client
 * annonce un score et une réponse brute ; rien d'autre n'est cru.
 *
 * Le jeu et la maîtrise restent séparés : la réponse passe par la SEULE porte
 * (ProgressEngine::recordEvidence, poids de pratique) ; un cœur ou un score ne
 * touchent jamais l'état de maîtrise. Terminer une leçon ne débloque rien ici.
 */
class MadarService
{
    public function __construct(
        private MadarConfig $config,
        private MadarLeaderboard $leaderboard,
        private StudyContextService $studyContext,
        private ChallengeQuestionSelector $selector,
        private ChallengeQuestionPresenter $presenter,
        private AnswerEvaluator $evaluator,
        private ProgressEngine $progress,
        private ExplorerLevels $levels,
    ) {}

    /**
     * L'ENSEIGNANT qui joue dans une de ses classes (« نافس أستاذك ») : ses
     * parties comptent dans le classement de CETTE classe, son record se lit
     * classe par classe. Il joue librement (aucun cœur, pas de محطة التزوّد —
     * ses parties ne sont jamais des preuves d'apprentissage), même un jeu fermé
     * aux élèves, et tous les niveaux des jeux de mathématiques lui sont ouverts.
     */
    private ?Classroom $teacherClass = null;

    /** Le même service, pour un enseignant qui joue dans `$classroom` (le contrôleur a vérifié la propriété). */
    public function asTeacherIn(Classroom $classroom): static
    {
        $copy = clone $this;
        $copy->teacherClass = $classroom;

        return $copy;
    }

    private function isTeacherPlay(array $ctx): bool
    {
        return (bool) ($ctx['teacher'] ?? false);
    }

    /** Un jeu sans cœur : un jeu gratuit, ou n'importe quel jeu pour l'enseignant. */
    private function isFreeFor(array $ctx, string $game): bool
    {
        return $this->isTeacherPlay($ctx) || self::isFree($game);
    }

    /** Le record de l'enseignant DANS la classe où il joue (une partie exclue au besoin). */
    private function classBest(User $user, string $game, ?int $exceptRunId = null, string $column = 'score'): int
    {
        return (int) MadarRun::where('user_id', $user->id)->where('game', $game)->where('classroom_id', $this->teacherClass?->id)
            ->where('status', MadarRun::STATUS_FINISHED)->when($exceptRunId, fn ($q) => $q->whereKeyNot($exceptRunId))->max($column);
    }

    // ── Contexte ────────────────────────────────────────────────────────────

    /**
     * La classe dans laquelle l'élève joue (sa classe principale), ses
     * réglages, et les jeux que l'enseignant a fermés pour CET élève. Un élève
     * indépendant joue seul, sans classement.
     *
     * @return array{classroom: ?Classroom, settings: array<string, mixed>, studentDisabledGames: string[]}
     */
    public function context(User $student): array
    {
        if ($this->teacherClass !== null) {
            return ['classroom' => $this->teacherClass, 'settings' => $this->config->forClassroom($this->teacherClass), 'studentDisabledGames' => [], 'teacher' => true];
        }
        $primary = $this->studyContext->resolve($student)['primary'] ?? null;
        $classroom = $primary !== null ? Classroom::find($primary['id']) : null;
        if ($classroom !== null && ! $classroom->isActive()) {
            $classroom = null;
        }
        $blocked = $classroom !== null
            ? MadarStudentGameBlock::where('classroom_id', $classroom->id)->where('student_id', $student->id)->pluck('game')->all()
            : [];

        return ['classroom' => $classroom, 'settings' => $this->config->forClassroom($classroom), 'studentDisabledGames' => $blocked];
    }

    /** Qui a fermé ce jeu pour cet élève : `class`, `student`, ou personne (null). */
    private function gameClosedBy(array $ctx, string $game): ?string
    {
        if ($this->isTeacherPlay($ctx)) {
            return null;
        }
        if (in_array($game, $ctx['settings']['disabledGames'], true)) {
            return 'class';
        }

        return in_array($game, $ctx['studentDisabledGames'] ?? [], true) ? 'student' : null;
    }

    public static function isFree(string $game): bool
    {
        return in_array($game, MadarRun::FREE_GAMES, true);
    }

    private function closedReason(array $ctx): ?string
    {
        if (! $this->config->enabled()) {
            return MadarException::DISABLED;
        }
        if ($ctx['classroom'] !== null && ! $ctx['settings']['enabled'] && ! $this->isTeacherPlay($ctx)) {
            return MadarException::DISABLED_BY_TEACHER;
        }

        return null;
    }

    private function assertOpen(array $ctx): void
    {
        if (($reason = $this->closedReason($ctx)) !== null) {
            throw new MadarException($reason);
        }
    }

    /**
     * Le profil de jeu, créé au premier passage, et la dotation du jour versée
     * une fois : les cœurs remontent À `dailyFreeHearts` s'ils sont en
     * dessous — jamais au-delà, et jamais cumulés d'un jour sur l'autre.
     */
    public function profile(User $student, array $ctx, bool $lock = false): MadarProfile
    {
        $today = $this->config->today();
        $free = (int) $ctx['settings']['dailyFreeHearts'];

        $query = MadarProfile::where('user_id', $student->id);
        $profile = ($lock ? $query->lockForUpdate() : $query)->first();
        if ($profile === null) {
            $profile = MadarProfile::firstOrCreate(
                ['user_id' => $student->id],
                ['hearts' => min($free, $this->config->maxHearts()), 'hearts_refilled_on' => $today],
            );
            if ($lock) {
                $profile = MadarProfile::whereKey($profile->id)->lockForUpdate()->first();
            }
        }

        if ($profile->hearts_refilled_on?->format('Y-m-d') !== $today) {
            $profile->hearts = max((int) $profile->hearts, min($free, $this->config->maxHearts()));
            $profile->hearts_refilled_on = $today;
            $profile->save();
        }

        return $profile;
    }

    // ── L'écran ─────────────────────────────────────────────────────────────

    public function state(User $student): array
    {
        $this->abandonStale($student);
        $ctx = $this->context($student);
        $reason = $this->closedReason($ctx);
        $profile = $this->profile($student, $ctx);
        $week = $this->config->weekStart();

        return [
            'available' => $reason === null,
            'reason' => $reason,
            'week' => $week,
        ] + $this->profileView($student, $profile, $ctx) + [
            'weekBest' => $this->weekBest($student, $week),
            'scope' => [
                'type' => $ctx['classroom'] ? 'classroom' : 'student',
                'classroom' => $ctx['classroom'] ? ['id' => $ctx['classroom']->id, 'name' => $ctx['classroom']->name] : null,
            ],
            'competition' => $this->competitionView($ctx, $student, $week),
            'games' => array_map(fn ($g) => [
                'id' => $g,
                'category' => MadarRun::CATEGORIES[$g],
                'free' => $this->isFreeFor($ctx, $g),
                'enabled' => $this->gameClosedBy($ctx, $g) === null,
                'closedBy' => $this->gameClosedBy($ctx, $g),
            ], MadarRun::GAMES),
            'teacher' => $this->isTeacherPlay($ctx),
            'defense' => [
                'best' => $this->isTeacherPlay($ctx) ? $this->classBest($student, MadarRun::GAME_DEFENSE) : (int) $profile->defense_best,
                'bestWave' => (int) $profile->defense_best_wave,
                'runsCount' => (int) $profile->defense_runs,
                'weekBest' => $this->weekBest($student, $week, MadarRun::GAME_DEFENSE),
                'turrets' => MadarTurrets::view($profile),
                'competition' => $this->competitionView($ctx, $student, $week, MadarRun::GAME_DEFENSE),
            ],
            'explorer' => $this->explorerView($ctx, $student, $week),
            'sniper' => $this->mathView($ctx, $student, $week, MadarRun::GAME_SNIPER),
            'odd' => $this->mathView($ctx, $student, $week, MadarRun::GAME_ODD),
            'mental' => $this->mathView($ctx, $student, $week, MadarRun::GAME_MENTAL),
            'adjustments' => $this->consumeAdjustments($student),
        ];
    }

    /**
     * « المستكشف » : les niveaux (ouverts ou non, étoiles, meilleur score), le
     * total d'étoiles, le classement de la semaine. Le niveau 1 est ouvert ; un
     * niveau réussi ouvre le suivant.
     */
    private function explorerView(array $ctx, User $student, string $week): array
    {
        $progress = MadarLevelProgress::where('user_id', $student->id)->where('game', MadarRun::GAME_EXPLORER)->get()->keyBy('level');
        $levels = [];
        foreach ($this->levels->levels() as $level) {
            $n = (int) $level['n'];
            $row = $progress->get($n);
            $levels[] = [
                'n' => $n,
                'world' => $level['world'],
                'unlocked' => $this->levelUnlocked($student, $n, $progress),
                'completed' => $row?->completed_at !== null,
                'stars' => (int) ($row?->stars ?? 0),
                'best' => (int) ($row?->best_score ?? 0),
                'crystals' => $this->levels->totalCrystals($n),
            ];
        }

        return [
            'levels' => $levels,
            'totalStars' => (int) $progress->sum('stars'),
            'maxStars' => 3 * count($levels),
            'best' => (int) $progress->max('best_score'),
            'weekBest' => $this->weekBest($student, $week, MadarRun::GAME_EXPLORER),
            'competition' => $this->competitionView($ctx, $student, $week, MadarRun::GAME_EXPLORER),
        ];
    }

    /**
     * Un jeu de mathématiques (« قنّاص القيم », « الدخيل ») : le record, la
     * manche la plus lointaine, les parties, le classement de la semaine — tout
     * se lit dans les parties terminées — et la position de l'élève dans les 50
     * niveaux, propre à CE jeu.
     */
    private function mathView(array $ctx, User $student, string $week, string $game): array
    {
        $runs = MadarRun::where('user_id', $student->id)->where('game', $game)->where('status', MadarRun::STATUS_FINISHED)
            ->selectRaw('MAX(score) as best, MAX(wave) as best_round, COUNT(*) as n')->first();
        $math = $this->mathProgress($ctx, $student, $game);

        return [
            'best' => $this->isTeacherPlay($ctx) ? $this->classBest($student, $game) : (int) ($runs?->best ?? 0),
            'bestRound' => (int) ($runs?->best_round ?? 0),
            'runsCount' => (int) ($runs?->n ?? 0),
            'weekBest' => $this->weekBest($student, $week, $game),
            'competition' => $this->competitionView($ctx, $student, $week, $game),
        ] + $math;
    }

    /** La borne d'un jeu de mathématiques ; les positions viennent toujours de SniperScoring. */
    private function mathScoring(string $game): SniperScoring|OddScoring
    {
        return in_array($game, [MadarRun::GAME_ODD, MadarRun::GAME_MENTAL], true)
            ? new OddScoring((array) $this->config->get($game, []), $this->sniperScoring())
            : $this->sniperScoring();
    }

    private function sniperScoring(): SniperScoring
    {
        return new SniperScoring($this->config->sniper());
    }

    /**
     * Où en est l'élève dans les 50 niveaux d'un jeu de mathématiques. Sans
     * partie jouée : au niveau d'entrée de son année (`sniper.entry`). Ouvert :
     * tout ce qui précède l'entrée de son année, et jusqu'au plus haut atteint.
     *
     * @return array{position: int, level: int, sub: int, bestPosition: int, bestLevel: int, entryLevel: int, unlockedUpTo: int, levels: int, subLevels: int}
     */
    private function mathProgress(array $ctx, User $student, string $game): array
    {
        $scoring = $this->sniperScoring();
        $grade = strtolower((string) ($student->grade ?? $ctx['classroom']?->grade));
        // Un jeu peut avoir sa propre entrée par année (« الحساب الذهني ») ; sinon celle des 50 niveaux partagés.
        $own = (array) $this->config->get("{$game}.entry", []);
        $entry = isset($own[$grade]) ? (int) $own[$grade] : $scoring->entryLevel($grade);
        $row = MadarMathProgress::where('user_id', $student->id)->where('game', $game)->first();
        $position = $row ? (int) $row->position : $scoring->positionOf($entry);
        $best = $row ? max((int) $row->best_position, $position) : $position;
        $sniper = $this->config->sniper();

        return [
            'position' => $position,
            'level' => $scoring->levelOf($position),
            'sub' => $scoring->subOf($position),
            'bestPosition' => $best,
            'bestLevel' => $scoring->levelOf($best),
            'entryLevel' => $entry,
            // L'enseignant peut essayer n'importe quel niveau.
            'unlockedUpTo' => $this->isTeacherPlay($ctx) ? (int) $this->config->sniper()['levels'] : max($entry, $scoring->levelOf($best)),
            'levels' => (int) $sniper['levels'],
            'subLevels' => (int) $sniper['sub_levels'],
        ];
    }

    private function levelUnlocked(User $student, int $n, $progress = null): bool
    {
        if ($n <= 1) {
            return true;
        }
        $progress ??= MadarLevelProgress::where('user_id', $student->id)->where('game', MadarRun::GAME_EXPLORER)->get()->keyBy('level');

        return $progress->get($n - 1)?->completed_at !== null;
    }

    /**
     * Les cœurs que l'enseignant a donnés ou retirés depuis la dernière
     * visite — montrés UNE fois (motif compris), puis marqués lus.
     *
     * @return array<int, array{applied: int, reason: string, note: ?string, at: string}>
     */
    private function consumeAdjustments(User $student): array
    {
        $rows = MadarHeartAdjustment::where('student_id', $student->id)->whereNull('seen_at')->orderBy('id')->limit(10)->get();
        if ($rows->isEmpty()) {
            return [];
        }
        MadarHeartAdjustment::whereIn('id', $rows->pluck('id'))->update(['seen_at' => now()]);

        return $rows->map(fn ($r) => [
            'applied' => (int) $r->applied,
            'reason' => $r->reason,
            'note' => $r->note,
            'at' => $r->created_at->toIso8601String(),
        ])->all();
    }

    private function profileView(User $student, MadarProfile $profile, array $ctx): array
    {
        return [
            // L'enseignant joue sans cœur : la réserve est toujours pleine.
            'hearts' => $this->isTeacherPlay($ctx) ? $this->config->maxHearts() : (int) $profile->hearts,
            'maxHearts' => $this->config->maxHearts(),
            'dailyFreeHearts' => (int) $ctx['settings']['dailyFreeHearts'],
            'runsToday' => $this->runsToday($student),
            'dailyRunCap' => (int) $ctx['settings']['dailyRunCap'],
            'maxRevives' => (int) $this->config->get('runs.max_revives', 2),
            'best' => $this->isTeacherPlay($ctx) ? $this->classBest($student, MadarRun::GAME_ORBIT) : (int) $profile->best_score,
            'runsCount' => (int) $profile->runs_count,
            'starsTotal' => (int) $profile->stars_total,
            'refuel' => ['answered' => (int) $profile->refuel_answered, 'correct' => (int) $profile->refuel_correct],
            'ship' => MadarShips::exists((string) $profile->ship) ? $profile->ship : 'sahm',
            'ships' => MadarShips::view($profile),
        ];
    }

    private function competitionView(array $ctx, User $student, string $week, string $game = MadarRun::GAME_ORBIT): ?array
    {
        // L'enseignant voit toujours le classement de la classe où il joue.
        if ($ctx['classroom'] === null || (! $ctx['settings']['competitionEnabled'] && ! $this->isTeacherPlay($ctx))) {
            return null;
        }

        return $this->leaderboard->view($ctx['classroom']->id, $week, $student->id, 10, $game);
    }

    /** Les parties du jour, TOUS jeux confondus : la limite est un temps d'écran. */
    private function runsToday(User $student): int
    {
        return MadarRun::where('user_id', $student->id)->where('run_date', $this->config->today())->count();
    }

    private function weekBest(User $student, string $week, string $game = MadarRun::GAME_ORBIT): int
    {
        return (int) MadarRun::where('user_id', $student->id)->where('week_start', $week)->where('game', $game)
            ->when($this->teacherClass, fn ($q) => $q->where('classroom_id', $this->teacherClass->id))
            ->where('status', MadarRun::STATUS_FINISHED)->max('score');
    }

    /**
     * La graine d'une partie. Orbite : au hasard. « دفاع الكوكب » et « قنّاص
     * القيم » : la carte (les cibles) de la SEMAINE — la même pour toute la
     * classe (ou pour l'élève seul), pour que le classement compare des parties
     * sur le même terrain.
     */
    private function seedFor(string $game, array $ctx, User $student, string $week): int
    {
        if ($game !== MadarRun::GAME_DEFENSE && ! MadarRun::isMath($game)) {
            return random_int(1, 2_147_483_646);
        }
        $scope = $ctx['classroom'] ? 'c'.$ctx['classroom']->id : 'u'.$student->id;

        return max(1, crc32("{$game}|{$scope}|{$week}") & 0x7FFFFFFF);
    }

    /** Une partie ouverte depuis trop longtemps ne se terminera plus. */
    private function abandonStale(User $student): void
    {
        MadarRun::where('user_id', $student->id)->where('status', MadarRun::STATUS_IN_PROGRESS)
            ->where('started_at', '<', now()->subMinutes((int) $this->config->get('runs.max_minutes', 30)))
            ->update(['status' => MadarRun::STATUS_ABANDONED]);
    }

    // ── Les parties ─────────────────────────────────────────────────────────

    /**
     * Une partie : un cœur (sauf un jeu gratuit, MadarRun::FREE_GAMES), une
     * graine (le monde est généré depuis elle), un départ posé par le serveur.
     * Une partie restée ouverte est abandonnée — son cœur était déjà dépensé.
     * La limite de parties du jour compte TOUS les jeux, gratuits compris.
     */
    public function startRun(User $student, string $game = MadarRun::GAME_ORBIT, ?int $level = null): array
    {
        $ctx = $this->context($student);
        $this->assertOpen($ctx);
        if (! in_array($game, MadarRun::GAMES, true)) {
            throw new MadarException(MadarException::NOT_FOUND);
        }
        $closedBy = $this->gameClosedBy($ctx, $game);
        if ($closedBy !== null) {
            throw new MadarException($closedBy === 'class' ? MadarException::GAME_DISABLED : MadarException::GAME_DISABLED_FOR_STUDENT);
        }
        $startPosition = null;
        if (MadarRun::isMath($game)) {
            // Le jeu reprend à la position de l'élève ; il peut aussi rejouer un niveau OUVERT.
            $math = $this->mathProgress($ctx, $student, $game);
            if ($level !== null) {
                if ($level < 1 || $level > $math['levels']) {
                    throw new MadarException(MadarException::NOT_FOUND);
                }
                if ($level > $math['unlockedUpTo']) {
                    throw new MadarException(MadarException::LEVEL_LOCKED);
                }
                $startPosition = $level === $math['level'] ? $math['position'] : $this->sniperScoring()->positionOf($level);
            } else {
                $startPosition = $math['position'];
            }
        }
        if ($game === MadarRun::GAME_EXPLORER) {
            $level ??= 1;
            if ($this->levels->find($level) === null) {
                throw new MadarException(MadarException::NOT_FOUND);
            }
            if (! $this->levelUnlocked($student, $level)) {
                throw new MadarException(MadarException::LEVEL_LOCKED);
            }
        }

        return DB::transaction(function () use ($student, $ctx, $game, $level, $startPosition) {
            $profile = $this->profile($student, $ctx, lock: true);

            if ($this->runsToday($student) >= (int) $ctx['settings']['dailyRunCap']) {
                throw new MadarException(MadarException::DAILY_CAP);
            }
            $free = $this->isFreeFor($ctx, $game);
            if (! $free && (int) $profile->hearts < 1) {
                throw new MadarException(MadarException::NO_HEARTS);
            }

            MadarRun::where('user_id', $student->id)->where('status', MadarRun::STATUS_IN_PROGRESS)
                ->update(['status' => MadarRun::STATUS_ABANDONED]);

            if (! $free) {
                $profile->decrement('hearts');
            }
            $today = $this->config->today();
            $week = $this->config->weekStart($today);
            $run = MadarRun::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => $student->id,
                'game' => $game,
                'classroom_id' => $ctx['classroom']?->id,
                'run_date' => $today,
                'week_start' => $week,
                // « المستكشف » : la carte EST le niveau — la graine est son numéro.
                'seed' => $game === MadarRun::GAME_EXPLORER ? $level : $this->seedFor($game, $ctx, $student, $week),
                'wave' => $game === MadarRun::GAME_EXPLORER ? $level : null,
                'level_start' => $startPosition,
                'status' => MadarRun::STATUS_IN_PROGRESS,
                'started_at' => now(),
            ]);

            return [
                'run' => ['id' => $run->uuid, 'game' => $game, 'seed' => (int) $run->seed, 'level' => $game === MadarRun::GAME_EXPLORER ? $level : null, 'position' => $startPosition, 'revives' => 0],
                'hearts' => (int) $profile->fresh()->hearts,
                'runsToday' => $this->runsToday($student),
            ];
        });
    }

    public function ownedRun(User $student, string $uuid): MadarRun
    {
        return MadarRun::where('uuid', $uuid)->where('user_id', $student->id)->first()
            ?? throw new MadarException(MadarException::NOT_FOUND);
    }

    /**
     * Reprendre après un crash (orbite) ou sauver la planète au bord de la
     * chute (« دفاع الكوكب », bouclier d'urgence) : un cœur, au plus
     * `max_revives` fois par partie.
     */
    public function revive(User $student, MadarRun $run): array
    {
        $ctx = $this->context($student);
        $this->assertOpen($ctx);

        return DB::transaction(function () use ($student, $ctx, $run) {
            $locked = MadarRun::whereKey($run->id)->lockForUpdate()->first();
            if (! $locked->isOpen()) {
                throw new MadarException(MadarException::RUN_CLOSED);
            }
            // Un jeu gratuit n'a pas de reprise : la partie s'arrête, on en relance une.
            if (self::isFree($locked->game) || (int) $locked->revives >= (int) $this->config->get('runs.max_revives', 2)) {
                throw new MadarException(MadarException::REVIVE_LIMIT);
            }
            $profile = $this->profile($student, $ctx, lock: true);
            // L'enseignant reprend sans cœur (toujours dans la limite de reprises).
            if (! $this->isTeacherPlay($ctx)) {
                if ((int) $profile->hearts < 1) {
                    throw new MadarException(MadarException::NO_HEARTS);
                }
                $profile->decrement('hearts');
            }
            $locked->increment('revives');

            return ['revives' => (int) $locked->revives, 'hearts' => $this->isTeacherPlay($ctx) ? $this->config->maxHearts() : (int) $profile->fresh()->hearts];
        });
    }

    /**
     * La fin d'une partie. Le score annoncé est borné par la durée RÉELLE —
     * MadarScoring pour l'orbite, DefenseScoring pour « دفاع الكوكب » (qui
     * borne aussi la vague), SniperScoring pour « قنّاص القيم » (qui borne la
     * manche) ; une seconde clôture renvoie la première, inchangée.
     */
    /** @param  array{position?: ?int, peak?: ?int}  $math  « قنّاص القيم » : la position d'arrivée et la plus haute annoncées */
    public function finishRun(User $student, MadarRun $run, int $claimed, int $stars, int $wave = 0, bool $completed = false, array $math = []): array
    {
        if ($run->game === MadarRun::GAME_EXPLORER) {
            return $this->finishLevel($student, $run, $claimed, $stars, $completed);
        }
        $ctx = $this->context($student);
        $isDefense = $run->game === MadarRun::GAME_DEFENSE;
        $isMath = MadarRun::isMath($run->game);

        $outcome = DB::transaction(function () use ($student, $ctx, $run, $claimed, $stars, $wave, $isDefense, $isMath, $math) {
            $locked = MadarRun::whereKey($run->id)->lockForUpdate()->first();
            if ($locked->status === MadarRun::STATUS_FINISHED) {
                return ['run' => $locked, 'previousBest' => null, 'unlocked' => [], 'unlockedTurrets' => [], 'rankBefore' => null, 'duplicate' => true];
            }
            if ($locked->status !== MadarRun::STATUS_IN_PROGRESS) {
                throw new MadarException(MadarException::RUN_CLOSED);
            }

            $profile = $this->profile($student, $ctx, lock: true);
            $shipsBefore = MadarShips::unlocked($profile);
            $turretsBefore = MadarTurrets::unlocked($profile);
            $week = $locked->week_start->format('Y-m-d');
            $competes = $locked->classroom_id !== null && ($ctx['settings']['competitionEnabled'] || $this->isTeacherPlay($ctx));
            $rankBefore = $competes ? $this->leaderboard->rankOf($locked->classroom_id, $week, $student->id, $locked->game) : null;

            $finishedAt = now();
            $maxMs = (int) $this->config->get('runs.max_minutes', 30) * 60_000;
            $duration = min($maxMs, max(0, (int) $locked->started_at->diffInMilliseconds($finishedAt, false)));

            if ($isDefense) {
                $settled = (new DefenseScoring($this->config->defense()))->settle($claimed, $wave, $duration);
                // `stars` porte les ennemis abattus : jamais plus que le score n'en contient.
                $stars = min(max(0, $stars), $settled['score']);
            } elseif ($isMath) {
                $sniper = $this->config->sniper();
                $settled = $this->mathScoring($locked->game)->settle($claimed, $wave, $duration, (int) ($locked->level_start ?? 0), $math['position'] ?? null, $math['peak'] ?? null);
                // `stars` porte les cibles touchées : chacune vaut au moins `points_base`.
                $stars = min(max(0, $stars), intdiv($settled['score'], max(1, (int) $sniper['points_base'])));
            } else {
                $settled = (new MadarScoring($this->config->physics()))->settle($claimed, $duration) + ['wave' => null];
                $physics = $this->config->physics();
                // Une étoile vaut au moins `star_points` : pas plus d'étoiles que le score n'en contient.
                $stars = min(max(0, $stars), intdiv($settled['score'], max(1, (int) $physics['star_points'])));
            }

            $locked->fill([
                'status' => MadarRun::STATUS_FINISHED,
                'finished_at' => $finishedAt,
                'duration_ms' => $duration,
                'claimed_score' => max(0, $claimed),
                'score' => $settled['score'],
                'stars' => min($stars, 65535),
                'wave' => $settled['wave'],
                'level_end' => $isMath ? $settled['position'] : null,
                'flagged' => $settled['flagged'],
            ])->save();

            if ($isMath) {
                // La position de l'élève avance (ou recule) : la prochaine partie reprend là.
                $progress = MadarMathProgress::where('user_id', $student->id)->where('game', $locked->game)->lockForUpdate()->first()
                    ?? new MadarMathProgress(['user_id' => $student->id, 'game' => $locked->game, 'position' => 0, 'best_position' => 0]);
                $progress->position = $settled['position'];
                $progress->best_position = max((int) $progress->best_position, $settled['peak'], $settled['position']);
                $progress->rounds = (int) $progress->rounds + (int) $settled['wave'];
                $progress->save();
            }

            if ($isMath) {
                // Le record se lit dans les parties terminées avant celle-ci.
                $previousBest = (int) MadarRun::where('user_id', $student->id)->where('game', $locked->game)
                    ->where('status', MadarRun::STATUS_FINISHED)->whereKeyNot($locked->id)->max('score');
            } elseif ($isDefense) {
                $previousBest = (int) $profile->defense_best;
                $profile->defense_runs = (int) $profile->defense_runs + 1;
                if ($settled['score'] > $previousBest) {
                    $profile->defense_best = $settled['score'];
                    $profile->defense_best_at = $finishedAt;
                }
                $profile->defense_best_wave = max((int) $profile->defense_best_wave, (int) $settled['wave']);
            } else {
                $previousBest = (int) $profile->best_score;
                $profile->runs_count = (int) $profile->runs_count + 1;
                $profile->stars_total = (int) $profile->stars_total + $stars;
                if ($settled['score'] > $previousBest) {
                    $profile->best_score = $settled['score'];
                    $profile->best_at = $finishedAt;
                }
            }
            $profile->save();
            // L'enseignant : son record, c'est celui de CETTE classe.
            if ($this->isTeacherPlay($ctx)) {
                $previousBest = $this->classBest($student, $locked->game, $locked->id);
            }

            if ($settled['flagged']) {
                Log::warning('madar.score_clamped', ['run' => $locked->uuid, 'game' => $locked->game, 'claimed' => $claimed, 'score' => $settled['score'], 'duration_ms' => $duration]);
            }

            return [
                'run' => $locked,
                'previousBest' => $previousBest,
                'unlocked' => array_values(array_diff(MadarShips::unlocked($profile), $shipsBefore)),
                'unlockedTurrets' => array_values(array_diff(MadarTurrets::unlocked($profile), $turretsBefore)),
                'rankBefore' => $rankBefore,
                'duplicate' => false,
            ];
        });

        /** @var MadarRun $finished */
        $finished = $outcome['run'];
        $profile = MadarProfile::where('user_id', $student->id)->first();
        $competes = $finished->classroom_id !== null && ($ctx['settings']['competitionEnabled'] || $this->isTeacherPlay($ctx));
        $week = $finished->week_start->format('Y-m-d');
        $best = match (true) {
            $this->isTeacherPlay($ctx) => $this->classBest($student, $finished->game),
            $isDefense => (int) $profile->defense_best,
            $isMath => (int) MadarRun::where('user_id', $student->id)->where('game', $finished->game)->where('status', MadarRun::STATUS_FINISHED)->max('score'),
            default => (int) $profile->best_score,
        };

        return [
            'duplicate' => $outcome['duplicate'],
            'run' => [
                'id' => $finished->uuid,
                'game' => $finished->game,
                'score' => (int) $finished->score,
                'stars' => (int) $finished->stars,
                'wave' => $finished->wave !== null ? (int) $finished->wave : null,
                'durationMs' => (int) $finished->duration_ms,
                'flagged' => (bool) $finished->flagged,
            ],
            'best' => $best,
            'bestWave' => match (true) {
                $isDefense => (int) $profile->defense_best_wave,
                $isMath => (int) MadarRun::where('user_id', $student->id)->where('game', $finished->game)->where('status', MadarRun::STATUS_FINISHED)->max('wave'),
                default => null,
            },
            'newBest' => ! $outcome['duplicate'] && (int) $finished->score > 0 && (int) $finished->score > $outcome['previousBest'],
            'previousBest' => $outcome['previousBest'],
            'weekBest' => $this->weekBest($student, $week, $finished->game),
            'rank' => $competes ? [
                'before' => $outcome['rankBefore'],
                'after' => $this->leaderboard->rankOf($finished->classroom_id, $week, $student->id, $finished->game),
            ] : null,
            'unlocked' => $outcome['unlocked'],
            'unlockedTurrets' => $outcome['unlockedTurrets'],
            'level' => $isMath ? $this->levelChange($finished) : null,
            'hearts' => $this->isTeacherPlay($ctx) ? $this->config->maxHearts() : (int) $profile->hearts,
            'runsToday' => $this->runsToday($student),
        ];
    }

    /** « قنّاص القيم » : d'où la partie est partie, où elle est arrivée. */
    private function levelChange(MadarRun $run): array
    {
        $scoring = $this->sniperScoring();
        $from = (int) ($run->level_start ?? 0);
        $to = (int) ($run->level_end ?? $from);

        return [
            'from' => ['position' => $from, 'level' => $scoring->levelOf($from), 'sub' => $scoring->subOf($from)],
            'to' => ['position' => $to, 'level' => $scoring->levelOf($to), 'sub' => $scoring->subOf($to)],
            'change' => $to > $from ? 'up' : ($to < $from ? 'down' : 'same'),
        ];
    }

    /**
     * La fin d'un niveau de « المستكشف ». Le score est borné par le MAXIMUM du
     * niveau ; « terminé » n'est cru que si la durée réelle suffit à traverser
     * la carte. Les étoiles sont calculées ICI (terminé · tous les cristaux ·
     * sans reprise — le serveur connaît les reprises). Un niveau terminé ouvre
     * le suivant. Une seconde clôture renvoie la première.
     */
    private function finishLevel(User $student, MadarRun $run, int $claimed, int $crystals, bool $completed): array
    {
        $ctx = $this->context($student);

        $outcome = DB::transaction(function () use ($student, $ctx, $run, $claimed, $crystals, $completed) {
            $locked = MadarRun::whereKey($run->id)->lockForUpdate()->first();
            $n = (int) $locked->wave;
            if ($locked->status === MadarRun::STATUS_FINISHED) {
                return ['run' => $locked, 'duplicate' => true, 'previousBest' => null, 'rankBefore' => null, 'starsBefore' => null, 'stars' => $this->levels->stars($n, $locked->completed, (int) $locked->stars, (int) $locked->revives), 'nextUnlocked' => false];
            }
            if ($locked->status !== MadarRun::STATUS_IN_PROGRESS) {
                throw new MadarException(MadarException::RUN_CLOSED);
            }

            $week = $locked->week_start->format('Y-m-d');
            $competes = $locked->classroom_id !== null && ($ctx['settings']['competitionEnabled'] || $this->isTeacherPlay($ctx));
            $rankBefore = $competes ? $this->leaderboard->rankOf($locked->classroom_id, $week, $student->id, MadarRun::GAME_EXPLORER) : null;
            $finishedAt = now();
            $maxMs = (int) $this->config->get('runs.max_minutes', 30) * 60_000;
            $duration = min($maxMs, max(0, (int) $locked->started_at->diffInMilliseconds($finishedAt, false)));
            $settled = $this->levels->settle($n, $claimed, $crystals, $completed, $duration);

            $locked->fill([
                'status' => MadarRun::STATUS_FINISHED,
                'finished_at' => $finishedAt,
                'duration_ms' => $duration,
                'claimed_score' => max(0, $claimed),
                'score' => $settled['score'],
                'stars' => $settled['crystals'],
                'completed' => $settled['completed'],
                'flagged' => $settled['flagged'],
            ])->save();

            $stars = $this->levels->stars($n, $settled['completed'], $settled['crystals'], (int) $locked->revives);
            $progress = MadarLevelProgress::where('user_id', $student->id)->where('game', MadarRun::GAME_EXPLORER)->where('level', $n)->lockForUpdate()->first()
                ?? new MadarLevelProgress(['user_id' => $student->id, 'game' => MadarRun::GAME_EXPLORER, 'level' => $n]);
            $previousBest = (int) $progress->best_score;
            $starsBefore = (int) $progress->stars;
            $wasCompleted = $progress->completed_at !== null;
            $progress->attempts = (int) $progress->attempts + 1;
            $progress->best_score = max($previousBest, $settled['score']);
            $progress->stars = max($starsBefore, $stars);
            if ($settled['completed'] && ! $wasCompleted) {
                $progress->completed_at = $finishedAt;
            }
            $progress->save();

            if ($settled['flagged']) {
                Log::warning('madar.score_clamped', ['run' => $locked->uuid, 'game' => 'explorer', 'level' => $n, 'claimed' => $claimed, 'duration_ms' => $duration]);
            }

            return [
                'run' => $locked, 'duplicate' => false, 'previousBest' => $previousBest, 'rankBefore' => $rankBefore,
                'starsBefore' => $starsBefore, 'stars' => $stars,
                'nextUnlocked' => $settled['completed'] && ! $wasCompleted && $this->levels->find($n + 1) !== null,
            ];
        });

        /** @var MadarRun $finished */
        $finished = $outcome['run'];
        $n = (int) $finished->wave;
        $week = $finished->week_start->format('Y-m-d');
        $competes = $finished->classroom_id !== null && ($ctx['settings']['competitionEnabled'] || $this->isTeacherPlay($ctx));
        $profile = MadarProfile::where('user_id', $student->id)->first();
        $levelRow = MadarLevelProgress::where('user_id', $student->id)->where('game', MadarRun::GAME_EXPLORER)->where('level', $n)->first();

        return [
            'duplicate' => $outcome['duplicate'],
            'run' => [
                'id' => $finished->uuid,
                'game' => MadarRun::GAME_EXPLORER,
                'score' => (int) $finished->score,
                'stars' => (int) $finished->stars,
                'wave' => $n,
                'completed' => (bool) $finished->completed,
                'durationMs' => (int) $finished->duration_ms,
                'flagged' => (bool) $finished->flagged,
            ],
            'level' => [
                'n' => $n,
                'stars' => $outcome['stars'],
                'bestStars' => (int) ($levelRow?->stars ?? 0),
                'newStars' => $outcome['starsBefore'] === null ? 0 : max(0, (int) ($levelRow?->stars ?? 0) - $outcome['starsBefore']),
                'crystals' => (int) $finished->stars,
                'totalCrystals' => $this->levels->totalCrystals($n),
                'completed' => (bool) $finished->completed,
                'nextUnlocked' => $outcome['nextUnlocked'],
                'next' => $this->levels->find($n + 1) !== null ? $n + 1 : null,
            ],
            'best' => (int) ($levelRow?->best_score ?? 0),
            'bestWave' => null,
            'newBest' => ! $outcome['duplicate'] && (int) $finished->score > 0 && (int) $finished->score > (int) $outcome['previousBest'],
            'previousBest' => $outcome['previousBest'],
            'weekBest' => $this->weekBest($student, $week, MadarRun::GAME_EXPLORER),
            'rank' => $competes ? ['before' => $outcome['rankBefore'], 'after' => $this->leaderboard->rankOf($finished->classroom_id, $week, $student->id, MadarRun::GAME_EXPLORER)] : null,
            'unlocked' => [],
            'unlockedTurrets' => [],
            'hearts' => (int) $profile->hearts,
            'runsToday' => $this->runsToday($student),
        ];
    }

    // ── Les vaisseaux ───────────────────────────────────────────────────────

    public function chooseShip(User $student, string $ship): array
    {
        $ctx = $this->context($student);
        $profile = $this->profile($student, $ctx);
        if (! MadarShips::isUnlocked($ship, $profile)) {
            throw new MadarException(MadarException::SHIP_LOCKED);
        }
        $profile->update(['ship' => $ship]);

        return ['ship' => $ship, 'ships' => MadarShips::view($profile)];
    }

    // ── محطة التزوّد ─────────────────────────────────────────────────────────

    /**
     * La question d'approvisionnement : celle déjà servie et pas encore
     * répondue (un rechargement ne la change pas, ni son chronomètre), sinon
     * une nouvelle, choisie par le sélecteur du défi dans la portée de
     * l'ÉLÈVE — ses كفاءات à reprendre d'abord, un item jamais vu de
     * préférence, pas un item servi en approvisionnement ces derniers jours.
     *
     * Une question ouverte dont le délai est passé est close « hors délai »
     * (aucun cœur, aucune preuve) avant d'en servir une autre : partir chercher
     * la réponse ailleurs puis revenir ne rapporte rien.
     */
    public function refuel(User $student): array
    {
        $ctx = $this->context($student);
        $this->assertOpen($ctx);
        $profile = $this->profile($student, $ctx);
        if ((int) $profile->hearts >= $this->config->maxHearts()) {
            throw new MadarException(MadarException::HEARTS_FULL);
        }

        $open = MadarRefuel::where('user_id', $student->id)->whereNull('answered_at')
            ->where('served_at', '>=', now()->subMinutes((int) $this->config->get('refuel.open_minutes', 30)))
            ->with('lesson:id,code,title', 'learningPoint:id,code,title')
            ->latest('served_at')->first();
        if ($open !== null && $this->isPastDeadline($open, now())) {
            $this->closeAsTimedOut($open);
            $open = null;
        }

        $refuel = $open ?? $this->serveNew($student, $ctx);

        return ['refuel' => $this->refuelView($refuel), 'hearts' => (int) $profile->hearts, 'maxHearts' => $this->config->maxHearts()];
    }

    private function serveNew(User $student, array $ctx): MadarRefuel
    {
        $today = $this->config->today();
        $servedToday = MadarRefuel::where('user_id', $student->id)->where('served_at', '>=', $this->config->now()->startOfDay()->utc())->count();
        $recent = MadarRefuel::where('user_id', $student->id)
            ->where('served_at', '>=', now()->subDays((int) $this->config->get('refuel.cooldown_days', 3)))
            ->pluck('item_key')->unique()->values()->all();

        $snapshot = [
            'questionCount' => (int) $this->config->get('refuel.pool', 8),
            'difficulty' => null,
            'lessonCodes' => $ctx['settings']['lessonCodes'],
            'learningPointCodes' => [],
        ];
        $options = ['seed' => 'madar:'.$servedToday, 'exclude' => $recent];
        // 1. ce qui a été travaillé, sans les items servis ces derniers jours ;
        // 2. épuisé : le reste du programme de l'élève vient APRÈS, toujours sans répéter ;
        // 3. tout a été servi récemment : mieux vaut revoir un item que bloquer le jeu.
        $picked = $this->selector->select('student', $student->id, $today, $snapshot, $student, $options);
        if ($picked === []) {
            $picked = $this->selector->select('student', $student->id, $today, $snapshot, $student, $options + ['warmup' => true]);
        }
        if ($picked === [] && $recent !== []) {
            $picked = $this->selector->select('student', $student->id, $today, $snapshot, $student, ['seed' => $options['seed'], 'warmup' => true]);
        }
        if ($picked === []) {
            throw new MadarException(MadarException::NOTHING_TO_REFUEL);
        }

        // Varier : les trois points les mieux classés se relaient.
        $item = $picked[$servedToday % min(3, count($picked))];

        // Pas de verrou ni d'unicité ici : deux onglets qui demandent en même
        // temps obtiennent chacun une question ; seule une réponse juste rend un cœur.
        $refuel = MadarRefuel::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $student->id,
            'classroom_id' => $ctx['classroom']?->id,
            'lesson_id' => $item['lessonId'],
            'learning_point_id' => $item['learningPointId'],
            'exercise_code' => $item['exerciseCode'],
            'question_id' => $item['questionId'],
            'item_key' => $item['itemKey'],
            'template_key' => $item['templateKey'],
            'difficulty' => $item['difficulty'],
            'answer_type' => $item['answerType'],
            'reason' => $item['reason'],
            'served_at' => now(),
            // Figé au service : un réglage changé ensuite ne déplace pas ce délai.
            'time_limit_s' => $this->config->timeLimitFor($ctx['classroom'], $item['itemKey'], $item['difficulty']),
            'evidence_attempt_id' => (string) Str::uuid(),
        ]);

        return $refuel->load('lesson:id,code,title', 'learningPoint:id,code,title');
    }

    private function timeLimitMs(MadarRefuel $refuel): int
    {
        return (int) ($refuel->time_limit_s ?? $this->config->get('refuel.default_time_limit', 90)) * 1000;
    }

    /** Hors délai : après le temps de la question, plus la marge du réseau. */
    private function isPastDeadline(MadarRefuel $refuel, $at): bool
    {
        $elapsed = (int) $refuel->served_at->diffInMilliseconds($at, false);

        return $elapsed > $this->timeLimitMs($refuel) + (int) $this->config->get('refuel.grace_seconds', 3) * 1000;
    }

    /** Une question abandonnée hors délai : close, sans cœur ni preuve. */
    private function closeAsTimedOut(MadarRefuel $refuel): void
    {
        $refuel->fill([
            'answered_at' => now(),
            'response_ms' => (int) $refuel->served_at->diffInMilliseconds(now(), false),
            'outcome' => Outcome::Abandoned->value,
            'is_correct' => false,
            'hearts_awarded' => 0,
            'flag' => MadarRefuel::FLAG_TIMEOUT,
        ])->save();
    }

    private function refuelView(MadarRefuel $refuel): array
    {
        return [
            'id' => $refuel->uuid,
            'content' => $this->presenter->public($refuel, $refuel->lesson->code),
            'learningPoint' => ['code' => $refuel->learningPoint?->code, 'title' => $refuel->learningPoint?->title],
            'lesson' => ['code' => $refuel->lesson->code, 'title' => $refuel->lesson->title],
            // Pourquoi cette question (ChallengeQuestionSelector::REASON_*) : l'élève le lit en bas de la carte.
            'reason' => $refuel->reason,
            // Le chronomètre est celui du SERVEUR : le client corrige l'horloge du téléphone avec serverNow.
            'timeLimitS' => (int) round($this->timeLimitMs($refuel) / 1000),
            'servedAt' => $refuel->served_at->format('Y-m-d\TH:i:s.vP'),
            'serverNow' => now()->format('Y-m-d\TH:i:s.vP'),
            'left' => $refuel->left_at !== null,
        ];
    }

    public function ownedRefuel(User $student, string $uuid): MadarRefuel
    {
        return MadarRefuel::where('uuid', $uuid)->where('user_id', $student->id)->with('lesson:id,code,title', 'learningPoint:id,code,title')->first()
            ?? throw new MadarException(MadarException::NOT_FOUND);
    }

    /**
     * L'élève a quitté la page (autre onglet, autre application) pendant la
     * question. Une absence plus courte que `leave_min_ms` (une notification,
     * le clavier du téléphone) ne compte pas. La première absence suffit : ce
     * cœur-là est perdu, la question reste à résoudre.
     */
    public function markLeft(User $student, MadarRefuel $refuel, int $awayMs): array
    {
        if ($awayMs < (int) $this->config->get('refuel.leave_min_ms', 1500)) {
            return ['left' => $refuel->left_at !== null];
        }

        return DB::transaction(function () use ($refuel) {
            $locked = MadarRefuel::whereKey($refuel->id)->lockForUpdate()->first();
            if (! $locked->isAnswered()) {
                $locked->left_at ??= now();
                $locked->left_count = min(255, (int) $locked->left_count + 1);
                $locked->save();
            }

            return ['left' => $locked->left_at !== null];
        });
    }

    /**
     * Juger la réponse.
     *
     *   juste, dans le délai, sans quitter la page  → un cœur (jusqu'au plafond)
     *   juste mais hors délai / page quittée         → aucun cœur, aucune preuve
     *   juste mais « trop rapide » (difficile, < seuil) → le cœur, PAS la preuve
     *   partiel ou faux                              → aucun cœur, la correction
     *
     * Le même envoi rejoué renvoie le verdict enregistré ; une autre réponse → 409.
     * `left` : le client signale aussi une absence au moment de répondre (si
     * l'appel `/left` s'est perdu).
     */
    public function answerRefuel(User $student, MadarRefuel $refuel, mixed $answer, bool $clientLeft = false): array
    {
        $ctx = $this->context($student);

        $result = DB::transaction(function () use ($student, $ctx, $refuel, $answer, $clientLeft) {
            $locked = MadarRefuel::whereKey($refuel->id)->lockForUpdate()->with('lesson:id,code,title', 'learningPoint:id,code,title')->first();
            if ($locked->isAnswered()) {
                if ($locked->answer == $answer) {
                    return ['duplicate' => true, 'refuel' => $locked, 'unlocked' => [], 'unlockedTurrets' => []];
                }
                throw new MadarException(MadarException::ALREADY_ANSWERED);
            }

            $now = now();
            $responseMs = max(0, (int) $locked->served_at->diffInMilliseconds($now, false));
            if ($clientLeft && $locked->left_at === null) {
                $locked->left_at = $now;
                $locked->left_count = min(255, (int) $locked->left_count + 1);
            }

            $content = $this->presenter->content($locked, $locked->lesson->code);
            $evaluation = ($content === null || $answer === null)
                ? ['outcome' => Outcome::Abandoned->value, 'misconceptionId' => null]
                : $this->evaluator->evaluate($answer, $content);
            $outcome = Outcome::fromString($evaluation['outcome']);
            $correct = $outcome->isSuccess();

            $flag = match (true) {
                $this->isPastDeadline($locked, $now) => MadarRefuel::FLAG_TIMEOUT,
                $locked->left_at !== null => MadarRefuel::FLAG_LEFT,
                $correct && $this->isTooFast($locked, $responseMs) => MadarRefuel::FLAG_FAST,
                default => null,
            };
            // Hors délai ou page quittée : la réponse ne rapporte rien.
            $earns = $correct && ! in_array($flag, [MadarRefuel::FLAG_TIMEOUT, MadarRefuel::FLAG_LEFT], true);

            $profile = $this->profile($student, $ctx, lock: true);
            $unlockedBefore = MadarShips::unlocked($profile);
            $turretsBefore = MadarTurrets::unlocked($profile);
            $awarded = $earns ? max(0, min((int) $this->config->get('hearts.per_correct', 1), $this->config->maxHearts() - (int) $profile->hearts)) : 0;

            // Seule une réponse NON signalée entre dans la maîtrise.
            $recordEvidence = $content !== null && $answer !== null && $flag === null;

            $locked->fill([
                'answered_at' => $now,
                'response_ms' => $responseMs,
                'answer' => $answer,
                'outcome' => $evaluation['outcome'],
                'is_correct' => $correct,
                'hearts_awarded' => $awarded,
                'flag' => $flag,
                'evidence_recorded' => $recordEvidence,
            ])->save();

            $profile->hearts = (int) $profile->hearts + $awarded;
            if (! $outcome->isInert()) {
                $profile->refuel_answered = (int) $profile->refuel_answered + 1;
            }
            if ($earns) {
                $profile->refuel_correct = (int) $profile->refuel_correct + 1;
            }
            $profile->save();

            if ($recordEvidence) {
                $this->recordEvidence($student, $locked, $content, $evaluation);
            }

            return [
                'duplicate' => false,
                'refuel' => $locked,
                'unlocked' => array_values(array_diff(MadarShips::unlocked($profile), $unlockedBefore)),
                'unlockedTurrets' => array_values(array_diff(MadarTurrets::unlocked($profile), $turretsBefore)),
            ];
        });

        /** @var MadarRefuel $answered */
        $answered = $result['refuel'];
        $profile = MadarProfile::where('user_id', $student->id)->first();

        return [
            'duplicate' => $result['duplicate'],
            'result' => [
                'id' => $answered->uuid,
                'outcome' => $answered->outcome,
                'isCorrect' => (bool) $answered->is_correct,
                'heartsAwarded' => (int) $answered->hearts_awarded,
                // timeout | left | null — « fast » ne regarde que l'enseignant.
                'flag' => in_array($answered->flag, [MadarRefuel::FLAG_TIMEOUT, MadarRefuel::FLAG_LEFT], true) ? $answered->flag : null,
                'responseMs' => (int) $answered->response_ms,
                'timeLimitS' => (int) round($this->timeLimitMs($answered) / 1000),
                'reveal' => $this->presenter->reveal($answered, $answered->lesson->code),
                'answer' => $answered->answer,
            ],
            'hearts' => (int) $profile->hearts,
            'maxHearts' => $this->config->maxHearts(),
            'refuel' => ['answered' => (int) $profile->refuel_answered, 'correct' => (int) $profile->refuel_correct],
            'unlocked' => $result['unlocked'],
            'unlockedTurrets' => $result['unlockedTurrets'],
        ];
    }

    /** Juste sur une question difficile, plus vite qu'on ne la lit. */
    private function isTooFast(MadarRefuel $refuel, int $responseMs): bool
    {
        $fast = (array) $this->config->get('refuel.fast', []);
        if ((int) ($refuel->difficulty ?? 0) < (int) ($fast['min_difficulty'] ?? 3)) {
            return false;
        }
        $threshold = max((int) ($fast['seconds'] ?? 5) * 1000, (int) round(((float) ($fast['ratio'] ?? 0.12)) * $this->timeLimitMs($refuel)));

        return $responseMs < $threshold;
    }

    /**
     * La preuve d'apprentissage, par la SEULE porte, comme une question de
     * pratique ; la provenance « مدار » dans `source_id`. Une preuve qui
     * échoue ne casse pas le jeu : elle est journalisée.
     */
    private function recordEvidence(User $student, MadarRefuel $refuel, array $content, array $evaluation): void
    {
        $refs = array_values(array_map(
            fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
            $content['learningPoints'] ?? [],
        ));
        if ($refs === []) {
            return;
        }

        try {
            $this->progress->recordEvidence($student, $refuel->lesson->code, [
                'questionCode' => "{$refuel->exercise_code}:{$refuel->question_id}",
                'exerciseCode' => $refuel->exercise_code,
                'questionId' => $refuel->question_id,
                'attemptId' => $refuel->evidence_attempt_id,
                'outcome' => $evaluation['outcome'],
                'learningPointRefs' => $refs,
                'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
                'difficulty' => $refuel->difficulty,
                'templateKey' => $refuel->template_key,
                'hintsUsed' => 0,
                'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
                'misconceptionId' => $evaluation['misconceptionId'] ?? null,
                'sourceId' => self::evidenceSourceId($refuel),
                'answer' => is_array($refuel->answer) ? $refuel->answer : null,
                'submittedAt' => $refuel->answered_at?->toIso8601String(),
            ]);
        } catch (DomainException $e) {
            Log::channel(config('mastery.log_channel', 'mastery'))->warning('madar.evidence_failed', [
                'refuel' => $refuel->uuid, 'error' => $e->getMessage(),
            ]);
        }
    }

    /** La provenance d'une preuve « مدار », dans `learning_evidence.source_id`. */
    public static function evidenceSourceId(MadarRefuel $refuel): string
    {
        return 'madar:'.$refuel->uuid;
    }
}
