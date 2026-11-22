<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Un livre papier vendu par la plateforme. Voir docs/architecture/BOOKS_STORE.md. */
class Book extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'slug', 'title', 'subtitle', 'author', 'summary', 'content',
        'price', 'cover_image', 'gallery', 'status', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'gallery' => 'array',
            'price' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(BookOrder::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }
}
