<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Le meilleur d'un élève sur UN niveau d'un jeu à niveaux (« المستكشف »). */
class MadarLevelProgress extends Model
{
    protected $table = 'madar_level_progress';

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = ['user_id', 'game', 'level', 'best_score', 'stars', 'attempts', 'completed_at'];

    protected function casts(): array
    {
        return ['level' => 'integer', 'best_score' => 'integer', 'stars' => 'integer', 'attempts' => 'integer', 'completed_at' => 'datetime'];
    }
}
