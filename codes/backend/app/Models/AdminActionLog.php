<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActionLog extends Model
{
    protected $fillable = ['admin_id','action','target_type','target_id','target_label','before','after','ip_address'];

    protected $casts = ['before' => 'array', 'after' => 'array'];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public static function record(string $action, ?string $targetType = null, ?int $targetId = null, ?string $targetLabel = null, ?array $before = null, ?array $after = null): void
    {
        static::create([
            'admin_id'     => auth('api')->id() ?? auth()->id(),
            'action'       => $action,
            'target_type'  => $targetType,
            'target_id'    => $targetId,
            'target_label' => $targetLabel,
            'before'       => $before,
            'after'        => $after,
            'ip_address'   => request()?->ip(),
        ]);
    }
}
