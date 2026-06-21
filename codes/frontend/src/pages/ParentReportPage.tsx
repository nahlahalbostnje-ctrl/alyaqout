import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchChildReport } from '../features/student/reportSlice';

const LK = {
  cardBg:     '#FFFFFF',
  cardBorder: '#EDE3CE',
  cardShadow: '0 2px 16px rgba(0,0,0,0.06)',
  pageBg:     '#F5EDD8',
  gold:       '#C9952A',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  blue:       '#3B82F6',
  blueBg:     'rgba(59,130,246,0.08)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  amber:      '#F59E0B',
  amberBg:    'rgba(245,158,11,0.08)',
};

function RingChart({ value, label, color, bg }: { value: number | null; label: string; color: string; bg: string }) {
  const pct  = value ?? 0;
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
          <circle cx="52" cy="52" r={r} fill="none" stroke={bg} strokeWidth="9" />
          <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center rotate-90">
          <p style={{ color: LK.text, fontSize: '20px', fontWeight: '800' }}>
            {value !== null ? `${value}%` : '—'}
          </p>
        </div>
      </div>
      <p style={{ color: LK.textSub, fontSize: '13px', fontWeight: '600' }}>{label}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}`, boxShadow: LK.cardShadow }}>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${LK.cardBorder}` }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: LK.goldGrad }} />
          <h2 style={{ color: LK.text, fontWeight: '700', fontSize: '15px' }}>{title}</h2>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ParentReportPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = parseInt(studentId ?? '0');

  const dispatch = useAppDispatch();
  const { childReports, loading } = useAppSelector((s) => s.report);
  const report = childReports[id];

  useEffect(() => { if (id) dispatch(fetchChildReport(id)); }, [dispatch, id]);

  if (loading && !report) {
    return (
      <ParentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-9 h-9 rounded-full animate-spin"
            style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: LK.gold }} />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-6 min-h-screen" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Header */}
        {report?.student && (
          <div
            className="rounded-2xl px-6 py-4 mb-6 flex items-center gap-4"
            style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}`, boxShadow: LK.cardShadow }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
              style={{ background: LK.goldGrad, color: '#fff' }}
            >
              {report.student.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}
            </div>
            <div>
              <h1 style={{ color: LK.text, fontWeight: '800', fontSize: '18px' }}>
                تقرير {report.student.name}
              </h1>
              <p style={{ color: LK.textSub, fontSize: '12px' }}>الأداء الأكاديمي الشامل</p>
            </div>
            <div className="mr-auto">
              <span
                className="px-3 py-1.5 rounded-xl text-sm font-bold"
                style={{ background: LK.goldBg, color: LK.gold, border: `1px solid ${LK.goldBorder}` }}
              >
                📊 التقرير الأكاديمي
              </span>
            </div>
          </div>
        )}

        {!report ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}` }}
          >
            <p style={{ color: LK.textSub }}>لا توجد بيانات</p>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl">

            {/* KPIs */}
            <SectionCard title="المؤشرات الرئيسية">
              <div className="flex justify-around flex-wrap gap-6">
                <RingChart value={report.attendance.rate}  label="نسبة الحضور"      color={LK.green} bg={LK.greenBg} />
                <RingChart value={report.exams.average}    label="متوسط الامتحانات"  color={LK.gold}  bg={LK.goldBg} />
                <RingChart value={report.homework.average} label="متوسط الواجبات"    color={LK.blue}  bg={LK.blueBg} />
              </div>
            </SectionCard>

            {/* Attendance */}
            <SectionCard title="الحضور والغياب">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'إجمالي', value: report.attendance.total,   color: LK.text,  bg: '#F9FAFB',  border: LK.cardBorder },
                  { label: 'حاضر',   value: report.attendance.present, color: LK.green, bg: LK.greenBg, border: 'rgba(16,185,129,0.2)' },
                  { label: 'غائب',   value: report.attendance.absent,  color: LK.red,   bg: LK.redBg,   border: 'rgba(239,68,68,0.2)' },
                  { label: 'متأخر',  value: report.attendance.late,    color: LK.amber, bg: LK.amberBg, border: 'rgba(245,158,11,0.2)' },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl p-4 text-center"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <p style={{ color: c.color, fontSize: '28px', fontWeight: '800' }}>{c.value}</p>
                    <p style={{ color: LK.textSub, fontSize: '12px', marginTop: '4px' }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Exams */}
            {report.exams.recent.length > 0 && (
              <SectionCard title={`الامتحانات (${report.exams.count})`}>
                <div className="space-y-2">
                  {report.exams.recent.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl"
                      style={{ background: '#F9FAFB', border: `1px solid ${LK.cardBorder}` }}>
                      <span style={{ color: LK.text, fontSize: '13px', fontWeight: '500' }} className="truncate max-w-xs">
                        {ex.title ?? 'امتحان'}
                      </span>
                      <div className="flex items-center gap-3 flex-shrink-0 mr-3">
                        <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${ex.pct}%`,
                            background: ex.pct >= 80 ? LK.green : ex.pct >= 60 ? LK.amber : LK.red,
                          }} />
                        </div>
                        <span style={{
                          fontSize: '13px', fontWeight: '700', minWidth: '40px', textAlign: 'left',
                          color: ex.pct >= 80 ? LK.green : ex.pct >= 60 ? LK.amber : LK.red,
                        }}>
                          {ex.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Homework & Progress */}
            <SectionCard title="الواجبات والتقدم">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-5 rounded-2xl"
                  style={{ background: LK.blueBg, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ color: LK.blue, fontSize: '32px', fontWeight: '800' }}>{report.homework.submitted}</p>
                  <p style={{ color: LK.textSub, fontSize: '12px', marginTop: '4px' }}>واجب مُسلَّم</p>
                </div>
                <div className="text-center p-5 rounded-2xl"
                  style={{ background: LK.redBg, border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ color: LK.red, fontSize: '32px', fontWeight: '800' }}>{report.homework.late}</p>
                  <p style={{ color: LK.textSub, fontSize: '12px', marginTop: '4px' }}>واجب متأخر</p>
                </div>
                <div className="text-center p-5 rounded-2xl"
                  style={{ background: LK.goldBg, border: `1px solid ${LK.goldBorder}` }}>
                  <p style={{ color: LK.gold, fontSize: '32px', fontWeight: '800' }}>{report.progress.videos_completed}</p>
                  <p style={{ color: LK.textSub, fontSize: '12px', marginTop: '4px' }}>فيديو مكتمل</p>
                </div>
              </div>
            </SectionCard>

          </div>
        )}
      </div>
    </ParentLayout>
  );
}
