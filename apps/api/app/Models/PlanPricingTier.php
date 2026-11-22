<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un PALIER de prix par élève : « de min à max élèves, tant par élève ».
 * `max_students` NULL = sans borne supérieure (« 101 et plus »). Voir la
 * migration ; la validation de la grille (ni chevauchement ni trou) est
 * dans TeacherPricingService.
 */
class PlanPricingTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_version_id',
        'min_students',
        'max_students',
        'price_per_student_cents',
        'currency',
        'sort_order',
        'is_active',
    ];

    protected $attributes = [
        'price_per_student_cents' => 0,
        'currency' => 'DZD',
        'sort_order' => 0,
        'is_active' => true,
    ];

    protected function casts(): array
    {
        return [
            'min_students' => 'integer',
            'max_students' => 'integer',
            'price_per_student_cents' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class, 'plan_version_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Ce palier couvre-t-il ce nombre d'élèves ? */
    public function covers(int $students): bool
    {
        return $students >= $this->min_students
            && ($this->max_students === null || $students <= $this->max_students);
    }

    /** « 6–20 » ou « 101+ », pour les écrans. */
    public function label(): string
    {
        return $this->max_students === null
            ? $this->min_students.'+'
            : $this->min_students.'–'.$this->max_students;
    }
}
