<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    protected $fillable = [
        'country_id', 'type', 'title', 'description', 'category',
        'target_value', 'current_value', 'unit', 'status',
        'created_by', 'student_id', 'parent_id', 'ends_at', 'completed_at',
    ];

    protected $casts = [
        'target_value'  => 'integer',
        'current_value' => 'integer',
        'ends_at'       => 'date',
        'completed_at'  => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ChallengeProgressLog::class)->orderByDesc('created_at');
    }

    public function progressPct(): int
    {
        if ($this->target_value <= 0) {
            return 0;
        }

        return (int) min(100, round($this->current_value / $this->target_value * 100));
    }
}
