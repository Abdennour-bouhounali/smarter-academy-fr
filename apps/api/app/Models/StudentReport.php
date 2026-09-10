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
     * D'où part le signalement.
     *
     * Déduire la source du contexte (« pas de module_number donc c'est la
     * leçon ») confondrait « signalement au niveau leçon » avec « contexte
     * incomplet ». Elle est donc dite explicitement.
     */
    public const SOURCE_LESSON = 'lesson';

    public const SOURCE_MODULE = 'module';

    public const SOURCE_EXERCISE = 'exercise';

    public const SOURCE_QUESTION = 'question';

    public const SOURCE_DIAGNOSTIC = 'diagnostic';

    public const SOURCES = [
        self::SOURCE_LESSON,
        self::SOURCE_MODULE,
        self::SOURCE_EXERCISE,
        self::SOURCE_QUESTION,
        self::SOURCE_DIAGNOSTIC,
    ];

    /**
     * Les catégories PROPOSÉES à l'élève aujourd'hui.
     *
     * Elles décrivent ce que l'élève CONSTATE, jamais ce qu'il faut corriger :
     * « la manipulation ne marche pas » est une observation, « bug JS » serait
     * un diagnostic qu'on lui demanderait de poser à notre place.
     */
    public const CATEGORY_MATH_ERROR = 'math_error';

    public const CATEGORY_MANIPULATION = 'manipulation_not_working';

    public const CATEGORY_UNCLEAR = 'unclear_question';

    public const CATEGORY_ANSWER = 'answer_correction_problem';

    public const CATEGORY_DISPLAY = 'display_problem';

    public const CATEGORY_TYPO = 'typo';

    public const CATEGORY_OTHER = 'other';

    public const OFFERED_CATEGORIES = [
        self::CATEGORY_MATH_ERROR,
        self::CATEGORY_MANIPULATION,
        self::CATEGORY_UNCLEAR,
        self::CATEGORY_ANSWER,
        self::CATEGORY_DISPLAY,
        self::CATEGORY_TYPO,
        self::CATEGORY_OTHER,
    ];

    /**
     * Catégories d'un vocabulaire antérieur. Toujours ACCEPTÉES en entrée et
     * toujours affichées côté administration — elles ne sont simplement plus
     * proposées.
     *
     * Les supprimer casserait tout signalement déjà en base et tout client
     * pas encore rechargé. Une liste fermée peut s'étendre ; elle ne se
     * réécrit pas sous les pieds de ce qui l'utilise.
     */
    public const LEGACY_CATEGORIES = [
        'content_error',
        'wrong_answer',
        'technical_problem',
        'interaction_problem',
    ];

    /** Tout ce que la validation accepte : proposé + hérité. */
    public const CATEGORIES = [
        ...self::OFFERED_CATEGORIES,
        ...self::LEGACY_CATEGORIES,
    ];

    /**
     * Les catégories qui décrivent une panne plutôt qu'une erreur de contenu :
     * seules celles-ci justifient de conserver navigateur/OS/écran.
     */
    public const TECHNICAL_CATEGORIES = [
        self::CATEGORY_MANIPULATION,
        self::CATEGORY_DISPLAY,
        // Vocabulaire antérieur, conservé : d'anciens signalements techniques
        // doivent garder leur contexte machine à l'affichage.
        'technical_problem',
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
        'source',
        'details_completed_at',
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
            'details_completed_at' => 'datetime',
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

    /** L'élève a-t-il rempli le formulaire, ou seulement cliqué ? */
    public function hasDetails(): bool
    {
        return $this->details_completed_at !== null;
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
