<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoProgress extends Model
{
    protected $fillable = ['student_id', 'video_id', 'completed', 'watch_duration', 'watched_at'];

    protected $casts = [
        'completed'      => 'boolean',
        'watch_duration' => 'integer',
        'watched_at'     => 'datetime',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function video(): BelongsTo   { return $this->belongsTo(Video::class); }
}
