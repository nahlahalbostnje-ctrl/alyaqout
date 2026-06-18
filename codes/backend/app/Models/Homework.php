<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Homework extends Model
{
    protected $table = 'homeworks';

    protected $fillable = [
        'course_id', 'teacher_id', 'title', 'description', 'status', 'due_date',
    ];

    protected $casts = ['due_date' => 'date'];

    public function course(): BelongsTo     { return $this->belongsTo(Course::class); }
    public function teacher(): BelongsTo    { return $this->belongsTo(User::class, 'teacher_id'); }
    public function submissions(): HasMany  { return $this->hasMany(HomeworkSubmission::class); }
}
