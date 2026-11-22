<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasteryReplay extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'engine_version', 'scope', 'scope_id', 'dry_run', 'status',
        'pairs_total', 'pairs_done', 'pairs_changed', 'diff_summary', 'error',
        'requested_by', 'started_at', 'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'engine_version' => 'integer',
            'dry_run' => 'boolean',
            'diff_summary' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}
