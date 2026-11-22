<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Un code d'activation vendu en espèces.
 *
 * Le code lui-même n'est PAS ici : seul son empreinte (code_hash) l'est.
 * Voir la migration pour le raisonnement complet.
 */
class ActivationCode extends Model
{
    use HasFactory;

    /** Jamais saisi, et encore saisissable. */
    public const STATUS_AVAILABLE = 'available';

    /** Saisi par un élève : activated_by / activated_at / entitlement_id. */
    public const STATUS_ACTIVATED = 'activated';

    /** Retiré par l'administration. Définitif. */
    public const STATUS_REVOKED = 'revoked';

    /**
     * DÉRIVÉ, jamais stocké en base : `available` dont la date limite de
     * saisie est dépassée. Voir effectiveStatus().
     */
    public const STATUS_EXPIRED = 'expired';

    /** Ce que la colonne `status` peut valoir. */
    public const STORED_STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_ACTIVATED,
        self::STATUS_REVOKED,
    ];

    /** Ce que l'administration peut FILTRER — le dérivé compris. */
    public const STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_ACTIVATED,
        self::STATUS_REVOKED,
        self::STATUS_EXPIRED,
    ];

    protected $fillable = [
        'batch_id',
        'code_hash',
        'code_hint',
        'status',
        'expires_at',
        'activated_at',
        'activated_by',
        'entitlement_id',
        'revoked_at',
        'revoked_by',
        'revoke_reason',
        'created_by',
    ];

    /**
     * Défaut porté par le MODÈLE et pas seulement par la colonne — même
     * raison que User::$attributes et Entitlement::$attributes : une instance
     * tout juste créée porterait sinon status = NULL en mémoire, et
     * isRedeemable(), écrit en liste blanche, la lirait comme non saisissable.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => self::STATUS_AVAILABLE,
    ];

    /**
     * L'empreinte ne sort JAMAIS dans une réponse JSON. Elle n'est pas un
     * secret au sens strict (elle ne permet pas de retrouver le code), mais
     * la publier offrirait une cible hors ligne à qui possède la base.
     *
     * @var list<string>
     */
    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'activated_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ActivationCodeBatch::class, 'batch_id');
    }

    public function activatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(Entitlement::class);
    }

    /**
     * L'état RÉEL, celui qu'on montre et qu'on filtre.
     *
     * Diffère de la colonne sur un seul point, et c'est tout l'intérêt : un
     * code jamais saisi dont la date limite est passée est `expired`, sans
     * qu'aucune écriture n'ait eu lieu. Le temps ferme tout seul.
     */
    public function effectiveStatus(?Carbon $now = null): string
    {
        if ($this->status !== self::STATUS_AVAILABLE) {
            return $this->status;
        }

        $now ??= Carbon::now();

        return $this->expires_at !== null && $this->expires_at->lessThanOrEqualTo($now)
            ? self::STATUS_EXPIRED
            : self::STATUS_AVAILABLE;
    }

    /**
     * Ce code peut-il être saisi, MAINTENANT ?
     *
     * L'instant pile de l'expiration est EXCLU, comme chez
     * Entitlement::isValid() — les deux bornes du produit appliquent la même
     * convention, sinon « jusqu'au 30 juin » ne voudrait pas dire la même
     * chose des deux côtés.
     */
    public function isRedeemable(?Carbon $now = null): bool
    {
        return $this->effectiveStatus($now) === self::STATUS_AVAILABLE;
    }

    /**
     * Filtre sur l'état EFFECTIF, en base.
     *
     * `expired` et `available` se traduisent tous deux en une condition sur
     * la date : c'est ce qui permet à l'écran d'administration de compter et
     * de paginer sur un état qui n'existe dans aucune colonne.
     */
    public function scopeEffectiveStatus(Builder $query, string $status, ?Carbon $now = null): Builder
    {
        $now ??= Carbon::now();

        return match ($status) {
            self::STATUS_AVAILABLE => $query->where('status', self::STATUS_AVAILABLE)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', $now)),
            self::STATUS_EXPIRED => $query->where('status', self::STATUS_AVAILABLE)
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', $now),
            default => $query->where('status', $status),
        };
    }
}
