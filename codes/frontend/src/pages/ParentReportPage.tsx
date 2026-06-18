import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchChildReport } from '../features/student/reportSlice';

function RingChart({ value, label, color }: { value: number | null; label: string; color: string }) {
  const pct   = value ?? 0;
  const r     = 36;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="text-center -mt-14">
        <p className="text-2xl font-bold text-gray-800">{value !== null ? `${value}%` : '—'}</p>
      </div>
      <p className="text-xs text-gray-500 mt-8">{label}</p>
    </div>
  );
}

export default function ParentReportPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = parseInt(studentId ?? '0');

  const dispatch = useAppDispatch();
  const { childReports, loading } = useAppSelector((s) => s.report);
  const report = childReports[id];

  useEffect(() => {
    if (id) dispatch(fetchChildReport(id));
  }, [dispatch, id]);

  if (loading && !report) {
    return (
      <ParentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="p-6" dir="rtl">
        {report?.student && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">تقرير {report.student.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">الأداء الأكاديمي الشامل</p>
          </div>
        )}

        {!report ? (
          <div className="text-center py-20 text-gray-400">لا توجد بيانات</div>
        ) : (
          <div className="space-y-5 max-w-3xl">
            {/* KPIs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-6">المؤشرات الرئيسية</h2>
              <div className="flex justify-around flex-wrap gap-6">
                <RingChart value={report.attendance.rate} label="نسبة الحضور" color="#6366f1" />
                <RingChart value={report.exams.average} label="متوسط الامتحانات" color="#7c3aed" />
                <RingChart value={report.homework.average} label="متوسط الواجبات" color="#f59e0b" />
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">الحضور</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'إجمالي', value: report.attendance.total, bg: 'bg-gray-50', text: 'text-gray-700' },
                  { label: 'حاضر',   value: report.attendance.present, bg: 'bg-green-50', text: 'text-green-700' },
                  { label: 'غائب',   value: report.attendance.absent, bg: 'bg-red-50', text: 'text-red-600' },
                  { label: 'متأخر',  value: report.attendance.late, bg: 'bg-amber-50', text: 'text-amber-600' },
                ].map((c) => (
                  <div key={c.label} className={`${c.bg} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
                    <p className={`text-xs mt-1 ${c.text} opacity-70`}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exams */}
            {report.exams.recent.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  الامتحانات
                  <span className="mr-2 text-xs font-normal text-gray-400">({report.exams.count} امتحان)</span>
                </h2>
                <div className="space-y-3">
                  {report.exams.recent.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-700 truncate max-w-xs">{ex.title ?? 'امتحان'}</span>
                      <span className={`text-sm font-bold ${
                        ex.pct >= 80 ? 'text-green-600' : ex.pct >= 60 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {ex.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">الواجبات</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{report.homework.submitted}</p>
                  <p className="text-xs text-blue-500 mt-1">مُسلَّم</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-500">{report.homework.late}</p>
                  <p className="text-xs text-red-400 mt-1">متأخر</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{report.progress.videos_completed}</p>
                  <p className="text-xs text-purple-400 mt-1">فيديو مكتمل</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
