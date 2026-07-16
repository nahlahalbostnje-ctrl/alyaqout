import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';

interface Installment {
  id: number;
  child: string;
  package: string;
  installment_no: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
}

const C = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.22)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  purple: '#8B5CF6', purpleBg: 'rgba(139,92,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
};

const CHILD_COLORS: Record<string, string> = {};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    paid: { label: 'مدفوع', color: C.green, bg: C.greenBg },
    pending: { label: 'معلق', color: C.amber, bg: C.amberBg },
    overdue: { label: 'متأخر', color: C.red, bg: C.redBg },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`,
    }}>{s.label}</span>
  );
}

function ChildPill({ name }: { name: string }) {
  const first = name.split(' ')[0];
  const color = CHILD_COLORS[first] ?? C.purple;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      color, background: `${color}12`, border: `1px solid ${color}30`,
    }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 900 }}>
        {name.split(' ').slice(0, 2).map(w => w[0]).join('')}
      </span>
      {name}
    </span>
  );
}

function DeviceRequestModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:28, width:420, maxWidth:'92vw', fontFamily:"'Cairo',sans-serif", direction:'rtl', textAlign:'center' }}>
        <h3 style={{ color:C.text, fontWeight:900, fontSize:17, marginBottom:10 }}>طلب جهاز بالتقسيط</h3>
        <p style={{ color:C.sub, fontSize:13, marginBottom:20 }}>لا توجد باقات أجهزة متاحة حالياً</p>
        <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>إغلاق</button>
      </div>
    </div>
  );
}

export default function ParentBillingPage() {
  const { currency, formatMoney } = useCurrency();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewPlan, setRenewPlan] = useState<'monthly'|'quarterly'|'annual'>('annual');
  const [renewDone, setRenewDone] = useState(false);

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/billing/installments')
      .then(({ data }) => setInstallments(data.data ?? []))
      .catch(() => setInstallments([]))
      .finally(() => setInstallmentsLoading(false));
  }, []);

  const totalPaid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = installments.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = installments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const hasPending = totalPending + totalOverdue > 0;

  const filtered = filter === 'all' ? installments : installments.filter(i => i.status === filter);

  return (
    <ParentLayout>
      {showDeviceModal && <DeviceRequestModal onClose={() => setShowDeviceModal(false)} />}

      {/* Renewal Modal */}
      {showRenewalModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
          onClick={() => { setShowRenewalModal(false); setRenewDone(false); }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px', width:'100%', maxWidth:420, fontFamily:"'Cairo',sans-serif", direction:'rtl', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#0D1E3A', fontWeight:800, fontSize:18, marginBottom:6 }}>تجديد الاشتراك</h3>
            <p style={{ color:'#6B7280', fontSize:13, marginBottom:20 }}>اختر مدة التجديد المناسبة لك</p>
            {renewDone ? (
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'16px', textAlign:'center', color:'#10B981', fontWeight:700, fontSize:15 }}>
                ✅ تم تجديد اشتراكك بنجاح! سيصلك تأكيد على واتساب.
              </div>
            ) : (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                  {([['monthly','شهري',`99 ${currency || ''} / شهر`.trim(),''], ['quarterly','ربع سنوي',`270 ${currency || ''} / 3 أشهر`.trim(),`وفّر 27 ${currency || ''}`.trim()], ['annual','سنوي',`960 ${currency || ''} / سنة`.trim(),`🎁 وفّر 228 ${currency || ''}`.trim()]] as const).map(([v,l,p,save]) => (
                    <button key={v} onClick={() => setRenewPlan(v)}
                      style={{ padding:'14px 16px', borderRadius:14, border:`2px solid ${renewPlan===v?C.gold:'#EDE3CE'}`, background: renewPlan===v?C.goldBg:'#F8FAFC', cursor:'pointer', fontFamily:"'Cairo',sans-serif", textAlign:'right', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <p style={{ color: renewPlan===v?C.gold:'#1B2038', fontWeight:800, fontSize:14, margin:0 }}>{l}</p>
                        <p style={{ color:'#6B7280', fontSize:12, margin:0 }}>{p}</p>
                      </div>
                      {save && <span style={{ background:C.goldBg, color:C.gold, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{save}</span>}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setRenewDone(true)}
                    style={{ flex:1, padding:'13px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    تجديد الآن 🎉
                  </button>
                  <button onClick={() => setShowRenewalModal(false)}
                    style={{ flex:1, padding:'13px', borderRadius:14, background:'#F1F5F9', color:'#6B7280', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    لاحقاً
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        {/* Subscription expiry banner */}
        <div style={{ background:'linear-gradient(135deg,#0D1E3A,#162144)', borderRadius:16, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:2 }}>اشتراكك الحالي</p>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>الباقة الذهبية — ينتهي في 15/08/2026</p>
            <p style={{ color:C.gold, fontSize:12, marginTop:2 }}>متبقي 46 يوم</p>
          </div>
          <button onClick={() => { setShowRenewalModal(true); setRenewDone(false); }}
            style={{ padding:'10px 20px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 4px 14px rgba(197,147,65,0.4)' }}>
            🔄 تجديد الاشتراك
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(135deg,#C59341,#D4A65A)' }} />
              <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 22, margin: 0 }}>المدفوعات والفواتير</h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>إدارة الفواتير ومتابعة المدفوعات لجميع أبنائك</p>
          </div>
          <button onClick={() => setShowDeviceModal(true)} style={{ padding:'10px 18px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif" }}>
            <span style={{ fontSize:16 }}>📦</span> طلب جهاز بالتقسيط
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
          {/* Paid */}
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.green}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: C.sub, fontSize: 12, margin: '0 0 6px' }}>إجمالي المدفوع</p>
                <p style={{ color: C.green, fontSize: 28, fontWeight: 900, margin: 0 }}>{totalPaid.toLocaleString('ar-SA')}</p>
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>{currency || '—'}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke={C.green} viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: C.greenBg }}>
              <div style={{ height: '100%', width: '100%', borderRadius: 2, background: C.green }} />
            </div>
          </div>

          {/* Pending */}
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.amber}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: C.sub, fontSize: 12, margin: '0 0 6px' }}>المستحقات</p>
                <p style={{ color: C.amber, fontSize: 28, fontWeight: 900, margin: 0 }}>{totalPending.toLocaleString('ar-SA')}</p>
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>{currency || '—'}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.amberBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke={C.amber} viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: C.amberBg }}>
              <div style={{ height: '100%', width: totalPending ? '60%' : '0%', borderRadius: 2, background: C.amber }} />
            </div>
          </div>

          {/* Overdue */}
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.red}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: C.sub, fontSize: 12, margin: '0 0 6px' }}>متأخرات</p>
                <p style={{ color: C.red, fontSize: 28, fontWeight: 900, margin: 0 }}>{totalOverdue.toLocaleString('ar-SA')}</p>
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>{currency || '—'}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke={C.red} viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: C.redBg }}>
              <div style={{ height: '100%', width: totalOverdue ? '40%' : '0%', borderRadius: 2, background: C.red }} />
            </div>
          </div>
        </div>

        {/* Payment Gateway Banner */}
        {hasPending && (
          <div style={{
            background: C.goldGrad, borderRadius: 16, padding: '16px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, boxShadow: '0 4px 20px rgba(197,147,65,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: 0 }}>لديك مستحقات معلقة</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '2px 0 0' }}>
                  إجمالي المبلغ المطلوب: {formatMoney(totalPending + totalOverdue)}
                </p>
              </div>
            </div>
            <button onClick={() => { setShowRenewalModal(true); setRenewDone(false); }} style={{
              background: '#fff', color: C.gold, border: 'none',
              borderRadius: 10, padding: '10px 22px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              ادفع الآن
            </button>
          </div>
        )}

        {/* Installments (خطة التقسيط) */}
        {(installmentsLoading || installments.length > 0) && (
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: C.goldGrad }} />
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>خطة التقسيط</h2>
            </div>

            {installmentsLoading ? (
              <p style={{ color: C.dim, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>جارٍ التحميل...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {['القسط #', 'الابن', 'الباقة', currency ? `المبلغ (${currency})` : 'المبلغ', 'تاريخ الاستحقاق', 'الحالة'].map(h => (
                        <th key={h} style={{ color: C.sub, fontSize: 11, fontWeight: 700, padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((inst) => (
                      <tr key={inst.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 12px', color: C.dim, fontSize: 12 }}>{inst.installment_no}</td>
                        <td style={{ padding: '10px 12px' }}><ChildPill name={inst.child} /></td>
                        <td style={{ padding: '10px 12px', color: C.text, fontSize: 13 }}>{inst.package}</td>
                        <td style={{ padding: '10px 12px', color: C.text, fontWeight: 800, fontSize: 14 }}>{Number(inst.amount).toLocaleString('ar-SA')}</td>
                        <td style={{ padding: '10px 12px', color: C.sub, fontSize: 12 }}>{inst.due_date}</td>
                        <td style={{ padding: '10px 12px' }}><StatusBadge status={inst.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Filter Tabs + Table */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>سجل الأقساط</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'paid', 'pending', 'overdue'] as const).map(f => {
                const labels: Record<string, string> = { all: 'الكل', paid: 'مدفوع', pending: 'معلق', overdue: 'متأخر' };
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
                    background: filter === f ? C.goldGrad : C.goldBg,
                    color: filter === f ? '#fff' : C.gold,
                    boxShadow: filter === f ? '0 2px 8px rgba(197,147,65,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}>{labels[f]}</button>
                );
              })}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['#', 'القسط', 'الطفل', 'الباقة', currency ? `المبلغ (${currency})` : 'المبلغ', 'تاريخ الاستحقاق', 'الحالة'].map(h => (
                    <th key={h} style={{ color: C.sub, fontSize: 11, fontWeight: 700, padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 12px', color: C.dim, fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: C.navy, fontWeight: 700 }}>{inv.installment_no}</td>
                    <td style={{ padding: '12px 12px' }}><ChildPill name={inv.child} /></td>
                    <td style={{ padding: '12px 12px', color: C.text, fontSize: 13 }}>{inv.package}</td>
                    <td style={{ padding: '12px 12px', color: C.text, fontWeight: 800, fontSize: 14 }}>{Number(inv.amount).toLocaleString('ar-SA')}</td>
                    <td style={{ padding: '12px 12px', color: C.sub, fontSize: 12 }}>{inv.due_date}</td>
                    <td style={{ padding: '12px 12px' }}><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: C.dim, fontSize: 14 }}>
                لا توجد أقساط في هذا التصنيف
              </div>
            )}
          </div>
        </div>

        {/* Monthly Chart placeholder */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>المصروفات الشهرية</h2>
          <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '30px 0' }}>لا تتوفر بيانات مصروفات شهرية بعد</p>
        </div>
      </div>
    </ParentLayout>
  );
}
