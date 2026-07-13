<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AdminActionLog;
use App\Models\LoginAttempt;
use App\Models\Notification;
use App\Models\VideoProgress;
use Illuminate\Database\Eloquent\Model;
use Throwable;

class ActivityLogger
{
    private static bool $muted = false;

    /** Models that must never create activity rows (noise / recursion). */
    private const EXCLUDED = [
        AdminActionLog::class,
        LoginAttempt::class,
        VideoProgress::class,
        Notification::class,
    ];

    /** Never persist these attribute keys in before/after payloads. */
    private const SENSITIVE = [
        'password',
        'remember_token',
        'otp_code',
        'otp_expires_at',
    ];

    /** Updates that only touch these keys are ignored (noise). */
    private const IGNORE_CHANGE_KEYS = [
        'password',
        'remember_token',
        'otp_code',
        'otp_expires_at',
        'updated_at',
        'created_at',
        'last_login_at',
    ];

    public static function mute(): void
    {
        self::$muted = true;
    }

    public static function unmute(): void
    {
        self::$muted = false;
    }

    /**
     * @template T
     * @param  callable(): T  $callback
     * @return T
     */
    public static function withoutLogging(callable $callback): mixed
    {
        self::mute();
        try {
            return $callback();
        } finally {
            self::unmute();
        }
    }

    public static function recordLogin(Model $user, ?string $ip = null): void
    {
        if (! $user->getKey()) {
            return;
        }

        self::write(
            actorId: (int) $user->getKey(),
            action: 'login',
            targetType: class_basename($user),
            targetId: (int) $user->getKey(),
            targetLabel: self::labelFor($user),
            before: null,
            after: null,
            ip: $ip ?? request()?->ip(),
        );
    }

    public static function created(Model $model): void
    {
        self::fromModel('create', $model, null, self::safeAttributes($model));
    }

    public static function updated(Model $model): void
    {
        $changes = $model->getChanges();
        $meaningful = array_diff_key($changes, array_flip(self::IGNORE_CHANGE_KEYS));
        if ($meaningful === []) {
            return;
        }

        $before = [];
        foreach (array_keys($meaningful) as $key) {
            $before[$key] = $model->getOriginal($key);
        }

        self::fromModel(
            'update',
            $model,
            self::stripSensitive($before),
            self::stripSensitive($meaningful),
        );
    }

    public static function deleted(Model $model): void
    {
        self::fromModel('delete', $model, self::safeAttributes($model), null);
    }

    private static function fromModel(
        string $action,
        Model $model,
        ?array $before,
        ?array $after,
    ): void {
        if (self::$muted || self::isExcluded($model)) {
            return;
        }

        $actorId = auth('api')->id() ?? auth()->id();
        if (! $actorId) {
            return;
        }

        self::write(
            actorId: (int) $actorId,
            action: $action,
            targetType: class_basename($model),
            targetId: $model->getKey() !== null ? (int) $model->getKey() : null,
            targetLabel: self::labelFor($model),
            before: $before,
            after: $after,
            ip: request()?->ip(),
        );
    }

    private static function write(
        int $actorId,
        string $action,
        string $targetType,
        ?int $targetId,
        ?string $targetLabel,
        ?array $before,
        ?array $after,
        ?string $ip,
    ): void {
        try {
            self::withoutLogging(function () use ($actorId, $action, $targetType, $targetId, $targetLabel, $before, $after, $ip): void {
                AdminActionLog::create([
                    'admin_id'     => $actorId,
                    'action'       => $action,
                    'target_type'  => $targetType,
                    'target_id'    => $targetId,
                    'target_label' => $targetLabel,
                    'before'       => $before,
                    'after'        => $after,
                    'ip_address'   => $ip,
                ]);
            });
        } catch (Throwable) {
            // Never break the main request because of audit logging.
        }
    }

    private static function isExcluded(Model $model): bool
    {
        foreach (self::EXCLUDED as $class) {
            if ($model instanceof $class) {
                return true;
            }
        }

        return false;
    }

    private static function labelFor(Model $model): string
    {
        foreach (['name', 'title', 'label', 'email', 'phone', 'code'] as $attr) {
            $value = $model->getAttribute($attr);
            if (is_string($value) && $value !== '') {
                $role = $model->getAttribute('role');
                if (is_string($role) && $role !== '') {
                    return $value.' ('.$role.')';
                }

                return $value;
            }
        }

        $key = $model->getKey();

        return class_basename($model).($key !== null ? ' #'.$key : '');
    }

    private static function safeAttributes(Model $model): array
    {
        return self::stripSensitive($model->attributesToArray());
    }

    private static function stripSensitive(array $data): array
    {
        foreach (self::SENSITIVE as $key) {
            unset($data[$key]);
        }

        return $data;
    }
}
