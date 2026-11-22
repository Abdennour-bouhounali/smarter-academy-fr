<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une note ou une erreur marquée par l'élève. Enregistrement historique
 * durable, pas un état d'interface (cible §20).
 */
class NotebookNote extends Model
{
    /** Ce qu'une note EST pour l'élève — le contexte, lui, dit d'où elle vient. */
    public const TYPES = ['note', 'erreur', 'question', 'rappel', 'astuce', 'exemple', 'resume'];

    protected $fillable = [
        'user_id',
        'title',
        'lesson_id',
        'learning_point_id',
        'module_number',
        'exercise_id',
        'question_id',
        'content',
        'content_text',
        'mistake_type',
        'note_type',
        'is_pinned',
        'completed_at',
        'archived_at',
        'next_review_at',
        'last_reviewed_at',
        'review_count',
    ];

    protected $casts = [
        'module_number' => 'integer',
        'is_pinned' => 'boolean',
        'review_count' => 'integer',
        'completed_at' => 'datetime',
        'archived_at' => 'datetime',
        'next_review_at' => 'datetime',
        'last_reviewed_at' => 'datetime',
    ];

    /** Le texte d'une note, sans balises — la colonne de recherche. */
    public static function plainText(?string $html): string
    {
        $spaced = preg_replace('/<\/(p|li|h[1-6]|div|section|blockquote)>|<br\s*\/?>/i', ' ', (string) $html);
        $text = html_entity_decode(strip_tags($spaced), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    public function isErreur(): bool
    {
        return $this->note_type === 'erreur' || $this->mistake_type !== null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }
}
