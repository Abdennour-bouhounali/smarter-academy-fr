<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une limite ou une fonctionnalité d'une version d'offre (clé → valeur).
 * Le vocabulaire des clés est App\Domain\Plans\EntitlementKeys.
 */
class PlanEntitlement extends Model
{
    use HasFactory;

    protected $fillable = ['plan_version_id', 'key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'json'];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class, 'plan_version_id');
    }
}
