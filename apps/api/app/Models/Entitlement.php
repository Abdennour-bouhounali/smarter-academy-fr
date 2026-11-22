<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Un droit d'accès accordé à un élève.
 *
 * Ne dit RIEN sur le contenu : un droit répond « cet élève a-t-il la
 * permission commerciale ? », jamais « ce contenu peut-il être servi ? ».
 * La seconde question appartient à la publication, et les deux doivent être
 * satisfaites (voir ContentAccess).
 *
 * Il n'existe pas de droit de type `free` en base : le gratuit est une règle,
 * pas une ligne. Voir la migration.
 */
class Entitlement extends Model
{
    use HasFactory;

    /** L'abonnement payant. Écrit par une future synchronisation de paiement. */
    public const TYPE_SUBSCRIPTION = 'subscription';

    /** La dérogation d'administration : test interne, support, geste commercial. */
    public const TYPE_ADMIN_OVERRIDE = 'admin_override';

    /**
     * Le droit né d'un CODE D'ACTIVATION vendu en espèces — le modèle
     * commercial algérien (ALGERIA_PLATFORM_MASTER_SPEC.md §17).
     *
     * Écrit UNIQUEMENT par ActivationCodeRedemptionService, et porteur d'une
     * `reference` de la forme `activation_code:{id}` : c'est elle qui, via
     * l'index unique (type, reference), rend impossible qu'un même code
     * ouvre deux droits — y compris si deux saisies arrivent en parallèle.
     */
    public const TYPE_ACTIVATION_CODE = 'activation_code';

    public const TYPES = [
        self::TYPE_SUBSCRIPTION,
        self::TYPE_ACTIVATION_CODE,
        self::TYPE_ADMIN_OVERRIDE,
    ];

    public const STATUS_ACTIVE = 'active';

    public const STATUS_REVOKED = 'revoked';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_REVOKED,
    ];

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'starts_at',
        'expires_at',
        'source',
        'reference',
        'granted_by',
        'revoked_at',
        'revoked_by',
        'reason',
    ];

    /**
     * Défaut porté par le MODÈLE et pas seulement par la colonne — même
     * raison que User::$attributes : une instance tout juste créée porterait
     * sinon status = NULL en mémoire, et isValid(), écrit en liste blanche,
     * la lirait comme non active.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    /**
     * Ce droit ouvre-t-il l'accès, MAINTENANT ?
     *
     * Les bornes, explicitement :
     *   starts_at NULL      → a toujours commencé
     *   starts_at <= now    → commencé (l'instant pile est inclus)
     *   expires_at NULL     → sans terme
     *   now < expires_at    → encore valide
     *   expires_at <= now   → expiré (l'instant pile est EXCLU)
     *
     * L'heure vient du serveur. Jamais du client — une date d'expiration que
     * l'appelant pourrait choisir ne serait pas une date d'expiration.
     */
    public function isValid(?Carbon $now = null): bool
    {
        if ($this->status !== self::STATUS_ACTIVE) {
            return false;
        }

        $now ??= Carbon::now();

        if ($this->starts_at !== null && $this->starts_at->greaterThan($now)) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->lessThanOrEqualTo($now)) {
            return false;
        }

        return true;
    }

    /**
     * Les droits potentiellement valides, filtrés EN BASE.
     *
     * Le filtre temporel est ici plutôt qu'en PHP pour que « cet élève a-t-il
     * un droit ? » reste une requête d'existence indexée, et non un
     * chargement de tout l'historique d'un compte pour n'en garder qu'une
     * ligne. isValid() reste l'autorité sur une instance déjà chargée ; les
     * deux appliquent les mêmes bornes.
     */
    public function scopeValidNow(Builder $query, ?Carbon $now = null): Builder
    {
        $now ??= Carbon::now();

        return $query->where('status', self::STATUS_ACTIVE)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', $now));
    }
}
