<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EncouragementMessage;
use Illuminate\Database\Seeder;

class EncouragementMessageSeeder extends Seeder
{
    public function run(): void
    {
        $messages = [
            // exam_passed
            ['achievement_type' => 'exam_passed', 'message' => '🎉 أحسنت! لقد اجتزت الاختبار بنجاح!'],
            ['achievement_type' => 'exam_passed', 'message' => '🏆 نتيجة رائعة! تعبك ما ضاع!'],
            ['achievement_type' => 'exam_passed', 'message' => '⭐ ممتاز! هذا الاجتهاد يؤتي ثماره!'],
            ['achievement_type' => 'exam_passed', 'message' => '🌟 بطل! واصل هذا المستوى الرائع!'],
            ['achievement_type' => 'exam_passed', 'message' => '🚀 علامتك تعكس ذكاءك واجتهادك!'],

            // homework_done
            ['achievement_type' => 'homework_done', 'message' => '✅ رائع! أنجزت واجبك في الوقت المحدد!'],
            ['achievement_type' => 'homework_done', 'message' => '💪 أنت طالب منظم ومجتهد!'],
            ['achievement_type' => 'homework_done', 'message' => '📚 واجبك مسلّم — استمر هكذا!'],
            ['achievement_type' => 'homework_done', 'message' => '🌈 الانتظام هو مفتاح النجاح!'],
            ['achievement_type' => 'homework_done', 'message' => '👏 أحسنت! كل واجب يقربك من هدفك!'],

            // points_earned
            ['achievement_type' => 'points_earned', 'message' => '⭐ ممتاز! حصلت على نقاط جديدة!'],
            ['achievement_type' => 'points_earned', 'message' => '🌟 رصيدك يزداد! واصل التألق!'],
            ['achievement_type' => 'points_earned', 'message' => '💰 كل نقطة تقربك من القمة!'],
            ['achievement_type' => 'points_earned', 'message' => '🏅 نقاط جديدة في حصالتك! رائع!'],
            ['achievement_type' => 'points_earned', 'message' => '🎯 أنت على الطريق الصحيح!'],

            // attendance
            ['achievement_type' => 'attendance', 'message' => '🏆 حضورك المنتظم يصنع الفارق!'],
            ['achievement_type' => 'attendance', 'message' => '📅 يوم رائع آخر في رحلة التعلم!'],
            ['achievement_type' => 'attendance', 'message' => '🌅 الاستمرارية هي سر النجاح!'],
            ['achievement_type' => 'attendance', 'message' => '👑 الحضور المنتظم علامة المتميزين!'],

            // general
            ['achievement_type' => 'general', 'message' => '💪 أنت تسير في الاتجاه الصحيح!'],
            ['achievement_type' => 'general', 'message' => '🚀 كل يوم خطوة نحو هدفك!'],
            ['achievement_type' => 'general', 'message' => '✨ طالب ياقوت — نجم المستقبل!'],
            ['achievement_type' => 'general', 'message' => '🌟 العلم نور — واصل رحلتك!'],
        ];

        foreach ($messages as $msg) {
            EncouragementMessage::firstOrCreate(
                ['achievement_type' => $msg['achievement_type'], 'message' => $msg['message']],
                ['is_active' => true]
            );
        }
    }
}
