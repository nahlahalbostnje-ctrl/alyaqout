# دليل النشر والتشغيل — منصة الياقوت

> آخر تحديث: **2026-07-01**  
> الحالة: **منشور ويعمل** على `https://alyaqoutgroup.net`

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
WASENDER_TEST_RECIPIENT=
```

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
cd ../frontend
sudo -u baitpait npm install    # npm ci قد يفشل — npm install بديل مقبول
sudo -u baitpait npm run build
sudo -u baitpait cp -r dist/. ../backend/public/
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

**الآلية:** حقل «الكلمة المفتاحية» → يُحوَّل إلى رقم هاتف → JWT. **لا كلمة مرور** (OTP معطّل حالياً للاختبار).

### حسابات الأردن (موجودة على الإنتاج)

| الدور | الكلمة المفتاحية | الهاتف | الصفحة بعد الدخول |
|--------|------------------|--------|-------------------|
| سوبر أدمن | `super` | `00962100000000` | `/dashboard` |
| أدمن دولة | `admin` | `00962200000000` | `/admin/dashboard` |
| معلم | `teacher` | `00962300000000` | `/teacher/dashboard` |
| طالب | `student` | `00962400000000` | `/student/dashboard` |
| ولي أمر | `parent` | `00962500000000` | `/parent/dashboard` |
| مشرف | `supervisor` | `00962600000000` | `/supervisor/students` |

### حسابات فلسطين (تحتاج PalestineSeeder)

| الدور | الكلمة المفتاحية | الهاتف |
|--------|------------------|--------|
| أدمن | `ps_admin` | `00970444444444` |
| معلم | `ps_teacher` | `00970111111111` |
| طالب | `ps_student` | `00970222222221` |
| ولي أمر | `ps_parent` | `00970333333331` |
| مشرف | `ps_supervisor` | `00970555555551` |

### API المصادقة

```http
POST /api/auth/login
Content-Type: application/json

{ "phone": "00962100000000" }
```

```http
GET /api/auth/me
Authorization: Bearer <token>
```

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

---

## 14. Commits مهمة للنشر

| Commit | الوصف |
|--------|--------|
| `12accf5` | `lcobucci/jwt` لـ PHP 8.4 |
| `9f88e96` | `.htaccess` — `/api` + React SPA |
| `b98482a` | `DirectoryIndex index.html` |
| `06de54d` | ميزات: مدن، أمان، صفحات جديدة |
| `fd314de` | إصلاح build TypeScript |

---

## 15. أمان — تذكير

- `.env` chmod `600` — لا يُرفع إلى Git
- `APP_DEBUG=false` على الإنتاج
- JWT + `SESSION_DOMAIN=.alyaqoutgroup.net`
- OTP/WaSender غير مفعّل حالياً — تفعيله لاحقاً للإنتاج الحقيقي
- لا تشغّل `DatabaseSeeder` الكامل على الإنتاج
