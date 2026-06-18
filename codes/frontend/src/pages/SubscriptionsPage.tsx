import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSubscriptions, addSubscription, cancelSubscription,
} from '../features/admin/subscriptionsSlice';
import { fetchUsers }    from '../features/admin/usersSlice';
import { fetchPackages } from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';
import type { Subscription } from '../features/admin/subscriptionsSlice';

type FilterStatus = 'all' | 'active' | 'expired' | 'cancelled' | 'pending';

const STATUS_LABEL: Record<string, string> = {
  active: 'فعّال', expired: 'منتهي', cancelled: 'ملغى', pending: 'معلّق',
};
const STATUS_STYLE: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  expired:   'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
  pending:   'bg-amber-100 text-amber-700',
};
const PAYMENT_LABEL: Record<string, string> = {
  paid: 'مدفوع', pending: 'بانتظار الدفع', refunded: 'مسترجع',
};
const PAYMENT_STYLE: Record<string, string> = {
  paid:     'bg-teal-50 text-teal-700',
  pending:  'bg-amber-50 text-amber-700',
  refunded: 'bg-red-50 text-red-600',
};

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((days / total) * 100)) : 0;
  const color = pct > 50 ? 'bg-emerald-400' : pct > 20 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-16 text-left">{days} يوم</span>
    </div>
  );
}

export default function SubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { items, stats, loading, error } = useAppSelector((s) => s.subscriptions);
  const students = useAppSelector((s) => s.adminUsers.list.filter((u) => u.role === 'student'));
  const packages = useAppSelector((s) => s.packages.list.filter((p) => p.is_active));

  const [filter, setFilter]   = useState<FilterStatus>('all');
  const [showModal, setModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    package_id: '',
    starts_at: new Date().toISOString().split('T')[0],
    payment_method: 'manual',
    payment_status: 'paid',
    amount_paid: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchSubscriptions(filter === 'all' ? {} : { status: filter }));
    dispatch(fetchUsers('student'));
    dispatch(fetchPackages());
  }, [dispatch, filter]);

  const openModal = () => { setFormError(''); setModal(true); };
  const closeModal = () => { setModal(false); setFormError(''); setSubmitting(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.package_id) {
      setFormError('يرجى اختيار الطالب والباقة.');
      return;
    }
    setSubmitting(true);
    const res = await dispatch(addSubscription({
      student_id:     Number(form.student_id),
      package_id:     Number(form.package_id),
      starts_at:      form.starts_at,
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      amount_paid:    form.amount_paid ? Number(form.amount_paid) : undefined,
      notes:          form.notes || undefined,
    }));
    if (addSubscription.fulfilled.match(res)) {
      closeModal();
      setForm({ student_id: '', package_id: '', starts_at: new Date().toISOString().split('T')[0], payment_method: 'manual', payment_status: 'paid', amount_paid: '', notes: '' });
    } else {
      setFormError((res.payload as string) || 'حدث خطأ.');
      setSubmitting(false);
    }
  };

  const handleCancel = async (sub: Subscription) => {
    if (!confirm(`هل تريد إلغاء اشتراك ${sub.student.name}؟`)) return;
    await dispatch(cancelSubscription(sub.id));
  };

  const filterTabs: { key: FilterStatus; label: string; count: number; color: string }[] = [
    { key: 'all',       label: 'الكل',     count: stats.total,     color: 'text-slate-600' },
    { key: 'active',    label: 'فعّالة',   count: stats.active,    color: 'text-emerald-600' },
    { key: 'expired',   label: 'منتهية',   count: stats.expired,   color: 'text-slate-400' },
    { key: 'cancelled', label: 'ملغاة',    count: stats.cancelled, color: 'text-red-500' },
    { key: 'pending',   label: 'معلّقة',   count: stats.pending,   color: 'text-amber-600' },
  ];

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">الاشتراكات</h2>
            <p className="text-slate-400 text-sm mt-1">إدارة اشتراكات الطلاب والباقات المفعّلة</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            اشتراك جديد
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'فعّالة',  value: stats.active,    from: 'from-emerald-500', to: 'to-teal-600',   bg: 'from-emerald-50 to-teal-50' },
            { label: 'منتهية',  value: stats.expired,   from: 'from-slate-400',  to: 'to-slate-500',  bg: 'from-slate-50 to-gray-50' },
            { label: 'ملغاة',   value: stats.cancelled, from: 'from-red-400',    to: 'to-rose-500',   bg: 'from-red-50 to-rose-50' },
            { label: 'معلّقة',  value: stats.pending,   from: 'from-amber-400',  to: 'to-orange-500', bg: 'from-amber-50 to-orange-50' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.from} ${s.to} shadow-md`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 w-fit shadow-sm border border-slate-100 mb-6">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === t.key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : `${t.color} hover:bg-slate-50`
              }`}
            >
              {t.label}
              <span className={`mr-1.5 text-xs ${filter === t.key ? 'text-teal-100' : 'text-slate-400'}`}>
                ({t.count})
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm mb-4">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            {items.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['الطالب', 'الباقة', 'تاريخ البداية', 'تاريخ الانتهاء', 'المتبقي', 'الحالة', 'الدفع', 'المبلغ', ''].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">{sub.student.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{sub.student.phone}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{sub.package.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{sub.package.duration_days} يوم</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{sub.starts_at}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{sub.ends_at}</td>
                        <td className="px-5 py-4 min-w-[130px]">
                          {sub.status === 'active'
                            ? <DaysBar days={sub.days_remaining} total={sub.package.duration_days} />
                            : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[sub.status]}`}>
                            {STATUS_LABEL[sub.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${PAYMENT_STYLE[sub.payment_status]}`}>
                            {PAYMENT_LABEL[sub.payment_status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-teal-700 whitespace-nowrap">
                          {Number(sub.amount_paid).toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleCancel(sub)}
                              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                              إلغاء
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-3xl mb-4">📋</div>
                <p className="text-slate-500 font-medium">لا توجد اشتراكات</p>
                <p className="text-slate-400 text-sm mt-1">أضف اشتراكاً جديداً للبدء</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #f0fdfa, #f0f9ff)' }}>
              <div>
                <h3 className="text-lg font-bold text-slate-800">اشتراك جديد</h3>
                <p className="text-slate-400 text-sm mt-0.5">تفعيل اشتراك يدوي لطالب</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">الطالب *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
                >
                  <option value="">اختر الطالب...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>
                  ))}
                </select>
              </div>

              {/* Package */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">الباقة *</label>
                <select
                  value={form.package_id}
                  onChange={(e) => {
                    const pkg = packages.find((p) => p.id === Number(e.target.value));
                    setForm({ ...form, package_id: e.target.value, amount_paid: pkg ? pkg.price : '' });
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
                >
                  <option value="">اختر الباقة...</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.duration_days} يوم — {p.price}</option>
                  ))}
                </select>
              </div>

              {/* Starts at + Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاريخ البداية *</label>
                  <input
                    type="date"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={form.amount_paid}
                    onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Payment status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">حالة الدفع</label>
                <div className="flex gap-2">
                  {[
                    { v: 'paid',    l: 'مدفوع' },
                    { v: 'pending', l: 'بانتظار الدفع' },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setForm({ ...form, payment_status: opt.v })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.payment_status === opt.v
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="مثلاً: حوالة بنكية رقم #..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 resize-none"
                />
              </div>

              {formError && (
                <p className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
                >
                  {submitting ? 'جاري التفعيل...' : 'تفعيل الاشتراك'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
