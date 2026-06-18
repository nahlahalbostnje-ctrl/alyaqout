<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    public $timestamps = false;

    protected $fillable = ['country_id', 'slug', 'title', 'content'];

    protected $casts = ['updated_at' => 'datetime'];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
}
