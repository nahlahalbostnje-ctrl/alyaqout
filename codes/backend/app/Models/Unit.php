<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = ['course_id', 'title', 'sort_order'];

    protected $casts = ['sort_order' => 'integer'];

    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
    public function lessons(): HasMany  { return $this->hasMany(Lesson::class)->orderBy('sort_order'); }
}
