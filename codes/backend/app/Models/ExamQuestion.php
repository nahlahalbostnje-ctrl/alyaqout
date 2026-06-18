<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamQuestion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'exam_id', 'question', 'type', 'options', 'answer', 'points', 'sort_order',
    ];

    protected $casts = [
        'options'    => 'array',
        'points'     => 'integer',
        'sort_order' => 'integer',
    ];

    public function exam(): BelongsTo { return $this->belongsTo(Exam::class); }
}
