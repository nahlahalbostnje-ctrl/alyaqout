# دليل النشر والتشغيل — منصة الياقوت

> آخر تحديث: **2026-07-19**  
> الحالة: **منشور ويعمل** على `https://alyaqoutgroup.net`  
> فهرس التوثيق: [`docs/README.md`](docs/README.md)

---

## 1. نظرة عامة

| البند | القيمة |
|--------|--------|
| **المستودع** | https://github.com/nahlahalbostnje-ctrl/alyaqout |
| **الفرع** | `master` |
| **الدومين (الإنتاج)** | `https://alyaqoutgroup.net` |
| **Backend** | Laravel 12 — PHP 8.4 |
| **Frontend** | React 19 + Vite 8 + TypeScript |
| **قاعدة البيانات** | MySQL |
| **المصادقة** | JWT (`tymon/jwt-auth`) |
| **البث المباشر** | Agora |

---

## 2. مسارات السيرفر (Webuzo)

```
المشروع (Git):     /home/baitpait/public_html/alyaqoutgroup/
Backend:           .../codes/backend/
Document Root:     .../codes/backend/public/
Frontend (مصدر):   .../codes/frontend/
```

### ربط الدومين (Webuzo)

Webuzo يشير الدومين `alyaqoutgroup.net` إلى:

```
/home/baitpait/alyaqoutgroup
```

**الحل المعتمد:** symlink من ذلك المسار إلى `public`:

```bash
rm -rf /home/baitpait/alyaqoutgroup
ln -s /home/baitpait/public_html/alyaqoutgroup/codes/backend/public /home/baitpait/alyaqoutgroup
chmod 755 /home/baitpait/alyaqoutgroup
```

**بديل:** تغيير Document Root في Webuzo مباشرة إلى:

```
/home/baitpait/public_html/alyaqoutgroup/codes/backend/public
```

---

## 3. الصلاحيات (مهم — 403)

مجلد `alyaqoutgroup` كان `750` مما منع Apache (`nobody`) من الدخول.

```bash
chmod 755 /home/baitpait/public_html/alyaqoutgroup
chmod 755 /home/baitpait/public_html/alyaqoutgroup/codes
chmod 755 /home/baitpait/public_html/alyaqoutgroup/codes/backend
chmod 755 /home/baitpait/public_html/alyaqoutgroup/codes/backend/public
chmod -R 755 /home/baitpait/public_html/alyaqoutgroup/codes/backend/public/assets
chmod 644 /home/baitpait/public_html/alyaqoutgroup/codes/backend/public/.htaccess
chmod 644 /home/baitpait/public_html/alyaqoutgroup/codes/backend/public/index.html
chmod 644 /home/baitpait/public_html/alyaqoutgroup/codes/backend/public/index.php
```

**المالك:** `baitpait:baitpait` — نفّذ أوامر Laravel و Git و Composer كـ `sudo -u baitpait`.

---

## 4. ملف `.env` (الإنتاج)

الملف على السيرفر فقط (غير موجود في Git):

```
/home/baitpait/public_html/alyaqoutgroup/codes/backend/.env
```

### متغيرات أساسية

```env
APP_NAME="منصة الياقوت"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://alyaqoutgroup.net

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=baitpait_alyaqout
DB_USERNAME=baitpait_alyaqout
DB_PASSWORD=<من cPanel>

SESSION_DRIVER=database
SESSION_DOMAIN=.alyaqoutgroup.net

AGORA_APP_ID=<من Agora Console>
AGORA_APP_CERTIFICATE=<من Agora Console>
AGORA_TOKEN_EXPIRE=3600

JWT_SECRET=<يُولَّد بـ artisan jwt:secret>

WASENDER_API_KEY=
# اختبار فقط: كل رموز OTP تُرسل لهذا الرقم الواحد (مثال: +97059xxxxxxx). اتركه فارغاً في الإنتاج.
WASENDER_TEST_RECIPIENT=
PHONE_DEFAULT_COUNTRY=PS
```

### تثبيت OTP — المرحلة الحالية فقط (فلسطين + اختبار)

على السيرفر في `codes/backend/.env`:

