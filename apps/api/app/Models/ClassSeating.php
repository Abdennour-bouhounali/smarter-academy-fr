<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Le plan d'UNE classe : qui est assis où, les équipes (« حصّة القسم »). Absence de ligne = pas encore placé. */
class ClassSeating extends Model
{
    protected $fillable = ['classroom_id', 'layout', 'updated_by'];

    protected function casts(): array
    {
        return ['layout' => 'array'];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }
}
