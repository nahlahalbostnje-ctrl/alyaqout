import { useEffect, useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSupervisedStudents, fetchStudentPerformance, removeStudent,
} from '../features/supervisor/supervisorSlice';
import type { StudentPerformance } from '../features/supervisor/supervisorSlice';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  dimTxt: '#9CA3AF',
};

function StatCard({ label, value, style }: { label: string; value: string | number | null; style: React.CSSProperties }) {
  return (
    <div className="rounded-2xl p-4" style={style}>
      <p className="text-xs font-medium mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  );
}

function PerformancePanel({ data }: { data: StudentPerformance }) {
  const att    = data.attendance;
  const attRate = att.rate ?? 0;
  const examAvg = data.exams.average;
  const hwAvg   = data.homework.average;

  return (
    <div className="mt-4 space-y-4">
      <div className="p-5 rounded-2xl" style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>الحضور والغياب</h4>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatCard label="إجمالي الحصص" value={att.total}   style={{ background: '#FFFFFF', color: '#1B2038', border: '1px solid #EDE3CE' }} />
          <StatCard label="حاضر"           value={att.present} style={{ background: 'rgba(16,185,129,0.06)', color: '#10B981', border: '1px solid rgba(16,185,129,0.15)' }} />
          <StatCard label="غائب"           value={att.absent}  style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }} />
          <StatCard label="متأخر"          value={att.late}    style={{ background: 'rgba(245,158,11,0.06)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#6B7280' }}>نسبة الحضور</span>
            <span className="font-bold" style={{ color: attRate >= 80 ? '#10B981' : attRate >= 60 ? '#F59E0B' : '#EF4444' }}>
              {attRate}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#EDE3CE' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${attRate}%`,
                background: attRate >= 80 ? '#10B981' : attRate >= 60 ? '#F59E0B' : '#EF4444',
              }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-2xl" style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>الامتحانات</h4>
          <p className="text-xs mb-1" style={{ color: DK.dimTxt }}>{data.exams.count} امتحان مُقدَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: '#1B2038' }}>{examAvg ?? '—'}</span>
            {examAvg !== null && <span className="text-sm mb-1" style={{ color: DK.dimTxt }}>%</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>متوسط النتائج</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>الواجبات</h4>
          <p className="text-xs mb-1" style={{ color: DK.dimTxt }}>{data.homework.submitted} واجب مُسلَّم</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: '#1B2038' }}>{hwAvg ?? '—'}</span>
            {hwAvg !== null && <span className="text-sm mb-1" style={{ color: DK.dimTxt }}>/100</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>متوسط الدرجات</p>
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

  async function handleToggle(id: number) {
    if (activeId === id) { setActiveId(null); return; }
    setActiveId(id);
    if (!performance[id]) dispatch(fetchStudentPerformance(id));
  }

  return (
    <SupervisorLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100%' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h1 className="text-xl font-bold" style={{ color: '#1B2038' }}>طلابي</h1>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>{students.length} طالب تحت إشرافك</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3" style={{ color: DK.dimTxt }}>
            <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#C9952A' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>لا يوجد طلاب مُعيَّنون بعد</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {students.map((st) => (
              <div key={st.id} className="rounded-2xl overflow-hidden" style={DK.card}>
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#1B2038' }}>{st.name}</p>
                      <p className="text-xs" style={{ color: DK.dimTxt }}>{st.phone} {st.grade ? `· ${st.grade}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={st.is_active
                        ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                        : { background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                      {st.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                    <button onClick={() => handleToggle(st.id)}
                      className="text-xs px-3 py-1.5 rounded-xl transition"
                      style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold, border: '1px solid rgba(201,149,42,0.2)' }}>
                      {activeId === st.id ? 'إخفاء' : 'عرض الأداء'}
                    </button>
                    <button onClick={() => dispatch(removeStudent(st.id))}
                      className="text-xs px-2 py-1.5 rounded-xl transition"
                      style={{ background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                      إزالة
                    </button>
                  </div>
                </div>

                {activeId === st.id && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid #EDE3CE' }}>
                    {performance[st.id] ? (
                      <PerformancePanel data={performance[st.id]} />
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
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
