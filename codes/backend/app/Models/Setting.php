<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'country_id',
        'chatbot_provider',
        'chatbot_api_key',
        'chatbot_system_prompt',
        'chatbot_enabled',
        'whatsapp_number',
        'whatsapp_default_message',
        'updated_at',
    ];

    protected $casts = [
        'chatbot_enabled' => 'boolean',
        'updated_at'      => 'datetime',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
