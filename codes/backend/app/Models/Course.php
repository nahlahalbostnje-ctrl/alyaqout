<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'country_id', 'category_id', 'teacher_id',
        'title', 'description', 'thumbnail',
        'price', 'is_free', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'is_free'    => 'boolean',
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    public function country(): BelongsTo  { return $this->belongsTo(Country::class); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function teacher(): BelongsTo  { return $this->belongsTo(User::class, 'teacher_id'); }
    public function units(): HasMany      { return $this->hasMany(Unit::class)->orderBy('sort_order'); }
}
