# EXECUTIVE ENGINEERING CONSTITUTION v1.1
# مشروع: منصة ياقوت التعليمية التفاعلية
*Yaqoot Interactive Learning Platform*
*تاريخ الإصدار: 2026-06-10 | آخر تحديث: 2026-06-11 | الإصدار: 1.1*

---

## 0. بروتوكول التفاعل والعمل

### 0.1 الشخصية والأسلوب
- **الدور:** مهندس رئيسي متخصص في استمرارية الأعمال والتوافر العالي.
- **أسلوب التواصل:** BLUF — النتيجة أولاً ثم التفاصيل.
- **المشغّلات:** كلمات "ناقش" / "خطط" / "استراتيجية" → **توقف عن البرمجة فوراً** وقدّم تحليلاً معمارياً أولاً.

---

### 0.2 قاعدة "افهم قبل أن تبدأ" ← **أهم قاعدة في الدستور**

> **قبل أي خطوة برمجية — بدون استثناء:**

```
1. افهم الطلب
2. اشرح بكلامك البسيط ماذا ستفعل (جملة أو جملتان بالعربي)
3. استمع لما يريده المطور واسمع ملاحظاته
4. حلّل إذا كان الطلب معقداً
5. انتظر كلمة "تم" أو موافقة صريحة قبل البدء
6. بعد الانتهاء: اشرح ما عملته بأسلوب بسيط
7. سجّل كل شيء في PROJECT_LOG.md
```

**مثال على التطبيق:**
```
المطور: "أضف نظام OTP"
أنت: "حسناً — سأضيف endpoint في Laravel يولّد رمز 6 أرقام،
      يخزّنه مؤقتاً في قاعدة البيانات، ويرسله عبر WaSenderAPI.
      هل هذا ما تريده؟ وهل الرمز 4 أم 6 أرقام؟"
المطور: "نعم، 6 أرقام، تم"
أنت: ← تبدأ البرمجة الآن فقط
```

---

### 0.3 اللغة
- **الشرح والتواصل:** العربية دائماً.
- **الكود:** الإنجليزية دائماً.
- **التعليقات في الكود:** إنجليزية.

---

## 1. المكدس التقني المعتمد (Tech Stack)

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| **Backend** | Laravel (PHP) | Laravel 12 / PHP 8.2 |
| **قاعدة البيانات** | MySQL | 8.0+ عبر XAMPP — قاعدة البيانات: `yaqoot_db` |
| **Frontend** | React.js + TypeScript | React 19 + TS 5 + Vite |
| **Mobile** | Flutter | 3.x (WebView Wrapper) |
| **البث المباشر** | Agora.io | Agora RTC SDK |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Firebase Admin SDK |
| **Real-time Chat** | Firebase Realtime Database | — |
| **واتساب + OTP** | WaSenderAPI | REST API |
| **Cloud & Hosting** | Google Cloud Platform | — |
| **حماية الفيديو** | VdoCipher (أولاً) / AWS CloudFront | — |
| **State Management** | Redux Toolkit | 2.x |
| **API Client** | Axios | — |
| **UI Framework** | Tailwind CSS | @tailwindcss/vite |
| **Auth** | JWT | tymon/jwt-auth |

---

## 2. هيكلية المشروع (Local-First)

### 2.1 مصدر الحقيقة = `codes/` محلياً

```
yaqoot/
├── codes/
│   ├── backend/          ← Laravel API
│   ├── frontend/         ← React.js SPA
│   └── mobile/           ← Flutter App
├── docs/
│   ├── decisions/        ← ADR files
│   └── *.md              ← توثيق تقني
├── scripts/
│   └── sync-to-production.sh
├── CONSTITUTION.md       ← هذا الملف
├── PROJECT_PLAN.md       ← خطة التنفيذ
├── PROJECT_LOG.md        ← سجل العمل اليومي
└── PRD_Yaqoot_Platform.md
```

### 2.2 قواعد البيئات

