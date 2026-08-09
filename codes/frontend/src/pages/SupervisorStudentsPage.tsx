import { useEffect, useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSupervisedStudents, fetchStudentPerformance, removeStudent,
} from '../features/supervisor/supervisorSlice';
import type { StudentPerformance } from '../features/supervisor/supervisorSlice';
import { C } from '../theme/palette';

function StatCard({ label, value, style }: { label: string; value: string | number | null; style: React.CSSProperties }) {
  return (
    <div className="rounded-2xl p-4" style={style}>
      <p className="text-xs font-medium mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  );
}

function PerformancePanel({ data }: { data: StudentPerformance }) {
  const att = data.attendance;
  const attRate = att.rate ?? 0;
  const examAvg = data.exams.average;
  const hwAvg = data.homework.average;

  return (
    <div className="mt-4 space-y-4">
      <div className="p-5 rounded-2xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: C.sub }}>الحضور والغياب</h4>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatCard label="إجمالي الحصص" value={att.total} style={{ background: C.card, color: C.text, border: `1px solid ${C.border}` }} />
          <StatCard label="حاضر" value={att.present} style={{ background: C.greenBg, color: C.green, border: `1px solid rgba(111,175,138,0.25)` }} />
          <StatCard label="غائب" value={att.absent} style={{ background: C.redBg, color: C.red, border: `1px solid rgba(224,122,122,0.25)` }} />
          <StatCard label="متأخر" value={att.late} style={{ background: C.amberBg, color: C.amber, border: `1px solid rgba(201,162,39,0.25)` }} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: C.sub }}>نسبة الحضور</span>
            <span className="font-bold" style={{ color: attRate >= 80 ? C.green : attRate >= 60 ? C.amber : C.red }}>
              {attRate}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: C.border }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${attRate}%`,
                background: attRate >= 80 ? C.green : attRate >= 60 ? C.amber : C.red,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-2xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: C.sub }}>الامتحانات</h4>
          <p className="text-xs mb-1" style={{ color: C.dim }}>{data.exams.count} امتحان مُقدَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: C.text }}>{examAvg ?? '—'}</span>
            {examAvg !== null && <span className="text-sm mb-1" style={{ color: C.dim }}>%</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: C.dim }}>متوسط النتائج</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: C.sub }}>الواجبات</h4>
          <p className="text-xs mb-1" style={{ color: C.dim }}>{data.homework.submitted} واجب مُسلَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: C.text }}>{hwAvg ?? '—'}</span>
            {hwAvg !== null && <span className="text-sm mb-1" style={{ color: C.dim }}>/100</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: C.dim }}>متوسط الدرجات</p>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorStudentsPage() {
  const dispatch = useAppDispatch();
  const { students, performance, loading } = useAppSelector((s) => s.supervisor);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => { dispatch(fetchSupervisedStudents()); }, [dispatch]);

  function handleToggle(id: number) {
    if (activeId === id) { setActiveId(null); return; }
    setActiveId(id);
    if (!performance[id]) dispatch(fetchStudentPerformance(id));
  }

  return (
    <SupervisorLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: C.bg, minHeight: '100%' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: C.goldGrad }} />
            <h1 className="text-xl font-bold" style={{ color: C.text }}>طلابي</h1>
          </div>
          <p className="text-xs mr-4" style={{ color: C.dim }}>{students.length} طالب تحت إشرافك</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `3px solid ${C.border}`, borderTopColor: C.primary }} />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3" style={{ color: C.dim }}>
            <p>لا يوجد طلاب مُعيَّنون بعد</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {students.map((st) => (
              <div
                key={st.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: C.goldGrad, color: '#fff' }}
                    >
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: C.text }}>{st.name}</p>
                      <p className="text-xs" style={{ color: C.dim }}>{st.phone} {st.grade ? `· ${st.grade}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={st.is_active
                        ? { background: C.greenBg, color: C.green }
                        : { background: C.bg, color: C.dim, border: `1px solid ${C.border}` }}
                    >
                      {st.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(st.id)}
                      className="text-xs px-3 py-1.5 rounded-xl transition"
                      style={{ background: C.goldBg, color: C.primary, border: `1px solid ${C.goldBdr}` }}
                    >
                      {activeId === st.id ? 'إخفاء' : 'عرض الأداء'}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(removeStudent(st.id))}
                      className="text-xs px-2 py-1.5 rounded-xl transition"
                      style={{ background: C.redBg, color: C.red, border: `1px solid rgba(224,122,122,0.25)` }}
                    >
                      إزالة
                    </button>
                  </div>
                </div>

                {activeId === st.id && (
                  <div className="px-5 pb-5" style={{ borderTop: `1px solid ${C.border}` }}>
                    {performance[st.id] ? (
                      <PerformancePanel data={performance[st.id]} />
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: `3px solid ${C.border}`, borderTopColor: C.primary }} />
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
