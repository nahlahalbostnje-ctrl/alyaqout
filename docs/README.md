# فهرس التوثيق — منصة الياقوت

> آخر تحديث: **2026-08-09** (بوابة الزائر + فواتير بلا دفع)  
> الإنتاج: https://alyaqoutgroup.net  
> المستودع: https://github.com/nahlahalbostnje-ctrl/alyaqout  
> Commit مرجعي للهبوط: `81e9999`

---

## ابدأ من هنا

| الوثيقة | لمن؟ | المحتوى |
|---------|------|---------|
| [الصفحة الرئيسية / بوابة الزائر](./LANDING_PAGE.md) | تصميم + فرونت + منتج | أقسام الهبوط، Visitor Mode، Public APIs، اشتراكات بلا Gateway |
| [حالة المنصة 2026-08-09](./PLATFORM_STATUS_2026-08-09.md) | فريق / مطوّر | تحديث الجرد بعد بوابة الزائر |
| [حالة المنصة 2026-07-19](./PLATFORM_STATUS_2026-07-19.md) | فريق / مطوّر | جرد سابق (أدوار وبوابات داخلية) |
| [ثيم الواجهة](./THEME.md) | تصميم + فرونت | ألوان، نسب، قواعد الذهب/الأزرق |
| [دليل الاستخدام HTML](./دليل-استخدام-منصة-الياقوت.html) | تدريب / مستخدمون | شرح كل دور وميزة |
| [../DEPLOYMENT.md](../DEPLOYMENT.md) | DevOps | نشر السيرفر، أوامر التحديث |
| [../PROJECT_LOG.md](../PROJECT_LOG.md) | الفريق | سجل الجلسات |
| [../CHANGELOG.md](../CHANGELOG.md) | الجميع | ملخص إصدارات |
| [../CONSTITUTION.md](../CONSTITUTION.md) | مطوّرون | قواعد العمل والأمان |
| [../PRD_Yaqoot_Platform.md](../PRD_Yaqoot_Platform.md) | منتج | المتطلبات الأصلية |

---

## روابط إنتاج مهمة

| الغرض | الرابط |
|--------|--------|
| الموقع / البوابة | https://alyaqoutgroup.net/ |
| دخول كزائر | https://alyaqoutgroup.net/explore |
| إنشاء حساب (طلب) | https://alyaqoutgroup.net/register |
| تسجيل الدخول | https://alyaqoutgroup.net/login |
| **دليل الاستخدام (رابط خاص)** | https://alyaqoutgroup.net/internal/docs/yg-3bb4b9c226a4.html |

> الرابط الخاص غير مربوط بالقوائم — لا تنشره علناً.

---

## أوامر التحديث السريعة (إنتاج)

```bash
cd /home/baitpait/public_html/alyaqoutgroup
sudo -u baitpait git pull origin master
cd codes/backend && php artisan migrate --force && php artisan optimize:clear
cd ../frontend && npm run build && cp -r dist/. ../backend/public/
```

**ملاحظة مسار:** إن كنت داخل `codes/frontend` مسبقاً فلا تكتب `cd codes/frontend` مرة أخرى — نفّذ `npm run build` مباشرة.

---

## مجلدات الأصول

| المسار | الاستخدام |
|--------|-----------|
| `codes/frontend/public/landing/` | صور اختيارية للهبوط (الـ Hero الحالي CSS mock) |
| `codes/frontend/src/features/visitor/` | منطق وضع الزائر |
| `codes/frontend/src/pages/visitor/` | صفحة الاستكشاف |
| `codes/backend/public/internal/docs/` | دليل HTML الداخلي |
| `docs/` | مصدر التوثيق في المستودع |
