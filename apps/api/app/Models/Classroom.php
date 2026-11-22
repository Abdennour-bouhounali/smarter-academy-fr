<?php

namespace App\Models;

use App\Domain\Classroom\JoinLinkToken;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * La classe d'un professeur (« القسم »). Voir la migration.
 *
 * `teacher_id` n'est PAS assignable en masse : c'est ClassroomService qui le
 * pose, depuis l'utilisateur authentifié, jamais depuis un corps de requête.
 * `join_link_token` non plus : il naît avec la classe (booted) et ne change
 * que par ClassroomService::rotateJoinLink.
 *
 * Deux portes d'entrée, une seule serrure : le lien et le code ne s'ouvrent
 * que si `join_code_enabled` (« الانضمام مفتوح ») — le nom de la colonne
 * date d'avant le lien.
 */
class Classroom extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_ARCHIVED, self::STATUS_SUSPENDED];

    protected $fillable = [
        'name',
        'description',
        'grade',
        'academic_year',
        'status',
        'join_code',
        'join_code_enabled',
        'archived_at',
    ];

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
        'join_code_enabled' => true,
    ];

    protected static function booted(): void
    {
        static::creating(function (Classroom $classroom) {
            $classroom->join_link_token ??= JoinLinkToken::unique();
        });
    }

    protected function casts(): array
    {
        return [
            'join_code_enabled' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * L'établissement de la classe, s'il y en a un. `school_id` n'est pas
     * assignable en masse : il ajoute un LECTEUR (la direction), jamais un
     * second propriétaire (SCHOOL_ADMIN_SPACE.md §4).
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(ClassroomMembership::class);
    }

    public function activeMemberships(): HasMany
    {
        return $this->hasMany(ClassroomMembership::class)->where('status', ClassroomMembership::STATUS_ACTIVE);
    }

    public function lessonSettings(): HasMany
    {
        return $this->hasMany(ClassroomLesson::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /** La classe accepte-t-elle un NOUVEL élève (par le lien ou le code) ? */
    public function acceptsNewMembers(): bool
    {
        return $this->isActive() && $this->join_code_enabled;
    }

    /** Compte dans la limite de classes : tout ce qui n'est pas archivé. */
    public function scopeCountingTowardsLimit(Builder $query): Builder
    {
        return $query->where($query->qualifyColumn('status'), '!=', self::STATUS_ARCHIVED);
    }

    /**
     * Les classes que la licence d'un établissement ne couvre PAS — celles
     * dont les élèves occupent les sièges de leur enseignant
     * (SCHOOL_ADMIN_SPACE.md, D1). Une classe d'établissement sans licence
     * qui court reste sur les sièges de l'enseignant.
     */
    public function scopeNotCoveredBySchool(Builder $query): Builder
    {
        return $query->where(fn (Builder $q) => $q
            ->whereNull($q->qualifyColumn('school_id'))
            ->orWhereNotIn($q->qualifyColumn('school_id'), SchoolLicence::query()->running()->select('school_id')));
    }

    /** La classe est-elle couverte par la licence de son établissement ? */
    public function isCoveredBySchool(): bool
    {
        return $this->school_id !== null
            && SchoolLicence::where('school_id', $this->school_id)->running()->exists();
    }

    public function scopeOwnedBy(Builder $query, User $teacher): Builder
    {
        return $query->where($query->qualifyColumn('teacher_id'), $teacher->id);
    }
}
