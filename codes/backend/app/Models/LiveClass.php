<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveClass extends Model
{
    protected $fillable = [
        'country_id', 'course_id', 'teacher_id',
        'session_type', 'student_id',
        'title', 'description', 'scheduled_at',
        'duration_minutes', 'status', 'meeting_link', 'agora_channel',
    ];

    protected $casts = [
        'scheduled_at'     => 'datetime',
        'duration_minutes' => 'integer',
    ];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
    public function course(): BelongsTo  { return $this->belongsTo(Course::class); }
    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
}
