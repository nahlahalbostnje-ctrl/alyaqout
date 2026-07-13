import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';

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

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

const CHILD_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];
const YEAR = new Date().getFullYear(), MONTH = new Date().getMonth();
const ATTENDANCE_MAP: Record<number, string> = {};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border?: string }> = {
  present: { label: 'حاضر', bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  absent: { label: 'غائب', bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  late: { label: 'متأخر', bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  excused: { label: 'بعذر', bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  holiday: { label: 'إجازة', bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  weekend: { label: 'عطلة', bg: '#F3F4F6', text: '#9CA3AF' },
};

const HISTORY: { date: string; status: string; note: string }[] = [];

const DAY_NAMES = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function ParentAttendancePage() {
  const dispatch = useAppDispatch();
  const { children } = useAppSelector(s => s.parent);
  useEffect(() => { if (children.length === 0) dispatch(fetchParentDashboard()); }, [dispatch, children.length]);
  const CHILDREN = children.map((c, i) => ({
    id: c.id, name: c.name,
    initials: c.name.split(' ').slice(0, 2).map(w => w[0]).join(''),
    color: CHILD_COLORS[i % CHILD_COLORS.length],
  }));
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  useEffect(() => { if (CHILDREN.length && selectedChild == null) setSelectedChild(CHILDREN[0].id); }, [CHILDREN, selectedChild]);
  const [_tooltip, setTooltip] = useState<{ day: number; x: number; y: number } | null>(null);
  const [excuseDate, setExcuseDate] = useState('');
  const [excuseReason, setExcuseReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const firstDay = new Date(YEAR, MONTH, 1).getDay();
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const today = new Date().getDate();

  // Stats
  const presentCount = Object.values(ATTENDANCE_MAP).filter(s => s === 'present').length;
  const absentCount = Object.values(ATTENDANCE_MAP).filter(s => s === 'absent').length;
  const lateCount = Object.values(ATTENDANCE_MAP).filter(s => s === 'late').length;
  const excusedCount = Object.values(ATTENDANCE_MAP).filter(s => s === 'excused').length;
  const schoolDays = Object.values(ATTENDANCE_MAP).filter(s => s !== 'weekend' && s !== 'holiday').length;

  const handleSubmit = () => {
    if (excuseDate && excuseReason) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setExcuseDate('');
      setExcuseReason('');
    }
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <PageHeader title="الحضور والغياب" sub="متابعة حضور أبنائك وتقديم الأعذار الرسمية" />

        {/* Child Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {CHILDREN.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChild(ch.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 40, border: 'none', cursor: 'pointer',
                background: selectedChild === ch.id ? C.goldGrad : '#fff',
                color: selectedChild === ch.id ? '#fff' : C.text,
                fontWeight: 700, fontSize: 13,
                boxShadow: selectedChild === ch.id ? '0 4px 12px rgba(197,147,65,0.3)' : C.shadow,
                transition: 'all 0.15s', fontFamily: "'Cairo',sans-serif",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: selectedChild === ch.id ? 'rgba(255,255,255,0.3)' : ch.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 11,
              }}>{ch.initials}</div>
              {ch.name}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'إجمالي أيام', value: schoolDays, pct: null, color: C.navy, bg: C.goldBg, icon: '📅' },
            { label: 'حاضر', value: presentCount, pct: Math.round((presentCount / schoolDays) * 100), color: C.green, bg: C.greenBg, icon: '✅' },
            { label: 'غائب', value: absentCount, pct: Math.round((absentCount / schoolDays) * 100), color: C.red, bg: C.redBg, icon: '❌' },
            { label: 'متأخر', value: lateCount, pct: Math.round((lateCount / schoolDays) * 100), color: C.amber, bg: C.amberBg, icon: '⏰' },
            { label: 'بعذر', value: excusedCount, pct: Math.round((excusedCount / schoolDays) * 100), color: C.blue, bg: C.blueBg, icon: '📋' },
          ].map((s, i) => (
            <div key={i} style={card({ padding: 16 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: s.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{s.label}</div>
                  {s.pct !== null && (
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.pct}%</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
          {/* Calendar */}
          <div style={card({ padding: 20 })}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 16 }}>
              مايو 2025
            </div>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 8 }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.sub, padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Calendar cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const status = ATTENDANCE_MAP[day] || 'present';
                const cfg = STATUS_CONFIG[status];
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    onMouseEnter={e => setTooltip({ day, x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: 10,
                      background: cfg.bg,
                      border: isToday ? `2px solid ${C.gold}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.text }}>{day}</span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: cfg.bg, border: `1px solid ${cfg.text}` }} />
                  <span style={{ fontSize: 11, color: C.sub }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Excuse Form */}
          <div style={card({ padding: 20 })}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>تقديم طلب عذر</div>
            {submitted && (
              <div style={{
                background: C.greenBg, border: `1px solid ${C.green}`,
                borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                color: C.green, fontSize: 13, fontWeight: 600,
              }}>
                تم تقديم طلب العذر بنجاح!
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>تاريخ الغياب</label>
              <input
                type="date"
                value={excuseDate}
                onChange={e => setExcuseDate(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 10,
                  border: `1px solid ${C.border}`, fontSize: 13,
                  fontFamily: "'Cairo',sans-serif", color: C.text, boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>سبب الغياب</label>
              <textarea
                value={excuseReason}
                onChange={e => setExcuseReason(e.target.value)}
                rows={4}
                placeholder="اكتب سبب الغياب هنا..."
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 10,
                  border: `1px solid ${C.border}`, fontSize: 13,
                  fontFamily: "'Cairo',sans-serif", color: C.text,
                  resize: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                background: C.goldBg, border: `1px dashed ${C.goldBdr}`,
                borderRadius: 10, padding: '10px 12px',
                fontSize: 12, color: C.gold,
              }}>
                📎 يمكنك إرفاق المستندات الطبية عبر مراسلة إدارة المدرسة مباشرة.
              </div>
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12, border: 'none',
                background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                boxShadow: '0 4px 14px rgba(197,147,65,0.4)',
              }}
            >
              تقديم طلب العذر
            </button>
          </div>
        </div>

        {/* Attendance History Table */}
        <div style={card()}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>سجل الغياب والتأخر</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.goldBg }}>
                  {['التاريخ', 'الحالة', 'الملاحظات', 'إجراء'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'right', color: C.gold, fontWeight: 800, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((row, i) => {
                  const cfg = STATUS_CONFIG[row.status];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', color: C.text, direction: 'ltr', textAlign: 'right' }}>{row.date}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: cfg.bg, color: cfg.text,
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: C.sub }}>{row.note}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={()=>alert(`تقديم عذر عن غياب/تأخر يوم ${row.date} قيد التطوير — سيتوفر نموذج تقديم الأعذار قريباً.`)} style={{
                          padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.goldBdr}`,
                          background: C.goldBg, color: C.gold, fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                        }}>
                          تقديم عذر
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
