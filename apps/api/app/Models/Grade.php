<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    protected $fillable = [
        'code',
        'name',
        'level',
        'order',
    ];

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }
}
