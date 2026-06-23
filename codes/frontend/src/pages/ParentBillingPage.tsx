import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';

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

const INVOICES = [
  { id: 'INV-2025-001', child: 'محمد أحمد', desc: 'دورة اللغة الإنجليزية', amount: 500, status: 'paid', date: '2025-05-01', dueDate: '2025-05-15' },
  { id: 'INV-2025-002', child: 'سارة أحمد', desc: 'دورة الرياضيات المتقدمة', amount: 450, status: 'paid', date: '2025-05-01', dueDate: '2025-05-15' },
  { id: 'INV-2025-003', child: 'علي أحمد', desc: 'اشتراك المنصة الشهري', amount: 200, status: 'pending', date: '2025-06-01', dueDate: '2025-06-10' },
  { id: 'INV-2025-004', child: 'محمد أحمد', desc: 'دورة العلوم', amount: 380, status: 'overdue', date: '2025-05-15', dueDate: '2025-05-30' },
  { id: 'INV-2025-005', child: 'سارة أحمد', desc: 'باقة الاشتراك السنوي', amount: 2000, status: 'paid', date: '2025-04-01', dueDate: '2025-04-10' },
];

const MONTHLY_DATA = [
  { month: 'يناير', محمد: 300, سارة: 250, علي: 200 },
  { month: 'فبراير', محمد: 350, سارة: 300, علي: 150 },
  { month: 'مارس', محمد: 400, سارة: 280, علي: 220 },
  { month: 'أبريل', محمد: 320, سارة: 2000, علي: 180 },
  { month: 'مايو', محمد: 880, سارة: 450, علي: 0 },
  { month: 'يونيو', محمد: 0, سارة: 0, علي: 200 },
];

const CHILD_COLORS: Record<string, string> = {
  'محمد': C.gold,
  'سارة': C.blue,
  'علي': C.green,
};

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(135deg,#C59341,#D4A65A)' }} />
        <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

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

export default function ParentBillingPage() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const hasPending = totalPending + totalOverdue > 0;

  const filtered = filter === 'all' ? INVOICES : INVOICES.filter(i => i.status === filter);

  // SVG bar chart
  const chartW = 580;
  const chartH = 140;
  const barW = 22;
  const gap = 14;
  const groupGap = 36;
  const months = MONTHLY_DATA;
  const maxVal = Math.max(...months.flatMap(m => [m['محمد'], m['سارة'], m['علي']]));
  const childKeys: Array<'محمد' | 'سارة' | 'علي'> = ['محمد', 'سارة', 'علي'];

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        <PageHeader title="المدفوعات والفواتير" sub="إدارة الفواتير ومتابعة المدفوعات لجميع أبنائك" />

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
          {/* Paid */}
          <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.green}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: C.sub, fontSize: 12, margin: '0 0 6px' }}>إجمالي المدفوع</p>
                <p style={{ color: C.green, fontSize: 28, fontWeight: 900, margin: 0 }}>{totalPaid.toLocaleString('ar-SA')}</p>
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>ريال سعودي</p>
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
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>ريال سعودي</p>
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
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>ريال سعودي</p>
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
                  إجمالي المبلغ المطلوب: {(totalPending + totalOverdue).toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
            <button style={{
              background: '#fff', color: C.gold, border: 'none',
              borderRadius: 10, padding: '10px 22px', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              ادفع الآن
            </button>
          </div>
        )}

        {/* Filter Tabs + Table */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>سجل الفواتير</h2>
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

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['#', 'رقم الفاتورة', 'الطفل', 'البيان', 'المبلغ (ريال)', 'تاريخ الإصدار', 'تاريخ الاستحقاق', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} style={{ color: C.sub, fontSize: 11, fontWeight: 700, padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = C.goldBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={{ padding: '12px 12px', color: C.dim, fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '12px 12px', fontFamily: 'monospace', fontSize: 12, color: C.navy, fontWeight: 700 }}>{inv.id}</td>
                    <td style={{ padding: '12px 12px' }}><ChildPill name={inv.child} /></td>
                    <td style={{ padding: '12px 12px', color: C.text, fontSize: 13 }}>{inv.desc}</td>
                    <td style={{ padding: '12px 12px', color: C.text, fontWeight: 800, fontSize: 14 }}>{inv.amount.toLocaleString('ar-SA')}</td>
                    <td style={{ padding: '12px 12px', color: C.sub, fontSize: 12 }}>{inv.date}</td>
                    <td style={{ padding: '12px 12px', color: C.sub, fontSize: 12 }}>{inv.dueDate}</td>
                    <td style={{ padding: '12px 12px' }}><StatusBadge status={inv.status} /></td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button style={{
                          background: C.goldBg, border: `1px solid ${C.goldBdr}`, borderRadius: 7,
                          padding: '5px 8px', cursor: 'pointer', color: C.gold, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, fontFamily: "'Cairo',sans-serif",
                        }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </button>
                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <button style={{
                            background: inv.status === 'overdue' ? C.red : C.goldGrad,
                            border: 'none', borderRadius: 7, padding: '5px 10px',
                            cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
                          }}>
                            دفع الآن
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: C.dim, fontSize: 14 }}>
                لا توجد فواتير في هذا التصنيف
              </div>
            )}
          </div>
        </div>

        {/* Monthly Chart */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>المصروفات الشهرية</h2>
          <p style={{ color: C.sub, fontSize: 12, margin: '0 0 20px' }}>إجمالي الإنفاق لكل طفل خلال الأشهر الماضية (ريال)</p>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 16 }}>
            {childKeys.map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: CHILD_COLORS[k] }} />
                <span style={{ color: C.sub, fontSize: 12 }}>{k}</span>
              </div>
            ))}
          </div>

          {/* SVG Bar Chart */}
          <div style={{ overflowX: 'auto' }}>
            <svg width={chartW} height={chartH + 30} style={{ display: 'block' }}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = chartH - pct * chartH;
                return (
                  <g key={pct}>
                    <line x1={0} y1={y} x2={chartW} y2={y} stroke={C.border} strokeWidth={1} strokeDasharray="3,3" />
                    <text x={chartW - 4} y={y - 3} fontSize={9} fill={C.dim} textAnchor="end">
                      {Math.round(pct * maxVal)}
                    </text>
                  </g>
                );
              })}

              {months.map((m, mi) => {
                const groupX = mi * (3 * barW + 2 * gap + groupGap) + 16;
                return (
                  <g key={m.month}>
                    {childKeys.map((k, ki) => {
                      const val = m[k];
                      const barH = maxVal > 0 ? (val / maxVal) * chartH : 0;
                      const x = groupX + ki * (barW + gap);
                      const y = chartH - barH;
                      return (
                        <g key={k}>
                          <rect
                            x={x} y={y} width={barW} height={barH}
                            rx={5} fill={CHILD_COLORS[k]}
                            opacity={val === 0 ? 0.15 : 0.85}
                          />
                          {val > 0 && (
                            <text x={x + barW / 2} y={y - 4} fontSize={8} fill={CHILD_COLORS[k]} textAnchor="middle" fontWeight="bold">
                              {val}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    <text x={groupX + (3 * barW + 2 * gap) / 2} y={chartH + 18} fontSize={10} fill={C.sub} textAnchor="middle">
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
