import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios';
import BrandLogo from '../components/BrandLogo';
import { C, brand } from '../theme/palette';

const FONT = "'Cairo','Tajawal',sans-serif";

type Country = { id: number; name: string };

/**
 * طلب إنشاء حساب — بدون تسجيل ذاتي فوري وبدون Payment Gateway.
 * يرسل Lead للمراجعة الإدارية.
 */
export default function RegisterPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState({
    country_id: '', student_name: '', phone: '', school: '', region: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/public/countries').then(({ data }) => {
      const list: Country[] = data.countries ?? [];
      setCountries(list);
      if (list[0]) setForm(f => ({ ...f, country_id: String(list[0].id) }));
    }).catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setDone('');
    try {
      const { data } = await api.post('/leads', {
        ...form,
        country_id: Number(form.country_id),
        source: 'register',
        subjects: [],
      });
      setDone(data.message || 'شكراً! سنتواصل معك لإتمام إنشاء الحساب.');
    } catch {
      setErr('تعذّر إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', fontFamily: FONT, background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 460, background: C.card, borderRadius: 20,
        border: `1px solid ${C.border}`, boxShadow: C.shadowLg, padding: '28px 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <BrandLogo size={56} style={{ marginInline: 'auto' }} />
          <h1 style={{ margin: '14px 0 6px', fontSize: 22, fontWeight: 900, color: C.text }}>إنشاء حساب</h1>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
            أرسل طلبك وسيتواصل معك فريق الياقوت لإتمام التسجيل. لا حاجة لإدخال بيانات دفع.
          </p>
        </div>

        {done ? (
          <div style={{
            background: C.greenBg, border: `1px solid ${C.green}40`, borderRadius: 14,
            padding: 16, textAlign: 'center', color: C.green, fontWeight: 700, marginBottom: 16,
          }}>
            {done}
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={label}>
              الدولة
              <select
                required
                value={form.country_id}
                onChange={e => setForm(f => ({ ...f, country_id: e.target.value }))}
                style={input}
              >
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label style={label}>
              الاسم الكامل
              <input
                required
                value={form.student_name}
                onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
                style={input}
                placeholder="اسم الطالب أو ولي الأمر"
              />
            </label>
            <label style={label}>
              رقم الجوال
              <input
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                style={input}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </label>
            <label style={label}>
              المدرسة (اختياري)
              <input
                value={form.school}
                onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                style={input}
              />
            </label>
            <label style={label}>
              المنطقة (اختياري)
              <input
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                style={input}
              />
            </label>
            {err && <p style={{ margin: 0, color: C.red, fontSize: 13, fontWeight: 700 }}>{err}</p>}
            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 4, padding: '13px', borderRadius: 14, border: 'none', cursor: busy ? 'wait' : 'pointer',
                background: C.goldGrad, color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: FONT,
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? 'جارٍ الإرسال...' : 'إرسال طلب إنشاء الحساب'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 14,
          display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 13,
        }}>
          <Link to="/login" style={{ color: C.primary, fontWeight: 700, textDecoration: 'none' }}>لديك حساب؟ تسجيل الدخول</Link>
          <Link to="/explore" style={{ color: brand.gold, fontWeight: 700, textDecoration: 'none' }}>👁 دخول كزائر</Link>
          <Link to="/" style={{ color: C.sub, textDecoration: 'none' }}>الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

const label: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700, color: C.sub,
};

const input: CSSProperties = {
  padding: '11px 12px', borderRadius: 12, border: `1px solid ${C.border}`,
  fontFamily: FONT, fontSize: 14, color: C.text, background: C.bg, outline: 'none',
};
