<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialLink extends Model
{
    public $timestamps = false;

    protected $fillable = ['country_id', 'platform', 'url', 'icon', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
}
