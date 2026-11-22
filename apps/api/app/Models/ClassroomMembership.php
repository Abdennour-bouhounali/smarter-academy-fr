<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * L'appartenance d'un élève à une classe. Voir la migration.
 *
 * `classroom_id` et `student_id` ne sont pas assignables en masse : le
 * service les pose depuis la classe possédée et l'élève authentifié.
 */
class ClassroomMembership extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_LEFT = 'left';

    public const STATUS_REMOVED = 'removed';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_LEFT, self::STATUS_REMOVED];

    public const VIA_JOIN_CODE = 'join_code';

    public const VIA_JOIN_LINK = 'join_link';

    /**
     * Historique : l'invitation par courriel (retirée le 2026-10-01). Des
     * lignes anciennes la portent encore, avec leur `invitation_id` ; plus
     * aucune n'est créée ainsi.
     */
    public const VIA_INVITATION = 'invitation';

    /** Inscrit par la direction de l'établissement (SCHOOL_ADMIN_SPACE.md, D2). */
    public const VIA_SCHOOL_ENROLMENT = 'school_enrolment';

    /** Qui a ouvert la lecture de l'ÉTABLISSEMENT : l'élève, ou l'inscription par la direction. */
    public const SCHOOL_CONSENT_BY_STUDENT = 'student';

    public const SCHOOL_CONSENT_BY_SCHOOL = 'school';

    protected $fillable = ['status', 'joined_at', 'left_at', 'joined_via', 'invitation_id', 'removed_by'];

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
            'consented_at' => 'datetime',
            'school_consent_at' => 'datetime',
        ];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * L'élève a-t-il accepté le texte de partage ACTUEL ? Une adhésion
     * antérieure au texte (null) ou à sa version courante le lui redemande.
     */
    public function hasCurrentConsent(): bool
    {
        return $this->consented_at !== null
            && $this->consent_version === (string) config('classroom.consent_version');
    }

    /**
     * L'élève a-t-il accepté un texte de partage qui annonce le rattachement
     * AUTOMATIQUE à un établissement (`classroom.school_auto_consent_since`) ?
     * Les versions sont des dates ISO : la comparaison de chaînes suffit.
     */
    public function coversFutureSchool(): bool
    {
        return $this->consented_at !== null
            && $this->consent_version !== null
            && strcmp($this->consent_version, (string) config('classroom.school_auto_consent_since')) >= 0;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where($query->qualifyColumn('status'), self::STATUS_ACTIVE);
    }
}
