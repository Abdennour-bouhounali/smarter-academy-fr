<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Où en est un élève dans les 50 niveaux d'un jeu de mathématiques : sa
 * position (0…149 = niveau × 3 sous-niveaux) et la plus haute atteinte.
 */
class MadarMathProgress extends Model
{
    protected $table = 'madar_math_progress';

    protected $fillable = ['user_id', 'game', 'position', 'best_position', 'rounds'];

    protected function casts(): array
    {
        return ['position' => 'integer', 'best_position' => 'integer', 'rounds' => 'integer'];
    }
}