```bash
# اختياري — إن وُجد يُرسل واتساب لرقم واحد فقط
WASENDER_API_KEY=
WASENDER_TEST_RECIPIENT=+97059xxxxxxx

# المرحلة الحالية: رمز ثابت + إظهاره في شاشة الدخول
OTP_FIXED_CODE=123456
OTP_SHOW_IN_RESPONSE=true
PHONE_DEFAULT_COUNTRY=PS
```

ثم:

```bash
cd /home/baitpait/public_html/alyaqoutgroup
sudo -u baitpait git pull origin master
cd codes/backend
sudo -u baitpait php artisan config:clear
sudo -u baitpait php artisan optimize:clear
```

**الاستخدام الآن:** دخول → جوال وواتساب → أي رقم مسجّل → الرمز `123456` يظهر في الشاشة (أو يُرسل لرقم الاختبار إن وُجد WaSender).

**عند الإنتاج الحقيقي:** امسح `OTP_FIXED_CODE` و`OTP_SHOW_IN_RESPONSE` و`WASENDER_TEST_RECIPIENT`، وأبقِ `WASENDER_API_KEY` فقط، ثم `config:clear`.

> بدون WaSender: الرمز يظهر في الواجهة.
> مع `WASENDER_TEST_RECIPIENT`: كل OTP يذهب لرقم واحد.
> فلسطين: تخزين `00970` وفحص `972` عند الإرسال الحقيقي.

### توليد المفاتيح (مرة واحدة)

```bash
cd /home/baitpait/public_html/alyaqoutgroup/codes/backend
sudo -u baitpait php artisan key:generate --force
sudo -u baitpait php artisan jwt:secret --force
```

### بعد تعديل `.env`

```bash
sudo -u baitpait php artisan config:clear
sudo -u baitpait php artisan optimize:clear
```

> **تحذير:** لا تضف تعليقات عربية أو أحرفاً stray في `.env` — يسبب `Failed to parse dotenv file`.

---

## 5. `.htaccess` — Laravel + React SPA

الملف: `codes/backend/public/.htaccess`

| المسار | التوجيه |
|--------|---------|
| `/` | `index.html` (React) — `DirectoryIndex index.html index.php` |
| `/api/*` | `index.php` (Laravel) |
| `/up` | `index.php` (health check) |
| `/assets/*`, `/storage/*` | ملفات ثابتة |
| `/dashboard`, `/login`, … | `index.html` (React Router) |

**لا تعدّل `.htaccess` يدوياً على السيرفر** — اسحبه من Git:

```bash
sudo -u baitpait git checkout -- codes/backend/public/.htaccess
sudo -u baitpait git pull origin master
```

---

## 6. النشر الأولي (من الصفر)

```bash
# 1. Clone
cd /home/baitpait/public_html
git clone https://github.com/nahlahalbostnje-ctrl/alyaqout.git alyaqoutgroup
chown -R baitpait:baitpait alyaqoutgroup

# 2. .env
cp codes/backend/.env.example codes/backend/.env
# عدّل القيم ثم:
chmod 600 codes/backend/.env

# 3. Backend
cd codes/backend
sudo -u baitpait composer install --no-dev --optimize-autoloader
sudo -u baitpait php artisan key:generate --force
sudo -u baitpait php artisan jwt:secret --force
sudo -u baitpait php artisan migrate --force
sudo -u baitpait php artisan db:seed --class=CountrySeeder --force
sudo -u baitpait php artisan db:seed --class=SuperAdminSeeder --force
sudo -u baitpait php artisan storage:link
sudo -u baitpait php artisan optimize:clear

# 4. Frontend
cd ../frontend
sudo -u baitpait npm install
sudo -u baitpait npm run build
sudo -u baitpait cp -r dist/. ../backend/public/

# 5. Symlink الدومين
ln -s /home/baitpait/public_html/alyaqoutgroup/codes/backend/public /home/baitpait/alyaqoutgroup

# 6. صلاحيات (انظر القسم 3)
```

---

## 7. تحديث الإنتاج (بعد كل push)

