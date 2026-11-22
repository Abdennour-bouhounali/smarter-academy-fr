<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use LogicException;

/**
 * UNE preuve d'apprentissage — ce qui s'est passé, une fois, pour de bon.
 *
 * APPEND-ONLY. La maîtrise se dérive de la preuve ; la preuve, elle, ne se
 * réécrit pas. Le modèle refuse toute mise à jour d'une ligne existante, sauf
 * à l'intérieur de LearningEvidence::allowBackfill() — la seule porte, tenue
 * par smarter:evidence:backfill, qui COMPLÈTE des colonnes nulles sans
 * jamais toucher à ce qui était déjà écrit.
 */
class LearningEvidence extends Model
{
    // 'learning_evidence' is uncountable — Eloquent's pluralized guess
    // ('learning_evidences') would be wrong.
    protected $table = 'learning_evidence';

    /** Ouverte uniquement par allowBackfill(). */
    private static bool $backfilling = false;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'question_code',
        'attempt_id',
        'is_correct',
        'assessment_type',
        'answer',
        'submitted_at',
        // Contexte apporté par le moteur de pratique. Restent NULL pour le
        // test final d'avant la V2, qui n'a ni niveau ni indices.
        'outcome',
        'level',
        'hints_used',
        'misconception_id',
        'source_id',
        // Mastery V2 — identité et nature de la preuve (EvidenceClassifier).
        'item_key',
        'template_key',
        'difficulty',
        'attempt_number',
        'demonstration_kind',
        'evaluated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'answer' => 'array',
            'submitted_at' => 'datetime',
            'level' => 'integer',
            'hints_used' => 'integer',
            'difficulty' => 'integer',
            'attempt_number' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (self $evidence) {
            if (! self::$backfilling) {
                throw new LogicException('learning_evidence est append-only : une preuve ne se réécrit pas.');
            }
            // Le backfill ne peut que REMPLIR : une colonne déjà écrite ne change pas.
            foreach ($evidence->getDirty() as $column => $value) {
                if ($evidence->getOriginal($column) !== null) {
                    throw new LogicException("Backfill : la colonne {$column} de la preuve {$evidence->id} est déjà renseignée.");
                }
            }
        });

        static::deleting(function () {
            throw new LogicException('learning_evidence est append-only : une preuve ne se supprime pas.');
        });
    }

    /**
     * Exécute $fn avec le droit de COMPLÉTER des colonnes nulles. Réservé à la
     * commande de backfill ; tout autre usage est une erreur de conception.
     *
     * @template T
     *
     * @param  callable(): T  $fn
     * @return T
     */
    public static function allowBackfill(callable $fn): mixed
    {
        $previous = self::$backfilling;
        self::$backfilling = true;
        try {
            return $fn();
        } finally {
            self::$backfilling = $previous;
        }
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningPoints(): BelongsToMany
    {
        // `role` ('primary' | 'secondary') pondère la preuve : une question
        // qui mesure surtout un point ne doit pas créditer autant celui
        // qu'elle ne fait qu'effleurer. Par défaut 'primary', donc les
        // lignes antérieures gardent exactement leur sens.
        return $this->belongsToMany(LearningPoint::class, 'learning_evidence_learning_point')
            ->withPivot('role');
    }
}
