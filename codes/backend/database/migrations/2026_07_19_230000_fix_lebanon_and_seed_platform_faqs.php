<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix mistyped Lebanon country metadata (was code=HI, phone=+22).
        DB::table('countries')
            ->where(function ($q) {
                $q->where('name', 'لبنان')
                    ->orWhere('code', 'HI')
                    ->orWhere('phone_code', '+22');
            })
            ->update([
                'name'       => 'لبنان',
                'code'       => 'LB',
                'phone_code' => '+961',
                'updated_at' => now(),
            ]);

        // Landing page uses platform FAQs (country_id IS NULL). Seed if empty.
        $hasPlatformFaqs = DB::table('faqs')->whereNull('country_id')->where('is_active', true)->exists();
        if ($hasPlatformFaqs) {
            return;
        }

        $faqs = [
            ['q' => 'كيف أسجّل في المنصة؟', 'a' => 'اضغط «احجز مكانك» أو «اطلب حصة مجانية» وأرسل بياناتك — يتواصل معك فريقنا لتحديد المستوى والموعد.'],
            ['q' => 'هل توجد حصة تجريبية مجانية؟', 'a' => 'نعم، يمكنك طلب حصة تجريبية مجانية من الصفحة الرئيسية وسنتواصل معك لتأكيد الموعد.'],
            ['q' => 'كيف أسجّل الدخول؟', 'a' => 'من زر «تسجيل الدخول» باستخدام البريد وكلمة المرور، أو برقم الجوال عبر رمز واتساب.'],
            ['q' => 'هل يمكن لولي الأمر متابعة الأبناء؟', 'a' => 'نعم، لولي الأمر بوابة خاصة لمتابعة الحضور والدرجات والتقارير والتواصل مع المعلمين.'],
            ['q' => 'كيف أتواصل مع المعلم؟', 'a' => 'من حساب الطالب عبر «تواصل مع المعلم» أو غرفة الطوارئ عند الحاجة العاجلة.'],
            ['q' => 'هل الحصص مباشرة ومسجّلة؟', 'a' => 'نعم، الحصص المباشرة عبر المنصة ويمكن الرجوع للتسجيلات والمراجعات حسب إعدادات الدورة.'],
        ];

        foreach ($faqs as $i => $f) {
            DB::table('faqs')->insert([
                'country_id' => null,
                'question'   => $f['q'],
                'answer'     => $f['a'],
                'sort_order' => $i + 1,
                'is_active'  => true,
                'created_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('faqs')
            ->whereNull('country_id')
            ->whereIn('question', [
                'كيف أسجّل في المنصة؟',
                'هل توجد حصة تجريبية مجانية؟',
                'كيف أسجّل الدخول؟',
                'هل يمكن لولي الأمر متابعة الأبناء؟',
                'كيف أتواصل مع المعلم؟',
                'هل الحصص مباشرة ومسجّلة؟',
            ])
            ->delete();
    }
};
