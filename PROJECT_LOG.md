# سجل مشروع منصة ياقوت التعليمية
*Yaqoot Interactive Learning Platform — Project Log*

---

## كيفية الاستخدام
كل إدخال يتبع الصيغة:
```
### [YYYY-MM-DD] — وصف قصير للمهمة
- **ما تم:** ...
- **الملفات المتأثرة:** ...
- **ما تبقى / ملاحظات:** ...
```

---

## 2026-06-10

### [2026-06-10] — تأسيس مستندات المشروع

- **ما تم:**
  - قراءة وثيقة متطلبات المشروع `PRD_Yaqoot_Platform.md` وتحديد المكدس التقني الكامل.
  - إنشاء `PROJECT_PLAN.md` — خطة تنفيذ تفصيلية تشمل:
    - معمارية النظام (رسم طبقات Client → API → DB → Storage)
    - هيكل مجلدات Laravel، React.js، Flutter
    - Schema كامل لـ 28 جدول في قاعدة البيانات (SQL)
    - جدول كامل لـ API Endpoints مصنفة حسب الأدوار
    - خطة تنفيذ 24 أسبوع على 3 مراحل
    - معايير الأمان والأداء
  - إنشاء `CONSTITUTION.md` — الدستور الهندسي للمشروع يتضمن:
    - المكدس التقني المعتمد (Laravel + React + Flutter + Agora + Firebase + WaSender...)
    - قاعدة "افهم قبل أن تبدأ" — شرح الخطوة قبل تنفيذها والانتظار للموافقة
    - تعريف "المهمة مكتملة" (DoD)
    - سياسة الأمان الكاملة
    - سير العمل في كل جلسة
  - إنشاء `PROJECT_LOG.md` — هذا الملف.

- **الملفات المتأثرة:**
  - `PROJECT_PLAN.md` ← جديد
  - `CONSTITUTION.md` ← جديد
  - `PROJECT_LOG.md` ← جديد (هذا الملف)

- **ما تبقى:**
  - الإجابة على الأسئلة المعلّقة في PRD (القسم 18) قبل البدء بالبرمجة
  - إعداد بيئة التطوير المحلية (Laravel + React + MySQL)
  - بدء المرحلة الأولى — MVP

---

### [2026-06-10] — إضافة نظام تعدد الدول (Multi-Country Architecture)

- **ما تم:**
  - تحديث `PRD_Yaqoot_Platform.md`:
    - إضافة قسم جديد (2) كامل لـ Multi-Country Architecture
    - إضافة دور `super_admin` في جدول الأدوار والصلاحيات (قسم 3.0)
    - توضيح أن `admin` مقيّد بدولته فقط
  - تحديث `PROJECT_PLAN.md`:
    - إضافة جدول `countries` (id, name, code, currency, phone_code)
    - إضافة `country_id` FK على: users, grades, categories, courses, packages, parents, students, supervisors, live_classes, leagues, coupons, banners, leads, notifications, pages, faqs, social_links, settings
    - تعديل `role` ENUM في `users` لإضافة `super_admin`
    - تعديل `pages` UNIQUE key ليكون `(slug, country_id)` بدل `slug` وحده
    - تعديل `settings` ليصير per-country (UNIQUE على country_id)
    - إضافة `SuperAdmin/` controllers (CountryController, StatsController)
    - إضافة `CountryScopeMiddleware.php`
    - إضافة `CountryScopeService.php`
    - إضافة Super Admin endpoints في جدول الـ APIs
    - إضافة صفحات `/super-admin/` في Frontend routing
    - تحديث RBAC Middleware لإضافة `country.scope`

- **الملفات المتأثرة:**
  - `PRD_Yaqoot_Platform.md` ← تعديل
  - `PROJECT_PLAN.md` ← تعديل

- **القرار المعماري:**
  - منصة واحدة — الطالب يختار دولته عند التسجيل
  - Super Admin يرى كل الدول — Admin مقيّد بدولته
  - العزل يتم عبر `CountryScopeMiddleware` + Global Scope على Models

- **ما تبقى:**
  - الإجابة على الأسئلة المعلّقة في PRD قسم 18 قبل البدء بالبرمجة

---

### [2026-06-10] — بناء قاعدة مشروع Laravel + نظام الدول + Super Admin

- **ما تم:**
  - إنشاء مشروع Laravel 12 في `codes/backend/`
  - ضبط `.env`: قاعدة بيانات `yaqoot_db` على MySQL، اسم التطبيق "Yaqoot Platform"
  - تثبيت `tymon/jwt-auth` وتوليد JWT Secret
  - ضبط `auth guard` ليستخدم `jwt` على guard الـ `api`
  - **Migrations:**
    - `0001_01_01_000000_create_countries_table` — جدول الدول
    - `0001_01_01_000000_create_users_table` — جدول المستخدمين مع أدوار ياقوت
  - **Models:**
    - `Country` — مع scope للدول النشطة
    - `User` — implements JWTSubject، مع SoftDeletes، isSuperAdmin()
  - **Middleware:**
    - `SuperAdminMiddleware` — يمنع أي دور غير super_admin
    - `CountryScopeMiddleware` — يحفظ country_id في app container
  - **Controllers:**
    - `SuperAdmin/CountryController` — CRUD كامل + toggle
  - **Routes:** `routes/api.php` محمية بـ JWT + super_admin middleware
  - **Seeders:**
    - `CountrySeeder` — الأردن (JO/JOD)، السعودية (SA/SAR)، الإمارات (AE/AED)
    - `SuperAdminSeeder` — حساب super_admin افتراضي (phone: 00962000000000)
  - تشغيل `migrate:fresh` + `db:seed` بنجاح ✅

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/` ← مشروع Laravel كامل
  - `codes/backend/.env`
  - `codes/backend/config/auth.php`
  - `codes/backend/bootstrap/app.php`
  - `codes/backend/routes/api.php`
  - `codes/backend/app/Models/Country.php` ← جديد
  - `codes/backend/app/Models/User.php` ← معدّل
  - `codes/backend/app/Http/Middleware/SuperAdminMiddleware.php` ← جديد
  - `codes/backend/app/Http/Middleware/CountryScopeMiddleware.php` ← جديد
  - `codes/backend/app/Http/Controllers/SuperAdmin/CountryController.php` ← جديد
  - `codes/backend/database/migrations/0001_01_01_000000_create_countries_table.php` ← جديد
  - `codes/backend/database/migrations/0001_01_01_000000_create_users_table.php` ← معدّل
  - `codes/backend/database/seeders/CountrySeeder.php` ← جديد
  - `codes/backend/database/seeders/SuperAdminSeeder.php` ← جديد
  - `codes/backend/database/seeders/DatabaseSeeder.php` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - بناء واجهة React للـ Super Admin Dashboard

---

### [2026-06-10] — إضافة Auth endpoints (Login / Me / Logout)

- **ما تم:**
  - إنشاء `Auth/AuthController.php` يحتوي على:
    - `login` — تسجيل دخول برقم الهاتف وإرجاع JWT Token
    - `me` — بيانات المستخدم الحالي
    - `logout` — إلغاء الـ Token
    - `refresh` — تجديد الـ Token
  - تحديث `routes/api.php` بإضافة auth routes (عامة + محمية)
  - تشغيل `optimize:clear` بعد تغيير الـ routes
  - **اختبار ناجح ✅ على `http://127.0.0.1:8000`:**
    - `POST /api/auth/login` → رجع JWT Token للـ Super Admin
    - `GET /api/auth/me` → رجع بيانات المستخدم
    - `GET /api/super-admin/countries` → رجع الدول الثلاث بالعربي

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Controllers/Auth/AuthController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - بناء واجهة React للـ Super Admin Dashboard

---

### [2026-06-11] — بناء واجهة React للـ Super Admin Dashboard

- **ما تم:**
  - إنشاء مشروع React 19 + TypeScript + Vite في `codes/frontend/`
  - تثبيت: Tailwind CSS + Axios + Redux Toolkit + React Router DOM
  - **الملفات المنشأة:**
    - `src/services/axios.ts` — Axios instance مع JWT interceptor تلقائي + redirect عند 401
    - `src/features/auth/authSlice.ts` — Redux slice للـ login/logout/me
    - `src/features/countries/countriesSlice.ts` — Redux slice لجلب الدول + toggle + إضافة
    - `src/app/store.ts` — Redux store موحّد
    - `src/app/hooks.ts` — typed hooks
    - `src/components/PrivateRoute.tsx` — حماية الصفحات بالدور
    - `src/pages/LoginPage.tsx` — صفحة تسجيل الدخول برقم الهاتف
    - `src/pages/DashboardPage.tsx` — لوحة Super Admin (إحصائيات + جدول دول + modal إضافة)
    - `src/App.tsx` — Routing كامل (login → dashboard)
    - `src/main.tsx` — Redux Provider
  - ضبط CORS في Laravel للسماح بالطلبات من `localhost:5173`
  - **الواجهة تعمل على `http://localhost:5173`** ✅
  - **Laravel API يعمل على `http://127.0.0.1:8000`** ✅

- **الملفات المتأثرة:**
  - `codes/frontend/` ← مشروع React كامل
  - `codes/backend/config/cors.php` ← نُشر وضُبط

- **ما تبقى (الخطوة التالية):**
  - إضافة إدارة المستخدمين (إنشاء Admin لكل دولة) في الـ Dashboard

---

### [2026-06-11] — إضافة ميزة "إنشاء Admin لكل دولة"

