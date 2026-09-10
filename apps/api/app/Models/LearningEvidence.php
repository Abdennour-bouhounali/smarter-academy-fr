<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningEvidence extends Model
{
    // 'learning_evidence' is uncountable — Eloquent's pluralized guess
    // ('learning_evidences') would be wrong.
    protected $table = 'learning_evidence';

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
        // test final, qui n'a ni niveau ni indices — c'est ce qui rend
        // l'extension invisible pour les 193 preuves déjà enregistrées.
        'outcome',
        'level',
        'hints_used',
        'misconception_id',
        'source_id',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'answer' => 'array',
            'submitted_at' => 'datetime',
            'level' => 'integer',
            'hints_used' => 'integer',
        ];
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
        // qu'elle ne fait qu'effleurer. Par défaut 'primary', donc les 230
        // lignes antérieures gardent exactement leur sens.
        return $this->belongsToMany(LearningPoint::class, 'learning_evidence_learning_point')
            ->withPivot('role');
    }
}
