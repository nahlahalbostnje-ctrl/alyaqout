<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Video extends Model
{
    protected $fillable = ['lesson_id', 'title', 'video_url', 'duration', 'type', 'sort_order'];

    protected $casts = [
        'duration'   => 'integer',
        'sort_order' => 'integer',
    ];

    public function lesson(): BelongsTo     { return $this->belongsTo(Lesson::class); }
    public function progress(): HasMany     { return $this->hasMany(VideoProgress::class); }
}