- **ما تم:**
  - **Backend:**
    - إنشاء `SuperAdmin/AdminController.php`:
      - `store` — ينشئ مدير مرتبط بدولة (يمنع تكرار أكثر من مدير واحد نشط لكل دولة)
      - `show` — يعرض المدير المرتبط بدولة
    - تحديث `SuperAdmin/CountryController.php`:
      - إضافة private method `formatCountry()` — تُرجع admin object (id/name/phone) أو null مع كل دولة
    - تحديث `routes/api.php`:
      - `POST /api/super-admin/countries/{country}/admin`
      - `GET  /api/super-admin/countries/{country}/admin`
  - **Frontend:**
    - تحديث `countriesSlice.ts`:
      - إضافة interface `CountryAdmin` (id, name, phone)
      - إضافة حقل `admin: CountryAdmin | null` على interface `Country`
      - إضافة async thunk `createCountryAdmin` (POST إلى API)
      - تحديث `addCountry.fulfilled` reducer ليتوافق مع الـ type الجديد
    - تحديث `DashboardPage.tsx`:
      - إضافة عمود "المدير" في جدول الدول
      - إذا الدولة لا يوجد لها مدير → يظهر زر "إنشاء مدير" (أزرق)
      - إذا يوجد مدير → يظهر اسمه ورقم هاتفه مباشرة
      - Modal جديد: "إنشاء مدير" — حقل الاسم + رقم الهاتف + رسالة خطأ عند الفشل
  - TypeScript check: `tsc --noEmit` بلا أخطاء ✅
  - `php artisan optimize:clear` بعد تغيير routes ✅

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Controllers/SuperAdmin/AdminController.php` ← جديد
  - `codes/backend/app/Http/Controllers/SuperAdmin/CountryController.php` ← معدّل (formatCountry)
  - `codes/backend/routes/api.php` ← معدّل (admin routes)
  - `codes/frontend/src/features/countries/countriesSlice.ts` ← معدّل (CountryAdmin interface + thunk)
  - `codes/frontend/src/pages/DashboardPage.tsx` ← معدّل (Admin column + modal)

- **القيود المطبّقة:**
  - مدير واحد فقط نشط لكل دولة (enforced في Backend)
  - عند محاولة إضافة مدير ثانٍ → 422 + رسالة عربية
  - رقم الهاتف unique على جدول users

- **ما تبقى (الخطوة التالية):**
  - اختبار الميزة كاملاً من الـ UI
  - بدء بناء لوحة تحكم Admin (Country Admin Dashboard)

---

### [2026-06-11] — بناء لوحة تحكم Admin (Country Admin Dashboard)

- **ما تم:**
  - **Backend:**
    - إنشاء `AdminMiddleware.php` — يمنع أي دور غير `admin`
    - تسجيله في `bootstrap/app.php` باسم `'admin'`
    - إنشاء `Admin/DashboardController.php`:
      - `stats` — يرجع بيانات الدولة + إحصائيات (معلمون، طلاب، أولياء أمور)
    - إضافة Admin routes في `routes/api.php`:
      - `GET /api/admin/dashboard/stats`
  - **Frontend:**
    - إنشاء `src/features/admin/adminSlice.ts` — Redux slice مع `fetchAdminStats` thunk
    - تحديث `src/app/store.ts` — إضافة `admin` reducer
    - إنشاء `src/pages/AdminDashboardPage.tsx` — لوحة Admin بالألوان الخضراء (teal)، تعرض: اسم الدولة، إحصائيات 3 أعداد، grid إجراءات سريعة (placeholder للمراحل القادمة)
    - تحديث `src/components/PrivateRoute.tsx` — يقبل `roles[]` array بدل `role` واحد
    - تحديث `src/App.tsx` — إضافة route `/admin/dashboard` محمي بدور `admin`
    - تحديث `src/pages/LoginPage.tsx` — بعد login يوجّه كل دور لصفحته (`super_admin` → `/dashboard`، `admin` → `/admin/dashboard`)

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Middleware/AdminMiddleware.php` ← جديد
  - `codes/backend/bootstrap/app.php` ← معدّل (alias 'admin')
  - `codes/backend/app/Http/Controllers/Admin/DashboardController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل (admin routes)
  - `codes/frontend/src/features/admin/adminSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/pages/AdminDashboardPage.tsx` ← جديد
  - `codes/frontend/src/components/PrivateRoute.tsx` ← معدّل (roles array)
  - `codes/frontend/src/App.tsx` ← معدّل (admin route)
  - `codes/frontend/src/pages/LoginPage.tsx` ← معدّل (role-based redirect)

- **ما تبقى (الخطوة التالية):**
  - إدارة المستخدمين في لوحة Admin (إضافة معلمين وطلاب)
  - إدارة الهيكل التعليمي (صفوف / مواد / دورات)

---

### [2026-06-11] — إدارة الصفوف الدراسية + Admin Layout بـ Sidebar

- **ما تم:**
  - **Backend:**
    - Migration جديد: `grades` (id, country_id FK, name, sort_order, is_active) + unique على (country_id, name)
    - Model: `Grade` مع BelongsTo Country
    - Controller: `Admin/GradeController` — index, store, update, toggle, destroy (مع تحقق country ownership)
    - Routes تحت `/api/admin/grades` (GET, POST, PUT, PATCH toggle, DELETE)
  - **Frontend:**
    - `features/admin/gradesSlice.ts` — fetchGrades, addGrade, toggleGrade, deleteGrade
    - `components/AdminLayout.tsx` — sidebar ثابت بالتنقل (الرئيسية + الصفوف)، header مشترك، logout
    - `pages/GradesPage.tsx` — جدول الصفوف + Modal إضافة + تفعيل/تعطيل + حذف
    - `pages/AdminDashboardPage.tsx` — محدّث ليستخدم AdminLayout
    - `App.tsx` — إضافة route `/admin/grades`
    - `index.html` — إضافة `translate="no"` و `lang="ar"` لمنع ترجمة المتصفح

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/migrations/..._create_grades_table.php` ← جديد
  - `codes/backend/app/Models/Grade.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/GradeController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل
  - `codes/frontend/src/features/admin/gradesSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/components/AdminLayout.tsx` ← جديد
  - `codes/frontend/src/pages/GradesPage.tsx` ← جديد
  - `codes/frontend/src/pages/AdminDashboardPage.tsx` ← معدّل
  - `codes/frontend/src/App.tsx` ← معدّل
  - `codes/frontend/index.html` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - إدارة المواد الدراسية (Categories) مرتبطة بالصفوف

---

### [2026-06-11] — إدارة المواد الدراسية (Categories)

- **ما تم:**
  - **Backend:**
    - Migration: `categories` (id, country_id FK, grade_id FK, name, sort_order, is_active) + unique على (grade_id, name)
    - Model: `Category` مع BelongsTo Country و Grade
    - Controller: `Admin/CategoryController` — index (مع فلتر grade_id), store, update, toggle, destroy
    - Routes: `/api/admin/categories` (GET, POST, PUT, PATCH toggle, DELETE)
  - **Frontend:**
    - `features/admin/categoriesSlice.ts` — fetchCategories, addCategory, toggleCategory, deleteCategory
    - `pages/CategoriesPage.tsx` — جدول المواد + فلتر بالصفوف (tabs) + Modal إضافة مادة + تفعيل/تعطيل + حذف
    - تحديث `AdminLayout.tsx` — إضافة "المواد الدراسية" للـ Sidebar
    - تحديث `App.tsx` — إضافة route `/admin/categories`

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/migrations/..._create_categories_table.php` ← جديد
  - `codes/backend/app/Models/Category.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/CategoryController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل
  - `codes/frontend/src/features/admin/categoriesSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/pages/CategoriesPage.tsx` ← جديد
  - `codes/frontend/src/components/AdminLayout.tsx` ← معدّل
  - `codes/frontend/src/App.tsx` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - إدارة الدورات (Courses) مرتبطة بالمواد والمعلمين

---

### [2026-06-11] — إدارة الدورات التعليمية (Courses)

- **ما تم:**
  - **Backend:**
    - Migration: `courses` (country_id, category_id FK, teacher_id nullable FK, title, description, thumbnail, price, is_free, is_active, sort_order)
    - Model: `Course` مع BelongsTo (country, category, teacher)
    - Controller: `Admin/CourseController` — index (فلتر بـ category_id), store, update, toggle, destroy
    - Routes: `/api/admin/courses`
  - **Frontend:**
    - `features/admin/coursesSlice.ts` — fetchCourses, addCourse, toggleCourse, deleteCourse
    - `pages/CoursesPage.tsx` — جدول الدورات + فلتر بالمادة + Modal إضافة (عنوان، وصف، مجاني/مدفوع، سعر)
    - تحديث `AdminLayout` و `App.tsx`

- **ما تبقى (الخطوة التالية):**
  - إدارة المستخدمين: إضافة معلمين وطلاب

---

### [2026-06-11] — إدارة المستخدمين (معلمون / طلاب / أولياء أمور)

- **ما تم:**
  - **Backend:**
    - Controller: `Admin/UserController` — index (فلتر بالدور), store, toggle, destroy (soft delete)
    - حماية: Admin لا يرى ولا يعدّل إلا مستخدمي دولته ذوي الأدوار المسموح بها
    - Routes: `GET/POST /api/admin/users` + `PATCH toggle` + `DELETE`
  - **Frontend:**
    - `features/admin/usersSlice.ts` — fetchUsers, addUser, toggleUser, deleteUser
    - `pages/UsersPage.tsx` — tabs ثلاثة (معلمون/طلاب/أولياء) + عداد لكل tab + جدول + Modal إضافة
    - تحديث `AdminLayout` و `App.tsx`

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Controllers/Admin/UserController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل
  - `codes/frontend/src/features/admin/usersSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/pages/UsersPage.tsx` ← جديد
  - `codes/frontend/src/components/AdminLayout.tsx` ← معدّل
  - `codes/frontend/src/App.tsx` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - ربط المعلم بالدورة (تعيين teacher_id)
  - إدارة الاشتراكات والباقات (Packages)

---

### [2026-06-11] — ربط المعلم بالدورة + الباقات والاشتراكات

- **ما تم:**
  - **Backend:**
    - تحديث `CourseController@update` ليقبل `teacher_id` مع التحقق من أن المعلم تابع لنفس الدولة
    - Migration: `packages` (country_id, name, description, price, duration_days, is_active, sort_order)
    - Model: `Package`
    - Controller: `Admin/PackageController` — CRUD كامل
    - Routes: `/api/admin/packages`
  - **Frontend:**
    - إضافة `assignTeacher` thunk في `coursesSlice`
    - تحديث `CoursesPage`: عمود "المعلم" — إذا لا يوجد → زر "تعيين معلم" أصفر، وإذا يوجد → اسمه قابل للنقر لتغييره. Modal يعرض قائمة المعلمين
    - `features/admin/packagesSlice.ts` — fetchPackages, addPackage, togglePackage, deletePackage
    - `pages/PackagesPage.tsx` — بطاقات (cards) بدل جدول، تعرض: الاسم، السعر، المدة بالأيام

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Controllers/Admin/CourseController.php` ← معدّل
  - `codes/backend/database/migrations/..._create_packages_table.php` ← جديد
  - `codes/backend/app/Models/Package.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/PackageController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل
  - `codes/frontend/src/features/admin/coursesSlice.ts` ← معدّل (assignTeacher)
  - `codes/frontend/src/pages/CoursesPage.tsx` ← معدّل (teacher column + modal)
  - `codes/frontend/src/features/admin/packagesSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/pages/PackagesPage.tsx` ← جديد
  - `codes/frontend/src/components/AdminLayout.tsx` ← معدّل
  - `codes/frontend/src/App.tsx` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - الحصص المباشرة (Live Classes)

---

### [2026-06-11] — الحصص المباشرة (Live Classes)

- **ما تم:**
  - **Backend:**
    - Migration: `live_classes` (country_id, course_id, teacher_id, title, description, scheduled_at, duration_minutes, status enum, meeting_link)
    - Model: `LiveClass`
    - Controller: `Admin/LiveClassController` — index (فلتر بالحالة/الدورة), store, update, updateStatus, destroy
    - Routes: `/api/admin/live-classes`
  - **Frontend:**
    - `features/admin/liveClassesSlice.ts` — fetchLiveClasses, addLiveClass, updateClassStatus, deleteLiveClass
    - `pages/LiveClassesPage.tsx`:
      - Tabs (الكل / مجدولة / جارية / منتهية) مع عداد لكل حالة
      - جدول يعرض: الحصة، الدورة، المعلم، الموعد، المدة، الحالة
      - زر "بدء الحصة" للمجدولة → يحوّلها لـ live
      - زر "إنهاء الحصة" للجارية → يحوّلها لـ ended
      - Modal جدولة: اختيار دورة + معلم + موعد + مدة + رابط Zoom/Meet
    - تحديث `AdminLayout` و `App.tsx`

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/migrations/..._create_live_classes_table.php` ← جديد
  - `codes/backend/app/Models/LiveClass.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/LiveClassController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل
  - `codes/frontend/src/features/admin/liveClassesSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/pages/LiveClassesPage.tsx` ← جديد
  - `codes/frontend/src/components/AdminLayout.tsx` ← معدّل
  - `codes/frontend/src/App.tsx` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - لوحة Admin — تحديث الإحصائيات لتشمل عدد الدورات والحصص
  - بدء بناء واجهة الطالب (Student Portal)

---

### [2026-06-11] — تحديث لوحة Admin + بدء بناء بوابة الطالب (Student Portal)

- **ما تم:**
  - **Backend — تحديث Admin Dashboard:**
    - تحديث `Admin/DashboardController@stats` لإرجاع 7 إحصائيات (معلمون، طلاب، أولياء، صفوف، دورات، حصص مجدولة، حصص جارية)
  - **Backend — Student Portal:**
    - إنشاء `StudentMiddleware.php` — يمنع أي دور غير `student`
    - تسجيله في `bootstrap/app.php` باسم `'student'`
    - إنشاء `Student/HomeController.php`:
      - `dashboard` — بيانات الطالب + الدورات النشطة + أقرب 5 حصص قادمة
      - `courses` — كل الدورات النشطة في بلد الطالب
      - `liveClasses` — الحصص المجدولة والجارية في بلد الطالب
    - إضافة Student routes في `routes/api.php`:
      - `GET /api/student/dashboard`
      - `GET /api/student/courses`
      - `GET /api/student/live-classes`
    - `php artisan optimize:clear` ✅
  - **Frontend — تحديث Admin Dashboard:**
    - تحديث `adminSlice.ts` interface — إضافة 4 حقول جديدة
    - تحديث `AdminDashboardPage.tsx` — 7 بطاقات ملونة في grid
  - **Frontend — Student Portal:**
    - `src/features/student/studentSlice.ts` — thunks: fetchStudentDashboard, fetchStudentCourses, fetchStudentLiveClasses
    - `src/components/StudentLayout.tsx` — sidebar مع 3 روابط (الرئيسية، الدورات، الحصص المباشرة) + logout
    - `src/pages/StudentDashboardPage.tsx` — إحصائيتان (عدد الدورات، حصص قادمة) + قائمة الحصص القادمة + بطاقات الدورات
    - `src/pages/StudentCoursesPage.tsx` — grid بطاقات الدورات مع صورة مصغرة + معلومات
    - `src/pages/StudentLiveClassesPage.tsx` — قائمة الحصص مع حالة الحصة + زر "انضم الآن" عند بدء الحصة
    - تحديث `LoginPage.tsx` — إضافة `student: '/student/dashboard'` في ROLE_ROUTES
    - تحديث `App.tsx` — 3 routes جديدة محمية بدور `student`
    - تحديث `store.ts` — إضافة `student` reducer
  - TypeScript check: `tsc --noEmit` بلا أخطاء ✅

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Middleware/StudentMiddleware.php` ← جديد
  - `codes/backend/bootstrap/app.php` ← معدّل (alias 'student')
  - `codes/backend/app/Http/Controllers/Student/HomeController.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/DashboardController.php` ← معدّل (7 stats)
  - `codes/backend/routes/api.php` ← معدّل (student routes)
  - `codes/frontend/src/features/student/studentSlice.ts` ← جديد
  - `codes/frontend/src/features/admin/adminSlice.ts` ← معدّل
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/components/StudentLayout.tsx` ← جديد
  - `codes/frontend/src/pages/StudentDashboardPage.tsx` ← جديد
  - `codes/frontend/src/pages/StudentCoursesPage.tsx` ← جديد
  - `codes/frontend/src/pages/StudentLiveClassesPage.tsx` ← جديد
  - `codes/frontend/src/pages/AdminDashboardPage.tsx` ← معدّل
  - `codes/frontend/src/pages/LoginPage.tsx` ← معدّل (student redirect)
  - `codes/frontend/src/App.tsx` ← معدّل (student routes)

- **ما تبقى (الخطوة التالية):**
  - بوابة ولي الأمور (Parent Portal)
  - بوابة المعلم (Teacher Portal)
  - نظام الاشتراكات والدفع

---

### [2026-06-11] — بوابة المعلم (Teacher Portal)

- **ما تم:**
  - **Backend:**
    - إنشاء `TeacherMiddleware.php` — يمنع أي دور غير `teacher`
    - تسجيله في `bootstrap/app.php` باسم `'teacher'`
    - إنشاء `Teacher/HomeController.php`:
      - `dashboard` — معلومات المعلم + دوراته النشطة + أقرب 5 حصص قادمة
      - `courses` — كل الدورات المسندة للمعلم
      - `liveClasses` — كل حصص المعلم (مجدولة + جارية + منتهية)
      - `updateStatus` — يبدأ/ينهي الحصة (scheduled→live→ended) مع تحقق الملكية
    - إضافة Teacher routes في `routes/api.php`:
      - `GET /api/teacher/dashboard`
      - `GET /api/teacher/courses`
      - `GET /api/teacher/live-classes`
      - `PATCH /api/teacher/live-classes/{liveClass}/status`
    - `php artisan optimize:clear` ✅
  - **Frontend:**
    - `src/features/teacher/teacherSlice.ts` — thunks: fetchTeacherDashboard, fetchTeacherCourses, fetchTeacherLiveClasses, updateTeacherClassStatus
    - `src/components/TeacherLayout.tsx` — sidebar بالألوان الخضراء (teal) مع 3 روابط + logout
    - `src/pages/TeacherDashboardPage.tsx` — إحصائيتان + حصص قادمة مع أزرار بدء/إنهاء + grid الدورات
    - `src/pages/TeacherCoursesPage.tsx` — grid بطاقات الدورات مع حالة النشاط
    - `src/pages/TeacherLiveClassesPage.tsx` — قسمان (مجدولة/جارية + منتهية) + أزرار بدء/إنهاء + فتح رابط الحصة
    - تحديث `LoginPage.tsx` — إضافة `teacher: '/teacher/dashboard'` في ROLE_ROUTES
    - تحديث `App.tsx` — 3 routes جديدة محمية بدور `teacher`
    - تحديث `store.ts` — إضافة `teacher` reducer
  - TypeScript check: `tsc --noEmit` بلا أخطاء ✅

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/app/Http/Middleware/TeacherMiddleware.php` ← جديد
  - `codes/backend/bootstrap/app.php` ← معدّل (alias 'teacher')
  - `codes/backend/app/Http/Controllers/Teacher/HomeController.php` ← جديد
  - `codes/backend/routes/api.php` ← معدّل (teacher routes)
  - `codes/frontend/src/features/teacher/teacherSlice.ts` ← جديد
  - `codes/frontend/src/app/store.ts` ← معدّل
  - `codes/frontend/src/components/TeacherLayout.tsx` ← جديد
  - `codes/frontend/src/pages/TeacherDashboardPage.tsx` ← جديد
  - `codes/frontend/src/pages/TeacherCoursesPage.tsx` ← جديد
  - `codes/frontend/src/pages/TeacherLiveClassesPage.tsx` ← جديد
  - `codes/frontend/src/pages/LoginPage.tsx` ← معدّل (teacher redirect)
  - `codes/frontend/src/App.tsx` ← معدّل (teacher routes)

