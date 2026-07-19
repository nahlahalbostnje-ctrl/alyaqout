<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Talent extends Model
{
    protected $fillable = [
        'student_id', 'country_id', 'display_name', 'talent_name',
        'grade_label', 'age', 'goal', 'dream', 'bio',
    ];

    protected $casts = [
        'age' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
