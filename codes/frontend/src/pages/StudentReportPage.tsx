import { useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyReport } from '../features/student/reportSlice';

function RingChart({ value, label, color }: { value: number | null; label: string; color: string }) {
  const pct = value ?? 0;
  const r   = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="text-center -mt-14">
        <p className="text-2xl font-bold text-gray-800">{value !== null ? `${value}%` : '—'}</p>
      </div>
      <p className="text-xs text-gray-500 mt-8">{label}</p>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function StudentReportPage() {
  const dispatch = useAppDispatch();
  const { myReport: report, loading } = useAppSelector((s) => s.report);

  useEffect(() => {
    dispatch(fetchMyReport());
  }, [dispatch]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">تقريري الشهري</h1>
          <p className="text-gray-400 text-sm mt-0.5">نظرة عامة على أدائك الأكاديمي</p>
        </div>

        {!report ? (
          <div className="text-center py-20 text-gray-400">لا توجد بيانات بعد</div>
        ) : (
          <div className="space-y-5 max-w-3xl">
            {/* KPI row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-6">المؤشرات الرئيسية</h2>
              <div className="flex justify-around flex-wrap gap-6">
                <RingChart value={report.attendance.rate} label="نسبة الحضور" color="#0d9488" />
                <RingChart value={report.exams.average} label="متوسط الامتحانات" color="#7c3aed" />
                <RingChart value={report.homework.average} label="متوسط الواجبات" color="#f59e0b" />
              </div>
            </div>

            {/* Attendance detail */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">تفاصيل الحضور</h2>
              <div className="space-y-3">
                <BarRow label="حاضر" value={report.attendance.present}
                  max={report.attendance.total} color="#10b981" />
                <BarRow label="غائب" value={report.attendance.absent}
                  max={report.attendance.total} color="#ef4444" />
                <BarRow label="متأخر" value={report.attendance.late}
                  max={report.attendance.total} color="#f59e0b" />
              </div>
            </div>

            {/* Recent exams */}
            {report.exams.recent.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">آخر الامتحانات</h2>
                <div className="space-y-3">
                  {report.exams.recent.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate max-w-xs">{ex.title ?? 'امتحان'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {ex.score}/{ex.total_points}
                        </span>
                        <span className={`text-sm font-bold ${
                          ex.pct >= 80 ? 'text-green-600' : ex.pct >= 60 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {ex.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">إحصائيات الواجبات</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{report.homework.submitted}</p>
                  <p className="text-xs text-blue-500 mt-1">واجب مُسلَّم</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-500">{report.homework.late}</p>
                  <p className="text-xs text-red-400 mt-1">تسليم متأخر</p>
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
    </StudentLayout>
  );
}
