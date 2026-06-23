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

const CHILDREN = [
  { id: 1, name: 'محمد أحمد', initials: 'مأ', color: '#C59341' },
  { id: 2, name: 'سارة أحمد', initials: 'سأ', color: '#3B82F6' },
  { id: 3, name: 'علي أحمد', initials: 'عأ', color: '#10B981' },
];

const SUBJECTS = ['الرياضيات', 'اللغة الإنجليزية', 'العلوم', 'العربية', 'التاريخ'];
const SUBJECT_ICONS = ['📐', '🔤', '🔬', '📖', '🏛️'];
const MONTHS = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];

// Mock scores per child (subjectIdx -> monthIdx -> score)
const SCORES: Record<number, number[][]> = {
  1: [
    [72, 75, 78, 80, 82, 85, 87, 90, 92],
    [68, 70, 73, 75, 78, 80, 82, 84, 86],
    [80, 83, 85, 86, 88, 89, 91, 92, 95],
    [65, 68, 70, 72, 75, 77, 79, 81, 83],
    [60, 63, 66, 68, 70, 72, 75, 77, 80],
  ],
  2: [
    [88, 90, 91, 93, 94, 95, 96, 97, 98],
    [75, 78, 80, 82, 84, 85, 87, 88, 90],
    [70, 72, 75, 77, 79, 81, 83, 85, 87],
    [82, 84, 85, 87, 88, 90, 91, 93, 95],
    [78, 80, 82, 84, 85, 87, 88, 90, 92],
  ],
  3: [
    [55, 58, 62, 65, 68, 70, 72, 75, 78],
    [60, 63, 65, 67, 70, 72, 74, 76, 79],
    [75, 77, 79, 81, 83, 85, 87, 89, 91],
    [58, 61, 64, 66, 69, 71, 73, 76, 78],
    [50, 53, 56, 59, 62, 65, 67, 70, 73],
  ],
};

const EXAMS = [
  { name: 'اختبار الوحدة 1 - رياضيات', subject: 'الرياضيات', date: '2025-10-15', score: 88, total: 100 },
  { name: 'اختبار منتصف الفصل - علوم', subject: 'العلوم', date: '2025-11-02', score: 76, total: 100 },
  { name: 'اختبار قواعد اللغة - عربية', subject: 'العربية', date: '2025-11-20', score: 92, total: 100 },
  { name: 'اختبار الوحدة 2 - إنجليزي', subject: 'اللغة الإنجليزية', date: '2025-12-05', score: 58, total: 100 },
  { name: 'اختبار نهاية الفصل - تاريخ', subject: 'التاريخ', date: '2026-01-12', score: 81, total: 100 },
  { name: 'اختبار الوحدة 3 - رياضيات', subject: 'الرياضيات', date: '2026-02-08', score: 95, total: 100 },
];

const SUBJECT_COLORS = [C.gold, C.blue, C.green, C.purple, C.amber];

