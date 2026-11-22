<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Les réglages de « مدار » d'UNE classe, posés par son enseignant.
 * Absence de ligne = les défauts de config/madar.php.
 */
class MadarClassSetting extends Model
{
    protected $fillable = [
        'classroom_id', 'enabled', 'disabled_games', 'competition_enabled', 'daily_free_hearts', 'daily_run_cap', 'lesson_codes', 'time_limits', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'disabled_games' => 'array',
            'competition_enabled' => 'boolean',
            'daily_free_hearts' => 'integer',
            'daily_run_cap' => 'integer',
            'lesson_codes' => 'array',
            'time_limits' => 'array',
        ];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }
}
