<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une PHOTO de copie jointe à une étape d'examen — réencodée sans métadonnées
 * sur le disque privé (AnswerImageStore), servie seulement à l'élève et à un
 * enseignant de sa classe active (AnswerImageController).
 */
class AnswerImage extends Model
{
    protected $fillable = [
        'uuid', 'question_attempt_id', 'user_id', 'disk_path', 'width', 'height', 'size',
        'annotation_path', 'annotated_by', 'annotated_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'size' => 'integer',
            'annotated_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function questionAttempt(): BelongsTo
    {
        return $this->belongsTo(QuestionAttempt::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /** La forme envoyée au client : jamais de chemin disque. */
    public function toClient(): array
    {
        return [
            'id' => $this->uuid,
            'width' => $this->width,
            'height' => $this->height,
            'annotated' => $this->annotation_path !== null,
        ];
    }
}