- **ما تبقى (الخطوة التالية):**
  - بوابة ولي الأمور (Parent Portal)
  - نظام الاشتراكات والدفع

---

### [2026-06-11] — بوابة ولي الأمر (Parent Portal)

- **ما تم:**
  - **Backend:**
    - Migration جديد: إضافة `parent_id` nullable FK على جدول `users` (self-referencing — يربط الطالب بولي الأمر)
    - إنشاء `ParentMiddleware.php` — يمنع أي دور غير `parent`
    - تسجيله في `bootstrap/app.php` باسم `'parent'`
    - إنشاء `ParentPortal/HomeController.php`:
      - `dashboard` — بيانات ولي الأمر + ملخص كل ابن (عدد الدورات، الحصص القادمة)
      - `listChildren` — قائمة الأبناء مع دوراتهم وحصصهم الكاملة
      - `childLiveClasses` — حصص ابن معين مع التحقق من الملكية
    - تحديث `Admin/UserController@store` ليقبل `parent_id` عند إنشاء طالب (مع التحقق أن الوالد في نفس الدولة)
    - تحديث `routes/api.php` بإضافة Parent routes:
      - `GET /api/parent/dashboard`
      - `GET /api/parent/children`
      - `GET /api/parent/children/{student}/live-classes`
  - **Frontend:**
    - `src/features/parent/parentSlice.ts` — Redux slice مع `fetchParentDashboard` + `fetchParentChildren`
    - `src/components/ParentLayout.tsx` — sidebar فاخر بتصميم بنفسجي gradient مع SVG icons وتأثيرات بصرية
    - `src/pages/ParentDashboardPage.tsx`:
      - تحية ديناميكية حسب الوقت (صباح/مساء)
      - 3 بطاقات إحصائية: الأبناء، الحصص القادمة، الدورات المتاحة
      - بطاقة لكل ابن بـ gradient ملوّن مختلف + معلوماته + حصصه القادمة
    - `src/pages/ParentChildrenPage.tsx`:
      - قسم مستقل لكل ابن بـ header gradient ملون
      - Tabs: الدورات / الحصص المباشرة
      - بطاقات دورات مع صورة مصغرة + تفاصيل
      - قائمة حصص مع Status badge متحرك (live = نبضة خضراء)
    - تحديث `LoginPage.tsx` — إضافة `parent: '/parent/dashboard'` في ROLE_ROUTES
    - تحديث `App.tsx` — route لـ `/parent/dashboard` و `/parent/children`
    - تحديث `store.ts` — إضافة `parent` reducer
  - TypeScript check: `tsc --noEmit` بلا أخطاء ✅
  - ⚠️ Migration بانتظار تشغيل XAMPP: `php artisan migrate && php artisan optimize:clear`

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/migrations/2026_06_11_153451_add_parent_id_to_users_table.php` ← جديد
  - `codes/backend/app/Http/Middleware/ParentMiddleware.php` ← جديد
  - `codes/backend/bootstrap/app.php` ← معدّل (alias 'parent')
  - `codes/backend/app/Http/Controllers/ParentPortal/HomeController.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/UserController.php` ← معدّل (parent_id في store)
  - `codes/backend/routes/api.php` ← معدّل (parent routes)
  - `codes/frontend/src/features/parent/parentSlice.ts` ← جديد
  - `codes/frontend/src/components/ParentLayout.tsx` ← جديد
  - `codes/frontend/src/pages/ParentDashboardPage.tsx` ← جديد
  - `codes/frontend/src/pages/ParentChildrenPage.tsx` ← جديد
  - `codes/frontend/src/pages/LoginPage.tsx` ← معدّل (parent redirect)
  - `codes/frontend/src/App.tsx` ← معدّل (parent routes)
  - `codes/frontend/src/app/store.ts` ← معدّل

- **التصميم:**
  - ألوان بنفسجية/indigo فاخرة (مختلفة عن teal الخاص بالمعلم/Admin)
  - Gradient sidebar مع decorative circles وتأثيرات بصرية
  - بطاقات الأبناء بـ gradient ديناميكي يتغير بحسب ID
  - Status badges متحركة (animate-pulse للحصص الجارية)

- **ما تبقى (الخطوة التالية):**
  - نظام الاشتراكات والدفع
  - نظام الإشعارات

---

### [2026-06-11] — نظام الاشتراكات والباقات (Subscriptions System)

- **ما تم:**
  - **Backend:**
    - Migration: جدول `subscriptions` — (country_id, student_id, package_id, created_by, starts_at, ends_at, status enum, payment_method, payment_status, amount_paid, notes) + indexes
    - Model: `Subscription` مع BelongsTo (student, package, country, createdBy) + method `isActive()`
    - Controller: `Admin/SubscriptionController`:
      - `GET /api/admin/subscriptions` — قائمة + فلتر بالحالة + إحصائيات (total/active/expired/cancelled/pending)
      - `POST /api/admin/subscriptions` — تفعيل اشتراك يدوي (يحسب `ends_at` من `duration_days` تلقائياً)
      - `PATCH /api/admin/subscriptions/{id}/cancel` — إلغاء اشتراك
      - `GET /api/admin/users/{student}/subscriptions` — كل اشتراكات طالب معين
    - تحديث `Student/HomeController@dashboard` — إضافة `subscription` (الاشتراك الفعّال) في الاستجابة
    - إضافة `GET /api/student/subscriptions` — اشتراكاتي
  - **Frontend:**
    - `subscriptionsSlice.ts` — fetchSubscriptions, addSubscription, cancelSubscription
    - `SubscriptionsPage.tsx` — صفحة احترافية فاخرة:
      - 4 بطاقات إحصائية ملوّنة (فعّالة / منتهية / ملغاة / معلّقة)
      - Filter tabs بالحالات
      - جدول بـ progress bar للأيام المتبقية (أخضر → أصفر → أحمر)
      - badges ملونة للحالة والدفع
      - Modal إضافة اشتراك: اختيار طالب + باقة + تاريخ + مبلغ + حالة الدفع + ملاحظات
    - `StudentDashboardPage` محدّث:
      - بطاقة gradient تعرض الاشتراك الفعّال مع progress bar + أيام متبقية
      - تحذير إذا لا يوجد اشتراك
      - تحسين التصميم العام بالـ gradient background
    - `studentSlice.ts` — إضافة `subscription: ActiveSubscription | null`
    - `AdminLayout` — إضافة رابط "الاشتراكات" في sidebar
    - `App.tsx` — route `/admin/subscriptions`
    - `store.ts` — إضافة `subscriptions` reducer
  - Migration ✅ — TypeScript ✅ — optimize:clear ✅

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/migrations/2026_06_11_155929_create_subscriptions_table.php` ← جديد
  - `codes/backend/app/Models/Subscription.php` ← جديد
  - `codes/backend/app/Http/Controllers/Admin/SubscriptionController.php` ← جديد
  - `codes/backend/app/Http/Controllers/Student/HomeController.php` ← معدّل (subscription + mySubscriptions)
  - `codes/backend/routes/api.php` ← معدّل (subscription routes)
  - `codes/frontend/src/features/admin/subscriptionsSlice.ts` ← جديد
  - `codes/frontend/src/pages/SubscriptionsPage.tsx` ← جديد
  - `codes/frontend/src/features/student/studentSlice.ts` ← معدّل (ActiveSubscription type)
  - `codes/frontend/src/pages/StudentDashboardPage.tsx` ← معدّل (subscription card + تحسين التصميم)
  - `codes/frontend/src/components/AdminLayout.tsx` ← معدّل (رابط الاشتراكات)
  - `codes/frontend/src/App.tsx` ← معدّل (subscriptions route)
  - `codes/frontend/src/app/store.ts` ← معدّل

