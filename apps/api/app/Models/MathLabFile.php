<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un fichier ajouté à une سبّورة du مختبر الرياضيات. La ligne est la
 * référence ; les octets vivent sur le disque privé, à `disk_path`.
 */
class MathLabFile extends Model
{
    protected $fillable = ['user_id', 'document_id', 'kind', 'original_name', 'mime_type', 'size', 'disk_path'];

    protected $casts = ['size' => 'integer'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(MathLabDocument::class, 'document_id');
    }
}
