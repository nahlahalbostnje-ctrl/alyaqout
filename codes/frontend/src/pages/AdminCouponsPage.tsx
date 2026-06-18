import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

interface Coupon {
  id:             number;
  code:           string;
  discount_type:  'percentage' | 'fixed';
  discount_value: number;
  max_uses:       number | null;
  used_count:     number;
  expires_at:     string | null;
  scope:          'all' | 'specific_course';
  course_id:      number | null;
  is_active:      boolean;
  course?:        { id: number; title: string } | null;
}

const emptyForm = {
  code:           '',
  discount_type:  'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  max_uses:       '',
  expires_at:     '',
  scope:          'all' as 'all' | 'specific_course',
  course_id:      '',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons]   = useState<Coupon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.coupons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/coupons', {
        code:           form.code.toUpperCase(),
        discount_type:  form.discount_type,
        discount_value: parseFloat(form.discount_value),
        max_uses:       form.max_uses ? parseInt(form.max_uses) : null,
        expires_at:     form.expires_at || null,
        scope:          form.scope,
        course_id:      form.scope === 'specific_course' && form.course_id ? parseInt(form.course_id) : null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e.response?.data?.errors;
      if (msgs) {
        setError(Object.values(msgs).flat().join(' • '));
      } else {
        setError(e.response?.data?.message || 'حدث خطأ');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.patch(`/admin/coupons/${coupon.id}/toggle`);
      await load();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الكوبون؟')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #f5a623' : '1px solid rgba(245,166,35,0.15)',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <div>
              <h2 className="text-xl font-bold text-white">الكوبونات</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إدارة كوبونات الخصم للاشتراكات</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setError(null); }}
            className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
            + كوبون جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="font-semibold text-white mb-1">لا توجد كوبونات بعد</p>
            <p className="text-sm" style={{ color: DK.dimTxt }}>أنشئ أول كوبون خصم للطلاب</p>
          </div>
        ) : (
          <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                <tr>
                  {['الكود', 'الخصم', 'الاستخدام', 'ينتهي', 'الحالة', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                      style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="transition"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3 font-mono font-bold tracking-widest" style={{ color: DK.gold }}>
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `${coupon.discount_value} ر.س`}
                    </td>
                    <td className="px-4 py-3" style={{ color: DK.dimTxt }}>
                      {coupon.used_count} / {coupon.max_uses ?? '∞'}
                    </td>
                    <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{formatDate(coupon.expires_at)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={coupon.is_active
                          ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' }
                          : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                        {coupon.is_active ? 'فعّال' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleToggle(coupon)}
                          className="text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                          style={coupon.is_active
                            ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                            : { background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                          {coupon.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button onClick={() => handleDelete(coupon.id)}
                          className="text-xs px-3 py-1.5 rounded-lg transition"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleCreate} className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)' }}>
            <h3 className="text-lg font-bold text-white mb-4">إنشاء كوبون جديد</h3>

            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>كود الكوبون</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SAVE20" className="uppercase tracking-widest"
                  onFocus={() => setFocusedInput('code')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('code')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>نوع الخصم</label>
                  <select value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    onFocus={() => setFocusedInput('dtype')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('dtype'), cursor: 'pointer' }}>
                    <option value="percentage" style={{ background: '#070e22' }}>نسبة مئوية (%)</option>
                    <option value="fixed"      style={{ background: '#070e22' }}>مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>
                    قيمة الخصم {form.discount_type === 'percentage' ? '(%)' : ''}
                  </label>
                  <input required type="number" min="0.01" step="0.01"
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder="20" dir="ltr"
                    onFocus={() => setFocusedInput('dval')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('dval')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>أقصى استخدامات</label>
                  <input type="number" min="1" value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="بلا حد" dir="ltr"
                    onFocus={() => setFocusedInput('maxuses')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('maxuses')} />
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>تاريخ الانتهاء</label>
                  <input type="date" value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    onFocus={() => setFocusedInput('exp')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('exp'), colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>النطاق</label>
                <select value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value as 'all' | 'specific_course' })}
                  onFocus={() => setFocusedInput('scope')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('scope'), cursor: 'pointer' }}>
                  <option value="all"             style={{ background: '#070e22' }}>جميع الدورات</option>
                  <option value="specific_course" style={{ background: '#070e22' }}>دورة محددة</option>
                </select>
              </div>
              {form.scope === 'specific_course' && (
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>رقم الدورة (ID)</label>
                  <input type="number" value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    placeholder="1" dir="ltr"
                    onFocus={() => setFocusedInput('cid')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('cid')} />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                {saving ? 'جاري الحفظ...' : 'إنشاء الكوبون'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
