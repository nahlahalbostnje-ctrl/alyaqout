# Changelog — منصة الياقوت التعليمية

## [2026-07-19] — ميزات الطالب/ولي الأمر + جودة + هبوط جديد + توثيق

### ✨ ميزات
- صديق الدراسة، الكبسولة الزمنية، مرشد الطالب، تواصل المعلم، غرفة 24/7
- إرشاد ولي الأمر، أكاديمية آباء، إنجازات، دوري أولياء
- حاضنة المواهب، مكتبة الياقوت، تحديات، فيديوهات مراجعة، دوري زملاء
- إعادة تصميم الصفحة الرئيسية (هيرو مزيج + نصوص ثقة + مسارات أدوار)

### 🔧 إصلاحات جودة
- تسجيل الدخول من الهبوط → `/login`
- رسائل الطالب → تواصل المعلم
- لبنان `LB`/`+961` + بذر FAQ المنصة
- صفحات ولي الأمر/المعلم/المشرف بلا بيانات وهمية مضلِّلة

### 📄 توثيق
- دليل استخدام HTML برابط خاص: `/internal/docs/yg-3bb4b9c226a4.html`
- فهرس: `docs/README.md` · حالة المنصة · `docs/LANDING_PAGE.md`

---

## [2026-07-01] — نشر الإنتاج + توثيق

### 🚀 نشر
- المنصة live على **https://alyaqoutgroup.net**
- دليل نشر كامل: [`DEPLOYMENT.md`](DEPLOYMENT.md)

### 📄 توثيق
- مسارات السيرفر، symlink Webuzo، `.htaccess` SPA
- أوامر النشر والتحديث، seeders، تسجيل الدخول
- استكشاف الأخطاء (403, 404, 500, git, npm, .env)

### 🔧 إصلاحات نشر
- PHP 8.4 + `lcobucci/jwt` 5.x
- `DirectoryIndex index.html` + React SPA routing
- إصلاح 9 أخطاء TypeScript لبناء الواجهة

---

## [2026-06-24] — إصدار الميزات الكاملة

### ✨ ميزات جديدة

#### 1. نظام الإضافة الذاتية (Self-Service Modules)
كل دور يمكنه إدارة عناصر خاصة به معزولة عن باقي الأدوار.

| الدور | الرابط | أنواع العناصر |
|-------|--------|--------------|
| Admin | `/admin/my-items` | مهمة، تذكير، ملاحظة، هدف |
| Teacher | `/teacher/my-items` | تذكير درس، تحضير، ملاحظة طالب |
| Parent | `/parent/my-items` | تذكير أبني، موعد مدرسي، متابعة |
| Supervisor | `/supervisor/my-items` | متابعة طالب، خطة تدخل، جلسة إرشاد |

- **Backend**: `personal_items` table مع `role` enum + `user_id` FK للعزل الكامل
- **RBAC**: كل endpoint محمي بـ middleware الدور — لا يمكن لمعلم الوصول لبيانات مدير
- **Super Admin**: يرى كل العناصر عبر `BranchController` (قيد التطوير)

#### 2. استبدال "المدارس" بـ "الأفرع" في Super Admin
مفهوم "فرع" = دولة كاملة (1:1) — قيد `unique` على `country_id`.

**الصفحات المحدّثة**:
- `SASchoolsPage` → صفحة الأفرع بدول عربية (فلسطين، الأردن، السعودية...)
- `DashboardPage` → "إجمالي الأفرع" + TOP_BRANCHES بأعلام الدول
- `SAStudentsPage`, `SAStaffPage`, `SABillingPage` → عمود "الفرع / الدولة"
- `SAPlansPage` → "X فرع" بدل "X مدرسة"
- `SADevCenterPage` → `/api/v1/branches` في توثيق API
- `SuperAdminShell` → "الأفرع 🌍" في القائمة الجانبية

#### 3. المساعد الذكي AI لكل الأدوار
- **Backend**: `ChatbotService` مع system prompts مخصصة لكل دور
- **Endpoints**: `/student/chatbot`, `/parent/chatbot`, `/teacher/chatbot`, `/supervisor/chatbot`
- **Frontend**: `ParentAIAssistantPage`, `SupervisorAIAssistantPage` مع دردشة حقيقية

#### 4. إصلاح لوجو الهيرو
- **قبل**: صورة مقصوصة دائرياً (overflow:hidden) تقطع النص
- **بعد**: `objectFit:contain` بدون قصّ + هالة ذهبية خلفية بـ drop-shadow

---

### 🔔 نظام الإشعارات
- `NotificationBell` موجود في جميع الـ layouts عبر `AppLayout`
- يستدعي API حقيقي: `GET /notifications` + `PATCH notifications/:id/read`
- **الحالة**: ✅ يعمل في Admin/Teacher/Parent/Student/Supervisor

---

### ⚠️ نقاط مفتوحة (تحتاج قرار)

| الوصف | الأولوية | الحالة |
|-------|---------|--------|
| صفحات SA تستخدم mock data — تحتاج ربط API حقيقي | عالية | مفتوح |
| أزرار التصدير (PDF/Excel) في SABillingPage | متوسطة | placeholder |
| أزرار "إضافة طالب/موظف" في SA تحتاج modals | متوسطة | placeholder |
| Super Admin رؤية عناصر كل الأدوار (my-items) | منخفضة | مفتوح |
| Migration branches + personal_items — تحتاج `php artisan migrate` | عالية | يدوي |

---

### 🗂️ الملفات الجديدة

**Backend:**
- `database/migrations/2026_06_24_000001_create_branches_table.php`
- `database/migrations/2026_06_24_000002_create_personal_items_table.php`
- `app/Models/Branch.php`, `app/Models/PersonalItem.php`
- `app/Http/Controllers/SuperAdmin/BranchController.php`
- `app/Http/Controllers/{Admin,Teacher,ParentPortal,Supervisor}/PersonalItemController.php`
- `app/Http/Controllers/{ParentPortal,Supervisor,Teacher}/ChatbotController.php`

**Frontend:**
- `pages/SASchoolsPage.tsx` (مُعاد كتابتها)
- `pages/AdminPersonalItemsPage.tsx`
- `pages/TeacherPersonalItemsPage.tsx`
- `pages/ParentPersonalItemsPage.tsx`
- `pages/SupervisorPersonalItemsPage.tsx`
- `pages/SupervisorAIAssistantPage.tsx`
- `pages/ParentAIAssistantPage.tsx`

---

## [2026-06-23] — تحديث السابق
- تصميم LandingPage: لوجو كبير + مختار الدولة + 18 دولة عربية
- إعادة تصميم بوابة المعلم (Desktop theme كريمي)
- لوحة Super Admin مع Sidebar + صفحات SA الكاملة
- لوحة Admin مع AppLayout موحّد
