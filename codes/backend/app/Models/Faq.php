<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faq extends Model
{
    public $timestamps = false;

    protected $fillable = ['country_id', 'question', 'answer', 'sort_order', 'is_active'];

    protected $casts = [
        'is_active'  => 'boolean',
        'created_at' => 'datetime',
    ];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
}
