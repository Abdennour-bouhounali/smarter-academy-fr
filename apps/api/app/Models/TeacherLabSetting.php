<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Les labos d'une leçon dont un ENSEIGNANT a coupé les questions pour SON compte (LabCheckpoint). Jamais lu pour un élève :
 * les questions sont obligatoires pour tous les élèves. Absence de ligne = toutes actives.
 */
class TeacherLabSetting extends Model
{
    protected $fillable = ['user_id', 'lesson_id', 'checkpoints_off'];

    protected function casts(): array
    {
        return ['checkpoints_off' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
