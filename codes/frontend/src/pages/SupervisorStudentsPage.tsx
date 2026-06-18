import { useEffect, useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSupervisedStudents, fetchStudentPerformance, removeStudent,
} from '../features/supervisor/supervisorSlice';
import type { StudentPerformance } from '../features/supervisor/supervisorSlice';

function StatCard({ label, value, color }: { label: string; value: string | number | null; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  );
}

function PerformancePanel({ data }: { data: StudentPerformance }) {
  const att = data.attendance;
  const attRate = att.rate ?? 0;
  const examAvg = data.exams.average;
  const hwAvg   = data.homework.average;

  return (
    <div className="mt-4 space-y-4">
      {/* Attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الحضور والغياب</h4>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatCard label="إجمالي الحصص" value={att.total} color="bg-gray-50 text-gray-700" />
          <StatCard label="حاضر" value={att.present} color="bg-green-50 text-green-700" />
          <StatCard label="غائب" value={att.absent} color="bg-red-50 text-red-700" />
          <StatCard label="متأخر" value={att.late} color="bg-amber-50 text-amber-700" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>نسبة الحضور</span>
            <span className={`font-bold ${attRate >= 80 ? 'text-green-600' : attRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {attRate}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${attRate}%`,
                background: attRate >= 80 ? '#10b981' : attRate >= 60 ? '#f59e0b' : '#ef4444',
              }} />
          </div>
        </div>
      </div>

      {/* Exams & Homework */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">الامتحانات</h4>
          <p className="text-xs text-gray-400 mb-1">{data.exams.count} امتحان مُقدَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-gray-800">{examAvg ?? '—'}</span>
            {examAvg !== null && <span className="text-sm text-gray-400 mb-1">%</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">متوسط النتائج</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">الواجبات</h4>
          <p className="text-xs text-gray-400 mb-1">{data.homework.submitted} واجب مُسلَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-gray-800">{hwAvg ?? '—'}</span>
            {hwAvg !== null && <span className="text-sm text-gray-400 mb-1">/100</span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">متوسط الدرجات</p>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorStudentsPage() {
  const dispatch = useAppDispatch();
  const { students, performance, loading } = useAppSelector((s) => s.supervisor);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchSupervisedStudents());
  }, [dispatch]);

  async function handleToggle(id: number) {
    if (activeId === id) { setActiveId(null); return; }
    setActiveId(id);
    if (!performance[id]) dispatch(fetchStudentPerformance(id));
  }

  return (
    <SupervisorLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">طلابي</h1>
          <p className="text-gray-400 text-sm mt-0.5">{students.length} طالب تحت إشرافك</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-gray-400">
            <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>لا يوجد طلاب مُعيَّنون بعد</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {students.map((st) => (
              <div key={st.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{st.name}</p>
                      <p className="text-xs text-gray-400">{st.phone} {st.grade ? `· ${st.grade}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      st.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {st.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                    <button
                      onClick={() => handleToggle(st.id)}
                      className="text-xs text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-xl hover:bg-teal-50 transition">
                      {activeId === st.id ? 'إخفاء' : 'عرض الأداء'}
                    </button>
                    <button
                      onClick={() => dispatch(removeStudent(st.id))}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-xl hover:bg-red-50 transition">
                      إزالة
                    </button>
                  </div>
                </div>

                {activeId === st.id && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {performance[st.id] ? (
                      <PerformancePanel data={performance[st.id]} />
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
}
