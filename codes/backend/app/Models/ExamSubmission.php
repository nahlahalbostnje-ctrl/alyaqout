<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamSubmission extends Model
{
    protected $fillable = [
        'exam_id', 'student_id', 'answers', 'score',
        'total_points', 'submitted_at', 'graded_at',
    ];

    protected $casts = [
        'answers'      => 'array',
        'score'        => 'decimal:2',
        'total_points' => 'decimal:2',
        'submitted_at' => 'datetime',
        'graded_at'    => 'datetime',
    ];

    public function exam(): BelongsTo    { return $this->belongsTo(Exam::class); }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
}
