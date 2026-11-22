<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Classroom\ClassroomAccess;
use App\Models\ClassroomMembership;
use App\Models\DailyChallenge;
use App\Models\DailyChallengeStanding;
use App\Models\User;

/**
 * Le CLASSEMENT d'une portée — une requête sur daily_challenge_standings,
 * jamais un parcours des réponses.
 *
 * Le score affiché est le score cumulé MOINS la pénalité des jours de défi
 * manqués depuis la dernière participation (non encore imputée : elle l'est
 * à la participation suivante). La calculer à la lecture rend le classement
 * juste le jour même, sans tâche planifiée.
 *
 * Départage, déterministe, documenté (DAILY_CHALLENGE.md) :
 *   1. score cumulé          ↓
 *   2. bonnes réponses       ↓
 *   3. temps moyen de réponse ↑   (sans réponse : en dernier)
 *   4. date d'atteinte du score ↑ (qui l'a eu le premier)
 *   5. identifiant           ↑   (ne peut pas être égal)
 *
 * Une classe ne classe que ses membres ACTIFS : un élève qui a quitté la
 * classe disparaît du classement (ses lignes restent, comme toute histoire).
 */
class DailyChallengeLeaderboard
{
    public function __construct(
        private DailyChallengeConfig $config,
        private DailyChallengeScoringService $scoring,
    ) {}

    /**
     * @return array<int, array{userId: int, rank: int, score: int, storedScore: int, pendingPenalty: int, totalCorrect: int, totalAnswered: int, averageResponseMs: ?int, challengesCompleted: int, lastCompletedDate: ?string, scoreReachedAt: ?string}>
     */
    public function ranking(string $scopeType, int $scopeId, ?string $today = null): array
    {
        $calendar = ChallengeCalendar::fromConfig($this->config);
        $today ??= $calendar->today();
        $scoring = $this->config->get('scoring');

        $query = DailyChallengeStanding::query()
            ->where('scope_type', $scopeType)
            ->where('scope_id', $scopeId);
        if ($scopeType === DailyChallenge::SCOPE_CLASSROOM) {
            $query->whereIn('user_id', ClassroomMembership::where('classroom_id', $scopeId)->active()->select('student_id'));
        }

        $rows = [];
        foreach ($query->get() as $s) {
            $last = $s->last_completed_date?->format('Y-m-d');
            $missed = $last !== null ? $calendar->challengeDaysBetween($last, $today) : 0;
            $penalty = min((int) $s->cumulative_score, $this->scoring->calculateMissedDayAdjustment($missed, $scoring));
            $rows[] = [
                'userId' => (int) $s->user_id,
                'score' => (int) $s->cumulative_score - $penalty,
                'storedScore' => (int) $s->cumulative_score,
                'pendingPenalty' => $penalty,
                'totalCorrect' => (int) $s->total_correct,
                'totalAnswered' => (int) $s->total_answered,
                'averageResponseMs' => $s->total_answered > 0 ? (int) round($s->total_response_ms / $s->total_answered) : null,
                'challengesCompleted' => (int) $s->challenges_completed,
                'lastCompletedDate' => $last,
                'scoreReachedAt' => $s->score_reached_at?->format('Y-m-d H:i:s.v'),
            ];
        }

        usort($rows, [self::class, 'compare']);
        foreach ($rows as $i => &$row) {
            $row['rank'] = $i + 1;
        }

        return $rows;
    }

    /** La règle de départage, exposée pour les tests. */
    public static function compare(array $a, array $b): int
    {
        return [
            -$a['score'],
            -$a['totalCorrect'],
            $a['averageResponseMs'] ?? PHP_INT_MAX,
            $a['scoreReachedAt'] ?? '9999',
            $a['userId'],
        ] <=> [
            -$b['score'],
            -$b['totalCorrect'],
            $b['averageResponseMs'] ?? PHP_INT_MAX,
            $b['scoreReachedAt'] ?? '9999',
            $b['userId'],
        ];
    }

    /** Le rang d'un élève dans une portée, ou null s'il n'y figure pas. */
    public function rankOf(string $scopeType, int $scopeId, int $userId, ?string $today = null): ?array
    {
        foreach ($this->ranking($scopeType, $scopeId, $today) as $row) {
            if ($row['userId'] === $userId) {
                return $row;
            }
        }

        return null;
    }

    /**
     * Le Top N PUBLIC (vu par les élèves) : un nom d'affichage, un rang, un
     * score. Rien d'autre — ni temps, ni réponses, ni courriel.
     *
     * @return array<int, array{rank: int, displayName: string, score: int, isMe: bool}>
     */
    public function publicTop(string $scopeType, int $scopeId, int $n, ?int $viewerId = null): array
    {
        $top = array_slice(array_filter($this->ranking($scopeType, $scopeId), fn ($r) => $r['score'] > 0), 0, $n);
        $users = User::whereIn('id', array_column($top, 'userId'))->get(['id', 'first_name', 'last_name'])->keyBy('id');

        return array_map(fn ($r) => [
            'rank' => $r['rank'],
            'displayName' => self::displayName($users->get($r['userId'])),
            'score' => $r['score'],
            'isMe' => $viewerId !== null && $r['userId'] === $viewerId,
        ], array_values($top));
    }

    /**
     * Le classement COMPLET pour l'enseignant, avec l'identité de l'enseignant
     * (ClassroomAccess::identity — jamais le courriel).
     */
    public function teacherRanking(int $classroomId, ?string $today = null): array
    {
        $rows = $this->ranking(DailyChallenge::SCOPE_CLASSROOM, $classroomId, $today);
        $users = User::whereIn('id', array_column($rows, 'userId'))
            ->get(explode(',', ClassroomAccess::IDENTITY_COLUMNS))->keyBy('id');

        return array_map(fn ($r) => ['student' => ClassroomAccess::identity($users->get($r['userId']), $r['userId'])] + $r, $rows);
    }

    /** « Amine B. » — le prénom et l'initiale : assez pour se reconnaître en classe. */
    public static function displayName(?User $user): string
    {
        if ($user === null) {
            return '';
        }
        $first = trim((string) $user->first_name);
        $initial = mb_substr(trim((string) $user->last_name), 0, 1);

        return trim($first.($initial !== '' ? ' '.$initial.'.' : ''));
    }
}
