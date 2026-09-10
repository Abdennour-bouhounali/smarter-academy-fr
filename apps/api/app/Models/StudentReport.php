<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Un signalement d'élève.
 *
 * Le contexte est capté automatiquement et RÉSOLU CÔTÉ SERVEUR : rien de ce
 * qui est une clé étrangère ici n'a été fourni par le client. Voir
 * App\Domain\Admin\ReportService::create().
 */
class StudentReport extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';

    public const STATUS_IN_REVIEW = 'in_review';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_DISMISSED = 'dismissed';

    public const STATUS_DUPLICATE = 'duplicate';

    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_IN_REVIEW,
        self::STATUS_RESOLVED,
        self::STATUS_DISMISSED,
        self::STATUS_DUPLICATE,
    ];

    public const PRIORITIES = ['low', 'medium', 'high', 'critical'];

    /**
     * Les huit catégories de la spec (§12). Une liste fermée : c'est ce qui
     * rend l'agrégation par empreinte fiable, et ce qui permet de compter
     * « 25 signalements sur cette question » sans interprétation.
     */
    public const CATEGORIES = [
        'content_error',
        'wrong_answer',
        'unclear_question',
        'technical_problem',
        'display_problem',
        'interaction_problem',
        'typo',
        'other',
    ];

    /**
     * Les catégories qui décrivent une panne plutôt qu'une erreur de contenu :
     * seules celles-ci justifient de conserver navigateur/OS/écran.
     */
    public const TECHNICAL_CATEGORIES = [
        'technical_problem',
        'display_problem',
        'interaction_problem',
    ];

    protected $fillable = [
        'user_id',
        'lesson_id',
        'lesson_module_id',
        'lesson_code',
        'module_number',
        'step',
        'exercise_code',
        'question_id',
        'practice_session_id',
        'question_attempt_id',
        'category',
        'note',
        'status',
        'priority',
        'assigned_to',
        'resolved_by',
        'resolved_at',
        'duplicate_of_id',
        'route',
        'browser',
        'os',
        'screen',
        'app_version',
        'error_ref',
        'fingerprint',
    ];

    protected function casts(): array
    {
        return [
            'module_number' => 'integer',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * L'empreinte d'agrégation (§17). Déterministe et calculée au même
     * endroit pour tout le monde : deux signalements identiques dans leur
     * objet produisent la même chaîne, quelles que soient la note libre de
     * l'élève et son navigateur.
     */
    public static function fingerprintFor(array $parts): string
    {
        $canonical = implode('|', [
            $parts['lesson_code'] ?? '',
            $parts['module_number'] ?? '',
            $parts['exercise_code'] ?? '',
            $parts['question_id'] ?? '',
            $parts['category'] ?? '',
        ]);

        return hash('sha256', $canonical);
    }

    public function isTechnical(): bool
    {
        return in_array($this->category, self::TECHNICAL_CATEGORIES, true);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(LessonModule::class, 'lesson_module_id');
    }

    public function questionAttempt(): BelongsTo
    {
        return $this->belongsTo(QuestionAttempt::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ReportNote::class);
    }
}
