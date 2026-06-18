<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomeworkSubmission extends Model
{
    protected $fillable = [
        'homework_id', 'student_id', 'file_url', 'notes',
        'grade', 'teacher_feedback', 'status', 'submitted_at',
    ];

    protected $casts = [
        'grade'        => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    public function homework(): BelongsTo { return $this->belongsTo(Homework::class); }
    public function student(): BelongsTo  { return $this->belongsTo(User::class, 'student_id'); }
}
