<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Des cœurs donnés (effort montré en classe) ou retirés (triche) par
 * l'enseignant. Un journal : une ligne n'est jamais réécrite, sauf `seen_at`
 * quand l'élève a lu le message.
 */
class MadarHeartAdjustment extends Model
{
    public const REASONS = ['effort', 'cheating', 'other'];

    protected $fillable = ['classroom_id', 'student_id', 'teacher_id', 'delta', 'applied', 'reason', 'note', 'seen_at'];

    protected function casts(): array
    {
        return ['delta' => 'integer', 'applied' => 'integer', 'seen_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
