<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une partie de « مدار ». Le serveur pose `started_at` et `finished_at` ; le
 * score annoncé (`claimed_score`) est borné par la durée réelle (`score`).
 */
class MadarRun extends Model
{
    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_FINISHED = 'finished';

    public const STATUS_ABANDONED = 'abandoned';

    /** Le jeu d'orbite (le premier jeu de « مدار »). */
    public const GAME_ORBIT = 'orbit';

    /** « دفاع الكوكب » — tours de défense, vagues. */
    public const GAME_DEFENSE = 'defense';

    /** « المستكشف » — plates-formes, niveaux (une partie = un niveau). */
    public const GAME_EXPLORER = 'explorer';

    /** « قنّاص القيم » — viser les expressions ÉGALES à la cible (jeu de mathématiques, gratuit). */
    public const GAME_SNIPER = 'sniper';

    /** « الدخيل » — trouver la carte qui n'est PAS égale aux autres (jeu de mathématiques, gratuit). */
    public const GAME_ODD = 'odd';

    /** « الحساب الذهني » — calcul mental, des additions de 1AM aux enchaînements (jeu de mathématiques, gratuit). */
    public const GAME_MENTAL = 'mental';

    public const GAMES = [self::GAME_ORBIT, self::GAME_DEFENSE, self::GAME_EXPLORER, self::GAME_SNIPER, self::GAME_ODD, self::GAME_MENTAL];

    /** La famille d'un jeu dans « فضاء الألعاب » : ترفيه (fun) ou رياضيات (math). */
    public const CATEGORIES = [
        self::GAME_ORBIT => 'fun',
        self::GAME_DEFENSE => 'fun',
        self::GAME_EXPLORER => 'fun',
        self::GAME_SNIPER => 'math',
        self::GAME_ODD => 'math',
        self::GAME_MENTAL => 'math',
    ];

    /** Les jeux qui ne coûtent aucun cœur (et n'ont pas de reprise) : leurs mathématiques sont le jeu. */
    public const FREE_GAMES = [self::GAME_SNIPER, self::GAME_ODD, self::GAME_MENTAL];

    /** Un jeu de mathématiques : 50 niveaux partagés, une position par élève (madar_math_progress). */
    public static function isMath(string $game): bool
    {
        return (self::CATEGORIES[$game] ?? null) === 'math';
    }

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'uuid', 'user_id', 'game', 'classroom_id', 'run_date', 'week_start', 'seed', 'status', 'started_at', 'finished_at',
        'duration_ms', 'claimed_score', 'score', 'stars', 'wave', 'level_start', 'level_end', 'completed', 'revives', 'flagged',
    ];

    protected function casts(): array
    {
        return [
            'run_date' => 'date:Y-m-d',
            'week_start' => 'date:Y-m-d',
            'seed' => 'integer',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'duration_ms' => 'integer',
            'claimed_score' => 'integer',
            'score' => 'integer',
            'stars' => 'integer',
            'wave' => 'integer',
            'level_start' => 'integer',
            'level_end' => 'integer',
            'completed' => 'boolean',
            'revives' => 'integer',
            'flagged' => 'boolean',
        ];
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
