import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherLiveClasses, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';
import type { TeacherLiveClass } from '../features/teacher/teacherSlice';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  cardEnded:  { background: '#FAFAFA', border: '1px solid #EDE3CE', opacity: 0.7 },
  gold:       '#C9952A',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  greenBorder:'rgba(16,185,129,0.2)',
  blue:       '#3B82F6',
  blueBg:     'rgba(59,130,246,0.08)',
  blueBorder: 'rgba(59,130,246,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  redBorder:  'rgba(239,68,68,0.2)',
};

function statusBadge(status: TeacherLiveClass['status']) {
  if (status === 'live') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: TH.green }} />
      جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: TH.blueBg, color: TH.blue, border: `1px solid ${TH.blueBorder}` }}>مجدولة</span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: '#F3F4F6', color: TH.textDim, border: '1px solid #E5E7EB' }}>منتهية</span>
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
      <div className="p-6 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: TH.pageBg }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <h2 className="text-xl font-bold" style={{ color: TH.text }}>حصصي المباشرة</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: TH.textSub }}>إدارة حصصك المجدولة والجارية</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        )}
        {error && (
          <p className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ color: TH.red, background: TH.redBg, border: `1px solid ${TH.redBorder}` }}>
            {error}
          </p>
        )}

        {!loading && liveClasses.length === 0 && (
          <p className="text-center py-12" style={{ color: TH.textDim }}>لا توجد حصص مسندة إليك حالياً</p>
        )}

        {active.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: TH.textSub }}>المجدولة والجارية</h3>
            <div className="space-y-3">
              {active.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl" style={TH.card}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(cls.status)}
                        <p className="font-semibold" style={{ color: TH.text }}>{cls.title}</p>
                      </div>
                      {cls.description && (
                        <p className="text-xs mb-2" style={{ color: TH.textSub }}>{cls.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: TH.textSub }}>
                        <span>📚 {cls.course.title}</span>
                        <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                        <span>⏱ {cls.duration_minutes} دقيقة</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 mr-4">
                      {cls.status === 'scheduled' && cls.agora_channel && (
                        <button onClick={() => handleStart(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          بدء الحصة
                        </button>
                      )}
                      {cls.status === 'live' && cls.agora_channel && (
                        <button onClick={() => handleJoin(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: TH.goldGrad, color: '#fff' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                          </svg>
                          الدخول للحصة
                        </button>
                      )}
                      {cls.status === 'live' && (
                        <button onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                          className="text-xs transition"
                          style={{ color: TH.red }}>
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
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: TH.textSub }}>المنتهية</h3>
            <div className="space-y-2">
              {ended.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl" style={TH.cardEnded}>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(cls.status)}
                    <p className="font-medium" style={{ color: TH.textSub }}>{cls.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: TH.textDim }}>
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
