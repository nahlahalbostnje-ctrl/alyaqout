import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentLiveClasses } from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';
import type { StudentLiveClass } from '../features/student/studentSlice';

const DK = {
  gold:   '#f5a623',
  dimTxt: 'rgba(255,255,255,0.4)',
};

function statusBadge(status: StudentLiveClass['status']) {
  if (status === 'live') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>مجدولة</span>
  );
  return null;
}

export default function StudentLiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { liveClasses, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => { dispatch(fetchStudentLiveClasses()); }, [dispatch]);

  const handleJoin = (cls: StudentLiveClass) => {
    if (!cls.agora_channel) return;
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  return (
    <StudentLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">الحصص المباشرة</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>الحصص المجدولة والجارية في بلدك</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}
        {error && <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

        {!loading && liveClasses.length === 0 && (
          <p className="text-center py-12" style={{ color: DK.dimTxt }}>لا توجد حصص متاحة حالياً</p>
        )}

        <div className="space-y-3">
          {liveClasses.map((cls) => (
            <div key={cls.id} className="p-4 rounded-xl"
              style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(cls.status)}
                    <p className="font-semibold text-white">{cls.title}</p>
                  </div>
                  {cls.description && (
                    <p className="text-xs mb-2" style={{ color: DK.dimTxt }}>{cls.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: DK.dimTxt }}>
                    <span>📚 {cls.course.title}</span>
                    <span>👤 {cls.teacher.name}</span>
                    <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                    <span>⏱ {cls.duration_minutes} دقيقة</span>
                  </div>
                </div>

                {cls.status === 'live' && cls.agora_channel && (
                  <button onClick={() => handleJoin(cls)}
                    className="mr-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    انضم الآن
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
