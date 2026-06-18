<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GamificationPoint extends Model
{
    public $timestamps = false;

    protected $fillable = ['student_id', 'action', 'points', 'description', 'earned_at'];

    protected $casts = ['earned_at' => 'datetime'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
