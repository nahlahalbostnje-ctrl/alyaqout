<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationBroadcast extends Model
{
    protected $fillable = [
        'sent_by', 'country_id', 'title', 'body',
        'target_type', 'target_value', 'recipients_count',
    ];

    protected $casts = [
        'recipients_count' => 'integer',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
