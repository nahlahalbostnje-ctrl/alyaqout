<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = ['unit_id', 'title', 'sort_order'];

    protected $casts = ['sort_order' => 'integer'];

    public function unit(): BelongsTo  { return $this->belongsTo(Unit::class); }
    public function videos(): HasMany  { return $this->hasMany(Video::class)->orderBy('sort_order'); }
}
