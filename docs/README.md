# فهرس التوثيق — منصة الياقوت

> آخر تحديث: **2026-07-19**  
> الإنتاج: https://alyaqoutgroup.net  
> المستودع: https://github.com/nahlahalbostnje-ctrl/alyaqout

---

## ابدأ من هنا

| الوثيقة | لمن؟ | المحتوى |
|---------|------|---------|
| [دليل الاستخدام HTML](./دليل-استخدام-منصة-الياقوت.html) | تدريب / مستخدمون | شرح كل دور وميزة في الواجهة |
| [حالة المنصة 2026-07-19](./PLATFORM_STATUS_2026-07-19.md) | فريق / مطوّر | جرد الميزات، الروابط، ما اكتمل وما بقي |
| [الصفحة الرئيسية](./LANDING_PAGE.md) | تصميم + فرونت | هيكل الهبوط، نصوص الثقة، مقاسات الصور |
| [../DEPLOYMENT.md](../DEPLOYMENT.md) | DevOps | نشر السيرفر، أوامر التحديث، أعطال شائعة |
| [../PROJECT_LOG.md](../PROJECT_LOG.md) | الفريق | سجل الجلسات الزمني |
| [../CHANGELOG.md](../CHANGELOG.md) | الجميع | ملخص إصدارات |
| [../CONSTITUTION.md](../CONSTITUTION.md) | مطوّرون | قواعد العمل والأمان |
| [../PRD_Yaqoot_Platform.md](../PRD_Yaqoot_Platform.md) | منتج | المتطلبات الأصلية |

---

## روابط إنتاج مهمة

| الغرض | الرابط |
|--------|--------|
| الموقع | https://alyaqoutgroup.net |
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
| `codes/frontend/public/landing/` | صور الصفحة الرئيسية (انظر LANDING_PAGE.md) |
| `codes/backend/public/internal/docs/` | دليل HTML المنشور داخلياً |
| `docs/` | مصدر التوثيق في المستودع |
