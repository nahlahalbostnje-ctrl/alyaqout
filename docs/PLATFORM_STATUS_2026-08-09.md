# حالة المنصة — تحديث 2026-08-09

> يكمل ويحدّث [PLATFORM_STATUS_2026-07-19.md](./PLATFORM_STATUS_2026-07-19.md)  
> Commit مرجعي: `81e9999` · الإنتاج: https://alyaqoutgroup.net

---

## عام (بدون تسجيل) — محدّث

| الميزة | الحالة | مسار / ملاحظة |
|--------|--------|----------------|
| بوابة الهبوط (Landing + Gateway) | ✅ | `/` — انظر `LANDING_PAGE.md` |
| دخول كزائر | ✅ | `/explore` |
| طلب إنشاء حساب | ✅ | `/register` → Lead `source=register` |
| تسجيل الدخول | ✅ | `/login` |
| Leads | ✅ | `book_now` · `free_class` · `register` · `try_free` |
| Public: دورات / معلمون / حصص | ✅ | `/api/public/courses|teachers|live-classes` |
| Public: متصدرين / تحديات | ✅ | `/api/public/leaderboard|challenges` |
| FAQ / بانرات / سوشيال / إحصاءات | ✅ | كما سبق |

---

## مالية — سياسة 2026-08-09

| البند | الحالة |
|--------|--------|
| Payment Gateway (Stripe/PayPal/بطاقة) | ❌ غير موجود — **ممنوع في UX حالياً** |
| إدارة الاشتراكات | ✅ Admin + Parent packages |
| فواتير/أقساط لولي الأمر | ✅ `/parent/billing` — عرض + طباعة + تواصل إدارة |
| بانر اشتراك الطالب | ✅ نشط / ينتهي / منتهٍ |
| بنية قابلة للتوسع | ✅ Subscription → Invoice Status |

---

## ما بقي بعد هذا التحديث

1. CMS خفيف لنصوص/صور الهبوط من لوحة التحكم  
2. Testimonials قابلة للإدارة (بدون آراء وهمية)  
3. عدّاد حي لغرفة المذاكرة إن وُجد backend  
4. ربط/تفعيل عناصر «غير متاح بعد» حسب الأولوية التجارية  
5. Code-splitting لحزمة الواجهة الكبيرة  

---

## روابط سريعة

| الغرض | URL |
|--------|-----|
| الرئيسية | https://alyaqoutgroup.net/ |
| زائر | https://alyaqoutgroup.net/explore |
| تسجيل | https://alyaqoutgroup.net/register |
| دخول | https://alyaqoutgroup.net/login |
| توثيق الهبوط | [LANDING_PAGE.md](./LANDING_PAGE.md) |
