# تسليم المبرمج — منصة الياقوت (alyaqout)

> تاريخ: **2026-07-13**  
> الفرع: `master`  
> المستودع: https://github.com/nahlahalbostnje-ctrl/alyaqout  
> آخر commit عند التسليم: `8068137`  
> الإنتاج: https://alyaqoutgroup.net  

---

## 1) سحب ونشر كامل على السيرفر

```bash
cd /home/baitpait/public_html/alyaqoutgroup

# صلاحيات Git إن لزم
chown -R baitpait:baitpait .git

sudo -u baitpait git fetch origin
sudo -u baitpait git pull origin master

# Backend
cd codes/backend
sudo -u baitpait composer install --no-dev --optimize-autoloader
sudo -u baitpait php artisan migrate --force
sudo -u baitpait php artisan optimize:clear

# Frontend (إلزامي لأي تغيير React)
cd ../frontend
sudo -u baitpait npm install
sudo -u baitpait npm run build
sudo -u baitpait cp -r dist/. ../backend/public/
```

**تحقق سريع:**

```bash
curl -s -o /dev/null -w "Home:%{http_code}\n" https://alyaqoutgroup.net/
curl -s -o /dev/null -w "Health:%{http_code}\n" https://alyaqoutgroup.net/up
curl -s https://alyaqoutgroup.net/api/public/faqs | head -c 200
```

> الدومين الصحيح: **alyaqoutgroup.net** (ليس `.com`).

---

## 2) OTP للمرحلة الحالية + QA (Quality Assurance)

### إعداد `.env` الموصى به للاختبار / QA

```bash
# codes/backend/.env

WASENDER_API_KEY=<مفتاح WaSender>
# اختياري: كل OTP واتساب يذهب لهذا الرقم الواحد فقط
WASENDER_TEST_RECIPIENT=+970598655197

# رمز ثابت للاختبار — يظهر في شاشة الدخول أيضاً
OTP_FIXED_CODE=123456
OTP_SHOW_IN_RESPONSE=true

PHONE_DEFAULT_COUNTRY=PS
APP_DEBUG=false
```

ثم:

```bash
sudo -u baitpait php artisan config:clear
sudo -u baitpait php artisan optimize:clear
```

| السيناريو | السلوك |
|-----------|--------|
| `OTP_FIXED_CODE=123456` | الرمز دائماً `123456` لأي مستخدم يطلب OTP |
| `OTP_SHOW_IN_RESPONSE=true` | الرمز يظهر في واجهة الدخول (`debug_otp`) |
| `WASENDER_TEST_RECIPIENT` مملوء | واتساب يُرسل لرقم واحد فقط (ليس لرقم كل مستخدم) |
| الثلاثة فارغة + `WASENDER_API_KEY` فقط | إنتاج: OTP عشوائي لكل رقم حقيقي (970 ثم 972) |

### اختبار OTP

```bash
curl -s -X POST https://alyaqoutgroup.net/api/auth/send-otp \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"phone":"0598655197"}' | python3 -m json.tool
```

### عند التحويل للإنتاج الحقيقي

امسح من `.env`:

- `OTP_FIXED_CODE`
- `OTP_SHOW_IN_RESPONSE`
- `WASENDER_TEST_RECIPIENT`

وأبقِ `WASENDER_API_KEY` فقط → `config:clear`.

---

## 3) أخطاء مهمة تم اكتشافها / إصلاحها

### أ) أرقام فلسطين `05…` في DB لا تطابق OTP

- **المشكلة:** أرقام مخزّنة كـ `0598655197` بينما OTP يطبّع إلى `00970598655197` → «رقم غير مسجل».
- **الحل في الكود:** `PhoneNormalizer` يوحّد التخزين إلى `00970…` ويفحص `972` عند واتساب.
- **إصلاح بيانات قديمة (شغّله مرة على السيرفر):**

```bash
cd /home/baitpait/public_html/alyaqoutgroup/codes/backend
sudo -u baitpait php artisan tinker --execute="
\$fixed=0;
App\Models\User::whereNull('deleted_at')->where('phone','like','0%')->where('phone','not like','00%')
  ->each(function(\$u) use (&\$fixed){
    \$new=App\Services\PhoneNormalizer::toStorage(\$u->phone);
    if(\$new!==\$u->phone){ echo \$u->id.' '.\$u->phone.' -> '.\$new.PHP_EOL; \$u->phone=\$new; \$u->save(); \$fixed++; }
  });
echo \"fixed=\$fixed\".PHP_EOL;
"
```

### ب) رسالة «رقم الجوال مسجّل مسبقاً»

- تعني محاولة **إضافة** حساب جديد برقم موجود.
- الحل: **تعديل** الحساب الحالي، لا إنشاء مكرر.

### ج) `WASENDER_TEST_RECIPIENT` يمنع وصول OTP لأرقام المعلمين

- إذا وُجدت القيمة → كل الرسائل لرقم الاختبار فقط (مقصود للـ QA).
- للإرسال الحقيقي: افرغ `WASENDER_TEST_RECIPIENT`.

### د) أخطاء بناء Frontend سابقة

- متغيرات TypeScript غير مستخدمة (`TS6133`) تكسر `npm run build`.
- **قبل كل push:** شغّل `npm run build` محلياً.

### هـ) `.env` و أحرف عربية stray

- لا تضع تعليقات عربية داخل `.env` → `Failed to parse dotenv file`.

