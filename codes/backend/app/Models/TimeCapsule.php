<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeCapsule extends Model
{
    protected $fillable = [
        'student_id', 'country_id', 'year', 'month', 'message', 'remind_at', 'opened_at',
    ];

    protected $casts = [
        'year'      => 'integer',
        'month'     => 'integer',
        'remind_at' => 'date',
        'opened_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
