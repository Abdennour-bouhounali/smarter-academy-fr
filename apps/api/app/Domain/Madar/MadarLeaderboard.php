<?php

namespace App\Domain\Madar;

use App\Domain\DailyChallenge\DailyChallengeLeaderboard;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\MadarProfile;
use App\Models\MadarRun;
use App\Models\User;

/**
 * Le classement de la SEMAINE d'une classe, POUR UN JEU (`orbit`, `defense`) : le meilleur score de chaque
 * membre ACTIF, parties terminées de la semaine (dimanche → samedi, Alger).
 * Une semaine = une saison : chaque dimanche, tout le monde repart de zéro,
 * ce qui laisse sa chance à qui n'a pas gagné la précédente.
 *
 * Départage fixe : score ↓, l'instant où ce score a été atteint ↑, id ↑.
 * Une seule requête, quelle que soit la taille de la classe.
 */
class MadarLeaderboard
{
    /**
     * Les membres ACTIFS de la classe — et son ENSEIGNANT, qui peut jouer avec
     * elle (« نافس أستاذك ») : sa ligne porte `isTeacher`.
     *
     * @return array<int, array{userId: int, rank: int, best: int, runs: int, reachedAt: ?string, isTeacher: bool}>
     */
    public function standings(int $classroomId, string $weekStart, string $game = MadarRun::GAME_ORBIT): array
    {
        $members = ClassroomMembership::where('classroom_id', $classroomId)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();
        $teacherId = (int) Classroom::whereKey($classroomId)->value('teacher_id');
        if ($teacherId > 0) {
            $members[] = $teacherId;
        }
        if ($members === []) {
            return [];
        }

        $rows = MadarRun::where('classroom_id', $classroomId)
            ->where('week_start', $weekStart)
            ->where('game', $game)
            ->where('status', MadarRun::STATUS_FINISHED)
            ->whereIn('user_id', $members)
            ->orderByDesc('score')->orderBy('finished_at')->orderBy('user_id')
            ->get(['user_id', 'score', 'wave', 'finished_at']);

        $best = [];
        $runs = [];
        foreach ($rows as $r) {
            $uid = (int) $r->user_id;
            $runs[$uid] = ($runs[$uid] ?? 0) + 1;
            if (! isset($best[$uid])) {
                $best[$uid] = ['userId' => $uid, 'isTeacher' => $uid === $teacherId, 'best' => (int) $r->score, 'wave' => $r->wave !== null ? (int) $r->wave : null, 'reachedAt' => $r->finished_at?->toIso8601String()];
            }
        }

        $out = [];
        $rank = 0;
        foreach ($best as $uid => $row) {
            $out[] = $row + ['rank' => ++$rank, 'runs' => $runs[$uid]];
        }

        return $out;
    }

    /**
     * Le classement tel qu'un élève de la classe le voit : les dix premiers
     * (prénom + initiale, vaisseau) et sa propre ligne. Jamais un courriel,
     * jamais un nom de famille complet.
     *
     * @return array{week: string, top: array<int, array<string, mixed>>, me: ?array{rank: int, best: int}, participants: int}
     */
    public function view(int $classroomId, string $weekStart, ?int $viewerId = null, int $limit = 10, string $game = MadarRun::GAME_ORBIT): array
    {
        $standings = $this->standings($classroomId, $weekStart, $game);
        $top = array_slice($standings, 0, $limit);
        $ids = array_column($top, 'userId');
        $users = User::whereIn('id', $ids)->get(['id', 'first_name', 'last_name'])->keyBy('id');
        $ships = MadarProfile::whereIn('user_id', $ids)->pluck('ship', 'user_id');

        $me = null;
        foreach ($standings as $row) {
            if ($row['userId'] === $viewerId) {
                $me = ['rank' => $row['rank'], 'best' => $row['best']];
                break;
            }
        }

        return [
            'week' => $weekStart,
            'game' => $game,
            'top' => array_map(fn ($row) => [
                'rank' => $row['rank'],
                'name' => DailyChallengeLeaderboard::displayName($users->get($row['userId'])),
                'best' => $row['best'],
                'wave' => $row['wave'],
                'ship' => $ships->get($row['userId']) ?? 'sahm',
                'isTeacher' => $row['isTeacher'],
                'isMe' => $row['userId'] === $viewerId,
            ], $top),
            'me' => $me,
            'participants' => count($standings),
        ];
    }

    public function rankOf(int $classroomId, string $weekStart, int $userId, string $game = MadarRun::GAME_ORBIT): ?int
    {
        foreach ($this->standings($classroomId, $weekStart, $game) as $row) {
            if ($row['userId'] === $userId) {
                return $row['rank'];
            }
        }

        return null;
    }
}
