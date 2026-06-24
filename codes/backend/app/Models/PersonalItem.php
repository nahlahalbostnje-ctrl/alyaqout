<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalItem extends Model
{
    protected $fillable = [
        'user_id',
        'role',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'due_date',
        'extra',
    ];

    protected $casts = [
        'due_date' => 'date',
        'extra'    => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