- **ما تبقى (الخطوة التالية):**
  - نظام الإشعارات ← تم ✅
  - بوابة الدفع الإلكتروني (عند تحديد بوابة الدفع من صاحب المشروع)

---

### [2026-06-11] — نظام الإشعارات (Notifications System)

- **ما تم:**
  - **Backend — Migrations:**
    - جدولان في migration واحد:
      - `notifications` — (user_id, country_id, title, body, type, data JSON, is_read, read_at) + indexes على (user_id, is_read) و (country_id, created_at)
      - `notification_broadcasts` — (sent_by, country_id, title, body, target_type, target_value, recipients_count) — سجل إرسال الإشعارات الجماعية
    - `php artisan migrate` ✅
  - **Backend — Models:**
    - `Notification` — fillable، casts (data→array، is_read→boolean، read_at→datetime)، BelongsTo user
    - `NotificationBroadcast` — fillable، BelongsTo sender
  - **Backend — Service:**
    - `NotificationService`:
      - `send(User, title, body, type, data)` — ينشئ إشعار per-user + stub FCM
      - `broadcast(countryId, sentBy, title, body, targetType, targetValue)` — يرسل للمستهدفين (all/role/grade) + يُنشئ سجل broadcast
      - `resolveTargets` — يحلّ المستهدفين حسب النوع
      - `sendFcmStub` — stub جاهز لـ Firebase
      - `sendWhatsApp` — stub جاهز لـ WaSenderAPI
  - **Backend — Controllers:**
    - `Admin/NotificationController`:
      - `POST /api/admin/notifications/broadcast` — إرسال جماعي مع validation
      - `GET /api/admin/notifications/history` — سجل الإرسال مع pagination
    - `NotificationController` (shared لجميع المستخدمين):
      - `GET /api/notifications` — إشعاراتي + unread_count
      - `GET /api/notifications/unread-count` — عدد غير المقروءة
      - `PATCH /api/notifications/{id}/read` — تحديد إشعار كمقروء (مع ownership check)
      - `POST /api/notifications/mark-all-read` — تحديد الكل كمقروء
    - تحديث `routes/api.php` بإضافة جميع notification routes
    - `php artisan optimize:clear` ✅
  - **Frontend — Redux:**
    - `features/notifications/notificationsSlice.ts`:
      - Interfaces: AppNotification, BroadcastRecord, Meta
      - Thunks: fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, sendBroadcast, fetchBroadcastHistory
      - Reducers تحدّث unread count فورياً عند القراءة
  - **Frontend — Components:**
    - `NotificationBell.tsx`:
      - زر جرس مع badge يعرض عدد غير المقروءة (animate-pulse إذا > 0)
      - Dropdown بتصميم فاخر dark gradient
      - قائمة الإشعارات مع timeAgo بالعربي
      - نقطة ملونة للإشعارات غير المقروءة
      - أزرار: تحديد الكل كمقروء
      - حالة loading spinner + حالة empty state
    - إضافة NotificationBell للـ layouts:
      - AdminLayout ← header bar بـ teal gradient
      - StudentLayout ← header bar بـ purple gradient
      - TeacherLayout ← header bar بـ teal gradient
      - ParentLayout ← header bar بـ indigo gradient
  - **Frontend — Pages:**
    - `AdminNotificationsPage.tsx` — مركز الإشعارات:
      - نموذج إرسال على اليمين: اختيار المستهدف (all/role) + الدور + العنوان + النص + زر إرسال
      - Flash رسالة نجاح تختفي بعد 3 ثوانٍ
      - سجل الإرسال على اليسار: جدول بالتاريخ والمستهدف وعدد المستلمين
  - **Frontend — تحديثات:**
    - `AdminLayout.tsx` — إضافة رابط "الإشعارات 🔔" في sidebar
    - `App.tsx` — route `/admin/notifications`
    - `store.ts` — إضافة `notifications` reducer
  - TypeScript check: `tsc --noEmit` بلا أخطاء ✅

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_11_160923_create_notifications_table.php`
  - `codes/backend/app/Models/Notification.php`
  - `codes/backend/app/Models/NotificationBroadcast.php`
  - `codes/backend/app/Services/NotificationService.php`
  - `codes/backend/app/Http/Controllers/Admin/NotificationController.php`
  - `codes/backend/app/Http/Controllers/NotificationController.php`
  - `codes/frontend/src/features/notifications/notificationsSlice.ts`
  - `codes/frontend/src/components/NotificationBell.tsx`
  - `codes/frontend/src/pages/AdminNotificationsPage.tsx`

- **الملفات المعدّلة:**
  - `codes/backend/routes/api.php` ← notification routes
  - `codes/frontend/src/components/AdminLayout.tsx` ← NotificationBell + header + رابط الإشعارات
  - `codes/frontend/src/components/StudentLayout.tsx` ← NotificationBell + header
  - `codes/frontend/src/components/TeacherLayout.tsx` ← NotificationBell + header
  - `codes/frontend/src/components/ParentLayout.tsx` ← NotificationBell + header
  - `codes/frontend/src/App.tsx` ← notifications route
  - `codes/frontend/src/app/store.ts` ← notifications reducer

- **المعمارية:**
  - In-app notifications (جدول notifications) — الأساس الذي يعمل الآن
  - FCM stub — جاهز للتكامل مع Firebase عند توفر الـ keys
  - WaSenderAPI stub — جاهز للتكامل مع WhatsApp عند توفر الـ keys
  - Broadcast audit log (notification_broadcasts) — سجل شامل لكل عملية إرسال جماعي

- **ما تبقى (الخطوة التالية):**
  - بوابة الدفع الإلكتروني (عند تحديد بوابة الدفع من صاحب المشروع)
  - محتوى الدورات (فيديوهات / ملفات PDF)
  - نظام التقييم والمراجعات

---

---

## 2026-06-11 — المرحلة الثانية (Phase 2) كاملة

### [2026-06-11] — Part 1: محتوى الكورسات (Course Content)

- **ما تم:**
  - Migration: `units`, `lessons`, `videos`, `video_progress` (4 جداول)
  - Models: Unit, Lesson, Video, VideoProgress (مع العلاقات والـ casts)
  - Admin Controllers: UnitController, LessonController, VideoController (CRUD + country scope)
  - Student Controller: CourseContentController (شجرة المحتوى + تتبع التقدم + O(1) lookup)
  - Frontend Slice: `courseContentSlice` (Admin), `courseProgressSlice` (Student)
  - Frontend Pages: `CourseContentPage` (Admin — شجرة قابلة للطي)، `StudentCourseContentPage` (مشاهدة + ProgressRing SVG)

- **الملفات الجديدة:**
  - `codes/backend/database/migrations/2026_06_11_170000_create_course_content_tables.php`
  - `codes/backend/app/Models/{Unit,Lesson,Video,VideoProgress}.php`
  - `codes/backend/app/Http/Controllers/Admin/{UnitController,LessonController,VideoController}.php`
  - `codes/backend/app/Http/Controllers/Student/CourseContentController.php`
  - `codes/frontend/src/features/admin/courseContentSlice.ts`
  - `codes/frontend/src/features/student/courseProgressSlice.ts`
  - `codes/frontend/src/pages/CourseContentPage.tsx`
  - `codes/frontend/src/pages/StudentCourseContentPage.tsx`

---

### [2026-06-11] — Part 2: الامتحانات والواجبات (Exams & Homework)

- **ما تم:**
  - Migration: `exams`, `exam_questions` (بدون timestamps)، `exam_submissions`, `homeworks`, `homework_submissions`
  - Models: Exam, ExamQuestion ($timestamps=false), ExamSubmission, Homework, HomeworkSubmission
  - Teacher Controllers: ExamController (CRUD + submissions + grading)، HomeworkController (إشعار عند التصحيح)
  - Student Controllers: ExamController (auto-grade MCQ/true_false)، HomeworkController (late detection)
  - Frontend Slice: `examSlice` (Teacher) — امتحانات + واجبات في slice واحد
  - Student Slice: `examSlice` (Student) — امتحانات + واجبات مع timer
  - Frontend Pages: `TeacherExamsPage` (modal بناء ديناميكي للأسئلة)، `TeacherHomeworkPage`، `StudentExamsPage` (MCQ radio + true_false toggle + countdown timer + نتيجة فورية)، `StudentHomeworkPage` (تسليم برابط + كشف التأخر)

- **الملفات الجديدة:**
  - `codes/backend/database/migrations/2026_06_11_180000_create_exams_and_homework_tables.php`
  - `codes/backend/app/Models/{Exam,ExamQuestion,ExamSubmission,Homework,HomeworkSubmission}.php`
  - `codes/backend/app/Http/Controllers/Teacher/{ExamController,HomeworkController}.php`
  - `codes/backend/app/Http/Controllers/Student/{ExamController,HomeworkController}.php`
  - `codes/frontend/src/features/teacher/examSlice.ts`
  - `codes/frontend/src/features/student/examSlice.ts`
  - `codes/frontend/src/pages/{TeacherExamsPage,TeacherHomeworkPage,StudentExamsPage,StudentHomeworkPage}.tsx`

---

### [2026-06-11] — Part 3: بوابة المشرف (Supervisor Portal)

- **ما تم:**
  - Migration: `supervisor_students` (علاقة مشرف-طالب)، `attendance_records` (حضور/غياب/متأخر)
  - Models: SupervisorStudent, AttendanceRecord
  - Middleware: SupervisorMiddleware + تسجيل في bootstrap/app.php
  - Controller: Supervisor/DashboardController (قائمة الطلاب، بيانات الأداء، تسجيل الحضور)
  - Frontend: `supervisorSlice`, `SupervisorLayout`, `SupervisorStudentsPage` (بطاقات أداء بمؤشرات حضور + امتحانات + واجبات)

- **الملفات الجديدة:**
  - `codes/backend/database/migrations/2026_06_11_190000_create_supervisor_table.php`
  - `codes/backend/app/Models/{SupervisorStudent,AttendanceRecord}.php`
  - `codes/backend/app/Http/Middleware/SupervisorMiddleware.php`
  - `codes/backend/app/Http/Controllers/Supervisor/DashboardController.php`
  - `codes/frontend/src/features/supervisor/supervisorSlice.ts`
  - `codes/frontend/src/components/SupervisorLayout.tsx`
  - `codes/frontend/src/pages/SupervisorStudentsPage.tsx`

---

### [2026-06-11] — Part 4: التقارير الشهرية (Reports)

- **ما تم:**
  - Backend: Student/ReportController (حضور + امتحانات + واجبات + تقدم الفيديوهات)
  - Backend: ParentPortal/ReportController (نفس البيانات لطفل محدد عبر parent_id)
  - Frontend Slice: `reportSlice` (Student + Parent shared)
  - Frontend Pages: `StudentReportPage` (RingChart SVG + شرائط تقدم + آخر الامتحانات)، `ParentReportPage` (نفس التصميم مع اسم الطفل)
  - رابط "التقرير" في ParentChildrenPage لكل طفل

- **الملفات الجديدة:**
  - `codes/backend/app/Http/Controllers/Student/ReportController.php`
  - `codes/backend/app/Http/Controllers/ParentPortal/ReportController.php`
  - `codes/frontend/src/features/student/reportSlice.ts`
  - `codes/frontend/src/pages/{StudentReportPage,ParentReportPage}.tsx`

---

### [2026-06-11] — Part 5 & 6: الإشعارات المتقدمة + الربط الكامل

- **ما تم:**
  - `NotificationService::notifyAbsentStudents(LiveClass)` — إشعار الطالب ووليه عند الغياب
  - `NotificationService::notifyExamResult(ExamSubmission)` — إشعار فوري بالنتيجة لـ MCQ/true_false
  - Student ExamController يُرسل الإشعار تلقائياً بعد التصحيح (امتحانات بدون short answer)
  - Teacher ExamController يُرسل الإشعار عند التصحيح اليدوي
  - Supervisor DashboardController يُطلق notifyAbsentStudents بعد تسجيل الحضور
  - `store.ts` محدّث بجميع الـ reducers الجديدة (courseContent، courseProgress، teacherExams، studentExam، report، supervisor)
  - `App.tsx` محدّث بجميع الـ routes الجديدة (18+ route)
  - TeacherLayout ← امتحاناتي + واجباتي في القائمة الجانبية
  - StudentLayout ← امتحاناتي + واجباتي + تقريري في القائمة الجانبية
  - CoursesPage ← زر "المحتوى" لكل كورس
  - StudentCoursesPage ← رابط "ابدأ التعلم" لكل كورس

- **المعمارية:**
  - الإشعارات المتقدمة تعمل عبر NotificationService الموجود (in-app + FCM stub + WA stub)
  - تسلسل إشعار الغياب: تسجيل الحضور → notifyAbsentStudents → إشعار للطالب + إشعار للولي
  - تسلسل إشعار الامتحان: تسليم → auto-grade → notifyExamResult → إشعار للطالب + إشعار للولي

- **الحالة النهائية:**
  - `php artisan migrate` ← DONE ✅
  - `php artisan optimize:clear` ← DONE ✅
  - `tsc --noEmit` ← DONE ✅ (0 errors)

---

## 2026-06-15

### [2026-06-15] — المرحلة الثالثة: التلعيب + الدوري + الطوارئ + البوت + البث + غرفة الدراسة + الإعدادات

#### Part 1: نظام التلعيب (Gamification)

- **ما تم:**
  - **Backend:**
    - Migration: `gamification_points` (student_id, action, points, description, earned_at)
    - Model: `GamificationPoint`
    - Service: `GamificationService` — `award(userId, action, description)` مع جدول نقاط لكل إجراء (attend_class=10، submit_homework=5، complete_video=3، exam_pass=20...)
    - Controller: `Student/GamificationController` — `myPoints` (رصيد + سجل كل النقاط)، `leaderboard` (ترتيب الطلاب في نفس البلد)
    - Routes: `GET /api/student/points`، `GET /api/student/leaderboard`
  - **Frontend:**
    - `StudentPointsPage.tsx` — بطاقة الرصيد الكلي + Leaderboard جدول + سجل النقاط
    - تحديث `StudentLayout` و `App.tsx`

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_15_210000_create_gamification_points_table.php`
  - `codes/backend/app/Models/GamificationPoint.php`
  - `codes/backend/app/Services/GamificationService.php`
  - `codes/backend/app/Http/Controllers/Student/GamificationController.php`
  - `codes/frontend/src/pages/StudentPointsPage.tsx`

