# خطة تنفيذ مشروع منصة ياقوت التعليمية
**Yaqoot Platform — Full Implementation Plan**
*تاريخ الإنشاء: 2026-06-10 | آخر تحديث: 2026-06-11 | الإصدار: 1.1*

---

## حالة التنفيذ الحالية (2026-06-16) — مكتمل 100%

### ✅ مكتمل بالكامل

| القسم | Backend | Frontend |
|-------|---------|----------|
| Auth (JWT) | ✅ | ✅ |
| Super Admin — الدول | ✅ | ✅ |
| Super Admin — مديرو الدول | ✅ | ✅ |
| Admin Dashboard (7 إحصائيات) | ✅ | ✅ |
| الصفوف الدراسية | ✅ | ✅ |
| المواد الدراسية | ✅ | ✅ |
| الدورات + محتوى + تعيين معلم | ✅ | ✅ |
| المستخدمون (معلم/طالب/ولي/مشرف) | ✅ | ✅ |
| الباقات | ✅ | ✅ |
| الاشتراكات | ✅ | ✅ |
| الحصص المباشرة (Agora) | ✅ | ✅ |
| بوابة الطالب (كاملة) | ✅ | ✅ |
| بوابة المعلم (كاملة) | ✅ | ✅ |
| بوابة ولي الأمر | ✅ | ✅ |
| بوابة المشرف | ✅ | ✅ |
| نظام الإشعارات | ✅ | ✅ |
| التلعيب — نقاط + Leaderboard | ✅ | ✅ |
| دوري ياقوت (Leagues) | ✅ | ✅ |
| زر الطوارئ الدراسية | ✅ | ✅ |
| البوت التفاعلي (AI Chatbot) | ✅ | ✅ |
| غرفة الدراسة (Firebase Chat) | ✅ | ✅ |
| إعدادات Admin (Chatbot + واتساب) | ✅ | ✅ |
| الكوبونات | ✅ | ✅ |
| البانرات | ✅ | ✅ |
| العملاء المحتملون (Leads) | ✅ | ✅ |
| إدارة المحتوى CMS (صفحات/FAQ/شبكات) | ✅ | ✅ |
| تعيين الطلاب للمشرفين | ✅ | ✅ |
| موافقات المعلمين (امتحانات/واجبات) | ✅ | ✅ |
| زر واتساب العائم | — | ✅ |
| Cookie Consent Banner | — | ✅ |

### بيانات الخوادم المحلية

| الخادم | الرابط |
|--------|-------|
| Backend API | http://127.0.0.1:8000 |
| Frontend SPA (Vite proxy) | http://localhost:5173 |
| قاعدة البيانات | MySQL — yaqoot_db عبر XAMPP |

### التكاملات المُوصَّلة

| التكامل | الحالة |
|---------|--------|
| Agora.io (بث مباشر) | ✅ Config + Token generation |
| Firebase Realtime Database (chat) | ✅ |
| Claude API / OpenAI (chatbot) | ✅ ChatbotService |

---

---

