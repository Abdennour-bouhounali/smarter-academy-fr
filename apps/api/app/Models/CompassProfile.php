<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Où en est la classe selon l'élève (« أين وصل قسمك؟ ») — بوصلتي. */
class CompassProfile extends Model
{
    public const MODE_LESSON = 'lesson';

    public const MODE_NOT_FOLLOWING = 'not_following';

    protected $fillable = ['user_id', 'pointer_mode', 'pointer_lesson', 'pointer_set_at'];

    protected function casts(): array
    {
        return ['pointer_set_at' => 'datetime'];
    }
}
