<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'country_id', 'title', 'image_url', 'link_url',
        'starts_at', 'ends_at', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'starts_at'  => 'date',
        'ends_at'    => 'date',
        'created_at' => 'datetime',
    ];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
}
