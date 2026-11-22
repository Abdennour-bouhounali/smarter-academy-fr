<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * « ملفّ الدرس » : le lien entre un enseignant, une leçon et SON document de la سبّورة du مختبر — un seul par
 * (enseignant, leçon). Le contenu vit dans `math_lab_documents` (et ses pièces jointes, sous le quota du مختبر).
 */
class TeacherLessonFile extends Model
{
    protected $fillable = ['teacher_id', 'lesson_code', 'math_lab_document_id'];

    protected function casts(): array
    {
        return ['math_lab_document_id' => 'integer'];
    }
}
