<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EncouragementMessage extends Model
{
    protected $fillable = ['achievement_type','message','is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public static function randomFor(string $type): string
    {
        $msg = static::where('achievement_type', $type)->where('is_active', true)->inRandomOrder()->first();
        return $msg?->message ?? static::defaultMessage($type);
    }

    private static function defaultMessage(string $type): string
    {
        return match($type) {
            'exam_passed'    => '🎉 أحسنت! لقد اجتزت الاختبار بنجاح!',
            'homework_done'  => '✅ رائع! أنجزت واجبك في الوقت المحدد!',
            'points_earned'  => '⭐ ممتاز! حصلت على نقاط جديدة!',
            'attendance'     => '🏆 استمر! حضورك المنتظم يصنع الفارق!',
            default          => '💪 أنت تسير في الاتجاه الصحيح، واصل!',
        };
    }
}
