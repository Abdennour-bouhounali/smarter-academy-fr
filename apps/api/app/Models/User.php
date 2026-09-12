<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * `role` is a free-text string, not an enum: today it's only 'admin' or
 * 'student' ("Élève"), but it's deliberately not constrained at the schema
 * level so future account types ("famille", "enseignant") are additive —
 * a new allowed value, not a migration. Neither of those is implemented yet;
 * this is a note on the existing column, not a speculative table.
 */
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    /**
     * Valeurs par défaut au niveau du MODÈLE, et pas seulement de la colonne.
     *
     * Le défaut SQL ne s'applique qu'à la relecture : une instance tout juste
     * créée (inscription, usine de test) porterait sinon account_status =
     * NULL en mémoire, et hasActiveAccount() — écrit en liste blanche — la
     * lirait comme inactive. Le défaut appartient donc ici.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'account_status' => self::STATUS_ACTIVE,
    ];

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'grade',
        'account_status',
        'suspended_at',
        'last_activity_at',
        'terms_accepted_version',
        'privacy_policy_accepted_version',
        'legal_consent_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'suspended_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'legal_consent_at' => 'datetime',
        ];
    }

    public const ROLE_ADMIN = 'admin';

    public const ROLE_STUDENT = 'student';

    /**
     * Statut de COMPTE — distinct du statut d'abonnement, qui vit dans
     * subscriptions. « Compte actif, abonnement expiré » est valide.
     *
     * active    : accès normal.
     * suspended : accès refusé, temporairement. Les données restent.
     * disabled  : accès refusé, et les jetons sont révoqués. Les données
     *             restent AUSSI — désactiver un compte n'efface jamais un
     *             historique d'apprentissage (spec §2.4).
     */
    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_DISABLED = 'disabled';

    public const ACCOUNT_STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_SUSPENDED,
        self::STATUS_DISABLED,
    ];

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Liste blanche, comme pour la publication : un statut inconnu ferme
     * l'accès, il ne l'ouvre pas.
     */
    public function hasActiveAccount(): bool
    {
        return $this->account_status === self::STATUS_ACTIVE;
    }

    /**
     * Les identités externes (Google) rattachées à ce compte.
     *
     * Une relation, et non une colonne `google_id` : voir la migration
     * create_user_identities_table.
     */
    public function identities(): HasMany
    {
        return $this->hasMany(UserIdentity::class);
    }

    /**
     * L'adresse est-elle prouvée ?
     *
     * Nommée comme le contrat MustVerifyEmail de Laravel (que ce modèle
     * n'implémente pas : il n'y a pas de route web à qui renvoyer un
     * visiteur, cette API ne rend que du JSON), afin que le vocabulaire
     * reste celui que tout le monde connaît.
     */
    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function getEmailForVerification(): string
    {
        return (string) $this->email;
    }

    /**
     * Marque l'adresse comme prouvée. IDEMPOTENT : vérifier deux fois n'est
     * pas une erreur, et la date du PREMIER passage est celle qui compte —
     * la réécrire effacerait l'information utile.
     */
    public function markEmailAsVerified(): bool
    {
        if ($this->hasVerifiedEmail()) {
            return false;
        }

        $this->forceFill(['email_verified_at' => now()])->save();

        return true;
    }

    /**
     * Ce compte peut-il se connecter par mot de passe ?
     *
     * Faux pour un compte créé par Google, qui n'en a pas (NULL, et non un
     * secret aléatoire — voir la migration qui rend la colonne facultative).
     */
    public function hasPassword(): bool
    {
        return $this->password !== null && $this->password !== '';
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Les droits d'accès — distincts des abonnements.
     *
     * subscriptions retrace ce qui a été VENDU (et le sera un jour par un
     * fournisseur de paiement) ; entitlements dit ce qui est OUVERT
     * aujourd'hui. Les deux se ressemblent assez pour qu'on soit tenté de les
     * fusionner, et diffèrent sur le cas qui compte : une dérogation
     * d'administration ouvre l'accès sans qu'aucun abonnement n'existe, et un
     * remboursement ferme l'accès sans effacer l'abonnement.
     */
    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class);
    }

    /**
     * L'abonnement qui fait foi : le plus récemment commencé. Il n'y a pas
     * de contrainte d'unicité en base — un renouvellement crée une ligne —
     * donc « l'abonnement de l'élève » se choisit, il ne se suppose pas.
     */
    public function currentSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->orderByRaw('started_at IS NULL')
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->first();
    }

    public function reports(): HasMany
    {
        return $this->hasMany(StudentReport::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(StudentLessonProgress::class);
    }

    public function diagnosticSessions(): HasMany
    {
        return $this->hasMany(DiagnosticSession::class);
    }
}
