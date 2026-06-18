<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'country_id', 'code', 'discount_type', 'discount_value',
        'max_uses', 'used_count', 'expires_at', 'scope', 'course_id', 'is_active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'is_active'      => 'boolean',
        'expires_at'     => 'date',
        'created_at'     => 'datetime',
    ];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
    public function course(): BelongsTo  { return $this->belongsTo(Course::class); }

    public function isValid(): bool
    {
        if (! $this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) return false;
        return true;
    }
}
