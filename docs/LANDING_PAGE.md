# الصفحة الرئيسية — بوابة الزائر (Visitor Gateway)

> تحديث: **2026-08-09**  
> Commit الإنتاج: `81e9999`  
> الملف الرئيسي: `codes/frontend/src/pages/LandingPage.tsx`  
> الإنتاج: https://alyaqoutgroup.net

---

## 1) الهدف

تحويل الصفحة الأولى من «صفحة دخول» إلى:

**Educational Landing Page + Visitor Gateway**

الزائر يفهم خلال 5–10 ثوانٍ:

- ما هي منصة الياقوت؟
- ماذا تقدم؟ ولمن؟
- كيف يسجّل / يدخل / يستكشف كزائر؟

---

## 2) المسارات العامة (بدون JWT)

| المسار | الصفحة | الوظيفة |
|--------|--------|---------|
| `/` | `LandingPage.tsx` | البوابة الرئيسية |
| `/explore` | `visitor/VisitorExplorePage.tsx` | وضع الزائر |
| `/register` | `RegisterPage.tsx` | طلب إنشاء حساب (Lead) |
| `/login` | `LoginPage.tsx` | تسجيل الدخول |
| `/verify/:code` | `CertificateVerifyPage.tsx` | التحقق من شهادة |

---

## 3) هيكل أقسام الصفحة الرئيسية (من الأعلى)

| # | المرساة | القسم |
|---|---------|--------|
| 1 | — | Sticky Header (شعار، دولة، مراسي، دخول / حساب / زائر) |
| 2 | `#top` | Hero + Mock Dashboard + Floating cards |
| 3 | — | Trust bar (نصوص ثقة؛ أرقام فقط عند عتبة الإحصاءات) |
| 4 | — | بانرات الدولة (إن وُجدت) |
| 5 | `#features` | لماذا الياقوت — 6 بطاقات |
| 6 | `#audience` | الطالب / ولي الأمر / المعلم / الزائر |
| 7 | `#courses` | الدورات من API |
| 8 | `#live` | الحصص المباشرة من API |
| 9 | `#teachers` | المعلمون من API |
| 10 | `#steps` | كيف تعمل الياقوت؟ (5 خطوات) |
| 11 | `#gamification` | نقاط / مستويات / سلسلة / متصدرين / مكافآت |
| 12 | `#leaderboard` | لوحة المتصدرين من API |
| 13 | `#challenges` | التحديات من API |
| 14 | `#ai` | Mock المعلم الذكي |
| 15 | `#study` | غرفة المذاكرة (بدون عدّاد وهمي) |
| 16 | `#parent` | بوابة ولي الأمر + اشتراكات/فواتير (إدارة) |
| 17 | `#certificates` | Mock الشهادات |
| 18 | `#about` | عن الياقوت |
| 19 | `#faqs` | FAQ من API (أو أسئلة افتراضية إن فارغ) |
| 20 | — | Final CTA |
| 21 | — | Footer متعدد الأعمدة + سوشيال |
| 22 | — | Lead Modal (`book_now` / `free_class` / `try_free`) |

---

## 4) وضع الزائر (Visitor Mode)

### الملفات

| ملف | دور |
|-----|-----|
| `codes/frontend/src/features/visitor/visitorMode.ts` | `enterVisitorMode` / `exitVisitorMode` / `isVisitorMode` عبر `sessionStorage` |
| `codes/frontend/src/components/visitor/VisitorGateDialog.tsx` | Dialog الخدمات المغلقة |
| `codes/frontend/src/pages/visitor/VisitorExplorePage.tsx` | صفحة الاستكشاف |

### السلوك

1. الضغط على **دخول كزائر** → `enterVisitorMode()` → `/explore`
2. يمكن مشاهدة: دورات، معلمون، حصص، تحديات، متصدرين، معلومات عامة
3. عند محاولة خدمة تتطلب حساباً → Dialog:

   > هذه الخدمة متاحة للمستخدمين المسجلين. أنشئ حسابك للمتابعة.

   أزرار: **إنشاء حساب** | **متابعة كزائر**

4. لا يوجد توكن JWT للزائر — استكشاف عبر Public APIs فقط

---

## 5) إنشاء حساب `/register`

- **ليس** تسجيلاً ذاتياً فورياً في النظام الحالي
- يرسل `POST /api/leads` بمصدر `register`
- الإدارة تُكمل إنشاء المستخدم لاحقاً
- **لا** إدخال بطاقة ولا Payment Gateway

---

## 6) Public APIs

بادئة: `/api/public/`