export default function ParentAcademicProgressPage() {
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('الكل');
  const [selectedSemester, setSelectedSemester] = useState('الفصل الأول');

  const scores = SCORES[selectedChild] || SCORES[1];
  const lastMonth = MONTHS.length - 1;

  // KPIs
  const allScores = scores.flat();
  const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const max = Math.max(...allScores);
  const min = Math.min(...allScores);
  const examCount = EXAMS.length;

  // Chart
  const chartW = 520, chartH = 200;
  const padL = 36, padR = 16, padT = 16, padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const xStep = innerW / (MONTHS.length - 1);
  const yScale = (v: number) => padT + innerH - ((v - 0) / 100) * innerH;
  const xScale = (i: number) => padL + i * xStep;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <PageHeader title="مؤشر التطور الأكاديمي" sub="تابع تقدم أبنائك الأكاديمي عبر المواد والفصول الدراسية" />

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Child tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
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
                  transition: 'all 0.15s',
                  fontFamily: "'Cairo',sans-serif",
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

          {/* Subject select */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: '#fff', color: C.text, fontSize: 13, fontWeight: 600,
              fontFamily: "'Cairo',sans-serif", cursor: 'pointer',
            }}
          >
            <option>الكل</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Semester select */}
          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: '#fff', color: C.text, fontSize: 13, fontWeight: 600,
              fontFamily: "'Cairo',sans-serif", cursor: 'pointer',
            }}
          >
            <option>الفصل الأول</option>
            <option>الفصل الثاني</option>
            <option>السنة كاملة</option>
          </select>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'متوسط الدرجات', value: `${avg}%`, icon: '📊', color: C.gold, bg: C.goldBg },
            { label: 'أعلى درجة', value: `${max}%`, icon: '🏆', color: C.green, bg: C.greenBg },
            { label: 'أدنى درجة', value: `${min}%`, icon: '📉', color: C.red, bg: C.redBg },
            { label: 'عدد الاختبارات', value: examCount, icon: '📝', color: C.blue, bg: C.blueBg },
          ].map((k, i) => (
            <div key={i} style={card({ padding: 18 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: k.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>{k.icon}</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{k.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={card({ marginBottom: 20, padding: 20 })}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>منحنى التطور الأكاديمي</div>
          <div style={{ overflowX: 'auto' }}>
            <svg width={chartW} height={chartH} style={{ display: 'block', minWidth: chartW }}>
              {/* Grid lines */}
              {gridLines.map(g => (
                <g key={g}>
                  <line
                    x1={padL} y1={yScale(g)} x2={chartW - padR} y2={yScale(g)}
                    stroke="#EDE3CE" strokeWidth={1} strokeDasharray="4,3"
                  />
                  <text x={padL - 4} y={yScale(g) + 4} textAnchor="end" fontSize={9} fill={C.dim}>{g}</text>
                </g>
              ))}
              {/* X axis labels */}
              {MONTHS.map((m, i) => (
                <text key={m} x={xScale(i)} y={chartH - 6} textAnchor="middle" fontSize={8.5} fill={C.dim}>{m}</text>
              ))}
              {/* Lines */}
              {scores.map((subjectScores, si) => {
                if (selectedSubject !== 'الكل' && SUBJECTS[si] !== selectedSubject) return null;
                const pts = subjectScores.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
                return (
                  <g key={si}>
                    <polyline points={pts} fill="none" stroke={SUBJECT_COLORS[si]} strokeWidth={2} strokeLinejoin="round" />
                    {subjectScores.map((v, i) => (
                      <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3.5} fill={SUBJECT_COLORS[si]} stroke="#fff" strokeWidth={1.5} />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            {SUBJECTS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 3, borderRadius: 2, background: SUBJECT_COLORS[i] }} />
                <span style={{ fontSize: 11, color: C.sub }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 12 }}>تفاصيل المواد الدراسية</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {SUBJECTS.map((subj, si) => {
              const monthScores = scores[si];
              const current = monthScores[lastMonth];
              const prev = monthScores[lastMonth - 1];
              const avg2 = Math.round(monthScores.reduce((a, b) => a + b, 0) / monthScores.length);
              const up = current >= prev;
              const classAvg = 72;
              const aboveAvg = avg2 >= classAvg;
              return (
                <div key={subj} style={card({ padding: 16 })}>
                  <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>{SUBJECT_ICONS[si]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textAlign: 'center', marginBottom: 10 }}>{subj}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: SUBJECT_COLORS[si] }}>{current}</span>
                    <span style={{ fontSize: 12, color: C.dim }}>/100</span>
                    <span style={{ fontSize: 16, color: up ? C.green : C.red }}>{up ? '↑' : '↓'}</span>
                  </div>
                  {/* Bar */}
                  <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${current}%`, background: SUBJECT_COLORS[si], borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{
                    textAlign: 'center', fontSize: 10, fontWeight: 700,
                    color: aboveAvg ? C.green : C.red,
                    background: aboveAvg ? C.greenBg : C.redBg,
                    borderRadius: 20, padding: '3px 8px',
                  }}>
                    {aboveAvg ? 'أعلى من المتوسط' : 'دون المتوسط'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exams Table */}
        <div style={card()}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>سجل الاختبارات</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.goldBg }}>
                  {['الاختبار', 'المادة', 'التاريخ', 'الدرجة', 'المئوية', 'التقييم'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'right', color: C.gold, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXAMS.map((ex, i) => {
                  const pct = Math.round((ex.score / ex.total) * 100);
                  const grade = pct >= 90 ? 'ممتاز' : pct >= 80 ? 'جيد جداً' : pct >= 70 ? 'جيد' : pct >= 60 ? 'مقبول' : 'ضعيف';
                  const badgeColor = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.red;
                  const badgeBg = pct >= 80 ? C.greenBg : pct >= 60 ? C.amberBg : C.redBg;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 12px', color: C.text, fontWeight: 600 }}>{ex.name}</td>
                      <td style={{ padding: '10px 12px', color: C.sub }}>{ex.subject}</td>
                      <td style={{ padding: '10px 12px', color: C.sub, direction: 'ltr', textAlign: 'right' }}>{ex.date}</td>
                      <td style={{ padding: '10px 12px', color: C.text, fontWeight: 700 }}>{ex.score}/{ex.total}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: badgeColor, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: badgeColor, minWidth: 32 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: badgeBg, color: badgeColor,
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        }}>{grade}</span>
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
