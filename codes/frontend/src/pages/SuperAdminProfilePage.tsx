import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateProfile } from '../features/auth/authSlice';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card,
  borderRadius: 18,
  padding: 20,
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
});

const inp = (): React.CSSProperties => ({
  background: C.bg,
  border: `1.5px solid ${C.border}`,
  color: C.text,
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  fontFamily: "'Cairo',sans-serif",
  boxSizing: 'border-box',
});

export default function SuperAdminProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
    : 'SA';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await dispatch(updateProfile({ name: form.name, phone: form.phone })).unwrap();
      setMsg({ type: 'success', text: 'تم تحديث بياناتك بنجاح.' });
    } catch (err: unknown) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'تعذّر حفظ التعديلات' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>الملف الشخصي</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>إدارة بيانات حسابك الشخصي</p>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div style={{ ...card(), marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: C.goldGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 22,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 6px 18px rgba(201,149,42,0.28)',
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>{user?.name}</p>
            <p style={{ color: C.sub, fontSize: 13, marginTop: 4, direction: 'ltr', textAlign: 'right' }}>{user?.phone}</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: C.goldGrad,
                color: '#1B2038',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              سوبر أدمن
            </span>
          </div>
        </div>

        <div style={card()}>
          <h3 style={{ color: C.gold, fontWeight: 800, fontSize: 12, margin: '0 0 16px' }}>المعلومات الأساسية</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', color: C.sub, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>الاسم الكامل</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  style={inp()}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: C.sub, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                  dir="ltr"
                  style={inp()}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.15)',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <p style={{ color: C.blue, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                تسجيل الدخول يتم عبر رمز OTP على واتساب — لا توجد كلمة مرور. تأكد من صحة رقم الهاتف.
              </p>
            </div>

            {msg && (
              <p
                style={{
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 14,
                  background: msg.type === 'success' ? 'rgba(22,163,74,0.08)' : 'rgba(239,68,68,0.08)',
                  color: msg.type === 'success' ? C.green : C.red,
                  border: `1px solid ${msg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                {msg.text}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '11px 22px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.goldGrad,
                  color: '#1B2038',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                {saving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SuperAdminShell>
  );
}
