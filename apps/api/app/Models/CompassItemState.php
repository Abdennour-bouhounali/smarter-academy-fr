<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** La dernière bande connue d'une كفاءة pour un élève (بوصلتي) — jamais une preuve de maîtrise. */
class CompassItemState extends Model
{
    protected $fillable = ['user_id', 'item_id', 'band', 'compass_session_id', 'measured_at'];

    protected function casts(): array
    {
        return ['measured_at' => 'datetime'];
    }
}
