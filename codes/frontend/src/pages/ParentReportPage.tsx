import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchChildReport } from '../features/student/reportSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

function RingChart({ value, label, color }: { value: number | null; label: string; color: string }) {
  const pct  = value ?? 0;
  const r    = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="text-center -mt-14">
        <p className="text-2xl font-bold text-white">{value !== null ? `${value}%` : '—'}</p>
      </div>
      <p className="text-xs mt-8" style={{ color: DK.dimTxt }}>{label}</p>
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
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        {report?.student && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
              <h1 className="text-xl font-bold text-white">تقرير {report.student.name}</h1>
            </div>
            <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>الأداء الأكاديمي الشامل</p>
          </div>
        )}

        {!report ? (
          <div className="text-center py-20" style={{ color: DK.dimTxt }}>لا توجد بيانات</div>
        ) : (
          <div className="space-y-5 max-w-3xl">
            {/* KPIs */}
            <div className="p-6 rounded-2xl" style={DK.card}>
              <h2 className="text-sm font-semibold mb-6" style={{ color: DK.dimTxt }}>المؤشرات الرئيسية</h2>
              <div className="flex justify-around flex-wrap gap-6">
                <RingChart value={report.attendance.rate}  label="نسبة الحضور"     color="#34d399" />
                <RingChart value={report.exams.average}    label="متوسط الامتحانات" color={DK.gold} />
                <RingChart value={report.homework.average} label="متوسط الواجبات"   color="#60a5fa" />
              </div>
            </div>

            {/* Attendance */}
            <div className="p-6 rounded-2xl" style={DK.card}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: DK.dimTxt }}>الحضور</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'إجمالي', value: report.attendance.total,   style: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' } },
                  { label: 'حاضر',   value: report.attendance.present, style: { background: 'rgba(52,211,153,0.08)', color: '#34d399' } },
                  { label: 'غائب',   value: report.attendance.absent,  style: { background: 'rgba(239,68,68,0.08)',   color: '#f87171' } },
                  { label: 'متأخر',  value: report.attendance.late,    style: { background: 'rgba(245,158,11,0.08)',  color: '#fbbf24' } },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl p-4 text-center" style={c.style}>
                    <p className="text-2xl font-bold">{c.value}</p>
                    <p className="text-xs mt-1 opacity-70">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exams */}
            {report.exams.recent.length > 0 && (
              <div className="p-6 rounded-2xl" style={DK.card}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: DK.dimTxt }}>
                  الامتحانات
                  <span className="mr-2 text-xs font-normal" style={{ color: DK.dimTxt }}>({report.exams.count} امتحان)</span>
                </h2>
                <div className="space-y-3">
                  {report.exams.recent.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-sm text-white truncate max-w-xs">{ex.title ?? 'امتحان'}</span>
                      <span className="text-sm font-bold" style={{
                        color: ex.pct >= 80 ? '#34d399' : ex.pct >= 60 ? '#fbbf24' : '#f87171'
                      }}>
                        {ex.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework */}
            <div className="p-6 rounded-2xl" style={DK.card}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: DK.dimTxt }}>الواجبات</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{report.homework.submitted}</p>
                  <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>مُسلَّم</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#f87171' }}>{report.homework.late}</p>
                  <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>متأخر</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                  <p className="text-2xl font-bold" style={{ color: DK.gold }}>{report.progress.videos_completed}</p>
                  <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>فيديو مكتمل</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
