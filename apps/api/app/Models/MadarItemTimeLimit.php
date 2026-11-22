<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Le délai d'UNE question de la « محطة التزوّد », posé par l'enseignant pour sa classe. */
class MadarItemTimeLimit extends Model
{
    protected $fillable = ['classroom_id', 'item_key', 'seconds', 'updated_by'];

    protected function casts(): array
    {
        return ['seconds' => 'integer'];
    }
}