```bash
cd /home/baitpait/public_html/alyaqoutgroup

# إصلاح تعارضات Git الشائعة
chown -R baitpait:baitpait .git
sudo -u baitpait git checkout -- codes/backend/public/.htaccess 2>/dev/null
sudo -u baitpait git checkout -- codes/frontend/package-lock.json 2>/dev/null
sudo -u baitpait git pull origin master

# Backend
cd codes/backend
sudo -u baitpait composer install --no-dev --optimize-autoloader
sudo -u baitpait php artisan migrate --force
# seeders اختيارية — انظر القسم 9
sudo -u baitpait php artisan optimize:clear

# Frontend
# إن كنت أصلاً داخل codes/frontend فلا تُعد cd codes/frontend (سيفشل المسار)
cd ../frontend
sudo -u baitpait npm install    # npm ci قد يفشل — npm install بديل مقبول
sudo -u baitpait npm run build
sudo -u baitpait cp -r dist/. ../backend/public/
```

> **تحذير:** لا تستخدم `rsync --delete dist/ public/` — يحذف `index.php` و `.htaccess` و `storage` من Laravel ويكسر `/api` و `/login`.

### صور الصفحة الرئيسية (`landing/`)

المصدر: `codes/frontend/public/landing/` — التفاصيل في [`docs/LANDING_PAGE.md`](docs/LANDING_PAGE.md).

بعد وضع الصور أعد `npm run build` و `cp -r dist/. ../backend/public/` أو انسخ المجلد إلى:

```
codes/backend/public/landing/
```

### دليل الاستخدام (رابط داخلي خاص)

```
https://alyaqoutgroup.net/internal/docs/yg-3bb4b9c226a4.html
```

الملفات: `codes/backend/public/internal/docs/` — يُحدَّث عبر `git pull` دون حاجة لـ build.

**بعد النشر** تأكد أن `public/` يحتوي:
- `index.php` + `.htaccess` (Laravel)
- `index.html` + `assets/` (React)
- `storage` → symlink

```bash
ls -la codes/backend/public/index.php codes/backend/public/.htaccess
```

### التحقق من نجاح البناء

```bash
ls -la ../backend/public/assets/
# يجب أن يظهر ملف JS/CSS جديد (اسم hash يتغير كل build)
curl -s -o /dev/null -w "Home: %{http_code}\n" https://alyaqoutgroup.net/
curl -s https://alyaqoutgroup.net/api/public/countries | head -c 200
```

---

## 8. تسجيل الدخول

**الرابط:** https://alyaqoutgroup.net/login

**طريقتان:**

| الطريقة | لمن | التدفق |
|---------|-----|--------|
| **إيميل + كلمة سر** | سوبر أدمن، أدمن، معلم، مشرف | `POST /api/auth/login` |
| **جوال + OTP واتساب** | طالب، ولي أمر (وأي مستخدم له رقم) | `POST /api/auth/send-otp` ثم `POST /api/auth/verify-otp` |

التوجيه بعد الدخول حسب `role` (PrivateRoute + ROLE_ROUTES).

### حسابات الاختبار (بعد seed)

| الدور | إيميل | كلمة السر | جوال (OTP) |
|--------|--------|-----------|------------|
| سوبر أدمن | `super@alyaqout.net` | `Yaqoot@123` | `00962100000000` |
| أدمن | `admin@alyaqout.net` | `Yaqoot@123` | `00962200000000` |
| معلم | `teacher@alyaqout.net` | `Yaqoot@123` | `00962300000000` |
| مشرف | `supervisor@alyaqout.net` | `Yaqoot@123` | `00962600000000` |
| طالب | — | — | `00962400000000` |
| ولي أمر | — | — | `00962500000000` |

> بدون `WASENDER_API_KEY`: يظهر `debug_otp` في الاستجابة للاختبار. مع المفتاح: الرمز يُرسل واتساب فقط.
>
> **المرحلة الحالية:** `OTP_FIXED_CODE=123456` + `OTP_SHOW_IN_RESPONSE=true` (انظر قسم «تثبيت OTP» أعلاه). اختياري: `WASENDER_TEST_RECIPIENT` لرقم واتساب واحد.
>
> **فلسطين (`970` / `972`):** الأرقام المحلية `05…` → `00970…`. الإرسال الحقيقي يفحص 970 ثم 972.
> **دولة افتراضية:** `PHONE_DEFAULT_COUNTRY=PS` حتى تُفعَّل دول أخرى.