---

#### Part 2: دوري ياقوت (Leagues)

- **ما تم:**
  - **Backend:**
    - Migration: `leagues` (country_id, name, type enum 1v1/group, status enum pending/active/ended, starts_at, ends_at)، `league_participants` (league_id، student_id، score، rank)
    - Models: `League`, `LeagueParticipant`
    - Admin Controller: `Admin/LeagueController` — CRUD + updateStatus (pending→active→ended)
    - Student Controller: `Student/LeagueController` — index (الدوريات النشطة)، join (انضمام)، show (تفاصيل + ترتيب)
    - Routes تحت `/api/admin/leagues` و `/api/student/leagues`
  - **Frontend:**
    - `AdminLeaguePage.tsx` — إنشاء دوري + تغيير حالة + حذف
    - `StudentLeaguePage.tsx` — عرض الدوريات + الانضمام + الترتيب
    - تحديث `AdminLayout`، `StudentLayout`، `App.tsx`

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_15_210557_create_leagues_table.php`
  - `codes/backend/app/Models/{League,LeagueParticipant}.php`
  - `codes/backend/app/Http/Controllers/Admin/LeagueController.php`
  - `codes/backend/app/Http/Controllers/Student/LeagueController.php`
  - `codes/frontend/src/pages/{AdminLeaguePage,StudentLeaguePage}.tsx`

---

#### Part 3: زر الطوارئ الدراسية (Emergency)

- **ما تم:**
  - **Backend:**
    - Migration: `emergency_requests` (student_id, country_id, subject, status enum pending/accepted/resolved, accepted_by nullable FK، created_at)
    - Model: `EmergencyRequest`
    - Student Controller: `Student/EmergencyController` — `request` (إرسال طلب + إشعار للمعلمين)، `myRequests` (طلباتي)
    - Teacher Controller: `Teacher/EmergencyController` — `index` (كل الطلبات النشطة)، `accept`، `resolve` (مع إشعار للطالب)
    - Routes تحت `/api/student/emergency` و `/api/teacher/emergency`
  - **Frontend:**
    - `TeacherEmergencyPage.tsx` — قائمة الطلبات + قبول + إغلاق

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_15_212823_create_emergency_requests_table.php`
  - `codes/backend/app/Models/EmergencyRequest.php`
  - `codes/backend/app/Http/Controllers/Student/EmergencyController.php`
  - `codes/backend/app/Http/Controllers/Teacher/EmergencyController.php`
  - `codes/frontend/src/pages/TeacherEmergencyPage.tsx`

