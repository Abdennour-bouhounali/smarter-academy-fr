<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Les réglages d'un élève — voir StudentSettingsService (qui décide quoi) et
 * la migration create_student_settings_table (pourquoi).
 */
class StudentSetting extends Model
{
    protected $fillable = ['user_id', 'practice_levels_open', 'practice_validation', 'updated_by'];

    protected function casts(): array
    {
        return ['practice_levels_open' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
