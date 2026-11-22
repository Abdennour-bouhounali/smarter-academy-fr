<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Une tentative sur un défi du « مختبر التفكير », comptée ou non (raison gardée). */
class ThinkingLabAttempt extends Model
{
    public const UPDATED_AT = null;

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = ['progress_id', 'answer_raw', 'answer_norm', 'correct', 'counted', 'reason', 'mistake_index', 'draft', 'created_at'];

    protected function casts(): array
    {
        return [
            'correct' => 'boolean',
            'counted' => 'boolean',
            'mistake_index' => 'integer',
            'created_at' => 'immutable_datetime',
        ];
    }

    public function progress(): BelongsTo
    {
        return $this->belongsTo(ThinkingLabProgress::class, 'progress_id');
    }
}
