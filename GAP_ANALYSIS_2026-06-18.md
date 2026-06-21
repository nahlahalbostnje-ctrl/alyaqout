# تحليل الفجوة — منصة ياقوت
**Gap Analysis — Yaqoot Platform**
*تاريخ التحليل: 2026-06-18*

---

## الملخص التنفيذي

المنصة مكتملة وظيفياً بنسبة ~85% من التوثيق الكامل. المحور الوحيد الكبير المفقود هو:
1. **إعادة تصميم صفحات الداشبورد** (6 بوابات) — الكود يعمل لكن بتصميم قديم
2. **تطبيق Flutter** — لم يُبدأ على الإطلاق
3. **مميزات تقنية موثّقة لكنها stubs فارغة** (Video Protection، Redis، OTP حقيقي)

---

## القسم الأول: ما تم في جلسة 2026-06-18 ولم يُدوَّن بعد

| الإجراء | الملف | الحالة في PROJECT_LOG |
|---------|-------|----------------------|
| إضافة فلسطين للـ Seeder | `codes/backend/database/seeders/PalestineSeeder.php` | ❌ غير مدوَّن |
| إضافة PalestineSeeder لـ DatabaseSeeder | `database/seeders/DatabaseSeeder.php` | ❌ غير مدوَّن |
| إنشاء GlobalCursor | `codes/frontend/src/components/GlobalCursor.tsx` | ❌ غير مدوَّن |
| إضافة GlobalCursor لـ App.tsx | `codes/frontend/src/App.tsx` | ❌ غير مدوَّن |
| إضافة كلمات مفتاحية ps_* | `codes/frontend/src/pages/LoginPage.tsx` | ❌ غير مدوَّن |
| إصلاح `duration_minutes` → `duration` | `codes/backend/app/Http/Controllers/Admin/TeacherApprovalController.php:27` | ❌ غير مدوَّن |
| إعداد GitHub Repo | https://github.com/nahlahalbostnje-ctrl/alyaqout | ❌ غير مدوَّن |
| 50/50 API Tests — نجاح كامل | Script PowerShell | ❌ غير مدوَّن |

---

## القسم الثاني: الفجوة بين التوثيق والكود الفعلي

### 2.1 تصميم الواجهة — فجوة كبيرة

**الموثّق في PROJECT_PLAN / ui_redesign:** إعادة تصميم كاملة بمستوى Awwwards لجميع الصفحات.

**الواقع:**

| الصفحة | الحالة |
|--------|--------|
| `LandingPage.tsx` | ✅ مُصمَّمة بالكامل (Awwwards-level، Framer Motion، Lenis) |
| `LoginPage.tsx` | ✅ مُصمَّمة بالكامل (dark/gold، animated) |
| `AdminDashboardPage.tsx` | ⚠️ تصميم قديم — تعمل وظيفياً لكن بلا Awwwards style |
| `StudentDashboardPage.tsx` | ⚠️ تصميم قديم |
| `TeacherDashboardPage.tsx` | ⚠️ تصميم قديم |
| `ParentDashboardPage.tsx` | ⚠️ تصميم قديم |
| `SupervisorStudentsPage.tsx` | ⚠️ تصميم قديم |
| `DashboardPage.tsx` (Super Admin) | ⚠️ تصميم قديم |
| باقي 35 صفحة داشبورد | ⚠️ تصميم قديم |

**الخلاصة:** 2 صفحات عامة مُعاد تصميمها، 37+ صفحة داشبورد لا تزال بالتصميم الأولي.

---

### 2.2 Flutter Mobile App — غائب كلياً

**الموثّق في PROJECT_PLAN — القسم 6:**
```
yaqoot-mobile/
├── lib/
│   ├── main.dart
│   ├── webview/WebViewScreen.dart
│   ├── notifications/FCMHandler.dart
│   └── utils/DeepLinkHandler.dart
└── android/ & ios/
```

**الواقع:** مجلد `codes/mobile/` غير موجود. لا يوجد أي ملف Flutter في المشروع.

**التأثير:** المنصة تعمل فقط على الويب. لا يوجد تطبيق جوال.

---

### 2.3 مميزات موثّقة وموجودة كـ stubs فارغة

| الميزة | الموثَّق | الواقع |
|--------|---------|--------|
| **OTP عبر WaSender** | إرسال OTP حقيقي على الهاتف | تسجيل دخول مباشر برقم الهاتف — لا OTP فعلي |
| **Video Protection** | AWS CloudFront Signed URLs أو VdoCipher | حقل `video_url` فارغ — لا signed URLs |
| **Cloud Recording (Agora)** | تسجيل الحصص تلقائياً | endpoint موجود لكن Agora Recording API غير مفعّل |
| **Redis Cache** | caching للاستعلامات المتكررة | لا يُستخدم Redis — كل request يصطدم بـ DB |
| **FCM (Firebase)** | Push Notifications للهاتف | `sendFcmStub` يطبع log فقط — لا إرسال حقيقي |
| **WaSender WhatsApp** | رسائل واتساب للإشعارات | stub جاهز لكن `api_key` فارغ |
| **بوابة الدفع الإلكتروني** | Payment Gateway | لم يُحدَّد المزود — غير موجود |
| **`package_subject` pivot** | ربط الباقات بالمواد | الجدول في PROJECT_PLAN لكن migration غير موجود |