## فهرس المحتويات
1. [نظرة عامة على المعمارية](#1-نظرة-عامة-على-المعمارية)
2. [هيكل المجلدات](#2-هيكل-المجلدات)
3. [قاعدة البيانات — Schema كامل](#3-قاعدة-البيانات)
4. [Backend — Laravel APIs](#4-backend--laravel-apis)
5. [Frontend — React.js](#5-frontend--reactjs)
6. [Mobile — Flutter](#6-mobile--flutter)
7. [التكاملات الخارجية](#7-التكاملات-الخارجية)
8. [خطة التنفيذ التفصيلية بالمراحل](#8-خطة-التنفيذ-التفصيلية)
9. [معايير الجودة والأمان](#9-معايير-الجودة-والأمان)

---

## 1. نظرة عامة على المعمارية

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  React.js    │  │   Flutter    │  │   Admin Dashboard     │ │
│  │  (Web SPA)   │  │  (Mobile)    │  │   (React.js)          │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │
└─────────┼─────────────────┼──────────────────────┼─────────────┘
          │                 │                       │
          └─────────────────┼───────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│                   Laravel (PHP) — REST API                      │
│              JWT Auth │ RBAC Middleware │ Rate Limiting         │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
       │          │           │           │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌──▼──────┐
  │ MySQL  │ │Firebase│ │ Agora  │ │  FCM   │ │WaSender │
  │  /PG   │ │Realtime│ │  .io   │ │        │ │  API    │
  └────────┘ └────────┘ └────────┘ └────────┘ └─────────┘
       │
  ┌────▼──────────────────────────────────────────┐
  │              STORAGE LAYER                    │
  │  AWS CloudFront (Signed URLs) │ VdoCipher     │
  │  Google Cloud Storage (files) │ Local Storage │
  └───────────────────────────────────────────────┘
```

---

## 2. هيكل المجلدات

### 2.1 Backend (Laravel)
```
yaqoot-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── OTPController.php
│   │   │   │   └── AuthController.php
│   │   │   ├── SuperAdmin/
│   │   │   │   ├── CountryController.php
│   │   │   │   └── StatsController.php
│   │   │   ├── Admin/
│   │   │   │   ├── UserController.php
│   │   │   │   ├── GradeController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── CourseController.php
│   │   │   │   ├── PackageController.php
│   │   │   │   ├── CouponController.php
│   │   │   │   ├── BannerController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── CMSController.php
│   │   │   │   └── SettingsController.php
│   │   │   ├── Teacher/
│   │   │   │   ├── ClassController.php
│   │   │   │   ├── ExamController.php
│   │   │   │   ├── HomeworkController.php
│   │   │   │   └── SessionController.php
│   │   │   ├── Student/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProgressController.php
│   │   │   │   ├── GamificationController.php
│   │   │   │   └── EmergencyController.php
│   │   │   ├── Parent/
│   │   │   │   ├── ReportController.php
│   │   │   │   └── ChildController.php
│   │   │   ├── Supervisor/
│   │   │   │   └── SupervisorController.php
│   │   │   ├── Live/
│   │   │   │   ├── AgoraController.php
│   │   │   │   └── StudyRoomController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── LeadController.php
│   │   │   └── ChatbotController.php
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php
│   │   │   ├── SubscriptionMiddleware.php
│   │   │   ├── GradeFilterMiddleware.php
│   │   │   └── CountryScopeMiddleware.php   (يفلتر كل Query بـ country_id تلقائياً)
│   │   └── Requests/
│   │       ├── Auth/
│   │       ├── Course/
│   │       └── Package/
│   ├── Models/
│   │   ├── Country.php
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Teacher.php
│   │   ├── Parent.php
│   │   ├── Supervisor.php
│   │   ├── Grade.php
│   │   ├── Category.php
│   │   ├── Course.php
│   │   ├── Unit.php
│   │   ├── Lesson.php
│   │   ├── Video.php
│   │   ├── Package.php
│   │   ├── Subscription.php
│   │   ├── LiveClass.php
│   │   ├── Exam.php
│   │   ├── Homework.php
│   │   ├── Attendance.php
│   │   ├── GamificationPoint.php
│   │   ├── Coupon.php
│   │   ├── Banner.php
│   │   ├── Lead.php
│   │   ├── Notification.php
│   │   └── Setting.php
│   ├── Services/
│   │   ├── AgoraService.php
│   │   ├── WaSenderService.php
│   │   ├── FCMService.php
│   │   ├── OTPService.php
│   │   ├── VideoProtectionService.php
│   │   ├── GamificationService.php
│   │   ├── ReportService.php
│   │   ├── ChatbotService.php
│   │   └── CountryScopeService.php   (تصفية البيانات بالدولة تلقائياً)
│   └── Jobs/
│       ├── SendPostClassNotification.php
│       ├── SendReminderNotification.php
│       └── GenerateMonthlyReport.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── web.php
└── config/
    ├── agora.php
    ├── firebase.php
    └── wasender.php

```

### 2.2 Frontend (React.js + TypeScript)
```
yaqoot-frontend/
├── src/
│   ├── app/
│   │   ├── store.ts                    (Redux store)
│   │   └── router.tsx                  (React Router)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── OTPLogin.tsx
│   │   │   └── authSlice.ts
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── courses/
│   │   │   ├── packages/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── teacher/
│   │   │   ├── classes/
│   │   │   ├── exams/
│   │   │   └── homework/
│   │   ├── student/
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── progress/
│   │   │   ├── gamification/
│   │   │   └── emergency/
│   │   ├── parent/
│   │   │   ├── reports/
│   │   │   └── children/
│   │   ├── live/
│   │   │   ├── AgoraRoom.tsx
│   │   │   ├── StudyRoom.tsx
│   │   │   └── agoraSlice.ts
│   │   └── chatbot/
│   │       └── ChatbotWidget.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── WhatsAppFloatingBtn.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── hooks/
│   │   └── utils/
│   └── pages/
│       ├── HomePage.tsx
│       ├── RegisterPage.tsx
│       └── PricingPage.tsx
```

### 2.3 Mobile (Flutter)
```
yaqoot-mobile/
├── lib/
│   ├── main.dart
│   ├── webview/
│   │   └── WebViewScreen.dart          (يحمّل الـ Web App)
│   ├── notifications/
│   │   └── FCMHandler.dart             (Push Notifications)
│   └── utils/
│       └── DeepLinkHandler.dart
└── android/ & ios/                     (إعدادات FCM)
```

---

## 3. قاعدة البيانات

### 3.1 Schema الكامل

```sql
-- ==============================
-- COUNTRIES (Multi-Country Core)
-- ==============================

CREATE TABLE countries (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,          -- الأردن، السعودية، الإمارات...
    code        VARCHAR(5) UNIQUE NOT NULL,      -- JO, SA, AE
    currency    VARCHAR(10) DEFAULT 'USD',       -- JOD, SAR, AED
    phone_code  VARCHAR(5),                      -- +962, +966, +971
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- ==============================
-- AUTH & USERS
-- ==============================

CREATE TABLE users (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    role            ENUM('super_admin','admin','teacher','student','parent','supervisor') NOT NULL,
    country_id      BIGINT UNSIGNED REFERENCES countries(id),  -- null للـ super_admin فقط
    otp_code        VARCHAR(6),
    otp_expires_at  TIMESTAMP,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ==============================
-- ACADEMIC STRUCTURE
-- ==============================

CREATE TABLE grades (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE categories (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    parent_id   BIGINT UNSIGNED REFERENCES categories(id),
    grade_id    BIGINT UNSIGNED REFERENCES grades(id),
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    icon        VARCHAR(255),
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE courses (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    grade_id        BIGINT UNSIGNED REFERENCES grades(id),
    category_id     BIGINT UNSIGNED REFERENCES categories(id),
    teacher_id      BIGINT UNSIGNED REFERENCES users(id),
    country_id      BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    term_type       ENUM('foundation','first_semester','second_semester') NOT NULL,
    package_type    ENUM('live_interactive','recorded_only') NOT NULL,
    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
    thumbnail       VARCHAR(255),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE units (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    course_id   BIGINT UNSIGNED REFERENCES courses(id) ON DELETE CASCADE,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE lessons (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    unit_id     BIGINT UNSIGNED REFERENCES units(id) ON DELETE CASCADE,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE videos (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    lesson_id       BIGINT UNSIGNED REFERENCES lessons(id) ON DELETE CASCADE,
    video_url       TEXT NOT NULL,           -- Encrypted Signed URL
    duration        INT,                     -- seconds
    type            ENUM('video','pdf','attachment') DEFAULT 'video',
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ==============================
-- FAMILY & STUDENT ACCOUNTS
-- ==============================

CREATE TABLE parents (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED REFERENCES users(id),
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    region      VARCHAR(100),
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE students (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED REFERENCES users(id),
    parent_id   BIGINT UNSIGNED REFERENCES parents(id),
    grade_id    BIGINT UNSIGNED REFERENCES grades(id) NOT NULL,
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    school      VARCHAR(255),
    region      VARCHAR(100),
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE supervisors (
    id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id      BIGINT UNSIGNED REFERENCES users(id),
    country_id   BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    max_students INT DEFAULT 150,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);

CREATE TABLE supervisor_student (
    supervisor_id   BIGINT UNSIGNED REFERENCES supervisors(id),
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    assigned_at     TIMESTAMP,
    PRIMARY KEY (supervisor_id, student_id)
);

-- ==============================
-- PACKAGES & SUBSCRIPTIONS
-- ==============================

CREATE TABLE packages (
    id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    price               DECIMAL(10,2) NOT NULL,
    country_id          BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    duration_days       INT NOT NULL,
    package_type        ENUM('live_interactive','recorded_only') NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_bundle           BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE TABLE package_subject (
    package_id  BIGINT UNSIGNED REFERENCES packages(id),
    subject_id  BIGINT UNSIGNED REFERENCES categories(id),
    PRIMARY KEY (package_id, subject_id)
);

CREATE TABLE subscriptions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    package_id      BIGINT UNSIGNED REFERENCES packages(id),
    coupon_id       BIGINT UNSIGNED REFERENCES coupons(id),
    starts_at       DATE NOT NULL,
    ends_at         DATE NOT NULL,
    payment_method  ENUM('online','manual'),
    payment_status  ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
    receipt_path    VARCHAR(255),            -- للدفع اليدوي
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ==============================
-- LIVE CLASSES
-- ==============================

CREATE TABLE live_classes (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    teacher_id      BIGINT UNSIGNED REFERENCES users(id),
    course_id       BIGINT UNSIGNED REFERENCES courses(id),
    country_id      BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    agora_channel   VARCHAR(255) UNIQUE NOT NULL,
    scheduled_at    TIMESTAMP NOT NULL,
    duration_min    INT DEFAULT 60,
    status          ENUM('pending','live','ended','approved') DEFAULT 'pending',
    recording_url   VARCHAR(255),
    admin_approval  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE class_attendance (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    live_class_id   BIGINT UNSIGNED REFERENCES live_classes(id),
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    joined_at       TIMESTAMP,
    left_at         TIMESTAMP,
    duration_min    INT,
    created_at      TIMESTAMP
);

-- ==============================
-- EXAMS & HOMEWORK
-- ==============================

CREATE TABLE exams (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    course_id   BIGINT UNSIGNED REFERENCES courses(id),
    teacher_id  BIGINT UNSIGNED REFERENCES users(id),
    status      ENUM('pending','approved','rejected') DEFAULT 'pending',
    type        ENUM('auto','manual'),       -- اختيار متعدد أو رفع صورة
    duration    INT,                         -- minutes
    starts_at   TIMESTAMP,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE exam_questions (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exam_id     BIGINT UNSIGNED REFERENCES exams(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    type        ENUM('mcq','true_false','short'),
    options     JSON,                        -- للـ MCQ
    answer      TEXT,
    points      INT DEFAULT 1,
    sort_order  INT DEFAULT 0
);

CREATE TABLE exam_submissions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    exam_id         BIGINT UNSIGNED REFERENCES exams(id),
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    answers         JSON,
    score           DECIMAL(5,2),
    submitted_at    TIMESTAMP,
    graded_at       TIMESTAMP
);

CREATE TABLE homeworks (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    course_id       BIGINT UNSIGNED REFERENCES courses(id),
    teacher_id      BIGINT UNSIGNED REFERENCES users(id),
    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
    due_date        DATE NOT NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE homework_submissions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    homework_id     BIGINT UNSIGNED REFERENCES homeworks(id),
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    file_path       VARCHAR(255),
    notes           TEXT,
    grade           DECIMAL(5,2),
    teacher_feedback TEXT,
    submitted_at    TIMESTAMP
);

-- ==============================
-- PROGRESS TRACKING
-- ==============================

CREATE TABLE video_progress (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id      BIGINT UNSIGNED REFERENCES students(id),
    video_id        BIGINT UNSIGNED REFERENCES videos(id),
    watched_at      TIMESTAMP,
    completed       BOOLEAN DEFAULT FALSE,
    watch_duration  INT DEFAULT 0,           -- seconds
    UNIQUE(student_id, video_id)
);

-- ==============================
-- GAMIFICATION
-- ==============================

CREATE TABLE gamification_points (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id  BIGINT UNSIGNED REFERENCES students(id),
    action      VARCHAR(100) NOT NULL,       -- 'attend_class','submit_homework'...
    points      INT NOT NULL,
    earned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leagues (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100),
    type            ENUM('1v1','group'),
    country_id      BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    status          ENUM('pending','active','ended'),
    starts_at       TIMESTAMP,
    ends_at         TIMESTAMP,
    created_at      TIMESTAMP
);

CREATE TABLE league_participants (
    league_id   BIGINT UNSIGNED REFERENCES leagues(id),
    student_id  BIGINT UNSIGNED REFERENCES students(id),
    score       INT DEFAULT 0,
    rank        INT,
    PRIMARY KEY (league_id, student_id)
);

-- ==============================
-- MARKETING
-- ==============================

CREATE TABLE coupons (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(50) UNIQUE NOT NULL,
    country_id      BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    discount_type   ENUM('percentage','fixed') NOT NULL,
    discount_value  DECIMAL(10,2) NOT NULL,
    max_uses        INT,
    used_count      INT DEFAULT 0,
    expires_at      DATE,
    scope           ENUM('all','specific_course') DEFAULT 'all',
    course_id       BIGINT UNSIGNED REFERENCES courses(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP
);

CREATE TABLE banners (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    image_path  VARCHAR(255) NOT NULL,
    link_url    VARCHAR(255),
    starts_at   DATE,
    ends_at     DATE,
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP
);

CREATE TABLE leads (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_name    VARCHAR(255) NOT NULL,
    grade_id        BIGINT UNSIGNED REFERENCES grades(id),
    country_id      BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    school          VARCHAR(255),
    subjects        JSON,
    phone           VARCHAR(20) NOT NULL,
    region          VARCHAR(100),
    source          ENUM('book_now','free_class') NOT NULL,
    status          ENUM('new','contacted','converted','lost') DEFAULT 'new',
    created_at      TIMESTAMP
);

-- ==============================
-- NOTIFICATIONS
-- ==============================

CREATE TABLE notifications (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    body        TEXT NOT NULL,
    country_id  BIGINT UNSIGNED REFERENCES countries(id),  -- null = كل الدول (super_admin)
    type        ENUM('push','whatsapp','both') DEFAULT 'push',
    target      ENUM('all','parents','students','grade') DEFAULT 'all',
    grade_id    BIGINT UNSIGNED REFERENCES grades(id),
    sent_at     TIMESTAMP,
    created_at  TIMESTAMP
);

-- ==============================
-- CMS
-- ==============================

CREATE TABLE pages (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    slug        VARCHAR(100) NOT NULL,        -- about, terms, privacy...
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     LONGTEXT NOT NULL,
    updated_at  TIMESTAMP,
    UNIQUE(slug, country_id)
);

CREATE TABLE faqs (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP
);

CREATE TABLE social_links (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    platform    VARCHAR(50) NOT NULL,        -- facebook, instagram, tiktok...
    url         VARCHAR(255) NOT NULL,
    country_id  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL,
    icon        VARCHAR(100),
    is_active   BOOLEAN DEFAULT TRUE
);

-- ==============================
-- SYSTEM SETTINGS (per-country)
-- ==============================

CREATE TABLE settings (
    id                          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    country_id                  BIGINT UNSIGNED REFERENCES countries(id) NOT NULL UNIQUE,
    chatbot_api_key             TEXT,        -- Encrypted
    chatbot_system_prompt       LONGTEXT,
    chatbot_provider            VARCHAR(50), -- openai, claude, etc.
    whatsapp_number             VARCHAR(20),
    whatsapp_default_message    TEXT,
    updated_at                  TIMESTAMP
);
```

---

## 4. Backend — Laravel APIs

### 4.1 جدول نقاط النهاية (Endpoints)

#### Auth
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/send-otp` | إرسال OTP على واتساب |
| POST | `/api/auth/verify-otp` | التحقق من الرمز والحصول على JWT Token |
| POST | `/api/auth/refresh` | تجديد الـ Token |
| POST | `/api/auth/logout` | تسجيل الخروج |

#### Super Admin — إدارة الدول
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/super-admin/countries` | قائمة كل الدول |
| POST | `/api/super-admin/countries` | إضافة دولة جديدة |
| PUT | `/api/super-admin/countries/{id}` | تعديل بيانات دولة |
| PATCH | `/api/super-admin/countries/{id}/toggle` | تفعيل/تعطيل دولة |
| POST | `/api/super-admin/countries/{id}/admin` | إنشاء Admin لدولة معينة |
| GET | `/api/super-admin/stats` | إحصائيات كل الدول موحّدة |
| POST | `/api/super-admin/switch-country/{id}` | التبديل لعرض لوحة دولة معينة |

#### Admin — المستخدمون
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/admin/users` | قائمة المستخدمين |
| POST | `/api/admin/users` | إضافة مستخدم |
| PUT | `/api/admin/users/{id}` | تعديل مستخدم |
| DELETE | `/api/admin/users/{id}` | حذف مستخدم |
| POST | `/api/admin/supervisors/{id}/assign-students` | تعيين طلاب للمشرف |

#### Admin — المحتوى الأكاديمي
| Method | Endpoint | الوصف |
|--------|----------|-------|
| CRUD | `/api/admin/grades` | الصفوف الدراسية |
| CRUD | `/api/admin/categories` | الفئات والمواد |
| CRUD | `/api/admin/courses` | الكورسات |
| CRUD | `/api/admin/units` | الوحدات |
| CRUD | `/api/admin/lessons` | الدروس |
| CRUD | `/api/admin/videos` | الفيديوهات |
| POST | `/api/admin/courses/{id}/approve` | قبول كورس المعلم |
| POST | `/api/admin/courses/{id}/reject` | رفض كورس المعلم |

#### Admin — الباقات والتسويق
| Method | Endpoint | الوصف |
|--------|----------|-------|
| CRUD | `/api/admin/packages` | الباقات |
| CRUD | `/api/admin/coupons` | كوبونات الخصم |
| CRUD | `/api/admin/banners` | البانرات |
| GET | `/api/admin/leads` | قائمة العملاء المحتملين |
| POST | `/api/admin/notifications/send` | إرسال إشعار مخصص |

#### Teacher
| Method | Endpoint | الوصف |
|--------|----------|-------|
| CRUD | `/api/teacher/classes` | جدول الحصص (Draft Mode) |
| CRUD | `/api/teacher/exams` | الامتحانات |
| CRUD | `/api/teacher/homeworks` | الواجبات |
| POST | `/api/teacher/homeworks/{id}/grade` | تصحيح واجب طالب |
| GET | `/api/teacher/sessions/bookings` | الجلسات الفردية المحجوزة |
| POST | `/api/teacher/sessions/{id}/evaluate` | تقييم جلسة فردية |

#### Agora — البث المباشر
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/live/token` | توليد Agora Token موقّع |
| POST | `/api/live/{classId}/start` | بدء البث |
| POST | `/api/live/{classId}/end` | إنهاء البث |
| POST | `/api/live/{classId}/attend` | تسجيل حضور الطالب |
| GET | `/api/live/{classId}/participants` | قائمة الحاضرين |

#### Student
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/student/dashboard` | لوحة المهام اليومية |
| GET | `/api/student/progress` | تتبع التقدم |
| GET | `/api/student/videos/{id}/url` | Signed URL للفيديو |
| POST | `/api/student/homeworks/{id}/submit` | تسليم واجب |
| POST | `/api/student/exams/{id}/submit` | تسليم امتحان |
| POST | `/api/student/emergency` | زر الطوارئ الدراسية |
| GET | `/api/student/points` | نقاط الطالب |
| POST | `/api/student/chatbot` | سؤال للبوت |

#### Parent
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/parent/children` | قائمة الأبناء |
| GET | `/api/parent/children/{id}/report` | التقرير الشهري |
| GET | `/api/parent/children/{id}/attendance` | لوحة الحضور |
| POST | `/api/parent/sessions/book` | حجز جلسة فردية + دفع |

#### Public (بدون تسجيل)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/leads` | نموذج "احجز الآن" |
| GET | `/api/pages/{slug}` | الصفحات الثابتة |
| GET | `/api/faqs` | الأسئلة الشائعة |
| POST | `/api/chatbot` | بوت للزوار |

---

### 4.2 نظام RBAC — Middleware
```php
// routes/api.php

// Super Admin — يرى كل الدول
Route::middleware(['auth:api', 'role:super_admin'])->prefix('super-admin')->group(...);

// Admin — مقيّد تلقائياً بـ country_id من الـ Token
Route::middleware(['auth:api', 'role:admin', 'country.scope'])->prefix('admin')->group(...);

// Teacher — مقيّد بدولته وكورساته
Route::middleware(['auth:api', 'role:teacher', 'country.scope'])->prefix('teacher')->group(...);

// Student — مقيّد بدولته واشتراكه وصفه
Route::middleware(['auth:api', 'role:student', 'subscription', 'country.scope'])->prefix('student')->group(...);

// Parent
Route::middleware(['auth:api', 'role:parent', 'country.scope'])->prefix('parent')->group(...);

// Supervisor
Route::middleware(['auth:api', 'role:supervisor', 'country.scope'])->prefix('supervisor')->group(...);
```

> **ملاحظة:** Middleware `country.scope` يُضيف تلقائياً شرط `WHERE country_id = auth()->user()->country_id`
> على جميع Queries عبر Global Scope في كل Model.

---

## 5. Frontend — React.js

### 5.1 صفحات الـ Routing
```
/                           → Homepage (عامة — اختيار الدولة)
/login                      → OTP Login
/register                   → التسجيل

/super-admin                → Super Admin Dashboard (كل الدول)
/super-admin/countries      → إدارة الدول
/super-admin/stats          → إحصائيات موحّدة

/admin                      → Admin Dashboard (دولة محددة)
/admin/users                → إدارة المستخدمين
/admin/grades               → الصفوف
/admin/categories           → الفئات
/admin/courses              → الكورسات
/admin/packages             → الباقات
/admin/coupons              → الكوبونات
/admin/banners              → البانرات
/admin/leads                → العملاء المحتملين
/admin/notifications        → مركز الإشعارات
/admin/settings             → الإعدادات (Bot API)
/admin/cms                  → إدارة المحتوى

/teacher/dashboard          → لوحة المعلم
/teacher/classes            → حصصي
/teacher/exams              → امتحاناتي
/teacher/homework           → واجباتي
/teacher/sessions           → الجلسات الفردية

/student/dashboard          → ماذا أفعل اليوم؟
/student/courses            → كورساتي
/student/homework           → واجباتي
/student/exams              → امتحاناتي
/student/progress           → تقدمي
/student/points             → نقاطي وجوائزي
/student/study-room         → غرفة الواجبات

/parent/dashboard           → لوحة ولي الأمر
/parent/children            → أبنائي
/parent/reports/:childId    → التقرير الشهري
/parent/sessions            → الجلسات الفردية

/live/:channelId            → غرفة البث المباشر (Agora)
/about                      → من نحن
/terms                      → الشروط والأحكام
/privacy                    → سياسة الخصوصية
```

### 5.2 State Management (Redux Toolkit)
```
store/
├── authSlice          → user, token, role
├── courseSlice        → courses, units, lessons
├── liveSlice          → agoraToken, participants, chatMessages
├── studentSlice       → progress, points, tasks
└── notificationSlice  → unread count, list
```

### 5.3 مكونات مشتركة مهمة
| المكوّن | الوصف |
|---------|-------|
| `<AgoraRoom>` | غرفة البث (Video + Chat + Whiteboard) |
| `<StudyRoom>` | غرفة Firebase Chat |
| `<ProgressBar>` | شريط التقدم لكل وحدة/درس |
| `<GradeFilter>` | تصفية المحتوى بصف الطالب تلقائياً |
| `<WhatsAppBtn>` | زر واتساب العائم (جميع الصفحات) |
| `<CookieConsent>` | موافقة ملفات الارتباط |
| `<ChatbotWidget>` | بوت الدعم في كل الصفحات |
| `<OTPInput>` | إدخال رمز التحقق مع عداد 60 ث |

---

## 6. Mobile — Flutter

### المبدأ: WebView Wrapper
التطبيق يحمّل الـ Web App داخل `WebView` بشكل أساسي مع:
- **FCM Integration** لاستقبال Push Notifications أصلية
- **Deep Links** للانتقال لصفحة محددة من الإشعار
- **Splash Screen** بشعار ياقوت
- **Offline Banner** إذا قُطع الإنترنت

```dart
// lib/main.dart — المبنى الأساسي
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_backgroundHandler);
  runApp(YaqootApp());
}
```

---

## 7. التكاملات الخارجية

### 7.1 Agora.io — البث المباشر
```
التدفق:
1. المعلم يبدأ حصة  →  Backend يولد Agora Token (UID + Channel + Role=Publisher)
2. الطالب ينضم     →  Backend يتحقق من الاشتراك ← يولد Token (Role=Subscriber)
3. انتهاء الحصة    →  Backend يطلق Cloud Recording API لحفظ التسجيل

الـ SDK: agora-rtc-sdk-ng (للويب)
الـ Token: PHP Agora Token Builder على Backend
```

### 7.2 Firebase — Chat والإشعارات
```
Firebase Realtime Database (Study Room + Class Chat):
  /studyRoom/
    /{roomId}/
      messages/
        /{messageId}: { userId, text, timestamp }

  /liveClasses/
    /{channelId}/
      chat/
        /{messageId}: { userId, name, text, timestamp }
      handRaise/
        /{studentId}: { raised: bool, timestamp }

Firebase Cloud Messaging (FCM):
  → تُرسل من Laravel عبر Firebase Admin SDK
  → الهاتف يستقبلها عبر Flutter
```

### 7.3 WaSenderAPI — واتساب
```
الاستخدامات:
1. OTP: POST /send-otp → { phone, code }
2. إشعار ما بعد الحصة (Job مجدول بعد انتهاء الحصة)
3. تقرير شهري (Cron Job يوم 1 كل شهر)
4. إشعار الغياب (تلقائي عند انتهاء الحصة)

الـ Template:
"حضر {اسم الطالب} حصة {المادة}
مدة الحضور: {X} دقيقة
نتيجة الاختبار: {X}/{Y}"
```

### 7.4 Video Protection
```
الخيار الأول — AWS CloudFront Signed URLs:
  Backend (Laravel):
    1. يُنشئ Signed URL بصلاحية محدودة (15 دقيقة)
    2. يُرجعها عبر API للـ Frontend
    3. لا تعمل الرابط بعد انتهاء الصلاحية

الخيار الثاني — VdoCipher:
  → OTP-based Video Embed (أبسط في التطبيق)
  → لا يحتاج AWS account
  → مناسب للبداية
```

### 7.5 AI Chatbot
```
Backend (ChatbotService.php):
  - يقرأ chatbot_api_key + system_prompt من settings table
  - يُرسل request للـ Provider (OpenAI أو غيره)
  - System Prompt يوجّه البوت لإعطاء تلميحات لا إجابات مباشرة

API:
  POST /api/chatbot
  { message: "كيف أحل المعادلات التربيعية؟" }
  ← { reply: "حاول تطبيق قاعدة العامل المشترك أولاً..." }
```

---

## 8. خطة التنفيذ التفصيلية

### المرحلة الأولى — MVP (8-10 أسابيع)

#### الأسبوع 1-2: البنية التحتية
- [ ] إعداد Laravel project + MySQL
- [ ] إعداد React.js + TypeScript + Redux Toolkit
- [ ] إعداد Flutter project
- [ ] إعداد بيئات الـ Development و Staging على Google Cloud
- [ ] كتابة جميع Migrations
- [ ] إعداد Redis للـ Queue Jobs
- [ ] إعداد JWT Authentication Package

#### الأسبوع 3: نظام التوثيق
- [ ] `OTPController` — توليد وإرسال OTP
- [ ] تكامل WaSenderAPI لإرسال OTP
- [ ] `AuthController` — التحقق وإصدار JWT Token
- [ ] صفحة Login بـ OTP input + عداد 60 ثانية
- [ ] نظام RBAC Middleware

#### الأسبوع 4: لوحة تحكم Admin — المحتوى
- [ ] CRUD: Grades, Categories, Courses
- [ ] CRUD: Units, Lessons, Videos (مع رفع الملفات)
- [ ] نظام الموافقة على طلبات المعلمين
- [ ] Video Protection — Signed URL Generator

#### الأسبوع 5: الباقات والاشتراكات
- [ ] CRUD: Packages (مادة واحدة + Bundle)
- [ ] نظام اقتراح الباقة الأرخص تلقائياً
- [ ] كوبونات الخصم مع التحقق عند الدفع
- [ ] صفحة عرض الباقات للمستخدم
- [ ] Subscription Access Middleware

#### الأسبوع 6: بوابة الطالب الأساسية
- [ ] Dashboard — "ماذا أفعل اليوم؟"
- [ ] عرض الكورسات (مفلتر بـ grade_id تلقائياً)
- [ ] مشاهدة الفيديوهات مع Progress Tracking
- [ ] تسليم الواجبات ورفع الملفات

#### الأسبوع 7: البث المباشر (Agora)
- [ ] Agora Token Generator في Backend
- [ ] دمج Agora SDK في React
- [ ] واجهة الحصة المباشرة (Video + Chat + قائمة الطلاب)
- [ ] Cloud Recording عند انتهاء الحصة
- [ ] تسجيل الحضور تلقائياً

#### الأسبوع 8: الحساب العائلي ولوحة المعلم
- [ ] نظام Parent + Children Accounts
- [ ] لوحة المعلم (Draft Mode — كل شيء pending)
- [ ] إشعار ما بعد الحصة عبر واتساب (Job)
- [ ] FCM: إشعار تذكير قبل الحصة

#### الأسبوع 9-10: صفحة الهوم والتجميع
- [ ] Homepage — بانرات، نموذج احجز الآن، نموذج الحصة المجانية
- [ ] زر واتساب العائم
- [ ] Cookie Consent Banner
- [ ] امتحان تحديد المستوى الآلي (Leads Funnel)
- [ ] تطبيق Flutter WebView + FCM
- [ ] Testing & Bug Fixes

---

### المرحلة الثانية — التتبع والمتابعة (6-8 أسابيع)

#### الأسبوع 11-12: المشرف والتقارير
- [ ] Dashboard المشرف (100-150 طالب)
- [ ] مؤشرات الأداء (غياب، انخفاض مفاجئ)
- [ ] تواصل المشرف مع أولياء الأمور
- [ ] لوحة ولي الأمر المتقدمة

#### الأسبوع 13-14: التقارير المرئية
- [ ] التقرير الشهري PDF (Visual Analytics)
- [ ] مؤشرات: الحضور، الواجبات، التقدم، نقاط القوة
- [ ] إرسال التقرير تلقائياً أول كل شهر عبر واتساب

#### الأسبوع 15-16: Study Room وتتبع التقدم
- [ ] غرفة الواجبات — Firebase Chat مع المشرفين
- [ ] شريط التقدم لكل وحدة ودرس
- [ ] علامة ✔ على الفيديوهات المكتملة
- [ ] نسبة الإنجاز من الفصل الدراسي

#### الأسبوع 17-18: الإشعارات المتقدمة
- [ ] مركز إشعارات Admin (إرسال مخصص لشريحة)
- [ ] إشعار الغياب التلقائي
- [ ] إشعار نتيجة الامتحان

---

### المرحلة الثالثة — التلعيب والذكاء الاصطناعي (6-8 أسابيع)

#### الأسبوع 19-20: نظام النقاط والجوائز
- [ ] Points Engine (نقاط على كل إجراء)
- [ ] Leaderboard الطلاب
- [ ] شاشة نقاطي ومكافآتي

#### الأسبوع 21-22: دوري ياقوت
- [ ] نظام المسابقات (1v1 + مجموعات)
- [ ] نادي ياقوت — ورش المهارات

#### الأسبوع 23-24: البوت والطوارئ
- [ ] زر الطوارئ الدراسية → توجيه فوري لمعلم مناوب
- [ ] بنك الأسئلة الحي
- [ ] AI Chatbot كامل (مع Admin Settings)
- [ ] PWA / Offline Mode

---

## 9. معايير الجودة والأمان

### الأمان
| الميزة | التطبيق |
|--------|---------|
| حماية الفيديو | Signed URLs فقط — لا روابط مباشرة |
| API Keys | مشفرة بـ `Crypt::encrypt()` في قاعدة البيانات |
| JWT Tokens | انتهاء الصلاحية بعد 24 ساعة + Refresh Token |
| HTTPS | إلزامي على جميع الطبقات |
| Rate Limiting | 60 request/min على Auth, 5 OTP/hour |
| SQL Injection | Eloquent ORM فقط — لا Raw Queries |
| XSS | React يتعامل مع هذا افتراضياً |

### فلترة البيانات
- كل API تُرجع فقط بيانات المستخدم الحالي (`grade_id` filter)
- المعلم لا يرى بيانات طلاب خارج كورساته
- المشرف يرى فقط الطلاب المعيّنين له

### الأداء
- Eager Loading لمنع N+1 Queries في Laravel
- Redis Cache للاستعلامات المتكررة (قائمة الكورسات)
- Lazy Loading للفيديوهات في React
- Pagination على جميع القوائم الطويلة

---

*خطة التنفيذ الكاملة — منصة ياقوت v1.0*
*آخر تحديث: 2026-06-10*