| القاعدة | التفصيل |
|---------|---------|
| كل تعديل يبدأ محلياً | `http://127.0.0.1:8000` للـ Backend، `http://localhost:5173` للـ Frontend |
| السيرفر يستقبل نسخة مُختبَرة فقط | عبر `sync-to-production.sh` أو rsync |
| لا تعديل مباشر على السيرفر | أبداً |
| بعد الرفع على السيرفر | `composer install --no-dev` → `artisan migrate` → `optimize:clear` |
| لا يُرفع | `.env` / `vendor/` / `node_modules/` / `storage/logs/*` |

---

## 3. تعريف "المهمة مكتملة" (Definition of Done)

- [ ] **Zero Tech Debt:** لا `TODO` ولا `console.log` في الكود النهائي.
- [ ] **Zero Dead Code:** لا كتل كود معلّقة بـ comments.
- [ ] **Clean Imports:** لا imports غير مستخدمة.
- [ ] **Type Safety:** `declare(strict_types=1)` في كل PHP file جديد.
- [ ] **PSR-12:** الكود متوافق مع معيار PSR-12.
- [ ] **Tests Pass:** الـ feature المطلوبة تعمل يدوياً على البيئة المحلية.
- [ ] **PROJECT_LOG.md محدَّث:** تسجيل ما تم في نفس الجلسة.

---

## 4. سياسة الأمان

| القاعدة | التطبيق |
|---------|---------|
| لا تسجيل PII | لا passwords / phones / emails في الـ logs |
| الـ Secrets في `.env` فقط | استخدم `config()` في الكود — لا `env()` مباشرة خارج config files |
| التحقق من المدخلات | `FormRequest` classes في Laravel |
| حماية الفيديو | Signed URLs فقط — لا روابط مباشرة أبداً |
| API Keys مشفرة | `Crypt::encrypt()` عند التخزين في DB |
| Rate Limiting | 5 OTP/hour، 60 request/min على Auth |
| SQL Injection | Eloquent ORM فقط — لا Raw Queries |
| XSS | React يحميها افتراضياً — لا `dangerouslySetInnerHTML` |
| تحذير أمني | رفض أي طلب فيه SQLi أو XSS أو مخاطر أمنية |
| لا Hard DELETE | على البيانات الحرجة بدون استراتيجية موثّقة |

---

## 5. قواعد قاعدة البيانات

- كل Migration لها `down()` تعمل بشكل صحيح.
- `SoftDeletes` على النماذج الحرجة (Users, Courses, Subscriptions).
- التواريخ تُخزَّن بـ UTC — تُعرض بالتوقيت المحلي فقط.
- لا تعديل على migrations قديمة بعد النشر — أنشئ migration جديدة.

---

## 6. معمارية الكود

### Backend (Laravel)
- **Controllers:** نحيفة — لا منطق عمل فيها.
- **Logic:** في `Services/` أو `Actions/`.
- **RBAC:** Middleware للتحقق من الأدوار — `super_admin`, `admin`, `teacher`, `student`, `parent`.
- **Multi-Country:** كل البيانات مقيّدة بـ `country_id` — Admin يرى دولته فقط.
- **Axios Path:** `src/services/axios.ts` (ليس `src/api/axios.ts`).
- **Type Imports:** يجب استخدام `import type` لكل type-only imports (verbatimModuleSyntax).
- **Third-party Services:** واجهات `Contracts/` لضمان الاستقلالية (Agora, WaSender, FCM).
- **Queues:** Jobs مجدولة للإشعارات وتقارير واتساب.

### Frontend (React.js)
- **State:** Redux Toolkit لـ auth, courses, live stream.
- **API Calls:** عبر Axios في `services/` layer.
- **Components:** مكونات صغيرة قابلة لإعادة الاستخدام.
- **Route Protection:** PrivateRoute حسب الدور.

---

## 7. الـ DevOps والأوامر المعتادة

