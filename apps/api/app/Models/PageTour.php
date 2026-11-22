<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une visite guidée CLOSE pour un compte — voir la migration
 * create_page_tours_table et PageTourController.
 */
class PageTour extends Model
{
    public const STATUS_COMPLETED = 'completed';

    public const STATUS_SKIPPED = 'skipped';

    public const STATUSES = [self::STATUS_COMPLETED, self::STATUS_SKIPPED];

    protected $fillable = ['user_id', 'tour', 'status', 'step'];

    protected function casts(): array
    {
        return ['step' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
