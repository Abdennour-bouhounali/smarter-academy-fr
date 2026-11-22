<?php

namespace App\Models;

use App\Domain\Classroom\JoinLinkToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * L'établissement (« المؤسسة ») — docs/architecture/SCHOOL_ADMIN_SPACE.md.
 *
 * Créé et réglé par l'administration de la plateforme seulement ; son
 * directeur le LIT et gère ce qui s'y trouve. Suspendre un établissement
 * ferme /school à son directeur et ne touche ni classe ni élève.
 */
class School extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_SUSPENDED, self::STATUS_ARCHIVED];

    protected $fillable = ['name', 'wilaya', 'commune', 'code', 'status', 'current_academic_year'];

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    /**
     * Le lien d'adhésion des ENSEIGNANTS naît avec l'établissement et ne
     * change que par SchoolTeacherService::rotateJoinLink. Non assignable.
     */
    protected static function booted(): void
    {
        static::creating(function (School $school) {
            $school->teacher_join_token ??= JoinLinkToken::generate();
        });
    }

    public function staff(): HasMany
    {
        return $this->hasMany(SchoolStaff::class);
    }

    /** Le directeur EN FONCTION — au plus un (SchoolService::appointDirector). */
    public function activeDirector(): HasOne
    {
        return $this->hasOne(SchoolStaff::class)
            ->where('school_role', SchoolStaff::ROLE_DIRECTOR)
            ->where('status', SchoolStaff::STATUS_ACTIVE);
    }

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }

    public function teachers(): HasMany
    {
        return $this->hasMany(SchoolTeacher::class);
    }

    public function terms(): HasMany
    {
        return $this->hasMany(SchoolTerm::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
