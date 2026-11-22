<?php

namespace Database\Seeders\Demo;

use App\Domain\Classroom\StudyContextService;
use App\Domain\DailyChallenge\ChallengeCalendar;
use App\Domain\DailyChallenge\ChallengeException;
use App\Domain\DailyChallenge\ClassDailyChallengeService;
use App\Domain\DailyChallenge\DailyChallengeConfig;
use App\Domain\DailyChallenge\DailyChallengeService;
use App\Domain\Practice\ExerciseRepository;
use App\Models\Classroom;
use App\Models\DailyChallengeAttempt;
use App\Models\DailyChallengeQuestion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * « التحدّي اليومي » dans la démonstration — deux semaines de défis joués
 * PAR LE SERVICE DE PRODUCTION (DailyChallengeService), jamais inscrits à la
 * main : chaque réponse est chronométrée par le serveur, jugée par
 * l'évaluateur, et devient une preuve par ProgressEngine, datée du jour joué.
 *
 * Les quatre classes portent les quatre configurations à vérifier :
 *
 *   A  compétition ON,  Top 3 ON,  participation visible
 *   B  compétition ON,  Top 3 OFF  (l'enseignant voit le classement, pas les élèves)
 *   C  compétition OFF             (ni classement ni rang pour personne)
 *   D  défi DÉSACTIVÉ              (ses élèves — s05, s12 — ont un défi PERSONNEL)
 *
 * La participation suit le portrait : un élève inactif ne joue pas, un
 * irrégulier manque des jours (série cassée, pénalité bornée), un moteur
 * joue presque tous les jours. Aujourd'hui reste ouvert : c'est le défi que
 * la QA joue à la main.
 */
final class DemoDailyChallenges
{
    private const DAYS = 14;

    private int $seed = 0;

    /** @var array<string, int> */
    public array $totals = ['challengeAttempts' => 0, 'challengeAnswers' => 0];

    public function __construct(private DemoContent $content) {}

    /**
     * @param  array<string, array{persona: DemoPersona, user: User}>  $students
     * @param  array<string, Classroom>  $groups
     */
    public function run(array $students, array $groups, User $mainTeacher, User $secondTeacher, User $freeTeacher): void
    {
        $classService = app(ClassDailyChallengeService::class);
        $settings = [
            'A' => [$mainTeacher, ['enabled' => true, 'competitionEnabled' => true, 'showTop3' => true, 'showResultsToClass' => true]],
            'B' => [$mainTeacher, ['enabled' => true, 'competitionEnabled' => true, 'showTop3' => false]],
            'C' => [$secondTeacher, ['enabled' => true, 'competitionEnabled' => false, 'showTop3' => false]],
            'D' => [$freeTeacher, ['enabled' => false]],
        ];
        foreach ($settings as $letter => [$teacher, $values]) {
            if (isset($groups[$letter])) {
                $classService->updateSettings($teacher, $groups[$letter], $values);
            }
        }

        $service = app(DailyChallengeService::class);
        $calendar = ChallengeCalendar::fromConfig(app(DailyChallengeConfig::class));
        $today = CarbonImmutable::parse($calendar->today(), 'Africa/Algiers');

        try {
            for ($daysAgo = self::DAYS; $daysAgo >= 1; $daysAgo--) {
                $date = $today->subDays($daysAgo);
                if (! $calendar->isChallengeDay($date->format('Y-m-d'))) {
                    continue;
                }
                foreach ($students as $key => $s) {
                    if (! $this->plays($s['persona'], $daysAgo)) {
                        continue;
                    }
                    // Chacun à son heure, entre 16 h et 21 h.
                    $at = $date->setTime(16, 0)->addMinutes($this->between(0, 300));
                    $this->play($service, $s['user'], $s['persona'], Carbon::instance($at->toDateTime()));
                }
            }
        } finally {
            Carbon::setTestNow();
            app(StudyContextService::class)->forget();
        }
    }

    /** Le portrait décide : présent ce jour-là ? */
    private function plays(DemoPersona $p, int $daysAgo): bool
    {
        if ($daysAgo < $p->lastSeenDaysAgo || $daysAgo > $p->startedDaysAgo) {
            return false;
        }
        foreach ($p->gapLengths as $gap) {
            // Les irréguliers : une absence récente.
            if ($daysAgo <= $gap && $daysAgo > $gap - 4) {
                return false;
            }
        }
        $chance = min(0.95, 0.35 + $p->density * 0.8);

        return $this->between(0, 1000) < $chance * 1000;
    }

    private function play(DailyChallengeService $service, User $user, DemoPersona $p, Carbon $at): void
    {
        Carbon::setTestNow($at);
        app(StudyContextService::class)->forget($user);

        try {
            $attempt = $service->start($user);
        } catch (ChallengeException) {
            return; // rien à réviser encore (nouvel élève) : un fait, pas une erreur
        }
        $this->totals['challengeAttempts']++;

        // Un élève irrégulier abandonne parfois en route (la tentative expirera).
        $stopAfter = $p->persistence < 0.5 && $this->between(0, 100) < 25 ? $this->between(1, 3) : PHP_INT_MAX;

        for ($i = 0; $i < 10; $i++) {
            $attempt = $attempt->fresh();
            if ($attempt->isFinished() || $i >= $stopAfter) {
                break;
            }
            $open = $service->next($attempt);
            if ($open === null) {
                break;
            }
            // Réfléchir : de 5 à 55 s, plus vite quand on est sûr de soi.
            $seconds = $this->between(5, 20) + (int) round((1 - $p->accuracy) * $this->between(5, 35));
            Carbon::setTestNow(Carbon::now()->addSeconds($seconds)->addMilliseconds($this->between(0, 999)));

            $q = DailyChallengeQuestion::where('daily_challenge_id', $attempt->daily_challenge_id)->where('position', $open['position'])->with('lesson')->first();
            $correct = $this->between(0, 1000) < $p->accuracy * 1000;
            $answer = $this->answerFor($q, $correct);
            try {
                $service->answer($user, $attempt, $open['position'], $answer);
                $this->totals['challengeAnswers']++;
            } catch (ChallengeException) {
                break;
            }
        }

        // Abandon : l'heure passe, la tentative expire à la visite suivante.
        $attempt = $attempt->fresh();
        if (! $attempt->isFinished()) {
            Carbon::setTestNow(Carbon::instance($attempt->expires_at)->addMinute());
            $service->expireIfDue($attempt);
        }
    }

    /** Une réponse juste ou fausse, LUE dans le contenu — jamais inventée. */
    private function answerFor(DailyChallengeQuestion $q, bool $correct): array
    {
        $content = app(ExerciseRepository::class)->findQuestion($q->lesson->code, $q->exercise_code, $q->question_id) ?? [];

        return match ($content['answerType'] ?? null) {
            'choice' => ['choiceId' => collect($content['choices'])->firstWhere('isCorrect', $correct)['id'] ?? 'A'],
            'multiChoice' => ['choiceIds' => collect($content['choices'])->where('isCorrect', $correct)->pluck('id')->values()->all()],
            'integerSet' => ['value' => $correct ? implode(', ', (array) $content['expectedAnswer']) : '1'],
            default => ['value' => $correct ? (string) ($content['expectedAnswer'] ?? '0') : '99991'],
        };
    }

    /** Générateur déterministe (xorshift) : deux exécutions, la même démonstration. */
    private function between(int $min, int $max): int
    {
        if ($this->seed === 0) {
            $this->seed = crc32('daily-challenge-demo');
        }
        $this->seed ^= ($this->seed << 13) & 0xFFFFFFFF;
        $this->seed ^= ($this->seed >> 17);
        $this->seed ^= ($this->seed << 5) & 0xFFFFFFFF;
        $this->seed &= 0xFFFFFFFF;

        return $min + ($this->seed % ($max - $min + 1));
    }

    /** Les défis sans propriétaire de démonstration restant : à purger avec les comptes. */
    public static function purge(iterable $userIds, iterable $classroomIds): void
    {
        $users = collect($userIds)->all();
        $classes = collect($classroomIds)->all();
        $attempts = DailyChallengeAttempt::whereIn('user_id', $users)->pluck('id');
        \DB::table('daily_challenge_answers')->whereIn('daily_challenge_attempt_id', $attempts)->delete();
        DailyChallengeAttempt::whereIn('id', $attempts)->delete();
        \DB::table('daily_challenge_standings')->whereIn('user_id', $users)->delete();
        \DB::table('daily_challenge_class_settings')->whereIn('classroom_id', $classes)->delete();
        $challengeIds = \DB::table('daily_challenges')
            ->where(fn ($q) => $q->where('scope_type', 'classroom')->whereIn('scope_id', $classes))
            ->orWhere(fn ($q) => $q->where('scope_type', 'student')->whereIn('scope_id', $users))
            ->pluck('id');
        \DB::table('daily_challenge_questions')->whereIn('daily_challenge_id', $challengeIds)->delete();
        \DB::table('daily_challenges')->whereIn('id', $challengeIds)->delete();
    }
}
