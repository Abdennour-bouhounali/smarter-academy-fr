<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookMessage extends Model
{
    public const STATUSES = ['new', 'in_progress', 'replied', 'closed', 'archived'];

    public const ROLES = ['student', 'teacher', 'parent', 'other'];

    public const SUBJECTS = ['general', 'feedback', 'support', 'mentoring', 'teacher_collab', 'bulk_purchase', 'other'];

    protected $fillable = [
        'book_id', 'full_name', 'email', 'phone', 'country', 'role', 'school',
        'book_owner', 'subject', 'message', 'status', 'admin_note',
    ];

    protected function casts(): array
    {
        return ['book_owner' => 'boolean'];
    }
}
