<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un des trois trimestres de l'année (« الفصل ») d'un établissement — les
 * rapports de fin de trimestre s'y rapportent (SCHOOL_ADMIN_SPACE.md, phase 3).
 * `starts_on` / `ends_on` sont des dates simples, sans heure.
 */
class SchoolTerm extends Model
{
    protected $fillable = ['academic_year', 'term', 'starts_on', 'ends_on'];

    protected function casts(): array
    {
        return [
            'term' => 'integer',
            'starts_on' => 'date:Y-m-d',
            'ends_on' => 'date:Y-m-d',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
