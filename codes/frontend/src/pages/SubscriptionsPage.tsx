import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSubscriptions, addSubscription, cancelSubscription,
} from '../features/admin/subscriptionsSlice';
import { fetchUsers }    from '../features/admin/usersSlice';
import { fetchPackages } from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';
import type { Subscription } from '../features/admin/subscriptionsSlice';

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

type FilterStatus = 'all' | 'active' | 'expired' | 'cancelled' | 'pending';

const STATUS_LABEL: Record<string, string> = {
  active: 'فعّال', expired: 'منتهي', cancelled: 'ملغى', pending: 'معلّق',
};

function statusStyle(s: string) {
  if (s === 'active')    return { background: 'rgba(16,185,129,0.08)',  color: '#10B981' };
  if (s === 'cancelled') return { background: 'rgba(239,68,68,0.08)',   color: '#EF4444' };
  if (s === 'pending')   return { background: 'rgba(245,158,11,0.08)',  color: '#F59E0B' };
  return { background: '#F9FAFB', color: '#6B7280' };
}

function paymentStyle(s: string) {
  if (s === 'paid')     return { background: 'rgba(16,185,129,0.08)', color: '#10B981' };
  if (s === 'pending')  return { background: 'rgba(245,158,11,0.08)', color: '#F59E0B' };
  return { background: 'rgba(239,68,68,0.08)', color: '#EF4444' };
}

const PAYMENT_LABEL: Record<string, string> = {
  paid: 'مدفوع', pending: 'بانتظار الدفع', refunded: 'مسترجع',
};

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((days / total) * 100)) : 0;
  const barColor = pct > 50 ? '#10B981' : pct > 20 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#EDE3CE' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="text-xs w-16 text-left" style={{ color: '#6B7280' }}>{days} يوم</span>
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all',       label: 'الكل',     count: stats.total     },
    { key: 'active',    label: 'فعّالة',   count: stats.active    },
    { key: 'expired',   label: 'منتهية',   count: stats.expired   },
    { key: 'cancelled', label: 'ملغاة',    count: stats.cancelled },
    { key: 'pending',   label: 'معلّقة',   count: stats.pending   },
  ];

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  const statsCards = [
    { label: 'فعّالة',  value: stats.active,    color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'منتهية',  value: stats.expired,   color: DK.dimTxt, bg: '#F9FAFB' },
    { label: 'ملغاة',   value: stats.cancelled, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
    { label: 'معلّقة',  value: stats.pending,   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  ];

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>الاشتراكات</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إدارة اشتراكات الطلاب والباقات المفعّلة</p>
            </div>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
            + اشتراك جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statsCards.map((s) => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: '1px solid #EDE3CE' }}>
              <p className="text-xs mb-1" style={{ color: DK.dimTxt }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {filterTabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition"
              style={filter === t.key
                ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }
                : { background: '#FFFFFF', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>{error}</div>
        )}

        {!loading && !error && (
          items.length > 0 ? (
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                  <tr>
                    {['الطالب', 'الباقة', 'البداية', 'الانتهاء', 'المتبقي', 'الحالة', 'الدفع', 'المبلغ', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider whitespace-nowrap"
                        style={{ color: DK.gold }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((sub) => (
                    <tr key={sub.id} className="transition"
                      style={{ borderBottom: '1px solid #EDE3CE' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: '#1B2038' }}>{sub.student.name}</p>
                        <p className="text-xs" style={{ color: DK.dimTxt }}>{sub.student.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p style={{ color: '#1B2038' }}>{sub.package.name}</p>
                        <p className="text-xs" style={{ color: DK.dimTxt }}>{sub.package.duration_days} يوم</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: DK.dimTxt }}>{sub.starts_at}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: DK.dimTxt }}>{sub.ends_at}</td>
                      <td className="px-4 py-3 min-w-[130px]">
                        {sub.status === 'active'
                          ? <DaysBar days={sub.days_remaining} total={sub.package.duration_days} />
                          : <span className="text-xs" style={{ color: DK.dimTxt }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={statusStyle(sub.status)}>
                          {STATUS_LABEL[sub.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={paymentStyle(sub.payment_status)}>
                          {PAYMENT_LABEL[sub.payment_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: DK.gold }}>
                        {Number(sub.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === 'active' && (
                          <button onClick={() => handleCancel(sub)}
                            className="text-xs px-3 py-1.5 rounded-lg transition"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
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
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={DK.card}>
              <p className="font-medium" style={{ color: '#1B2038' }}>لا توجد اشتراكات</p>
              <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>أضف اشتراكاً جديداً للبدء</p>
            </div>
          )
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EDE3CE' }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#1B2038' }}>اشتراك جديد</h3>
                <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>تفعيل اشتراك يدوي لطالب</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: DK.dimTxt }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الطالب *</label>
                <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  onFocus={() => setFocusedInput('student')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('student'), cursor: 'pointer' }}>
                  <option value="">اختر الطالب...</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الباقة *</label>
                <select value={form.package_id}
                  onChange={(e) => {
                    const pkg = packages.find((p) => p.id === Number(e.target.value));
                    setForm({ ...form, package_id: e.target.value, amount_paid: pkg ? String(pkg.price) : '' });
                  }}
                  onFocus={() => setFocusedInput('pkg')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('pkg'), cursor: 'pointer' }}>
                  <option value="">اختر الباقة...</option>
                  {packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.duration_days} يوم — {p.price}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>تاريخ البداية *</label>
                  <input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    onFocus={() => setFocusedInput('date')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('date')} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>المبلغ المدفوع</label>
                  <input type="number" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                    placeholder="0.00" dir="ltr"
                    onFocus={() => setFocusedInput('amount')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('amount')} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>حالة الدفع</label>
                <div className="flex gap-2">
                  {[{ v: 'paid', l: 'مدفوع' }, { v: 'pending', l: 'بانتظار الدفع' }].map((opt) => (
                    <button key={opt.v} type="button" onClick={() => setForm({ ...form, payment_status: opt.v })}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition"
                      style={form.payment_status === opt.v
                        ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }
                        : { background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="مثلاً: حوالة بنكية رقم #..."
                  onFocus={() => setFocusedInput('notes')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('notes'), resize: 'none' }} />
              </div>
              {formError && (
                <p className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
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
