<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $fillable = [
        'course_id', 'teacher_id', 'title', 'description',
        'status', 'duration', 'starts_at',
    ];

    protected $casts = [
        'duration'   => 'integer',
        'starts_at'  => 'datetime',
    ];

    public function course(): BelongsTo      { return $this->belongsTo(Course::class); }
    public function teacher(): BelongsTo     { return $this->belongsTo(User::class, 'teacher_id'); }
    public function questions(): HasMany     { return $this->hasMany(ExamQuestion::class)->orderBy('sort_order'); }
    public function submissions(): HasMany   { return $this->hasMany(ExamSubmission::class); }
}