### API

```http
POST /api/auth/login
{ "email": "super@alyaqout.net", "password": "Yaqoot@123" }

POST /api/auth/send-otp
{ "phone": "00962400000000" }

POST /api/auth/verify-otp
{ "phone": "00962400000000", "otp": "123456" }
```

### حسابات فلسطين (تحتاج PalestineSeeder)

| الدور | الكلمة المفتاحية | الهاتف |
|--------|------------------|--------|
| أدمن | `ps_admin` | `00970444444444` |
| معلم | `ps_teacher` | `00970111111111` |
| طالب | `ps_student` | `00970222222221` |
| ولي أمر | `ps_parent` | `00970333333331` |
| مشرف | `ps_supervisor` | `00970555555551` |

---

## 9. Seeders

| Seeder | متى تُشغّله | ملاحظة |
|--------|-------------|--------|
| `CountrySeeder` | النشر الأول | الدول الأساسية |
| `SuperAdminSeeder` | النشر الأول | سوبر أدمن واحد |
| `TestUsersSeeder` | اختبار | 5 حسابات أردنية |
| `PalestineSeeder` | اختبار/demo | بيانات فلسطين كاملة |
| `EncouragementMessageSeeder` | بعد migration | رسائل تشجيع |
| `DatabaseSeeder` | **لا على الإنتاج** | يشغّل الكل بما فيها تجريبي |

```bash
sudo -u baitpait php artisan db:seed --class=TestUsersSeeder --force
sudo -u baitpait php artisan db:seed --class=PalestineSeeder --force
sudo -u baitpait php artisan db:seed --class=EncouragementMessageSeeder --force
```

---

## 10. Cron (تقارير يومية)

Laravel Scheduler يرسل تقارير الآباء يومياً الساعة 20:00:

```php
Schedule::command('yaqoot:daily-reports')->dailyAt('20:00');
```

**أضف في crontab للمستخدم `baitpait`:**

```cron
* * * * * cd /home/baitpait/public_html/alyaqoutgroup/codes/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 11. التطوير المحلي (Mac)

```bash
# Backend
cd codes/backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve

# Frontend (نافذة ثانية)
cd codes/frontend
npm install
npm run dev   # http://localhost:5175 — proxy /api → :8000
```

---

## 12. استكشاف الأخطاء

### 403 Forbidden

- صلاحيات مجلد `alyaqoutgroup` → `755` (انظر القسم 3)
- تحقق: `namei -l .../public/index.html`

### 404 من Webuzo (صفحة Softaculous)

- Document Root خاطئ — يجب symlink أو مسار `public` (القسم 2)
- تحقق: `grep -A5 alyaqoutgroup.net /var/webuzo/users/baitpait/info`

### 404 على `/dashboard` أو `/login`

- `.htaccess` قديم — لا يوجّه SPA إلى `index.html` (القسم 5)

### 500 على الصفحة الرئيسية

- Apache يشغّل `index.php` قبل `index.html`
- تأكد من `DirectoryIndex index.html index.php` في `.htaccess`

### `composer install` — PHP 8.4

- المشروع يستخدم `lcobucci/jwt` 5.x — متوافق مع PHP 8.4
- إذا فشل: `git pull` لآخر `composer.lock`

### 404 على `/api` أو `/up` — الدومين خاطئ

- الدومين الإنتاجي المعتمد: **`https://alyaqoutgroup.net`** (مُعدّ في Webuzo → `/home/baitpait/alyaqoutgroup`)
- **`alyaqoutgroup.com`** غير مُعدّ في Webuzo — يخدم `index.html` فقط (React) بدون توجيه `/api` و `/up` إلى Laravel
- تحقق:
  ```bash
  curl -s -o /dev/null -w "Health: %{http_code}\n" https://alyaqoutgroup.net/up
  curl -s -o /dev/null -w "API: %{http_code}\n" https://alyaqoutgroup.net/api/public/countries
  ```
