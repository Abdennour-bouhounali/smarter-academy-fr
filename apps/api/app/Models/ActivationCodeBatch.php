<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Un lot de codes d'activation : ce qui est imprimé d'un coup, et les
 * conditions d'accès qu'il ouvre. Voir la migration pour le pourquoi de la
 * séparation lot / code.
 */
class ActivationCodeBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'quantity',
        'access_days',
        'access_ends_at',
        'redeem_by',
        'notes',
        'plan_version_id',
        'student_seat_limit',
        'recipient_user_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'student_seat_limit' => 'integer',
            'access_days' => 'integer',
            'access_ends_at' => 'datetime',
            'redeem_by' => 'datetime',
        ];
    }

    public function codes(): HasMany
    {
        return $this->hasMany(ActivationCode::class, 'batch_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** L'offre que chaque code de ce lot active — nul pour un lot élève classique. */
    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class);
    }

    /** Le destinataire d'un code individuel envoyé depuis une fiche de compte. */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    /** Un lot lié à une offre active un ABONNEMENT à la saisie ; sinon, un droit premium classique. */
    public function activatesPlan(): bool
    {
        return $this->plan_version_id !== null;
    }

    /**
     * Jusqu'à quand l'accès reste ouvert, pour un code de ce lot saisi à
     * l'instant $now. NULL = sans terme.
     *
     * Calculé À LA SAISIE et recopié dans le droit d'accès, jamais relu
     * ensuite : c'est ce qui permet à un droit d'expirer tout seul même si le
     * lot est modifié après coup (Entitlement::isValid applique la date qu'il
     * porte). Même principe que SubscriptionEntitlementSynchronizer, qui copie
     * les dates de l'abonnement plutôt que de les recalculer.
     *
     * Les deux champs sont exclusifs (voir la migration) ; si les deux étaient
     * présents malgré tout, la date fixe l'emporte — c'est la plus
     * restrictive des deux dans le cas qui motive ce champ (fin d'année
     * scolaire), donc la plus sûre en cas d'incohérence.
     */
    public function accessExpiryFrom(Carbon $now): ?Carbon
    {
        if ($this->access_ends_at !== null) {
            return $this->access_ends_at->copy();
        }

        if ($this->access_days !== null) {
            return $now->copy()->addDays($this->access_days);
        }

        return null;
    }
}
