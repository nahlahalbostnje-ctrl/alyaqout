import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>الكوبونات</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إدارة كوبونات الخصم للاشتراكات</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setError(null); }}
            className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
            + كوبون جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="font-semibold mb-1" style={{ color: '#1B2038' }}>لا توجد كوبونات بعد</p>
            <p className="text-sm" style={{ color: DK.dimTxt }}>أنشئ أول كوبون خصم للطلاب</p>
          </div>
        ) : (
          <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                <tr>
                  {['الكود', 'الخصم', 'الاستخدام', 'ينتهي', 'الحالة', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                      style={{ color: DK.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="transition"
                    style={{ borderBottom: '1px solid #EDE3CE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3 font-mono font-bold tracking-widest" style={{ color: DK.gold }}>
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1B2038' }}>
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
                          ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                          : { background: '#F9FAFB', color: DK.dimTxt }}>
                        {coupon.is_active ? 'فعّال' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleToggle(coupon)}
                          className="text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                          style={coupon.is_active
                            ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                          {coupon.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button onClick={() => handleDelete(coupon.id)}
                          className="text-xs px-3 py-1.5 rounded-lg transition"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
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
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleCreate} className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1B2038' }}>إنشاء كوبون جديد</h3>

            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>}

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
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
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
                    style={inputStyle('exp')} />
                </div>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>النطاق</label>
                <select value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value as 'all' | 'specific_course' })}
                  onFocus={() => setFocusedInput('scope')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('scope'), cursor: 'pointer' }}>
                  <option value="all">جميع الدورات</option>
                  <option value="specific_course">دورة محددة</option>
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
                style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                {saving ? 'جاري الحفظ...' : 'إنشاء الكوبون'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
