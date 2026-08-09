# الصفحة الرئيسية — بوابة الزائر

> تحديث: 2026-08-09  
> الملف: `codes/frontend/src/pages/LandingPage.tsx`

---

## الهدف

**Educational Landing Page + Visitor Gateway** — ليس صفحة دخول فقط.

الزائر يفهم خلال ثوانٍ: ما الياقوت؟ ماذا تقدم؟ لمن؟ كيف يسجّل؟ وكيف يستكشف كزائر؟

---

## المسارات العامة

| المسار | الوظيفة |
|--------|---------|
| `/` | الصفحة الرئيسية |
| `/explore` | وضع الزائر (استكشاف محدود) |
| `/register` | طلب إنشاء حساب (Lead → إدارة) |
| `/login` | تسجيل الدخول |

---

## Visitor Mode

- تفعيل عبر `enterVisitorMode()` → `sessionStorage`
- الخدمات المغلقة تظهر `VisitorGateDialog` (إنشاء حساب / متابعة كزائر)
- **لا يوجد Payment Gateway** في أي تدفق عام

---

## Public APIs

| Endpoint | الاستخدام |
|----------|-----------|
| `GET /api/public/countries` | اختيار الدولة |
| `GET /api/public/faqs` | الأسئلة |
| `GET /api/public/stats` | أرقام حقيقية (بعتبة عرض) |
| `GET /api/public/banners` | بانرات |
| `GET /api/public/social` | سوشيال |
| `GET /api/public/courses` | بطاقات الدورات |
| `GET /api/public/teachers` | المعلمون |
| `GET /api/public/live-classes` | الحصص |
| `GET /api/public/leaderboard` | المتصدرون (اسم مختصر) |
| `GET /api/public/challenges` | التحديات |
| `POST /api/leads` | `book_now` \| `free_class` \| `register` \| `try_free` |

### عتبة الإحصاءات (`STATS_MIN`)

أرقام فقط إذا: طلاب ≥ 50 أو معلمون ≥ 5 أو دول ≥ 3 — وإلا نصوص ثقة بدون أرقام وهمية.

---

## الاشتراكات والفواتير

البنية: **Subscription → Invoice/Installment → Status**

- بدون Stripe / PayPal / بطاقات / Checkout
- ولي الأمر: `/parent/billing` = إدارة مستحقات + طباعة فاتورة + تواصل مع الإدارة
- الطالب: بانر حالة الاشتراك في الداشبورد

---

## الهوية

انظر `docs/THEME.md` — أزرق هادئ + كحلي + أبيض + ذهب نادر.
