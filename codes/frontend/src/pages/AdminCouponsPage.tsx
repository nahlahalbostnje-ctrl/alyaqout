import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">الكوبونات</h2>
            <p className="text-sm text-gray-400 mt-1">إدارة كوبونات الخصم للاشتراكات</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            كوبون جديد
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">إنشاء كوبون جديد</h3>

              {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">كود الكوبون</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 uppercase tracking-widest"
                    placeholder="SAVE20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">نوع الخصم</label>
                    <select
                      value={form.discount_type}
                      onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      قيمة الخصم {form.discount_type === 'percentage' ? '(%)' : ''}
                    </label>
                    <input
                      required
                      type="number"
                      min="0.01"
                      max={form.discount_type === 'percentage' ? 100 : undefined}
                      step="0.01"
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">أقصى عدد استخدامات</label>
                    <input
                      type="number"
                      min="1"
                      value={form.max_uses}
                      onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="بلا حد"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">النطاق</label>
                  <select
                    value={form.scope}
                    onChange={(e) => setForm({ ...form, scope: e.target.value as 'all' | 'specific_course' })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="all">جميع الدورات</option>
                    <option value="specific_course">دورة محددة</option>
                  </select>
                </div>

                {form.scope === 'specific_course' && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">رقم الدورة (ID)</label>
                    <input
                      type="number"
                      value={form.course_id}
                      onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="1"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'إنشاء الكوبون'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

        {!loading && coupons.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="text-gray-500 font-semibold">لا توجد كوبونات بعد</p>
            <p className="text-gray-400 text-sm mt-1">أنشئ أول كوبون خصم للطلاب</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {coupons.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold">الكود</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold">الخصم</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold">الاستخدام</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold">ينتهي</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-semibold">الحالة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700 tracking-widest">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `${coupon.discount_value} د.ا`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.used_count} / {coupon.max_uses ?? '∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(coupon.expires_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {coupon.is_active ? 'فعّال' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggle(coupon)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition font-semibold ${coupon.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {coupon.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