---

### 2.4 فجوات في التوثيق الفني

| الفجوة | التفاصيل |
|--------|----------|
| **Vite Port** | PROJECT_PLAN يقول `5173` — الواقع `5175` (strictPort في vite.config.ts) |
| **GlobalCursor** | مكوّن جديد غير مذكور في أي وثيقة |
| **PalestineSeeder** | بيانات فلسطين (38 مستخدم، 12 دورة، 108 فيديو...) غير مذكورة |
| **كلمات مفتاحية ps_*** | KEYWORD_MAP يحتوي على `ps_admin`, `ps_teacher`... غير مذكور |
| **GitHub repo** | `https://github.com/nahlahalbostnje-ctrl/alyaqout` غير مذكور في أي ملف |
| **مجلد `codes/`** | البنية الفعلية هي `codes/backend/` و `codes/frontend/` — PROJECT_PLAN يسمّيها `yaqoot-backend/` |
| **لا `.gitignore` لـ backend** | `codes/backend/.gitignore` (Laravel الافتراضي) موجود لكن `.gitignore` الجذر فيه فجوات |

---

### 2.5 controllers موجودة في الكود لكن غير في PROJECT_PLAN

| الملف الفعلي | ملاحظة |
|-------------|--------|
| `Admin/SupervisorAssignmentController.php` | موثَّق في LOG لكن غير في PLAN |
| `Admin/TeacherApprovalController.php` | موثَّق في LOG لكن غير في PLAN |
| `Live/AgoraController.php` | موثَّق |
| `NotificationController.php` (shared) | موثَّق |
| `PublicController.php` | موثَّق في LOG لكن غير في PLAN |

---

## القسم الثالث: ما يجب عمله قبل الإطلاق الحقيقي

### أولوية عالية (Blockers)
1. **إعادة تصميم صفحات الداشبورد** — المستخدم الحالي يرى تصميماً قديماً بعد تسجيل الدخول
2. **تفعيل OTP حقيقي** — حالياً يمكن لأي شخص تجاوز المصادقة برقم الهاتف فقط
3. **بوابة الدفع** — لا يمكن تحصيل اشتراكات دون payment gateway

### أولوية متوسطة
4. **Flutter App** — التطبيق كلياً غائب
5. **FCM حقيقي** — الإشعارات لا تصل للهاتف
6. **Video Protection** — روابط الفيديو مكشوفة بدون Signed URLs

### أولوية منخفضة (تحسينات)
7. **Redis Cache** — الأداء مقبول للآن لكن سيُحتاج عند scale
8. **Cloud Recording** — تسجيل الحصص غير متاح
9. **WaSender** — إشعارات WhatsApp الفعلية

---

## القسم الرابع: ملاحظات تقنية إضافية

### اكتشافات من تشغيل الـ Seeder

عند كتابة `PalestineSeeder.php` اكتُشفت مخالفات بين التوثيق والـ migrations الفعلية:

| الجدول | التوثيق (PROJECT_PLAN) | الواقع (Migration) |
|--------|----------------------|-------------------|
| `subscriptions` | `coupon_id`, `receipt_path` | `country_id`, `created_by`, `payment_method`, `payment_status`, `amount_paid` |
| `emergency_requests` | `accepted_by` | `teacher_id`, `accepted_at`, `resolved_at`, `message` |
| `league_participants` | `score`, `rank` | `league_id`, `student_id`, `joined_at` فقط |
| `settings` | `created_at` و `updated_at` | `updated_at` فقط (بلا created_at) |
| `live_classes` | `status: pending/live/ended/approved` | `status: scheduled/live/ended` |
| `exams` | column اسمه `duration_minutes` | column اسمه `duration` |

**الخلاصة:** التوثيق يصف ما كان مخططاً. الـ migrations تعكس ما بُني فعلاً. هناك divergence طبيعي تراكم خلال التطوير.

---

## ملاحظة نهائية

السجل الكامل من 2026-06-10 إلى 2026-06-16 موثَّق في `PROJECT_LOG.md`.
جلسة 2026-06-18 (Palestine Seeder + GlobalCursor + GitHub + Bug Fix) يجب إضافتها لـ `PROJECT_LOG.md`.

---

*تحليل الفجوة — منصة ياقوت | 2026-06-18*
