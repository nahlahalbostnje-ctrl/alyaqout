<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Country;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PalestineSeeder extends Seeder
{
    public function run(): void
    {
        // ══════════════════════════════════════════════
        // 1. COUNTRY — فلسطين
        // ══════════════════════════════════════════════
        $ps = Country::firstOrCreate(
            ['code' => 'PS'],
            [
                'name'       => 'فلسطين',
                'currency'   => 'ILS',
                'phone_code' => '+970',
                'sort_order' => 4,
                'is_active'  => true,
            ]
        );
        $cid = $ps->id;

        // ══════════════════════════════════════════════
        // 2. ADMIN
        // ══════════════════════════════════════════════
        $admin = User::firstOrCreate(
            ['phone' => '00970444444444'],
            ['name' => 'مدير فلسطين', 'role' => 'admin', 'country_id' => $cid, 'is_active' => true]
        );

        // ══════════════════════════════════════════════
        // 3. GRADES (12)
        // ══════════════════════════════════════════════
        $gradeNames = [
            'الصف الأول الابتدائي',   'الصف الثاني الابتدائي',  'الصف الثالث الابتدائي',
            'الصف الرابع الابتدائي',  'الصف الخامس الابتدائي',  'الصف السادس الابتدائي',
            'الصف السابع الإعدادي',   'الصف الثامن الإعدادي',   'الصف التاسع الإعدادي',
            'الصف العاشر الثانوي',    'الصف الحادي عشر العلمي', 'الصف الثاني عشر العلمي',
        ];
        $grades = [];
        foreach ($gradeNames as $i => $name) {
            $row = DB::table('grades')->where('country_id', $cid)->where('name', $name)->first();
            if (!$row) {
                $grades[] = DB::table('grades')->insertGetId([
                    'country_id' => $cid, 'name' => $name,
                    'sort_order' => $i + 1, 'is_active' => true,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $grades[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 4. TEACHERS (10)
        // ══════════════════════════════════════════════
        $teacherRows = [
            ['name' => 'أ. محمد أبو عمر',  'phone' => '00970111111111'],
            ['name' => 'أ. فاطمة الشيخ',   'phone' => '00970111111112'],
            ['name' => 'أ. يوسف حمدان',    'phone' => '00970111111113'],
            ['name' => 'أ. سمر النجار',    'phone' => '00970111111114'],
            ['name' => 'أ. خالد البرغوثي', 'phone' => '00970111111115'],
            ['name' => 'أ. منى حسين',      'phone' => '00970111111116'],
            ['name' => 'أ. طارق الأشقر',   'phone' => '00970111111117'],
            ['name' => 'أ. رنا أبو دية',   'phone' => '00970111111118'],
            ['name' => 'أ. وسام قاسم',     'phone' => '00970111111119'],
            ['name' => 'أ. هناء الخطيب',   'phone' => '00970111111120'],
        ];
        $teachers = [];
        foreach ($teacherRows as $t) {
            $teachers[] = User::firstOrCreate(
                ['phone' => $t['phone']],
                ['name' => $t['name'], 'role' => 'teacher', 'country_id' => $cid, 'is_active' => true]
            );
        }

        // ══════════════════════════════════════════════
        // 5. PARENTS (10)
        // ══════════════════════════════════════════════
        $parentRows = [
            ['name' => 'أبو أحمد سالم',  'phone' => '00970333333331'],
            ['name' => 'أم سارة رشيد',   'phone' => '00970333333332'],
            ['name' => 'أبو عمر حمادة',  'phone' => '00970333333333'],
            ['name' => 'أم ليلى حسن',    'phone' => '00970333333334'],
            ['name' => 'أبو كريم ناصر',  'phone' => '00970333333335'],
            ['name' => 'أم دانا محمود',  'phone' => '00970333333336'],
            ['name' => 'أبو زياد طاهر',  'phone' => '00970333333337'],
            ['name' => 'أم رنا إبراهيم', 'phone' => '00970333333338'],
            ['name' => 'أبو فيصل ودان',  'phone' => '00970333333339'],
            ['name' => 'أم سلمى العرج',  'phone' => '00970333333340'],
        ];
        $parents = [];
        foreach ($parentRows as $p) {
            $parents[] = User::firstOrCreate(
                ['phone' => $p['phone']],
                ['name' => $p['name'], 'role' => 'parent', 'country_id' => $cid, 'is_active' => true]
            );
        }

        // ══════════════════════════════════════════════
        // 6. STUDENTS (15)
        // ══════════════════════════════════════════════
        $studentRows = [
            ['name' => 'أحمد سالم',    'phone' => '00970222222221', 'gi' => 9,  'pi' => 0],
            ['name' => 'سارة رشيد',    'phone' => '00970222222222', 'gi' => 10, 'pi' => 1],
            ['name' => 'عمر حمادة',    'phone' => '00970222222223', 'gi' => 11, 'pi' => 2],
            ['name' => 'ليلى حسن',     'phone' => '00970222222224', 'gi' => 8,  'pi' => 3],
            ['name' => 'كريم ناصر',    'phone' => '00970222222225', 'gi' => 9,  'pi' => 4],
            ['name' => 'دانا محمود',   'phone' => '00970222222226', 'gi' => 10, 'pi' => 5],
            ['name' => 'زياد طاهر',    'phone' => '00970222222227', 'gi' => 6,  'pi' => 6],
            ['name' => 'رنا إبراهيم',  'phone' => '00970222222228', 'gi' => 7,  'pi' => 7],
            ['name' => 'فيصل ودان',    'phone' => '00970222222229', 'gi' => 8,  'pi' => 8],
            ['name' => 'سلمى العرج',   'phone' => '00970222222230', 'gi' => 9,  'pi' => 9],
            ['name' => 'باسل خليل',    'phone' => '00970222222231', 'gi' => 10, 'pi' => 0],
            ['name' => 'نور الدين',    'phone' => '00970222222232', 'gi' => 11, 'pi' => 1],
            ['name' => 'هدى الشيخ',    'phone' => '00970222222233', 'gi' => 6,  'pi' => 2],
            ['name' => 'جهاد أبو حسن', 'phone' => '00970222222234', 'gi' => 7,  'pi' => 3],
            ['name' => 'ميرا خطاب',    'phone' => '00970222222235', 'gi' => 8,  'pi' => 4],
        ];
        $students = [];
        foreach ($studentRows as $s) {
            $students[] = User::firstOrCreate(
                ['phone' => $s['phone']],
                [
                    'name'       => $s['name'],
                    'role'       => 'student',
                    'country_id' => $cid,
                    'grade_id'   => $grades[$s['gi']],
                    'parent_id'  => $parents[$s['pi']]->id,
                    'is_active'  => true,
                ]
            );
        }

        // ══════════════════════════════════════════════
        // 7. SUPERVISORS (2)
        // ══════════════════════════════════════════════
        $sup1 = User::firstOrCreate(
            ['phone' => '00970555555551'],
            ['name' => 'مشرف فلسطين الأول',  'role' => 'supervisor', 'country_id' => $cid, 'is_active' => true]
        );
        $sup2 = User::firstOrCreate(
            ['phone' => '00970555555552'],
            ['name' => 'مشرف فلسطين الثاني', 'role' => 'supervisor', 'country_id' => $cid, 'is_active' => true]
        );

        // ══════════════════════════════════════════════
        // 8. CATEGORIES (12)
        // ══════════════════════════════════════════════
        $catRows = [
            ['name' => 'الرياضيات',         'gi' => 9],
            ['name' => 'اللغة العربية',     'gi' => 6],
            ['name' => 'اللغة الإنجليزية',  'gi' => 7],
            ['name' => 'الفيزياء',          'gi' => 10],
            ['name' => 'الكيمياء',          'gi' => 10],
            ['name' => 'الأحياء',           'gi' => 10],
            ['name' => 'علم الحاسوب',       'gi' => 8],
            ['name' => 'التاريخ',           'gi' => 7],
            ['name' => 'الجغرافيا',         'gi' => 7],
            ['name' => 'التربية الإسلامية', 'gi' => 6],
            ['name' => 'الفلسفة والمنطق',   'gi' => 11],
            ['name' => 'الاقتصاد',          'gi' => 11],
        ];
        $categories = [];
        foreach ($catRows as $i => $c) {
            $row = DB::table('categories')->where('country_id', $cid)->where('name', $c['name'])->first();
            if (!$row) {
                $categories[] = DB::table('categories')->insertGetId([
                    'country_id' => $cid, 'grade_id' => $grades[$c['gi']],
                    'name' => $c['name'], 'sort_order' => $i + 1, 'is_active' => true,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $categories[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 9. COURSES (12)
        // ══════════════════════════════════════════════
        $courseRows = [
            ['title' => 'رياضيات الصف التاسع - الفصل الأول',   'ci' => 0,  'ti' => 0, 'price' => 50,  'free' => false],
            ['title' => 'لغة عربية متقدمة للصف السادس',         'ci' => 1,  'ti' => 1, 'price' => 0,   'free' => true],
            ['title' => 'إنجليزي محادثة وتواصل',                'ci' => 2,  'ti' => 2, 'price' => 45,  'free' => false],
            ['title' => 'فيزياء الصف العاشر - الميكانيكا',      'ci' => 3,  'ti' => 3, 'price' => 60,  'free' => false],
            ['title' => 'كيمياء عضوية مبسطة',                   'ci' => 4,  'ti' => 4, 'price' => 55,  'free' => false],
            ['title' => 'أحياء - التكاثر والوراثة',             'ci' => 5,  'ti' => 5, 'price' => 50,  'free' => false],
            ['title' => 'برمجة Python للمبتدئين',                'ci' => 6,  'ti' => 6, 'price' => 70,  'free' => false],
            ['title' => 'تاريخ فلسطين الحديث',                  'ci' => 7,  'ti' => 7, 'price' => 0,   'free' => true],
            ['title' => 'جغرافيا الوطن العربي',                 'ci' => 8,  'ti' => 8, 'price' => 40,  'free' => false],
            ['title' => 'التربية الإسلامية - الفقه',            'ci' => 9,  'ti' => 9, 'price' => 0,   'free' => true],
            ['title' => 'فلسفة وتفكير نقدي',                    'ci' => 10, 'ti' => 0, 'price' => 45,  'free' => false],
            ['title' => 'اقتصاد ومحاسبة أساسية',               'ci' => 11, 'ti' => 1, 'price' => 50,  'free' => false],
        ];
        $courses = [];
        foreach ($courseRows as $c) {
            $row = DB::table('courses')->where('country_id', $cid)->where('title', $c['title'])->first();
            if (!$row) {
                $courses[] = DB::table('courses')->insertGetId([
                    'country_id'  => $cid,
                    'category_id' => $categories[$c['ci']],
                    'teacher_id'  => $teachers[$c['ti']]->id,
                    'title'       => $c['title'],
                    'description' => 'كورس تعليمي شامل مُعدّ خصيصاً للطلاب في فلسطين.',
                    'price'       => $c['price'],
                    'is_free'     => $c['free'],
                    'is_active'   => true,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            } else {
                $courses[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 10. PACKAGES (10)
        // ══════════════════════════════════════════════
        $pkgRows = [
            ['name' => 'باقة شهرية أساسية',     'price' => 30,  'days' => 30],
            ['name' => 'باقة شهرية مميزة',       'price' => 50,  'days' => 30],
            ['name' => 'باقة ثلاثة أشهر',        'price' => 80,  'days' => 90],
            ['name' => 'باقة ستة أشهر',          'price' => 140, 'days' => 180],
            ['name' => 'باقة سنوية كاملة',       'price' => 250, 'days' => 365],
            ['name' => 'باقة الامتحانات',         'price' => 45,  'days' => 60],
            ['name' => 'باقة الثانوية العامة',   'price' => 120, 'days' => 180],
            ['name' => 'باقة المرحلة الإعدادية', 'price' => 90,  'days' => 180],
            ['name' => 'باقة التجريب المجانية',  'price' => 0,   'days' => 7],
            ['name' => 'باقة العائلة',            'price' => 200, 'days' => 365],
        ];
        $packages = [];
        foreach ($pkgRows as $p) {
            $row = DB::table('packages')->where('country_id', $cid)->where('name', $p['name'])->first();
            if (!$row) {
                $packages[] = DB::table('packages')->insertGetId([
                    'country_id' => $cid, 'name' => $p['name'],
                    'price' => $p['price'], 'duration_days' => $p['days'],
                    'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $packages[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 11. LIVE CLASSES (12)
        // ══════════════════════════════════════════════
        $liveRows = [
            ['title' => 'رياضيات - معادلات الدرجة الثانية', 'ci' => 0, 'ti' => 0, 'status' => 'ended',     'offset' => -5],
            ['title' => 'عربي - النحو والإعراب',             'ci' => 1, 'ti' => 1, 'status' => 'ended',     'offset' => -4],
            ['title' => 'إنجليزي - Present Perfect',         'ci' => 2, 'ti' => 2, 'status' => 'ended',     'offset' => -3],
            ['title' => 'فيزياء - قوانين نيوتن',             'ci' => 3, 'ti' => 3, 'status' => 'ended',     'offset' => -2],
            ['title' => 'كيمياء - الروابط التساهمية',        'ci' => 4, 'ti' => 4, 'status' => 'ended',     'offset' => -1],
            ['title' => 'أحياء - الانقسام الخلوي',           'ci' => 5, 'ti' => 5, 'status' => 'live',      'offset' => 0],
            ['title' => 'Python - المتغيرات والحلقات',       'ci' => 6, 'ti' => 6, 'status' => 'scheduled', 'offset' => 1],
            ['title' => 'تاريخ - النكبة الفلسطينية',         'ci' => 7, 'ti' => 7, 'status' => 'scheduled', 'offset' => 2],
            ['title' => 'جغرافيا - المناخ في فلسطين',        'ci' => 8, 'ti' => 8, 'status' => 'scheduled', 'offset' => 3],
            ['title' => 'إسلامية - أحكام الطهارة',           'ci' => 9, 'ti' => 9, 'status' => 'scheduled', 'offset' => 4],
            ['title' => 'فلسفة - مذاهب فلسفية متنوعة',       'ci' => 10,'ti' => 0, 'status' => 'scheduled', 'offset' => 5],
            ['title' => 'اقتصاد - قانون العرض والطلب',       'ci' => 11,'ti' => 1, 'status' => 'scheduled', 'offset' => 6],
        ];
        $liveClasses = [];
        foreach ($liveRows as $l) {
            $row = DB::table('live_classes')->where('country_id', $cid)->where('title', $l['title'])->first();
            if (!$row) {
                $liveClasses[] = DB::table('live_classes')->insertGetId([
                    'country_id'       => $cid,
                    'course_id'        => $courses[$l['ci']],
                    'teacher_id'       => $teachers[$l['ti']]->id,
                    'title'            => $l['title'],
                    'scheduled_at'     => now()->addDays($l['offset']),
                    'duration_minutes' => 60,
                    'status'           => $l['status'],
                    'meeting_link'     => 'https://meet.yaqoot.ps/room/' . ($l['ci'] + 1),
                    'agora_channel'    => 'ps-ch-' . ($l['ci'] + 1) . '-' . time(),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            } else {
                $liveClasses[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 12. SUBSCRIPTIONS (15 — one per student)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            $pkgId = $packages[$i % count($packages)];
            $exists = DB::table('subscriptions')
                ->where('student_id', $student->id)->where('package_id', $pkgId)->exists();
            if (!$exists) {
                DB::table('subscriptions')->insert([
                    'country_id'     => $cid,
                    'student_id'     => $student->id,
                    'package_id'     => $pkgId,
                    'created_by'     => $admin->id,
                    'starts_at'      => now()->subDays(rand(1, 15))->format('Y-m-d'),
                    'ends_at'        => now()->addDays(30 + $i * 5)->format('Y-m-d'),
                    'status'         => 'active',
                    'payment_method' => 'manual',
                    'payment_status' => 'paid',
                    'amount_paid'    => $pkgRows[$i % count($pkgRows)]['price'],
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════
        // 13. NOTIFICATIONS (15)
        // ══════════════════════════════════════════════
        $notifData = [
            ['title' => 'مرحباً بك في منصة ياقوت',         'body' => 'ابدأ رحلتك التعليمية معنا اليوم!',            'type' => 'general'],
            ['title' => 'حصة جديدة مجدولة',                'body' => 'رياضيات - الساعة 10 صباحاً غداً.',            'type' => 'live_class'],
            ['title' => 'تذكير بالواجب',                   'body' => 'موعد تسليم واجب الفيزياء غداً.',              'type' => 'homework'],
            ['title' => 'نتيجة الامتحان',                  'body' => 'حصلت على 85 من 100 في رياضيات.',               'type' => 'exam'],
            ['title' => 'اشتراكك ينتهي قريباً',            'body' => 'يتبقى 3 أيام على انتهاء اشتراكك.',            'type' => 'subscription'],
            ['title' => 'معلم جديد في المنصة',             'body' => 'أ. خالد البرغوثي ينضم لتدريس الفيزياء.',      'type' => 'general'],
            ['title' => 'مسابقة رياضيات جديدة',            'body' => 'شارك وفرصتك في جائزة 500 شيكل.',             'type' => 'league'],
            ['title' => 'تمت الموافقة على امتحانك',        'body' => 'امتحان الكيمياء الفصلي معتمد الآن.',          'type' => 'exam'],
            ['title' => 'تم تسجيل حضورك',                  'body' => 'حضورك في حصة اللغة العربية مسجّل.',          'type' => 'general'],
            ['title' => 'كسبت نقاطاً جديدة',               'body' => 'حصلت على 50 نقطة لإكمال الواجب!',            'type' => 'general'],
            ['title' => 'كورس Python متاح الآن',           'body' => 'سجّل مجاناً وابدأ البرمجة اليوم.',            'type' => 'general'],
            ['title' => 'أكملت 10 دروس!',                  'body' => 'إنجاز رائع، استمر وكافئ نفسك.',              'type' => 'general'],
            ['title' => 'تحديث المنصة',                    'body' => 'تم إضافة غرفة الدراسة الجماعية.',             'type' => 'general'],
            ['title' => 'طلب مساعدة عاجلة',                'body' => 'طالبك أرسل طلب مساعدة، تحقق منه.',           'type' => 'general'],
            ['title' => 'تقرير أسبوعي',                    'body' => 'شاهدت 5 فيديوهات هذا الأسبوع، أحسنت!',       'type' => 'general'],
        ];
        foreach ($students as $i => $student) {
            $n = $notifData[$i % count($notifData)];
            DB::table('notifications')->insert([
                'user_id'    => $student->id,
                'country_id' => $cid,
                'title'      => $n['title'],
                'body'       => $n['body'],
                'type'       => $n['type'],
                'data'       => json_encode([]),
                'is_read'    => (bool) rand(0, 1),
                'created_at' => now()->subHours(rand(1, 72)),
                'updated_at' => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 14. NOTIFICATION BROADCASTS (5)
        // ══════════════════════════════════════════════
        $broadcasts = [
            ['title' => 'إعلان هام للطلاب',      'body' => 'سيتم صيانة المنصة الجمعة 2-4 صباحاً.',     'tt' => 'all',  'tv' => null],
            ['title' => 'رسالة للمعلمين',         'body' => 'يرجى رفع نتائج الامتحانات قبل نهاية الأسبوع.','tt' => 'role', 'tv' => 'teacher'],
            ['title' => 'تذكير الحصص المباشرة',   'body' => 'تابعوا جدول الحصص هذا الأسبوع.',           'tt' => 'all',  'tv' => null],
            ['title' => 'عروض خاصة',              'body' => 'خصم 30% على الباقات لمدة أسبوع.',          'tt' => 'all',  'tv' => null],
            ['title' => 'نتائج مسابقة الرياضيات', 'body' => 'تهانينا للفائزين، راجع قائمة الأوائل.',    'tt' => 'all',  'tv' => null],
        ];
        foreach ($broadcasts as $b) {
            DB::table('notification_broadcasts')->insert([
                'sent_by'          => $admin->id,
                'country_id'       => $cid,
                'title'            => $b['title'],
                'body'             => $b['body'],
                'target_type'      => $b['tt'],
                'target_value'     => $b['tv'],
                'recipients_count' => rand(5, 50),
                'created_at'       => now()->subDays(rand(1, 10)),
                'updated_at'       => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 15. UNITS + LESSONS + VIDEOS (4 courses × 3 units × 3 lessons × 3 videos)
        // ══════════════════════════════════════════════
        $allVideos = [];
        for ($ci = 0; $ci < 4; $ci++) {
            for ($ui = 0; $ui < 3; $ui++) {
                $uTitle  = 'الوحدة ' . ($ui + 1) . ' — ' . $courseRows[$ci]['title'];
                $unitRow = DB::table('units')->where('course_id', $courses[$ci])->where('title', $uTitle)->first();
                $unitId  = $unitRow ? $unitRow->id : DB::table('units')->insertGetId([
                    'course_id'  => $courses[$ci], 'title' => $uTitle,
                    'sort_order' => $ui + 1, 'created_at' => now(), 'updated_at' => now(),
                ]);

                for ($li = 0; $li < 3; $li++) {
                    $lTitle    = 'الدرس ' . ($li + 1) . ' — ' . $uTitle;
                    $lessonRow = DB::table('lessons')->where('unit_id', $unitId)->where('title', $lTitle)->first();
                    $lessonId  = $lessonRow ? $lessonRow->id : DB::table('lessons')->insertGetId([
                        'unit_id' => $unitId, 'title' => $lTitle,
                        'sort_order' => $li + 1, 'created_at' => now(), 'updated_at' => now(),
                    ]);

                    for ($vi = 0; $vi < 3; $vi++) {
                        $vTitle   = 'شرح ' . ($vi + 1) . ' — ' . $lTitle;
                        $videoRow = DB::table('videos')->where('lesson_id', $lessonId)->where('title', $vTitle)->first();
                        $videoId  = $videoRow ? $videoRow->id : DB::table('videos')->insertGetId([
                            'lesson_id'  => $lessonId, 'title' => $vTitle,
                            'video_url'  => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            'duration'   => rand(300, 1800), 'type' => 'video',
                            'sort_order' => $vi + 1, 'created_at' => now(), 'updated_at' => now(),
                        ]);
                        $allVideos[] = $videoId;
                    }
                }
            }
        }

        // ══════════════════════════════════════════════
        // 16. VIDEO PROGRESS (15)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            if ($i < count($allVideos)) {
                DB::table('video_progress')->insertOrIgnore([
                    'student_id'     => $student->id,
                    'video_id'       => $allVideos[$i],
                    'completed'      => (bool) rand(0, 1),
                    'watch_duration' => rand(60, 1500),
                    'watched_at'     => now()->subHours(rand(1, 48)),
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════
        // 17. EXAMS (10) + QUESTIONS (5 each)
        // ══════════════════════════════════════════════
        $examTitles = [
            'امتحان رياضيات الفصل الأول',     'اختبار قصير - اللغة العربية',
            'امتحان إنجليزي - الوحدة الأولى', 'امتحان فيزياء - الميكانيكا',
            'اختبار كيمياء عضوية',             'امتحان أحياء شامل',
            'اختبار Python أساسيات',           'امتحان تاريخ فلسطين',
            'اختبار جغرافيا المناخ',           'امتحان إسلامية نصفي',
        ];
        $exams = [];
        foreach ($examTitles as $i => $title) {
            $row = DB::table('exams')->where('course_id', $courses[$i])->where('title', $title)->first();
            if (!$row) {
                $eid = DB::table('exams')->insertGetId([
                    'course_id'   => $courses[$i],
                    'teacher_id'  => $teachers[$i % count($teachers)]->id,
                    'title'       => $title,
                    'description' => 'امتحان تقييمي شامل للمادة.',
                    'status'      => $i < 6 ? 'approved' : 'pending',
                    'duration'    => 60,
                    'starts_at'   => now()->addDays($i + 1),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
                for ($q = 0; $q < 5; $q++) {
                    $type = ['mcq', 'true_false', 'short'][$q % 3];
                    DB::table('exam_questions')->insert([
                        'exam_id'    => $eid,
                        'question'   => 'سؤال ' . ($q + 1) . ': ' . $title,
                        'type'       => $type,
                        'options'    => $type === 'mcq' ? json_encode(['أ. الإجابة الصحيحة', 'ب. خاطئة', 'ج. خاطئة', 'د. خاطئة']) : null,
                        'answer'     => $type === 'mcq' ? 'أ' : ($type === 'true_false' ? 'true' : 'إجابة نموذجية'),
                        'points'     => rand(2, 5),
                        'sort_order' => $q + 1,
                    ]);
                }
                $exams[] = $eid;
            } else {
                $exams[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 18. EXAM SUBMISSIONS (12)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            if ($i < count($exams)) {
                DB::table('exam_submissions')->insertOrIgnore([
                    'exam_id'      => $exams[$i],
                    'student_id'   => $student->id,
                    'answers'      => json_encode(['1' => 'أ', '2' => 'true', '3' => 'إجابة الطالب']),
                    'score'        => rand(50, 100),
                    'total_points' => 100,
                    'submitted_at' => now()->subHours(rand(1, 24)),
                    'graded_at'    => now()->subHours(rand(0, 12)),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════
        // 19. HOMEWORKS (10)
        // ══════════════════════════════════════════════
        $hwTitles = [
            'واجب: حل 10 معادلات رياضية',       'واجب: تحليل نص أدبي',
            'واجب: كتابة فقرة إنجليزية',         'واجب: مسائل الحركة الفيزيائية',
            'واجب: رسم جزيئات الكيمياء',         'واجب: تشريح خلية نباتية',
            'واجب: كتابة برنامج Python بسيط',    'واجب: ورقة بحثية تاريخية',
            'واجب: رسم خريطة الجغرافيا',         'واجب: حفظ 5 أحاديث نبوية',
        ];
        $homeworks = [];
        foreach ($hwTitles as $i => $title) {
            $row = DB::table('homeworks')->where('course_id', $courses[$i])->where('title', $title)->first();
            if (!$row) {
                $homeworks[] = DB::table('homeworks')->insertGetId([
                    'course_id'   => $courses[$i],
                    'teacher_id'  => $teachers[$i % count($teachers)]->id,
                    'title'       => $title,
                    'description' => 'واجب منزلي يجب تسليمه في الموعد المحدد.',
                    'status'      => $i < 6 ? 'approved' : 'pending',
                    'due_date'    => now()->addDays($i + 2)->format('Y-m-d'),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            } else {
                $homeworks[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 20. HOMEWORK SUBMISSIONS (12)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            if ($i < count($homeworks)) {
                DB::table('homework_submissions')->insertOrIgnore([
                    'homework_id'      => $homeworks[$i],
                    'student_id'       => $student->id,
                    'file_url'         => 'https://files.yaqoot.ps/hw/student_' . $student->id . '_hw_' . $homeworks[$i] . '.pdf',
                    'notes'            => 'حللت جميع الأسئلة وأرفقت الحل كاملاً.',
                    'grade'            => rand(60, 100),
                    'teacher_feedback' => 'عمل ممتاز، استمر في التميز!',
                    'status'           => ['graded', 'submitted', 'late'][$i % 3],
                    'submitted_at'     => now()->subHours(rand(1, 48)),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════
        // 21. SUPERVISOR STUDENTS
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            $supId = $i < 8 ? $sup1->id : $sup2->id;
            DB::table('supervisor_students')->insertOrIgnore([
                'supervisor_id' => $supId,
                'student_id'    => $student->id,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 22. ATTENDANCE RECORDS (12)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            if ($i < count($liveClasses)) {
                DB::table('attendance_records')->insertOrIgnore([
                    'student_id'    => $student->id,
                    'live_class_id' => $liveClasses[$i],
                    'status'        => ['present', 'absent', 'late'][$i % 3],
                    'recorded_at'   => now()->subHours(rand(1, 120)),
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════
        // 23. GAMIFICATION POINTS (15)
        // ══════════════════════════════════════════════
        $actions    = ['attend_class', 'submit_homework', 'submit_exam', 'complete_video', 'submit_homework'];
        $ptValues   = ['attend_class' => 25, 'submit_homework' => 30, 'submit_exam' => 50, 'complete_video' => 20];
        foreach ($students as $i => $student) {
            $action = $actions[$i % count($actions)];
            DB::table('gamification_points')->insert([
                'student_id'  => $student->id,
                'action'      => $action,
                'points'      => $ptValues[$action] ?? 20,
                'description' => 'نقاط مكتسبة — ' . $action,
                'earned_at'   => now()->subDays(rand(0, 15)),
            ]);
        }

        // ══════════════════════════════════════════════
        // 24. LEAGUES (10)
        // ══════════════════════════════════════════════
        $leagueTitles = [
            'بطولة الرياضيات الفصلية',  'مسابقة العلوم الشهرية',
            'تحدي اللغة العربية',       'بطولة الفيزياء',
            'مسابقة الكيمياء',          'تحدي البرمجة',
            'بطولة الأحياء',            'تحدي التاريخ',
            'مسابقة الجغرافيا',         'بطولة الطلاب المتميزين',
        ];
        $leagueStatuses = ['ended','ended','active','active','pending','pending','pending','pending','pending','pending'];
        $leagueIds = [];
        foreach ($leagueTitles as $i => $lt) {
            $row = DB::table('leagues')->where('country_id', $cid)->where('name', $lt)->first();
            if (!$row) {
                $leagueIds[] = DB::table('leagues')->insertGetId([
                    'country_id'       => $cid,
                    'name'             => $lt,
                    'type'             => $i % 2 === 0 ? 'group' : '1v1',
                    'status'           => $leagueStatuses[$i],
                    'max_participants'  => 20,
                    'starts_at'        => now()->subDays(10 - $i),
                    'ends_at'          => now()->addDays($i + 5),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            } else {
                $leagueIds[] = $row->id;
            }
        }

        // ══════════════════════════════════════════════
        // 25. LEAGUE PARTICIPANTS (15)
        // ══════════════════════════════════════════════
        foreach ($students as $i => $student) {
            $lid = $leagueIds[$i % count($leagueIds)];
            DB::table('league_participants')->insertOrIgnore([
                'league_id'  => $lid,
                'student_id' => $student->id,
                'joined_at'  => now()->subDays(rand(0, 5)),
            ]);
        }

        // ══════════════════════════════════════════════
        // 26. EMERGENCY REQUESTS (10)
        // ══════════════════════════════════════════════
        $subjects  = [
            'لا أفهم درس المعادلات',       'مشكلة في فهم الكيمياء',
            'أحتاج مساعدة عاجلة في الفيزياء','لا أستطيع حل الواجب',
            'مشكلة تقنية في الحصة',         'الصوت لا يعمل',
            'الفيديو لا يُشغّل',            'لم أستلم رابط الحصة',
            'مشكلة في تسليم الواجب',        'لم تُحسب نقاطي',
        ];
        $erStatuses = ['pending', 'accepted', 'resolved'];
        foreach ($students as $i => $student) {
            if ($i >= count($subjects)) break;
            $status = $erStatuses[$i % 3];
            DB::table('emergency_requests')->insert([
                'student_id'  => $student->id,
                'country_id'  => $cid,
                'teacher_id'  => $status !== 'pending' ? $teachers[$i % count($teachers)]->id : null,
                'subject'     => $subjects[$i],
                'message'     => 'أحتاج مساعدة عاجلة: ' . $subjects[$i],
                'status'      => $status,
                'accepted_at' => $status !== 'pending' ? now()->subHours(rand(1, 12)) : null,
                'resolved_at' => $status === 'resolved' ? now()->subHours(rand(0, 6)) : null,
                'created_at'  => now()->subHours(rand(1, 48)),
                'updated_at'  => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 27. SETTINGS
        // ══════════════════════════════════════════════
        if (!DB::table('settings')->where('country_id', $cid)->exists()) {
            DB::table('settings')->insert([
                'country_id'               => $cid,
                'chatbot_provider'         => 'claude',
                'chatbot_enabled'          => true,
                'chatbot_system_prompt'    => 'أنت مساعد تعليمي ذكي لمنصة ياقوت في فلسطين. ساعد الطلاب.',
                'whatsapp_number'          => '+970599000000',
                'whatsapp_default_message' => 'مرحباً، أريد الاستفسار عن منصة ياقوت.',
                'updated_at'               => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 28. COUPONS (10)
        // ══════════════════════════════════════════════
        $coupons = [
            ['code' => 'PS_WELCOME10', 'type' => 'percentage', 'val' => 10, 'max' => 100],
            ['code' => 'PS_RAMADAN30', 'type' => 'percentage', 'val' => 30, 'max' => 200],
            ['code' => 'PS_FIXED5',    'type' => 'fixed',      'val' => 5,  'max' => 50],
            ['code' => 'PS_NEW20',     'type' => 'percentage', 'val' => 20, 'max' => 75],
            ['code' => 'PS_SUMMER25',  'type' => 'percentage', 'val' => 25, 'max' => 150],
            ['code' => 'PS_EXAM15',    'type' => 'percentage', 'val' => 15, 'max' => 100],
            ['code' => 'PS_FRIEND10',  'type' => 'fixed',      'val' => 10, 'max' => 200],
            ['code' => 'PS_BACK2SCH',  'type' => 'percentage', 'val' => 20, 'max' => 300],
            ['code' => 'PS_TEACHER5',  'type' => 'fixed',      'val' => 5,  'max' => 30],
            ['code' => 'PS_VIP50',     'type' => 'percentage', 'val' => 50, 'max' => 10],
        ];
        foreach ($coupons as $c) {
            DB::table('coupons')->insertOrIgnore([
                'country_id'     => $cid,
                'code'           => $c['code'],
                'discount_type'  => $c['type'],
                'discount_value' => $c['val'],
                'max_uses'       => $c['max'],
                'used_count'     => rand(0, 10),
                'expires_at'     => now()->addMonths(rand(1, 6))->format('Y-m-d'),
                'scope'          => 'all',
                'is_active'      => true,
                'created_at'     => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 29. BANNERS (10)
        // ══════════════════════════════════════════════
        $banners = [
            'باقة الثانوية العامة',   'عروض شهر رمضان',     'كورس Python مجاناً',
            'الحصص المباشرة يومياً',  'انضم لمسابقة الرياضيات','معلمون فلسطينيون متميزون',
            'تجربة مجانية 7 أيام',   'تطبيق ياقوت - قريباً',  'العودة للمدارس 2026',
            'شهادات معتمدة',
        ];
        foreach ($banners as $i => $title) {
            DB::table('banners')->insertOrIgnore([
                'country_id' => $cid,
                'title'      => $title,
                'image_url'  => 'https://cdn.yaqoot.ps/banners/banner_' . ($i + 1) . '.jpg',
                'link_url'   => '/learn',
                'starts_at'  => now()->subDays(2)->format('Y-m-d'),
                'ends_at'    => now()->addDays(30 + $i)->format('Y-m-d'),
                'is_active'  => true,
                'sort_order' => $i + 1,
                'created_at' => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 30. LEADS (12)
        // ══════════════════════════════════════════════
        $leadNames = [
            'إبراهيم سامي','لينا محمد','حسن يوسف','مريم خليل',
            'عبدالله ناصر','روان أحمد','سامي علي','ديمة خالد',
            'نضال حسين',   'شيماء عمر','رامي إبراهيم','سوسن راضي',
        ];
        foreach ($leadNames as $i => $name) {
            DB::table('leads')->insert([
                'country_id'   => $cid,
                'grade_id'     => $grades[$i % count($grades)],
                'student_name' => $name,
                'phone'        => '0097059' . str_pad((string)(1000000 + $i), 7, '0', STR_PAD_LEFT),
                'school'       => ['مدرسة الرشيد','مدرسة صلاح الدين','مدرسة القدس','ثانوية الفاروق'][$i % 4],
                'region'       => ['رام الله','نابلس','الخليل','جنين','غزة'][$i % 5],
                'subjects'     => json_encode(['الرياضيات','الفيزياء']),
                'source'       => ['book_now','free_class'][$i % 2],
                'status'       => ['new','contacted','converted','lost'][$i % 4],
                'created_at'   => now()->subDays(rand(1, 30)),
            ]);
        }

        // ══════════════════════════════════════════════
        // 31. CMS PAGES (10)
        // ══════════════════════════════════════════════
        $pages = [
            ['slug' => 'about',          'title' => 'من نحن'],
            ['slug' => 'privacy',        'title' => 'سياسة الخصوصية'],
            ['slug' => 'terms',          'title' => 'الشروط والأحكام'],
            ['slug' => 'contact',        'title' => 'تواصل معنا'],
            ['slug' => 'how-it-works',   'title' => 'كيف تعمل المنصة'],
            ['slug' => 'parents-guide',  'title' => 'دليل أولياء الأمور'],
            ['slug' => 'teachers-guide', 'title' => 'دليل المعلمين'],
            ['slug' => 'refund-policy',  'title' => 'سياسة الاسترجاع'],
            ['slug' => 'features',       'title' => 'مميزات المنصة'],
            ['slug' => 'success-stories','title' => 'قصص نجاح'],
        ];
        foreach ($pages as $p) {
            DB::table('pages')->insertOrIgnore([
                'country_id' => $cid,
                'slug'       => $p['slug'],
                'title'      => $p['title'],
                'content'    => '<h2>' . $p['title'] . '</h2><p>محتوى صفحة ' . $p['title'] . ' لمنصة ياقوت في فلسطين.</p>',
                'updated_at' => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 32. FAQs (12)
        // ══════════════════════════════════════════════
        $faqs = [
            ['q' => 'كيف أسجل في المنصة؟',             'a' => 'يمكنك التسجيل برقم هاتفك مباشرةً من صفحة التسجيل.'],
            ['q' => 'هل هناك نسخة مجانية؟',            'a' => 'نعم، باقة تجريبية مجانية 7 أيام.'],
            ['q' => 'كيف أدفع الاشتراك؟',              'a' => 'ندعم البطاقات الائتمانية وPayPal وتحويل بنكي.'],
            ['q' => 'هل تُسجَّل الحصص؟',               'a' => 'نعم، الحصص مسجّلة ومتاحة بعد انتهائها.'],
            ['q' => 'كيف أتواصل مع المعلم؟',           'a' => 'عبر خاصية الطوارئ وغرفة الدراسة.'],
            ['q' => 'هل الشهادات معتمدة؟',             'a' => 'نعم، معتمدة من وزارة التربية الفلسطينية.'],
            ['q' => 'ما المواد المتاحة؟',               'a' => 'جميع مواد المناهج الفلسطينية من الصف 1-12.'],
            ['q' => 'كيف يعمل نظام النقاط؟',           'a' => 'تكسب نقاطاً بإكمال الدروس والواجبات والامتحانات.'],
            ['q' => 'هل يمكن لأولياء الأمور المتابعة؟', 'a' => 'نعم، بوابة خاصة لأولياء الأمور.'],
            ['q' => 'كيف أحصل على دعم فني؟',           'a' => 'تواصل معنا عبر واتساب أو البريد الإلكتروني.'],
            ['q' => 'هل تدعمون اللهجة الفلسطينية؟',   'a' => 'معلمونا فلسطينيون يشرحون بأسلوب مألوف.'],
            ['q' => 'كم طالباً على المنصة؟',            'a' => 'أكثر من 50,000 طالب من فلسطين والوطن العربي.'],
        ];
        foreach ($faqs as $i => $f) {
            DB::table('faqs')->insert([
                'country_id' => $cid,
                'question'   => $f['q'],
                'answer'     => $f['a'],
                'sort_order' => $i + 1,
                'is_active'  => true,
                'created_at' => now(),
            ]);
        }

        // ══════════════════════════════════════════════
        // 33. SOCIAL LINKS (7)
        // ══════════════════════════════════════════════
        $socials = [
            ['platform' => 'facebook',  'url' => 'https://facebook.com/yaqoot.ps'],
            ['platform' => 'instagram', 'url' => 'https://instagram.com/yaqoot.ps'],
            ['platform' => 'twitter',   'url' => 'https://twitter.com/yaqoot_ps'],
            ['platform' => 'youtube',   'url' => 'https://youtube.com/@yaqoot-ps'],
            ['platform' => 'telegram',  'url' => 'https://t.me/yaqoot_ps'],
            ['platform' => 'tiktok',    'url' => 'https://tiktok.com/@yaqoot.ps'],
            ['platform' => 'linkedin',  'url' => 'https://linkedin.com/company/yaqoot-ps'],
        ];
        foreach ($socials as $s) {
            DB::table('social_links')->insertOrIgnore([
                'country_id' => $cid,
                'platform'   => $s['platform'],
                'url'        => $s['url'],
                'is_active'  => true,
            ]);
        }

        $this->command->info('✅ Palestine seeder done — ' . count($students) . ' students | ' . count($teachers) . ' teachers | ' . count($courses) . ' courses | all 33 tables seeded.');
    }
}
