<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un rapport FIGÉ de l'établissement (SCHOOL_ADMIN_SPACE.md, phase 5). Le
 * `payload` est la forme versionnée (`schema_version`) que le client sait
 * dessiner, imprimer et exporter. Aucune ligne ne se modifie : on en génère
 * une nouvelle.
 */
class SchoolReportSnapshot extends Model
{
    public const TYPE_STUDENT = 'student';

    public const TYPE_CLASS = 'class';

    public const TYPE_GRADE = 'grade';

    public const TYPE_SCHOOL_TERM = 'school_term';

    public const TYPE_TEACHERS = 'teachers';

    public const TYPES = [self::TYPE_STUDENT, self::TYPE_CLASS, self::TYPE_GRADE, self::TYPE_SCHOOL_TERM, self::TYPE_TEACHERS];

    public const SCHEMA_VERSION = 1;

    protected $fillable = ['type', 'scope', 'term_id', 'title', 'payload', 'schema_version', 'generated_at'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'schema_version' => 'integer',
            'generated_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(SchoolTerm::class, 'term_id');
    }
}