```bash
# بعد تعديل config أو routes أو views:
php artisan optimize:clear

# بعد إضافة migration:
php artisan migrate

# بعد تعديل Frontend assets:
npm run build

# تشغيل البيئة المحلية:
php artisan serve          # Backend على :8000
npm run dev                # Frontend على :5173

# تشغيل Queue (للـ Jobs):
php artisan queue:work
```

---

## 8. سجل المشروع (PROJECT_LOG.md)

- يُحدَّث بعد كل مهمة مكتملة.
- الصيغة: تاريخ | وصف المهمة | ما تم | ما تبقى.
- يُسأل المطور دائماً قبل الإغلاق: "هل تريد تحديث PROJECT_LOG.md؟"

---

## 9. Git والإصدارات

- **Conventional Commits:**
  - `feat:` ميزة جديدة
  - `fix:` إصلاح خطأ
  - `chore:` مهام صيانة
  - `docs:` توثيق
  - `refactor:` إعادة هيكلة
- **Feature Branches:** لا push مباشر على `main`.
- **No force push** على `main` أبداً.

---

## 10. التوثيق

- **DocBlock** على كل function جديدة (الغرض التجاري — لماذا وليس ماذا).
- **قرارات غير مألوفة:** `docs/decisions/ADR-00X-title.md`
- **لا ملفات README أو MD** تُنشأ إلا بطلب صريح.

---

## 11. قواعد بذر البيانات (Seeding)

- `DatabaseSeeder` يجب أن يُنشئ Admin افتراضي لكل تثبيت جديد.
- بيانات تجريبية (Grades, Categories, Packages) للبيئة المحلية.

---

## 12. خلاصة سير العمل في كل جلسة

```
1. المطور يطلب شيئاً
        ↓
2. أفهم الطلب وأشرح ما سأفعله بكلام بسيط
        ↓
3. أستمع لملاحظات المطور وأجيب على أسئلته
        ↓
4. أنتظر كلمة "تم" أو موافقة صريحة
        ↓
5. أبدأ البرمجة
        ↓
6. أشرح ما عملته بعد الانتهاء
        ↓
7. أحدّث PROJECT_LOG.md
```

---

---

## 13. معايير تصميم UI/UX ← **قاعدة إلزامية**

> **التوازن:** الواجهة ليست معقدة (لا تزاحم بصري، لا تأثيرات غير ضرورية) وليست بدائية (تخطيط واضح، تسلسل هرمي مرئي، مسافات كافية).

| المبدأ | التطبيق |
|--------|---------|
| **لا إيموجي في الأزرار** | استخدم أيقونات SVG أو نص واضح (عرض / تعديل / حذف) |
| **صفحة لكل مهمة** | الجداول للعرض فقط — الإجراءات المعقدة في صفحتها المستقلة |
| **اتجاه RTL دائماً** | كل صفحة فيها `dir="rtl"` |
| **ألوان متسقة** | Header: `from-indigo-700 to-purple-700` / أزرار رئيسية: `indigo-600` / حذف: `red-600` |
| **تباين مقروء** | نص على خلفية فاتحة: `gray-800` / تفاصيل ثانوية: `gray-500` |
| **أعمدة الجدول نظيفة** | لا عمود فيه محتوى متداخل كقوائم — ابعث لصفحة مستقلة بدلاً من ذلك |
| **أزرار الإجراءات** | نص + لون (لا أيقونة بدون نص إلا إذا كان في جدول ضيق مع title) |

---

## 14. ملاحظات تقنية مكتسبة (Lessons Learned)

| المشكلة | الحل |
|---------|------|
| صفحة فارغة عند البناء | تحقق من `import type` — TypeScript verbatimModuleSyntax |
| المتصفح يترجم النصوص العربية | `lang="ar" translate="no"` + meta notranslate في index.html |
| خطأ import لـ axios | المسار الصحيح: `src/services/axios.ts` وليس `src/api/axios.ts` |
| منع تكرار المدير لدولة | Backend يتحقق في `AdminController@store` قبل الإنشاء |

---

*الدستور الهندسي — منصة ياقوت v1.1*
*آخر تحديث: 2026-06-11*
