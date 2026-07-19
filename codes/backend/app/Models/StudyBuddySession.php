<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyBuddySession extends Model
{
    protected $fillable = [
        'student_id', 'duration_seconds', 'break_seconds', 'notes',
        'smart_mode', 'started_at', 'ended_at',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'break_seconds'    => 'integer',
        'smart_mode'       => 'boolean',
        'started_at'       => 'datetime',
        'ended_at'         => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