- لربط `.com`: أضف addon في Webuzo بنفس Document Root، أو حوّل `.com` → `.net`

### `npm run build` — TS6133 متغير غير مستخدم

- مثال: `GOALS is declared but its value is never read` في `ParentDashboardPage.tsx`
- TypeScript strict يرفض build الإنتاج — احذف المتغير/الـ import غير المستخدم أو استخدمه
- **قبل push:** شغّل `npm run build` محلياً
- إصلاح مرجعي: commit `e933993`

### `npm ci` — lock file out of sync

```bash
sudo -u baitpait git checkout -- codes/frontend/package-lock.json
sudo -u baitpait git pull origin master
sudo -u baitpait npm install   # بديل npm ci
```

### `git pull` — تعارض `.htaccess` أو `package-lock.json`

```bash
sudo -u baitpait git checkout -- codes/backend/public/.htaccess
sudo -u baitpait git checkout -- codes/frontend/package-lock.json
sudo -u baitpait git pull origin master
```

### `Permission denied` على `.git/FETCH_HEAD`

```bash
chown -R baitpait:baitpait /home/baitpait/public_html/alyaqoutgroup/.git
```

### `Failed to parse dotenv` — حرف `[ش]`

- احذف أسطر عربية stray من `.env`:
  ```bash
  sudo -u baitpait sed -i '/^ش$/d' .env
  ```

### Laravel logs

```bash
tail -50 /home/baitpait/public_html/alyaqoutgroup/codes/backend/storage/logs/laravel.log
```

---

## 13. سجل النشر (Production Timeline)

| التاريخ | الحدث |
|---------|--------|
| 2026-06-25 | Clone، composer، migrate، seed، frontend build |
| 2026-06-25 | إصلاح PHP 8.4 (`lcobucci/jwt` 5.6) |
| 2026-06-25 | إصلاح `.env` (حرف stray) |
| 2026-06-25 | symlink `/home/baitpait/alyaqoutgroup` → `public` |
| 2026-06-25 | إصلاح 403 (chmod 755) + `.htaccess` SPA |
| 2026-06-25 | الدومين الصحيح: `alyaqoutgroup.net` |
| 2026-06-25 | `TestUsersSeeder` على الإنتاج |
| 2026-07-01 | Pull `06de54d` — migrations جديدة + صفحات |
| 2026-07-01 | Pull `fd314de` — إصلاح TypeScript + build `index-Wl-VvKzH.js` |
| 2026-07-06 | Pull `1389a94` — لوحات الطالب/ولي الأمر + إشعارات واتساب + Responsive |
| 2026-07-06 | فشل build: `GOALS` غير مستخدم في `ParentDashboardPage.tsx` (TS6133) |
| 2026-07-06 | إصلاح `e933993` — حذف `GOALS` + نشر ناجح على `alyaqoutgroup.net` |

---

## 14. Commits مهمة للنشر

| Commit | الوصف |
|--------|--------|
| `12accf5` | `lcobucci/jwt` لـ PHP 8.4 |
| `9f88e96` | `.htaccess` — `/api` + React SPA |
| `b98482a` | `DirectoryIndex index.html` |
| `06de54d` | ميزات: مدن، أمان، صفحات جديدة |
| `fd314de` | إصلاح build TypeScript |
| `1389a94` | لوحات الطالب/ولي الأمر + إشعارات واتساب + Responsive |
| `e933993` | إصلاح build — حذف `GOALS` غير المستخدم من `ParentDashboardPage.tsx` |

---

## 15. أمان — تذكير

- `.env` chmod `600` — لا يُرفع إلى Git
- `APP_DEBUG=false` على الإنتاج
- JWT + `SESSION_DOMAIN=.alyaqoutgroup.net`
- OTP: مرحلة حالية عبر `OTP_FIXED_CODE` / `WASENDER_TEST_RECIPIENT` — الإنتاج الحقيقي لاحقاً (مسح الرمز الثابت)
- لا تشغّل `DatabaseSeeder` الكامل على الإنتاج