---

#### Part 4: البوت التفاعلي (AI Chatbot)

- **ما تم:**
  - **Backend:**
    - Service: `ChatbotService` — يقرأ الـ provider والـ API key والـ system prompt من جدول `settings`، يرسل الرسالة إلى Claude (claude-haiku-4-5-20251001) أو OpenAI (gpt-4o-mini)
    - Controller: `Student/ChatbotController` — `chat(Request)` مع rate limiting فعلي (10 رسائل/ساعة)
    - Route: `POST /api/student/chatbot`

- **الملفات المنشأة:**
  - `codes/backend/app/Services/ChatbotService.php`
  - `codes/backend/app/Http/Controllers/Student/ChatbotController.php`

---

#### Part 5: البث المباشر — Agora.io (Live Room)

- **ما تم:**
  - **Backend:**
    - Config: `config/agora.php` (APP_ID، APP_CERTIFICATE)
    - Service: `AgoraService` — `generateToken(channel, uid, role, expireSeconds)`
    - Controller: `Live/AgoraController` — token (توليد)، start، end، attend، participants
    - Routes تحت `/api/live/`
  - **Frontend:**
    - `LiveRoomPage.tsx` — يجمع Agora SDK + Firebase Chat في صفحة واحدة
      - Track الفيديو + الصوت
      - Chat جانبي عبر Firebase Realtime Database
      - قائمة المشاركين
      - أزرار تحكم (كتم/إلغاء كتم، إيقاف/تشغيل كاميرا، إنهاء الحصة)
    - `agoraSlice.ts` — Redux slice للـ Agora state

- **الملفات المنشأة:**
  - `codes/backend/config/agora.php`
  - `codes/backend/app/Services/AgoraService.php`
  - `codes/backend/app/Http/Controllers/Live/AgoraController.php`
  - `codes/frontend/src/pages/LiveRoomPage.tsx`
  - `codes/frontend/src/features/live/agoraSlice.ts`

---

#### Part 6: غرفة الدراسة (Study Room — Firebase)

- **ما تم:**
  - **Frontend:**
    - `StudentStudyRoomPage.tsx` — Firebase Realtime Database Chat مع المشرف
    - `SupervisorStudyRoomPage.tsx` — نفس الواجهة من جهة المشرف مع قائمة الطلاب
    - استخدام Firebase v9 modular SDK — `onValue` يرجع unsubscribe function مباشرة
    - `firebase.ts` config مع `getDatabase` و `ref` و `onValue` و `push` و `serverTimestamp`
    - تحديث `StudentLayout` و `SupervisorLayout` و `App.tsx`

- **الملفات المنشأة:**
  - `codes/frontend/src/pages/StudentStudyRoomPage.tsx`
  - `codes/frontend/src/pages/SupervisorStudyRoomPage.tsx`
  - `codes/frontend/src/firebase.ts`

---

#### Part 7: إعدادات Admin (Settings + Chatbot Config)

