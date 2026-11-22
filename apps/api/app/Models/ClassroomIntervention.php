<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Un geste pédagogique de l'enseignant dans son قسم (« تدخّل »). Voir la
 * migration et App\Domain\Classroom\ClassroomInterventionService, son seul
 * écrivain.
 *
 * `classroom_id`, `teacher_id` et `baseline` ne sont pas assignables en
 * masse : le service les pose depuis la classe possédée, l'enseignant
 * authentifié et l'état canonique du moment.
 */
class ClassroomIntervention extends Model
{
    public const STATUS_OPEN = 'open';

    public const STATUS_CLOSED = 'closed';

    public const KIND_OBSERVATION = 'observation';

    public const KIND_INDIVIDUAL_FOLLOWUP = 'individual_followup';

    public const KIND_CLASS_REINFORCEMENT = 'class_reinforcement';

    public const KIND_REVIEW_PREREQUISITE = 'review_prerequisite';

    public const KIND_RECOMMEND_LESSON = 'recommend_lesson';

    public const KIND_RECOMMEND_PRACTICE = 'recommend_practice';

    public const KINDS = [
        self::KIND_OBSERVATION,
        self::KIND_INDIVIDUAL_FOLLOWUP,
        self::KIND_CLASS_REINFORCEMENT,
        self::KIND_REVIEW_PREREQUISITE,
        self::KIND_RECOMMEND_LESSON,
        self::KIND_RECOMMEND_PRACTICE,
    ];

    /** Les gestes que l'élève VOIT, comme une suggestion — jamais un verrou. */
    public const STUDENT_VISIBLE_KINDS = [
        self::KIND_REVIEW_PREREQUISITE,
        self::KIND_RECOMMEND_LESSON,
        self::KIND_RECOMMEND_PRACTICE,
    ];

    /** Les gestes qui n'ont de sens que sur un learning point. */
    public const LEARNING_POINT_KINDS = [
        self::KIND_CLASS_REINFORCEMENT,
        self::KIND_REVIEW_PREREQUISITE,
        self::KIND_RECOMMEND_PRACTICE,
    ];

    protected $fillable = ['kind', 'note', 'student_message', 'status', 'opened_at', 'closed_at', 'review_after', 'source_signal'];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'review_after' => 'date',
            'baseline' => 'array',
        ];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'classroom_intervention_students', 'classroom_intervention_id', 'student_id')->withTimestamps();
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isStudentVisible(): bool
    {
        return in_array($this->kind, self::STUDENT_VISIBLE_KINDS, true);
    }
}
