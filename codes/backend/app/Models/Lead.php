<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'country_id', 'grade_id', 'student_name', 'phone',
        'school', 'region', 'subjects', 'source', 'status',
    ];

    protected $casts = [
        'subjects'   => 'array',
        'created_at' => 'datetime',
    ];

    public function country(): BelongsTo { return $this->belongsTo(Country::class); }
    public function grade(): BelongsTo   { return $this->belongsTo(Grade::class); }
}
