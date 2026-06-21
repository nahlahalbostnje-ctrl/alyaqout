import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateProfile } from '../features/auth/authSlice';
import SuperAdminLayout from '../components/SuperAdminLayout';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties,
};

export default function SuperAdminProfilePage() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);

  const [form, setForm]     = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
    : 'م';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await dispatch(updateProfile({ name: form.name, phone: form.phone })).unwrap();
      setMsg({ type: 'success', text: 'تم تحديث بياناتك بنجاح.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err as string });
    } finally { setSaving(false); }
  }

  return (
    <SuperAdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>الإعدادات</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#1B2038' }}>الملف الشخصي</h1>
          <p className="mt-1 text-sm" style={{ color: DK.dimTxt }}>إدارة بيانات حسابك الشخصي</p>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        <div className="max-w-2xl">

          {/* Avatar card */}
          <div
            className="rounded-2xl p-6 mb-5 flex items-center gap-5"
            style={DK.card}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff', boxShadow: '0 8px 24px rgba(201,149,42,0.25)' }}
            >
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#1B2038' }}>{user?.name}</p>
              <p className="text-sm mt-0.5 dir-ltr" style={{ color: DK.dimTxt }}>{user?.phone}</p>
              <span
                className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
              >
                سوبر أدمن
              </span>
            </div>
          </div>

          {/* Edit form */}
          <div className="rounded-2xl p-6" style={DK.card}>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: DK.gold }}>
              المعلومات الأساسية
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>الاسم الكامل</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    style={DK.inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                    onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>رقم الهاتف (واتساب)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    required
                    dir="ltr"
                    style={DK.inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                    onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                  />
                </div>
              </div>

              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="#3B82F6" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs" style={{ color: '#3B82F6' }}>
                  تسجيل الدخول يتم عبر رمز OTP على واتساب — لا توجد كلمة مرور. تأكد من صحة رقم الهاتف.
                </p>
              </div>

              {msg && (
                <div
                  className="text-sm px-4 py-3 rounded-xl"
                  style={msg.type === 'success'
                    ? { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.15)' }
                    : { background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }
                  }
                >
                  {msg.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="font-bold text-sm px-6 py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                >
                  {saving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </SuperAdminLayout>
  );
}