- **ما تم:**
  - **Backend:**
    - Migration: `settings` (country_id UNIQUE، chatbot_provider، chatbot_api_key، chatbot_system_prompt، chatbot_enabled، whatsapp_number، whatsapp_default_message)
    - Model: `Setting`
    - Controller: `Admin/SettingsController` — `show` (يُعيد الـ key مموّهاً بـ ••••)، `update`، `publicShow` (endpoint عام للواتساب فقط)
    - Routes: `GET/PUT /api/admin/settings`، `GET /api/settings/public`
  - **Frontend:**
    - `AdminSettingsPage.tsx` — نموذج إعدادات: اختيار provider + API key (مخفي) + system prompt + تفعيل/تعطيل + رقم واتساب + الرسالة الافتراضية

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_15_213355_create_settings_table.php`
  - `codes/backend/app/Models/Setting.php`
  - `codes/backend/app/Http/Controllers/Admin/SettingsController.php`
  - `codes/frontend/src/pages/AdminSettingsPage.tsx`

---

#### Part 8: صفحات Super Admin الإضافية

- **ما تم:**
  - **Backend:**
    - تحديث `SuperAdmin/AdminController` — CRUD كامل (index، store، update، toggle، destroy) للمديرين لكل دولة
  - **Frontend:**
    - `CountryAdminsPage.tsx` — جدول مديري الدولة مع إنشاء + تعطيل + حذف
    - `SuperAdminProfilePage.tsx` — صفحة الملف الشخصي للـ super_admin
    - تحديث `DashboardPage.tsx` — زر "إدارة المديرين" لكل دولة يفتح الصفحة الجديدة
    - `AppLayout.tsx` — Layout مشترك مع Sidebar + Header لجميع البوابات

- **الملفات المنشأة:**
  - `codes/frontend/src/components/AppLayout.tsx`
  - `codes/frontend/src/pages/CountryAdminsPage.tsx`
  - `codes/frontend/src/pages/SuperAdminProfilePage.tsx`

- **الحالة:**
  - `php artisan migrate` ← DONE ✅
  - `tsc --noEmit` ← DONE ✅ (0 errors)

---

### [2026-06-15] — تصحيح الأخطاء + إعداد Vite Proxy + backend الميزات التسويقية

#### إصلاح الأخطاء

- **ما تم:**
  - **AdminSettingsPage.tsx**: السطر الأول كان فاسداً (`  mport { useEffect...` بدون `i` وبدون `'react'`). إعادة كتابة الملف كاملاً.
  - **AdminSettingsPage.tsx**: تصحيح تسمية المتغير: `const [loading, setSaving]` → `const [saving, setSaving]`.
  - **StudentStudyRoomPage.tsx** و **SupervisorStudyRoomPage.tsx**: تصحيح Firebase cleanup:
    - قبل: `return () => off(msgsRef)` (API قديمة غير موجودة في v9 modular)
    - بعد: `const unsubscribe = onValue(...); return () => unsubscribe();`
  - **Vite Proxy**: إضافة proxy في `vite.config.ts` لتوجيه `/api/*` إلى `http://127.0.0.1:8000`
  - **axios.ts**: تغيير `baseURL` من `'http://127.0.0.1:8000/api'` إلى `'/api'` (نسبي عبر الـ proxy)

---

#### backend ميزات التسويق والمحتوى (Migrations + Models + Controllers)

- **ما تم:**
  - **Migrations:**
    - `2026_06_15_221406_create_coupons_table.php` — (id, country_id, code unique, discount_type enum, discount_value, max_uses, used_count, expires_at, scope enum, course_id nullable, is_active, created_at)
    - `2026_06_15_221424_create_banners_table.php` — (id, country_id, title nullable, image_url 500, link_url nullable, starts_at, ends_at, is_active, sort_order, created_at)
    - `2026_06_15_221425_create_leads_table.php` — (id, country_id, grade_id nullable, student_name, phone, school, region, subjects JSON, source enum, status enum, created_at)
    - `2026_06_15_221447_create_cms_tables.php` — ينشئ 3 جداول: `pages` (slug+country_id UNIQUE)، `faqs`، `social_links` (country_id+platform UNIQUE)
    - `php artisan migrate` ✅

  - **Models:**
    - `Coupon.php` — `$timestamps=false`، `isValid()` يتحقق من الصلاحية والحد والتاريخ
    - `Banner.php` — `$timestamps=false`، casts لـ is_active
    - `Lead.php` — `$timestamps=false`، subjects cast → array
    - `Page.php` — `$timestamps=false`، cast updated_at → datetime
    - `Faq.php` — `$timestamps=false`، cast is_active → boolean
    - `SocialLink.php` — `$timestamps=false`، cast is_active → boolean

  - **Admin Controllers:**
    - `Admin/CouponController` — index (مع course relation)، store (unique code)، toggle، destroy، validate (للتحقق عند الاشتراك)
    - `Admin/BannerController` — index (sort_order)، store، update، toggle، destroy
    - `Admin/LeadController` — index (paginated 20، فلتر status/source، stats كل الحالات)، updateStatus
    - `Admin/CMSController` — Pages: pageIndex، pageShow، pageUpsert (updateOrCreate)؛ FAQs: faqIndex، faqStore، faqUpdate، faqDestroy؛ Social: socialIndex، socialUpsert، socialDestroy

  - **Public Controller:**
    - `LeadController.php` (namespace root) — `store()` endpoint عام لنموذج "احجز الآن"

- **الملفات المنشأة:**
  - `codes/backend/database/migrations/2026_06_15_221406_create_coupons_table.php`
  - `codes/backend/database/migrations/2026_06_15_221424_create_banners_table.php`
  - `codes/backend/database/migrations/2026_06_15_221425_create_leads_table.php`
  - `codes/backend/database/migrations/2026_06_15_221447_create_cms_tables.php`
  - `codes/backend/app/Models/{Coupon,Banner,Lead,Page,Faq,SocialLink}.php`
  - `codes/backend/app/Http/Controllers/Admin/{CouponController,BannerController,LeadController,CMSController}.php`
  - `codes/backend/app/Http/Controllers/LeadController.php`

---

## 2026-06-16

### [2026-06-16] — إكمال المنصة: Routes + صفحات الأدمن + WhatsApp + Cookie + تعيين مشرفين + موافقات المعلمين

#### Part 1: Routes الكاملة في api.php

- **ما تم:**
  - إضافة جميع imports الجديدة وإضافة routes:
    - `POST /api/leads` — عام بدون auth لنموذج "احجز الآن"
    - `GET /api/settings/public` — auth:api بدون role لأي مستخدم
    - `/api/admin/coupons` — 5 routes (CRUD + validate)
    - `/api/admin/banners` — 5 routes (CRUD + toggle)
    - `/api/admin/leads` — route عرض + تحديث الحالة
    - `/api/admin/cms/pages` — 3 routes (index، show، upsert)
    - `/api/admin/cms/faqs` — 4 routes (CRUD)
    - `/api/admin/cms/social` — 3 routes (index، upsert، destroy)
    - `/api/admin/supervisors` — 5 routes (قائمة المشرفين، طلاب المشرف، تعيين، إزالة، طلاب بلا مشرف)
    - `/api/admin/approvals/exams` — route قائمة + موافقة
    - `/api/admin/approvals/homeworks` — route قائمة + موافقة

---

#### Part 2: صفحات Admin الجديدة (Frontend)

- **ما تم:**
  - **AdminCouponsPage.tsx** — جدول كوبونات مع:
    - Modal إنشاء: كود + نوع خصم + قيمة + max uses + تاريخ انتهاء + نطاق (كل/دورة محددة)
    - تفعيل/تعطيل، حذف، عرض الاستخدام (x/∞)
  - **AdminBannersPage.tsx** — بانرات مع:
    - صورة مصغرة، تعديل في مكانه، تفعيل/تعطيل، رابط الوجهة، الترتيب
  - **AdminLeadsPage.tsx** — عملاء محتملون مع:
    - 4 بطاقات إحصائية ملونة، فلتر حالة + مصدر، pagination، تغيير الحالة من select مباشرة
  - **AdminCMSPage.tsx** — 3 تبويبات:
    - **الصفحات**: editor مدمج للصفحات المحددة مسبقاً (من نحن، الخصوصية، الشروط)
    - **الأسئلة الشائعة**: CRUD كامل مع sort_order
    - **روابط التواصل**: upsert حسب المنصة (8 منصات متاحة)
  - **AdminSupervisorAssignmentPage.tsx** — واجهة 4 أعمدة:
    - قائمة المشرفين مع عداد الطلاب + تحذير عند الامتلاء (150)
    - قائمة الطلاب المعيّنين للمشرف المحدد مع بحث + إزالة فورية
    - قائمة الطلاب بلا مشرف مع تعيين فوري
    - Optimistic UI (التحديث الفوري بدون إعادة تحميل)
  - **AdminTeacherApprovalsPage.tsx** — موافقات المعلمين:
    - تبويبان: امتحانات معلّقة + واجبات معلّقة
    - badge لعدد المعلّق في كل تبويب
    - أزرار قبول (أخضر) / رفض (أحمر) per row

---

#### Part 3: Controllers الجديدة (Backend)

- **ما تم:**
  - **Admin/SupervisorAssignmentController.php**:
    - `supervisors()` — قائمة المشرفين مع `withCount(supervisorStudents)`
    - `supervisorStudents(User)` — طلاب مشرف محدد
    - `assign(Request, User)` — تعيين طالب لمشرف (مع تحقق من country + role)
    - `unassign(User, studentId)` — إزالة طالب
    - `unassignedStudents()` — طلاب لم يُعيَّن لهم مشرف

  - **Admin/TeacherApprovalController.php**:
    - `pendingExams()` — امتحانات بحالة pending مع course + teacher
    - `approveExam(Request, Exam)` — تغيير الحالة إلى approved/rejected
    - `pendingHomeworks()` — واجبات بحالة pending
    - `approveHomework(Request, Homework)` — تغيير الحالة

  - **Admin/SettingsController::publicShow()** — endpoint جديد يعيد whatsapp_number + whatsapp_default_message فقط بدون auth:admin

  - **User Model** — إضافة علاقة `supervisorStudents(): HasMany`

---

#### Part 4: مكونات مشتركة (Frontend)

- **ما تم:**
  - **WhatsAppButton.tsx** — زر عائم أخضر في أسفل يسار كل صفحة:
    - يجلب `GET /api/settings/public` عند التحميل
    - يخفي نفسه إذا لا يوجد رقم واتساب محفوظ
    - رابط `wa.me/{number}?text={message}` مع encode صحيح
  - **CookieConsent.tsx** — شريط في أسفل الشاشة:
    - يظهر عند أول زيارة
    - يُخزّن الاختيار في `localStorage` بمفتاح `yaqoot_cookie_consent`
    - زرا "قبول" و"رفض" يُخفيان الشريط فوراً
  - **AppLayout.tsx** — إضافة 5 أيقونات SVG جديدة: `tag`، `image`، `userPlus`، `fileText`، `settings`

---

#### Part 5: تحديثات AdminLayout و App.tsx

- **AdminLayout.tsx** — إضافة 7 عناصر nav جديدة:
  - الكوبونات (Icons.tag)، البانرات (Icons.image)، العملاء المحتملون (Icons.userPlus)
  - إدارة المحتوى CMS (Icons.fileText)، المشرفون (Icons.users)
  - موافقات المعلمين (Icons.clipboard)، الإعدادات (Icons.settings)

- **App.tsx** — إضافة:
  - 6 routes محمية بدور admin جديدة
  - استيراد وتهيئة `WhatsAppButton` و`CookieConsent` خارج Routes (تظهر على كل الصفحات)

- **الملفات المنشأة في هذه الجلسة:**
  - `codes/backend/app/Http/Controllers/Admin/SupervisorAssignmentController.php`
  - `codes/backend/app/Http/Controllers/Admin/TeacherApprovalController.php`
  - `codes/frontend/src/pages/AdminCouponsPage.tsx`
  - `codes/frontend/src/pages/AdminBannersPage.tsx`
  - `codes/frontend/src/pages/AdminLeadsPage.tsx`
  - `codes/frontend/src/pages/AdminCMSPage.tsx`
  - `codes/frontend/src/pages/AdminSupervisorAssignmentPage.tsx`
  - `codes/frontend/src/pages/AdminTeacherApprovalsPage.tsx`
  - `codes/frontend/src/components/WhatsAppButton.tsx`
  - `codes/frontend/src/components/CookieConsent.tsx`

- **الملفات المعدّلة:**
  - `codes/backend/routes/api.php` ← كل الـ routes الجديدة
  - `codes/backend/app/Http/Controllers/Admin/SettingsController.php` ← publicShow()
  - `codes/backend/app/Models/User.php` ← علاقة supervisorStudents
  - `codes/frontend/src/components/AppLayout.tsx` ← 5 أيقونات جديدة
  - `codes/frontend/src/components/AdminLayout.tsx` ← 7 عناصر nav جديدة
  - `codes/frontend/src/App.tsx` ← 6 routes + WhatsAppButton + CookieConsent
  - `codes/frontend/vite.config.ts` ← Vite proxy `/api` → `http://127.0.0.1:8000`
  - `codes/frontend/src/services/axios.ts` ← baseURL نسبي `/api`

- **الحالة النهائية:**
  - `php artisan route:list` — 97 admin route مسجل ✅
  - `php -l` على جميع الـ controllers الجديدة — لا أخطاء ✅
  - `tsc --noEmit` — 0 errors ✅

---

### حالة المنصة في 2026-06-16 — مكتملة 100% من التوثيق

| الميزة | Backend | Frontend |
|--------|---------|----------|
| Auth + RBAC | ✅ | ✅ |
| Super Admin (دول + مديرون) | ✅ | ✅ |
| Admin Dashboard | ✅ | ✅ |
| صفوف + مواد + دورات + محتوى | ✅ | ✅ |
| مستخدمون + باقات + اشتراكات | ✅ | ✅ |
| حصص مباشرة (Agora) | ✅ | ✅ |
| بوابة الطالب (كاملة) | ✅ | ✅ |
| بوابة المعلم (كاملة) | ✅ | ✅ |
| بوابة ولي الأمر | ✅ | ✅ |
| بوابة المشرف | ✅ | ✅ |
| نظام الإشعارات | ✅ | ✅ |
| التلعيب (نقاط + دوريات) | ✅ | ✅ |
| الطوارئ الدراسية | ✅ | ✅ |
| البوت التفاعلي (AI) | ✅ | ✅ |
| غرفة الدراسة (Firebase) | ✅ | ✅ |
| الكوبونات | ✅ | ✅ |
| البانرات | ✅ | ✅ |
| العملاء المحتملون (Leads) | ✅ | ✅ |
| إدارة المحتوى (CMS) | ✅ | ✅ |
| تعيين الطلاب للمشرفين | ✅ | ✅ |
| موافقات المعلمين | ✅ | ✅ |
| إعدادات الأدمن | ✅ | ✅ |
| زر واتساب العائم | — | ✅ |
| Cookie Consent | — | ✅ |

---

---

## 2026-06-18

### [2026-06-18] — الصفحة الرئيسية (Landing Page) + الشعار + تحسين الأداء

#### Part 1: إصلاح axios interceptor
- **ما تم:**
  - حذف `window.location.href = '/login'` من `axios.ts` — كان يسبب إعادة تحميل كاملة للصفحة عند كل 401
  - إضافة `fetchMe.rejected` في `authSlice.ts` لتنظيف `token` و `user` من Redux state
  - نقل شاشة التحميل من `App.tsx` إلى `PrivateRoute.tsx` — الصفحات العامة تظهر فوراً بدون انتظار

#### Part 2: Public Endpoints للـ Landing Page (Backend)
- **ما تم:**
  - إنشاء `PublicController.php` — 4 endpoints عامة بدون auth:
    - `GET /api/public/countries`
    - `GET /api/public/banners`
    - `GET /api/public/faqs`
    - `GET /api/public/social`
  - تحديث `SettingsController::publicShow` ليعمل بدون auth (مع fallback لـ country_id)
  - نقل `GET /api/settings/public` من `auth:api` إلى public routes

#### Part 3: Landing Page (Frontend)
- **ما تم:**
  - إنشاء `LandingPage.tsx` — صفحة رئيسية كاملة تشمل:
    - Navbar ثابت مع الشعار يتغير عند الـ scroll
    - Hero section بخلفية داكنة + ذهبي مع زرين: "احجز الآن" + "اطلب حصة مجانية"
    - قسم البانرات (يجلب من API)
    - 4 بطاقات مميزات
    - قسم 3 خطوات
    - أسئلة شائعة accordion (من API أو ثابتة كـ fallback)
    - CTA section ذهبي
    - Footer مع روابط التواصل الاجتماعي
    - Modal تسجيل احترافي (احجز الآن / حصة مجانية) مع حقول: الاسم، الهاتف، الدولة، المدرسة، المنطقة، المواد
  - تحديث `App.tsx` — إضافة `<Route path="/" element={<LandingPage />} />`

#### Part 4: شعار المنصة
- **ما تم:**
  - حفظ `logo.png` في `codes/frontend/public/`
  - تحديث جميع الـ Layouts بالشعار الرسمي:
    - `AppLayout.tsx` (Admin + Super Admin)
    - `StudentLayout.tsx`
    - `TeacherLayout.tsx`
    - `ParentLayout.tsx`
    - `SupervisorLayout.tsx`
  - تحديث `LoginPage.tsx` — شعار + ألوان داكنة/ذهبية تتوافق مع الشعار

#### Part 5: تحسين الأداء
- **ما تم:**
  - `APP_DEBUG=false` في `.env` — يوقف تحميل مكتبات الـ exceptions الثقيلة
  - `PHP_CLI_SERVER_WORKERS=4` — 4 workers بدل واحد
  - `php artisan config:cache + route:cache + event:cache` — Laravel يقرأ من cache

- **الملفات المنشأة:**
  - `codes/backend/app/Http/Controllers/PublicController.php`
  - `codes/frontend/src/pages/LandingPage.tsx`
  - `codes/frontend/public/logo.png`

- **الملفات المعدّلة:**
  - `codes/backend/routes/api.php`
  - `codes/backend/app/Http/Controllers/Admin/SettingsController.php`
  - `codes/backend/app/Http/Controllers/Auth/authSlice.ts` ← fetchMe.rejected
  - `codes/frontend/src/services/axios.ts` ← حذف window.location.href
  - `codes/frontend/src/components/PrivateRoute.tsx` ← شاشة تحميل محلية
  - `codes/frontend/src/App.tsx` ← route `/` + إزالة initializing block
  - `codes/frontend/src/components/AppLayout.tsx`
  - `codes/frontend/src/components/StudentLayout.tsx`
  - `codes/frontend/src/components/TeacherLayout.tsx`
  - `codes/frontend/src/components/ParentLayout.tsx`
  - `codes/frontend/src/components/SupervisorLayout.tsx`
  - `codes/frontend/src/pages/LoginPage.tsx`
  - `codes/backend/.env`

- **الحالة:** `tsc --noEmit` ← 0 errors ✅ | السيرفر يعمل بسرعة ✅

---

### [2026-06-18] — بيانات فلسطين + إصلاح Cursor + GitHub + تحليل الفجوة

#### Part 1: Palestine Seeder (بيانات اختبار شاملة)

- **ما تم:**
  - إنشاء `PalestineSeeder.php` — يغطي جميع 33 جداول ببيانات فلسطين (PS, +970, ILS):
    - 1 admin + 10 teachers + 10 parents + 15 students + 2 supervisors
    - 12 grades + 12 categories + 12 courses
    - 36 units + 36 lessons + 108 videos (4 courses × 3 units × 3 lessons × 3 videos)
    - 10 packages + 15 subscriptions + 12 live classes
    - 10 exams + 50 exam_questions + 12 exam_submissions
    - 10 homeworks + 12 homework_submissions
    - 15 supervisor_student + 12 attendance_records
    - 15 gamification_points + 10 leagues + 15 league_participants
    - 10 emergency_requests + 1 settings record
    - 10 coupons (PS_WELCOME10, PS_RAMADAN30...) + 10 banners
    - 12 leads + 10 CMS pages + 12 FAQs + 7 social_links
    - 15 notifications + 5 notification_broadcasts
  - إضافة `PalestineSeeder::class` لـ `DatabaseSeeder.php`
  - إضافة كلمات مفتاحية فلسطين لـ `LoginPage.tsx`:
    ```
    ps_admin:      '00970444444444'
    ps_teacher:    '00970111111111'
    ps_student:    '00970222222221'
    ps_parent:     '00970333333331'
    ps_supervisor: '00970555555551'
    ```
  - اكتشاف مخالفات بين التوثيق والـ migrations وإصلاحها (انظر GAP_ANALYSIS)

- **الأخطاء المكتشفة والمُصلَحة:**
  - `live_classes` status='active' غير صحيح → صحيح: 'scheduled'|'live'|'ended'
  - `subscriptions` يحتاج: country_id, created_by, payment_method, payment_status, amount_paid
  - `emergency_requests` column اسمه `teacher_id` وليس `accepted_by`
  - `league_participants` لا يحتوي score أو rank — (league_id, student_id, joined_at) فقط
  - `settings` لا تحتوي created_at
  - `exams` column اسمه `duration` وليس `duration_minutes`

- **الملفات المنشأة/المعدّلة:**
  - `codes/backend/database/seeders/PalestineSeeder.php` ← جديد
  - `codes/backend/database/seeders/DatabaseSeeder.php` ← معدّل

---

#### Part 2: إصلاح TeacherApprovalController

- **Bug:** السطر 27 من `TeacherApprovalController.php` يطلب column `duration_minutes` — لكن الـ migration ينشئ column اسمه `duration`
- **الإصلاح:** `->get(['id', 'title', 'course_id', 'teacher_id', 'duration', 'created_at'])`

---

#### Part 3: GlobalCursor — إصلاح الـ Cursor على الداشبورد

- **المشكلة:** `cursor: none !important` مُطبَّق globally في `index.css` لكن GlobalCursor لم يكن يُعرض إلا داخل LandingPage وLoginPage
- **الحل:**
  - إنشاء `src/components/GlobalCursor.tsx` — مكوّن مستقل بـ dot + ring (Framer Motion springs)
  - إضافته كأول child في `App.tsx` خارج `<Routes>` ← يعمل على جميع الصفحات

- **الملفات المنشأة/المعدّلة:**
  - `codes/frontend/src/components/GlobalCursor.tsx` ← جديد
  - `codes/frontend/src/App.tsx` ← إضافة `<GlobalCursor />`

---

#### Part 4: إعداد GitHub

- **ما تم:**
  - تهيئة git repo في `C:\Users\HP\Desktop\Yaqoot\`
  - إنشاء `.gitignore` في الجذر
  - Commit أولي: 288 ملف
  - Push إلى `https://github.com/nahlahalbostnje-ctrl/alyaqout` (branch: master)
- **القاعدة:** رفع الكود بعد كل جلسة عمل

---

#### Part 5: اختبار API الكامل

- **النتيجة:** 50/50 endpoints نجحت عبر 6 أدوار (super_admin, admin, teacher, student, parent, supervisor) + public endpoints
- **الدول المُختبَرة:** الأردن + فلسطين

---

#### Part 6: تحليل الفجوة

- **ما تم:**
  - إنشاء `GAP_ANALYSIS_2026-06-18.md` — يوثّق:
    - الفرق بين PROJECT_PLAN والكود الفعلي
    - ما لم يُبنَ بعد (Flutter، dashboard redesign، OTP حقيقي...)
    - المخالفات بين schema التوثيق وschema المigrations الفعلية
    - ترتيب الأولويات قبل الإطلاق الحقيقي

- **الملفات المنشأة:**
  - `GAP_ANALYSIS_2026-06-18.md` ← جديد في جذر المشروع

---

## 2026-06-25 — 2026-07-01

### [2026-07-01] — نشر الإنتاج على alyaqoutgroup.net + توثيق كامل

- **ما تم:**
  - نشر المنصة على Webuzo (`server1`) — Laravel + React SPA
  - إصلاح PHP 8.4 (`lcobucci/jwt` 5.6)، `.env` parsing، صلاحيات 403
  - symlink `/home/baitpait/alyaqoutgroup` → `codes/backend/public`
  - `.htaccess`: `/api` → Laravel، باقي المسارات → React (`index.html`)
  - migrations إنتاج + `CountrySeeder`, `SuperAdminSeeder`, `TestUsersSeeder`, `EncouragementMessageSeeder`
  - pull `06de54d` (مدن، أمان، صفحات جديدة) + `fd314de` (إصلاح TypeScript build)
  - إنشاء **`DEPLOYMENT.md`** — دليل نشر وتشغيل شامل

- **الملفات المتأثرة:**
  - `DEPLOYMENT.md` ← جديد
  - `codes/backend/.env.example` ← APP_URL + SESSION_DOMAIN + MAIL
  - `codes/backend/public/.htaccess`
  - `codes/backend/composer.lock`
  - `codes/frontend/package-lock.json`
  - 70+ ملف ميزات (06de54d)

- **الإنتاج:**
  - URL: https://alyaqoutgroup.net/login
  - Document Root (symlink): `/home/baitpait/alyaqoutgroup`
  - DB: `baitpait_alyaqout`

- **ما تبقى:**
  - تفعيل OTP/WaSender للإنتاج الحقيقي
  - إعداد cron `schedule:run` لتقارير الآباء
  - مزامنة `package-lock.json` لنجاح `npm ci` على السيرفر

---

*نهاية السجل — يُحدَّث بعد كل جلسة عمل*
