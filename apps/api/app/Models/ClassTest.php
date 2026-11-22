<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * La COPIE d'un enseignant du test en classe d'une leçon (début / fin). Le test par défaut reste un fichier du dépôt :
 * supprimer cette ligne, c'est « réinitialiser ». Les questions écrites par l'enseignant portent `source: teacher` —
 * elles ne sont pas vérifiées par la plateforme, il en a la responsabilité (propriétaire, 2026-11-18).
 */
class ClassTest extends Model
{
    protected $fillable = ['teacher_id', 'lesson_code', 'questions', 'base_version'];

    protected function casts(): array
    {
        return ['questions' => 'array', 'base_version' => 'integer'];
    }
}
