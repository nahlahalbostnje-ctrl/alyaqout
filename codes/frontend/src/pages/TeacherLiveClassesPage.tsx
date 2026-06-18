import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherLiveClasses, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';
import type { TeacherLiveClass } from '../features/teacher/teacherSlice';

const DK = {
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

function statusBadge(status: TeacherLiveClass['status']) {
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
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>منتهية</span>
  );
}

export default function TeacherLiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { liveClasses, loading, error } = useAppSelector((s) => s.teacher);

  useEffect(() => { dispatch(fetchTeacherLiveClasses()); }, [dispatch]);

  const active = liveClasses.filter((c) => c.status !== 'ended');
  const ended  = liveClasses.filter((c) => c.status === 'ended');

  const handleStart = async (cls: TeacherLiveClass) => {
    if (!cls.agora_channel) return;
    await dispatch(updateTeacherClassStatus(cls.id)).unwrap();
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  const handleJoin = (cls: TeacherLiveClass) => {
    if (!cls.agora_channel) return;
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  return (
    <TeacherLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">حصصي المباشرة</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>إدارة حصصك المجدولة والجارية</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}
        {error && <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

        {!loading && liveClasses.length === 0 && (
          <p className="text-center py-12" style={{ color: DK.dimTxt }}>لا توجد حصص مسندة إليك حالياً</p>
        )}

        {active.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: DK.dimTxt }}>المجدولة والجارية</h3>
            <div className="space-y-3">
              {active.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl"
                  style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(cls.status)}
                        <p className="font-semibold text-white">{cls.title}</p>
                      </div>
                      {cls.description && <p className="text-xs mb-2" style={{ color: DK.dimTxt }}>{cls.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: DK.dimTxt }}>
                        <span>📚 {cls.course.title}</span>
                        <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                        <span>⏱ {cls.duration_minutes} دقيقة</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 mr-4">
                      {cls.status === 'scheduled' && cls.agora_channel && (
                        <button onClick={() => handleStart(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          بدء الحصة
                        </button>
                      )}
                      {cls.status === 'live' && cls.agora_channel && (
                        <button onClick={() => handleJoin(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                          </svg>
                          الدخول للحصة
                        </button>
                      )}
                      {cls.status === 'live' && (
                        <button onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                          className="text-xs transition"
                          style={{ color: '#f87171' }}>
                          إنهاء الحصة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ended.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: DK.dimTxt }}>المنتهية</h3>
            <div className="space-y-2">
              {ended.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.6 }}>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(cls.status)}
                    <p className="font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{cls.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: DK.dimTxt }}>
                    <span>📚 {cls.course.title}</span>
                    <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                    <span>⏱ {cls.duration_minutes} دقيقة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
