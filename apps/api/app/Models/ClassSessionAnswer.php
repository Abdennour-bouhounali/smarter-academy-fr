<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Qui a répondu à quelle question d'une séance en classe, juste ou non. Fait de classe, pas preuve d'apprentissage. */
class ClassSessionAnswer extends Model
{
    public $timestamps = false;

    protected $fillable = ['class_session_id', 'position', 'question_id', 'item', 'student_id', 'team_id', 'correct', 'picked_by', 'ms'];

    protected function casts(): array
    {
        return ['correct' => 'boolean', 'position' => 'integer', 'ms' => 'integer'];
    }
}