### و) مفتاح WaSender ظهر في شات التشخيص

- يُفضّل تدوير `WASENDER_API_KEY` من لوحة WaSender وتحديث `.env`.

---

## 4) ما أصبح ديناميكياً مؤخراً (commits مهمة)

| Commit | الموضوع |
|--------|---------|
| `8068137` | أسئلة شائعة ديناميكية — سوبر أدمن فقط (`/dashboard/faqs`) |
| `ba1e46b` | مسؤولو الدولة: إزالة زر دخول + إيميل/باسورد إلزامي |
| `637c9b6` | طالب وولي أمر: إيميل + باسورد إلزامي للدخول |
| `4f7678d` / `3efbe7d` | OTP ثابت + رقم اختبار + تطبيع 970/972 |
| `0ea6dff` | المالية ببيانات حقيقية + فلاتر |
| `e92df8a` | Toast عربي بدل `alert` |
| `736ccaf` / `16f70a6` | تعديل/حذف في قوائم الإدارة والكادر |
| `2f7954e` | فلتر تاريخ في سجل العمليات |
| `8b165f3` / `d46850d` | تبويب طلاب/أولياء + زر عرض الطلاب |

### الأسئلة الشائعة

- إدارة: سوبر أدمن → `/dashboard/faqs`
- عرض عام: الصفحة الرئيسية عبر `GET /api/public/faqs`
- أدمن الدولة **لم يعد** يدير FAQ
- بعد السحب: `php artisan migrate --force` (migration تجعل `country_id` nullable)

### تسجيل الدخول

| الدور | إيميل/باسورد | OTP جوال |
|--------|---------------|----------|
| سوبر أدمن / أدمن / معلم / مشرف | نعم | نعم إن وُجد رقم |
| طالب / ولي أمر | **مطلوب عند الإنشاء** | نعم |
| أدمن دولة | **مطلوب عند الإنشاء** | نعم |

صفحة الدخول: تبويب «إيميل وكلمة سر» لجميع الأدوار أعلاه.

---

## 5) ما يزال يحتاج أن يصبح ديناميكياً (Backlog للمبرمج)

راجع أيضاً `PROJECT_LOG.md` و stubs في الواجهة. أولويات مقترحة:

1. **صفحات Stub / Empty** عند الطالب وولي الأمر (مكتبة، مواهب، تحديات، كبسولة زمنية، فيديوهات مراجعة، دراسة 24، …) — تحتاج APIs.
2. **دعم فني / تذاكر** (`/dashboard/support`) — غالباً واجهة بلا backend كامل.
3. **مركز التطوير / webhooks / PDF** — أزرار معطّلة أو وهمية.
4. **صفحات CMS لأدمن الدولة** (صفحات about/privacy) — ما زالت لأدمن الدولة؛ FAQ انتقلت لسوبر أدمن.
5. **تعدد الدول بالكامل** — المنصة حالياً افتراض `PHONE_DEFAULT_COUNTRY=PS`؛ توسيع دول لاحقاً بدون كسر التطبيع.
6. **إشعارات واتساب للإنتاج** — بعد إيقاف وضع QA OTP.
7. **توحيد كل أرقام الهواتف** في DB إلى `00970…` (أمر tinker أعلاه).
8. **حسابات قديمة** بلا `email`/`password` (طلاب/أولياء/أدمن دول) — تحتاج تعبئة يدوية أو سكربت seed كلمات مرور مؤقتة للـ QA.

---

## 6) مسارات مفيدة للمبرمج

```
المشروع (Git):   /home/baitpait/public_html/alyaqoutgroup/
Backend:         .../codes/backend/
Frontend:        .../codes/frontend/
Document Root:   .../codes/backend/public/  (+ symlink /home/baitpait/alyaqoutgroup)
```

| مسار | الدور |
|------|--------|
| `/dashboard/*` | سوبر أدمن |
| `/admin/*` | أدمن دولة |
| `/teacher/*` | معلم |
| `/student/*` | طالب |
| `/parent/*` | ولي أمر |
| `/supervisor/*` | مشرف |
| `/login` | دخول (إيميل أو OTP) |

وثائق: `DEPLOYMENT.md` · `PROJECT_LOG.md` · هذا الملف.

---

## 7) Checklist بدء عمل المبرمج التالي

- [ ] `git pull origin master` + `migrate` + `npm run build` + `cp dist`
- [ ] التأكد من `.env` (OTP QA أو إنتاج)
- [ ] تشغيل أمر تطبيع أرقام `05…` → `00970…`
- [ ] تجربة دخول معلم: إيميل + باسورد، و OTP بـ `123456` إن كان وضع QA
- [ ] تجربة `/dashboard/faqs` وإظهار سؤال في الصفحة الرئيسية
- [ ] عدم commit لـ `.env` أو مفاتيح API
- [ ] `npm run build` قبل كل push

---

## 8) حسابات اختبار شائعة (إن وُجدت في Seeder)

انظر `DEPLOYMENT.md` قسم الحسابات — أمثلة قديمة:

- سوبر أدمن: غالباً `super@alyaqout.net` / راجع السيدر
- معلم مثال على الإنتاج (بعد التشخيص): id=7 · هاتف كان `0598655197` · إيميل `aa@aa.com`

> حدّث كلمات المرور في الإنتاج بعد QA.

---

*نهاية ملف التسليم — حدّثه بعد كل مرحلة كبيرة.*
