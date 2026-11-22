<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Un jeu de « فضاء الألعاب » fermé par l'enseignant pour UN élève de sa
 * classe. Les autres élèves (et les autres jeux) ne changent pas.
 */
class MadarStudentGameBlock extends Model
{
    protected $fillable = ['classroom_id', 'student_id', 'game', 'teacher_id'];
}
