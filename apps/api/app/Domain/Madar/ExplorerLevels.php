<?php

namespace App\Domain\Madar;

/**
 * Les niveaux de « المستكشف », lus dans le fichier COMMUN au moteur web
 * (resources/games/explorer/levels.json, construit par
 * scripts/games/build-explorer-levels.mjs). Le serveur ne rejoue pas un
 * niveau ; il sait, depuis la carte, ce qu'un niveau peut rapporter AU PLUS et
 * le temps qu'il faut AU MOINS pour le traverser :
 *
 *   max  = cristaux × crystal + blocs-cristal × block + ennemis écrasables × enemy
 *        + blocs-bouclier × power + (completeBase + completePerLevel × n)
 *        + temps du niveau × timeBonusPerSecond
 *   min  = (x de la fusée − x du départ) / runSpeed × min_duration_factor
 *
 * Un score au-delà du max est ramené au max ; un niveau « terminé » plus vite
 * que le min n'est PAS compté comme terminé ; dans les deux cas, signalé.
 */
class ExplorerLevels
{
    private ?array $data = null;

    public function __construct(private MadarConfig $config) {}

    private function data(): array
    {
        if ($this->data === null) {
            $path = (string) $this->config->get('explorer.levels_path');
            $this->data = is_file($path) ? (json_decode((string) file_get_contents($path), true) ?: []) : [];
        }

        return $this->data;
    }

    /** @return array<int, array<string, mixed>> */
    public function levels(): array
    {
        return $this->data()['levels'] ?? [];
    }

    public function count(): int
    {
        return count($this->levels());
    }

    public function find(int $n): ?array
    {
        foreach ($this->levels() as $level) {
            if ((int) $level['n'] === $n) {
                return $level;
            }
        }

        return null;
    }

    /** @return array{crystals: int, blocks: int, stompable: int, powers: int, startX: int, goalX: int, time: int} */
    public function summary(int $n): array
    {
        $level = $this->find($n) ?? throw new MadarException(MadarException::NOT_FOUND);
        $count = fn (string $ch) => array_sum(array_map(fn ($row) => substr_count($row, $ch), $level['rows']));
        $find = function (string $ch) use ($level): int {
            foreach ($level['rows'] as $row) {
                $x = strpos($row, $ch);
                if ($x !== false) {
                    return $x;
                }
            }

            return 0;
        };

        return [
            'crystals' => $count('c'),
            'blocks' => $count('?'),
            'stompable' => $count('e') + $count('f'),
            'powers' => $count('P'),
            'startX' => $find('@'),
            'goalX' => $find('G'),
            'time' => (int) $level['time'],
        ];
    }

    /** Tous les cristaux d'un niveau (libres et dans les blocs) : la condition de la 2e étoile. */
    public function totalCrystals(int $n): int
    {
        $s = $this->summary($n);

        return $s['crystals'] + $s['blocks'];
    }

    public function maxScore(int $n): int
    {
        $s = $this->summary($n);
        $p = $this->data()['scoring'];

        return $s['crystals'] * (int) $p['crystal'] + $s['blocks'] * (int) $p['block'] + $s['stompable'] * (int) $p['enemy']
            + $s['powers'] * (int) $p['power'] + (int) $p['completeBase'] + (int) $p['completePerLevel'] * $n
            + $s['time'] * (int) $p['timeBonusPerSecond'];
    }

    public function minDurationMs(int $n): int
    {
        $s = $this->summary($n);
        $speed = (float) ($this->data()['physics']['runSpeed'] ?? 7);

        return (int) floor(max(0, $s['goalX'] - $s['startX']) / $speed * (float) $this->config->get('explorer.min_duration_factor', 0.8) * 1000);
    }

    /** @return array{score: int, crystals: int, completed: bool, flagged: bool} */
    public function settle(int $n, int $claimed, int $crystals, bool $completed, int $durationMs): array
    {
        $max = $this->maxScore($n) + (int) $this->config->get('explorer.slack', 50);
        $tooFast = $completed && $durationMs < $this->minDurationMs($n);
        $claimed = max(0, $claimed);

        return [
            'score' => min($claimed, $max),
            'crystals' => min(max(0, $crystals), $this->totalCrystals($n)),
            'completed' => $completed && ! $tooFast,
            'flagged' => $claimed > $max || $tooFast,
        ];
    }

    /** Les étoiles d'une partie : terminé · tous les cristaux · sans reprise. */
    public function stars(int $n, bool $completed, int $crystals, int $revives): int
    {
        if (! $completed) {
            return 0;
        }

        return 1 + ($crystals >= $this->totalCrystals($n) ? 1 : 0) + ($revives === 0 ? 1 : 0);
    }
}
