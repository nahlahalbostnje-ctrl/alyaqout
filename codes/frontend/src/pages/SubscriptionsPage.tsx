import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSubscriptions, addSubscription, cancelSubscription,
} from '../features/admin/subscriptionsSlice';
import { fetchUsers }    from '../features/admin/usersSlice';
import { fetchPackages } from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';
import type { Subscription } from '../features/admin/subscriptionsSlice';

const DK = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6', orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background:'#FFFFFF', borderRadius:16, padding:20,
  boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #EDE3CE', ...e,
});
const btn = (v:'gold'|'outline'|'danger'='gold'): React.CSSProperties => ({
  padding:'9px 20px', borderRadius:12, border: v==='outline'?'1px solid #EDE3CE':'none',
  background: v==='gold'?'#C59341': v==='danger'?'#EF4444':'#FFFFFF',
  color: v==='outline'?'#1B2038':'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?'#C59341':'#EDE3CE'}`,
  color:'#1B2038', borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});
const TH: React.CSSProperties = {
  padding:'11px 16px', textAlign:'right', color:'#6B7280', fontSize:12,
  fontWeight:700, background:'#F8F5EE', borderBottom:'1px solid #EDE3CE',
};
const TD: React.CSSProperties = {
  padding:'12px 16px', borderBottom:'1px solid #F3EDE0', fontSize:13, color:'#1B2038',
};

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:520,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:'#1B2038',fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16,color:'#6B7280'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ label, color, bg }: { label:string; color:string; bg:string }) {
  return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:bg,color}}>{label}</span>;
}

type FilterStatus = 'all' | 'active' | 'expired' | 'cancelled' | 'pending';

const STATUS_LABEL: Record<string, string> = {
  active: 'فعّال', expired: 'منتهي', cancelled: 'ملغى', pending: 'معلّق',
};

function statusStyle(s: string): { color:string; bg:string } {
  if (s === 'active')    return { bg:'rgba(16,185,129,0.1)',  color:'#10B981' };
  if (s === 'cancelled') return { bg:'rgba(239,68,68,0.1)',   color:'#EF4444' };
  if (s === 'pending')   return { bg:'rgba(245,158,11,0.1)',  color:'#F59E0B' };
  return { bg:'#F3F4F6', color:'#6B7280' };
}

function paymentStyle(s: string): { color:string; bg:string } {
  if (s === 'paid')    return { bg:'rgba(16,185,129,0.1)', color:'#10B981' };
  if (s === 'pending') return { bg:'rgba(245,158,11,0.1)', color:'#F59E0B' };
  return { bg:'rgba(239,68,68,0.1)', color:'#EF4444' };
}

const PAYMENT_LABEL: Record<string, string> = {
  paid: 'مدفوع', pending: 'بانتظار الدفع', refunded: 'مسترجع',
};

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((days / total) * 100)) : 0;
  const barColor = pct > 50 ? '#10B981' : pct > 20 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, borderRadius:3, overflow:'hidden', background:'#EDE3CE' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:barColor, transition:'width 0.5s' }} />
      </div>
      <span style={{ fontSize:11, color:'#6B7280', whiteSpace:'nowrap' }}>{days} يوم</span>
    </div>
  );
}