| Method | Endpoint | ملاحظات |
|--------|----------|---------|
| GET | `countries` | دول نشطة |
| GET | `faqs` | FAQ المنصة (سوبر أدمن) |
| GET | `stats` | أعداد حقيقية فقط |
| GET | `banners?country_id=` | حسب الدولة |
| GET | `social?country_id=` | حسب الدولة |
| GET | `courses?limit=&country_id=` | دورات معتمدة + تقييم متوسط إن وُجد |
| GET | `teachers?limit=&country_id=` | معلمون + مواد + عدد دورات |
| GET | `live-classes?limit=&country_id=` | live/scheduled معتمدة |
| GET | `leaderboard?limit=&country_id=` | اسم مختصر للخصوصية |
| GET | `challenges?limit=&country_id=` | تحديات نشطة/معلّقة |
| POST | `/api/leads` | مصادر: `book_now`, `free_class`, `register`, `try_free` |

**Controller:** `codes/backend/app/Http/Controllers/PublicController.php`

### عتبة الإحصاءات (`STATS_MIN` في الفرونت)

تُعرض الأرقام فقط إذا تحقق أحد:

- طلاب ≥ **50**، أو
- معلمون ≥ **5**، أو
- دول ≥ **3**

وإلا: نصوص ثقة بدون أرقام وهمية.

---

## 7) الاشتراكات والفواتير (بدون Payment Gateway)

### القاعدة

```
Subscription → Invoice / Installment → Invoice Status
```

**ممنوع حالياً:** Stripe · PayPal · بطاقة · Checkout · شاشة دفع إلكتروني

قابل لاحقاً لإضافة بوابة دفع **دون** إعادة بناء نموذج الاشتراك/الفاتورة أو تجربة البوابة العامة.

### الواجهات

| الدور | المسار | السلوك |
|-------|--------|--------|
| ولي أمر | `/parent/billing` | اشتراكات حقيقية + أقساط/فواتير + طباعة + تواصل إدارة |
| طالب | `/student/dashboard` | بانر: نشط 🟢 / ينتهي خلال ≤5 أيام 🟡 / منتهٍ 🔴 |

حالات الفاتورة/القسط المعتمدة في الواجهة: مدفوعة · مستحقة · متأخرة · ملغاة (عند توفرها).

### Migration متعلقة

`2026_08_09_220000_expand_leads_source_enum.php` — توسيع `leads.source`.

---

## 8) الهوية البصرية

انظر `docs/THEME.md`

- أزرق `#3B82A0` · كحلي `#243746` · أبيض/رمادي فاتح · ذهب `#C59341` نادر
- RTL · Responsive · حركات خفيفة (Framer Motion)

---

## 9) الملفات المتأثرة (مرجع سريع)

**Frontend**

- `pages/LandingPage.tsx`
- `pages/RegisterPage.tsx`
- `pages/visitor/VisitorExplorePage.tsx`
- `features/visitor/visitorMode.ts`
- `components/visitor/VisitorGateDialog.tsx`
- `pages/ParentBillingPage.tsx`
- `pages/StudentDashboardPage.tsx`
- `components/ParentLayout.tsx` (تسمية القائمة)
- `App.tsx` (مسارات `/register` و`/explore`)

**Backend**

- `PublicController.php`
- `LeadController.php`
- `Models/User.php` (`taughtCourses`)
- `Models/Course.php` (`ratings`)
- `routes/api.php`
- migration توسيع `leads.source`

---

## 10) ما تبقّى (مرحلة لاحقة)

| بند | ملاحظة |
|-----|--------|
| CMS نصوص/صور الهبوط | جدول `landing_settings` مقترح سابقاً — غير منفّذ |
| Testimonials من الأدمن | لا model/API بعد — لا تُعرض آراء وهمية |
| عدّاد غرفة المذاكرة الحي | لا API عام — لا رقم ثابت |
| رفع صور `public/landing/` | اختياري؛ الـ Hero الحالي CSS mock لا يعتمد عليها |
| Code-splitting لحزمة JS | تحسين أداء فقط |

---

## 11) أوامر النشر بعد تعديل الهبوط

```bash
cd /home/baitpait/public_html/alyaqoutgroup
sudo -u baitpait git pull origin master
cd codes/backend && sudo -u baitpait php artisan migrate --force && sudo -u baitpait php artisan optimize:clear
cd ../frontend && sudo -u baitpait npm run build && sudo -u baitpait cp -r dist/. ../backend/public/
```

تحقق سريع:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://alyaqoutgroup.net/
curl -s -o /dev/null -w "%{http_code}\n" https://alyaqoutgroup.net/api/public/courses
```