export default function SubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { items, stats, loading, error } = useAppSelector((s) => s.subscriptions);
  const students = useAppSelector((s) => s.adminUsers.list.filter((u) => u.role === 'student'));
  const packages = useAppSelector((s) => s.packages.list.filter((p) => p.is_active));

  const [filter, setFilter]       = useState<FilterStatus>('all');
  const [showModal, setModal]     = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

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
    { key: 'all',       label: 'الكل',          count: stats.total     },
    { key: 'active',    label: 'فعّال',          count: stats.active    },
    { key: 'expired',   label: 'منتهي',          count: stats.expired   },
    { key: 'cancelled', label: 'ملغى',           count: stats.cancelled },
    { key: 'pending',   label: 'بانتظار الدفع',  count: stats.pending   },
  ];

  const statsCards = [
    { label:'فعّال',          value: stats.active,    color: DK.green,  bg:'rgba(16,185,129,0.08)'  },
    { label:'منتهي',          value: stats.expired,   color: DK.dim,    bg:'#F3F4F6'                },
    { label:'ملغى',           value: stats.cancelled, color: DK.red,    bg:'rgba(239,68,68,0.08)'   },
    { label:'بانتظار الدفع',  value: stats.pending,   color: DK.orange, bg:'rgba(245,158,11,0.08)'  },
  ];

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: DK.bg, minHeight:'100vh', padding:24 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: DK.goldGrad }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: DK.text }}>الاشتراكات</h1>
              <p style={{ margin:0, fontSize:12, color: DK.sub, marginTop:2 }}>إدارة اشتراكات الطلاب والباقات المفعّلة</p>
            </div>
          </div>
          <button onClick={openModal} style={{ ...btn('gold'), display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:400 }}>+</span> اشتراك جديد
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {statsCards.map((s) => (
            <div key={s.label} style={{ ...card({ padding:'16px 20px' }), background: s.bg, border:'1px solid #EDE3CE' }}>
              <p style={{ margin:'0 0 4px', fontSize:12, color: DK.sub, fontWeight:600 }}>{s.label}</p>
              <p style={{ margin:0, fontSize:28, fontWeight:900, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {filterTabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              style={{
                borderRadius:10, padding:'8px 20px', border:'none', cursor:'pointer',
                fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700,
                background: filter === t.key ? DK.gold : 'transparent',
                color: filter === t.key ? '#fff' : DK.sub,
                transition:'all 0.15s',
              }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        )}

        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:13 }}>{error}</div>
        )}

        {!loading && !error && (
          items.length > 0 ? (
            <div style={{ ...card({ padding:0 }), overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    {['#','الطالب','الباقة','تاريخ البدء','تاريخ الانتهاء','الدفع','الحالة','إجراءات'].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((sub, idx) => {
                    const ss = statusStyle(sub.status);
                    const ps = paymentStyle(sub.payment_status);
                    return (
                      <tr key={sub.id}
                        onMouseEnter={e => (e.currentTarget.style.background='rgba(197,147,65,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                        <td style={{ ...TD, color: DK.dim, fontWeight:700, width:48 }}>{idx + 1}</td>
                        <td style={TD}>
                          <p style={{ margin:0, fontWeight:700, color: DK.text }}>{sub.student.name}</p>
                          <p style={{ margin:0, fontSize:11, color: DK.sub }}>{sub.student.phone}</p>
                        </td>
                        <td style={TD}>
                          <p style={{ margin:0, color: DK.text }}>{sub.package.name}</p>
                          <p style={{ margin:0, fontSize:11, color: DK.sub }}>{sub.package.duration_days} يوم</p>
                        </td>
                        <td style={{ ...TD, color: DK.sub, whiteSpace:'nowrap', fontSize:12 }}>{sub.starts_at}</td>
                        <td style={{ ...TD, whiteSpace:'nowrap', fontSize:12 }}>
                          {sub.status === 'active'
                            ? <DaysBar days={sub.days_remaining} total={sub.package.duration_days} />
                            : <span style={{ color: DK.sub }}>{sub.ends_at}</span>}
                        </td>
                        <td style={TD}>
                          <StatusBadge label={PAYMENT_LABEL[sub.payment_status] ?? sub.payment_status} color={ps.color} bg={ps.bg} />
                        </td>
                        <td style={TD}>
                          <StatusBadge label={STATUS_LABEL[sub.status] ?? sub.status} color={ss.color} bg={ss.bg} />
                        </td>
                        <td style={TD}>
                          {sub.status === 'active' && (
                            <button onClick={() => handleCancel(sub)}
                              style={{ padding:'5px 12px', borderRadius:8, border:'none', background:'rgba(239,68,68,0.1)', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                              إلغاء
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ ...card(), textAlign:'center', padding:60 }}>
              <p style={{ color: DK.text, fontWeight:700, fontSize:15, margin:'0 0 6px' }}>لا توجد اشتراكات</p>
              <p style={{ color: DK.sub, fontSize:13, margin:0 }}>أضف اشتراكاً جديداً للبدء</p>
            </div>
          )
        )}
      </div>

      {/* Add Subscription Modal */}
      {showModal && (
        <Modal title="اشتراك جديد" onClose={closeModal}>
          <form onSubmit={handleSubmit} dir="rtl">
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الطالب *</label>
              <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})}
                style={{ ...inp(focused==='student'), cursor:'pointer' }}
                onFocus={() => setFocused('student')} onBlur={() => setFocused(null)}>
                <option value="">اختر الطالب...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الباقة *</label>
              <select value={form.package_id}
                onChange={e => {
                  const pkg = packages.find(p => p.id === Number(e.target.value));
                  setForm({...form, package_id: e.target.value, amount_paid: pkg ? String(pkg.price) : ''});
                }}
                style={{ ...inp(focused==='pkg'), cursor:'pointer' }}
                onFocus={() => setFocused('pkg')} onBlur={() => setFocused(null)}>
                <option value="">اختر الباقة...</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name} — {p.duration_days} يوم — {p.price}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>تاريخ البداية *</label>
                <input type="date" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})}
                  style={inp(focused==='date')}
                  onFocus={() => setFocused('date')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المبلغ المدفوع</label>
                <input type="number" value={form.amount_paid} onChange={e => setForm({...form, amount_paid: e.target.value})}
                  placeholder="0.00" dir="ltr"
                  style={inp(focused==='amount')}
                  onFocus={() => setFocused('amount')} onBlur={() => setFocused(null)} />
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:8 }}>حالة الدفع</label>
              <div style={{ display:'flex', gap:8 }}>
                {[{ v:'paid', l:'مدفوع' }, { v:'pending', l:'بانتظار الدفع' }].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setForm({...form, payment_status: opt.v})}
                    style={{
                      flex:1, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer',
                      fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700,
                      background: form.payment_status === opt.v ? DK.gold : '#F3F4F6',
                      color: form.payment_status === opt.v ? '#fff' : DK.sub,
                      transition:'all 0.15s',
                    }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>ملاحظات</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                rows={2} placeholder="مثلاً: حوالة بنكية رقم #..."
                style={{ ...inp(focused==='notes'), resize:'none' }}
                onFocus={() => setFocused('notes')} onBlur={() => setFocused(null)} />
            </div>
            {formError && (
              <p style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{formError}</p>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={submitting}
                style={{ ...btn('gold'), flex:1, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'جاري التفعيل...' : 'تفعيل الاشتراك'}
              </button>
              <button type="button" onClick={closeModal}
                style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
