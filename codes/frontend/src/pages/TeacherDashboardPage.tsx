import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherDashboard, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';
import type { TeacherLiveClass } from '../features/teacher/teacherSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

function StatusBadge({ status }: { status: TeacherLiveClass['status'] }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
      مجدولة
    </span>
  );
  return null;
}

export default function TeacherDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { teacher, courses, upcoming, loading, error } = useAppSelector((s) => s.teacher);

  useEffect(() => { dispatch(fetchTeacherDashboard()); }, [dispatch]);

  return (
    <TeacherLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full"
              style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.7 }}>
              لوحة المعلم
            </span>
          </div>
          <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.5px' }}>
            {teacher ? `مرحباً، ${teacher.name.split(' ')[0]}` : 'لوحة المعلم'}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: DK.dimTxt }}>نظرة عامة على دوراتك وحصصك</p>
          <div className="mt-5 h-px"
            style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.2), transparent)' }} />
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(245,166,35,0.2)', borderTopColor: DK.gold }} />
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-5 py-4 text-sm font-medium mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="rounded-2xl p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300" style={DK.card}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#34d399" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-4xl font-black text-white" style={{ lineHeight: 1 }}>{courses.length}</p>
                  <p className="text-xs font-semibold mt-2" style={{ color: '#34d399' }}>دوراتي</p>
                </div>
              </div>

              <div className="rounded-2xl p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300" style={DK.card}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke={DK.gold} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-4xl font-black text-white" style={{ lineHeight: 1 }}>{upcoming.length}</p>
                  <p className="text-xs font-semibold mt-2" style={{ color: DK.gold }}>حصص قادمة</p>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            {upcoming.length > 0 && (
              <div className="mb-10">
                <h3 className="text-base font-bold text-white mb-4">حصصي القادمة</h3>
                <div className="space-y-3">
                  {upcoming.map((cls) => (
                    <div key={cls.id} className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={DK.card}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <StatusBadge status={cls.status} />
                            <p className="font-bold text-white text-sm">{cls.title}</p>
                          </div>
                          <p className="text-xs" style={{ color: DK.dimTxt }}>{cls.course.title}</p>
                          <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>
                            {new Date(cls.scheduled_at).toLocaleString('ar-EG')} · {cls.duration_minutes} دقيقة
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {cls.status === 'scheduled' && (
                            <button
                              onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                              className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                              style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: '#040a18', boxShadow: '0 4px 14px rgba(52,211,153,0.25)' }}
                            >
                              بدء الحصة
                            </button>
                          )}
                          {cls.status === 'live' && (
                            <div className="flex flex-col gap-2 items-end">
                              <button
                                onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                                className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                              >
                                إنهاء الحصة
                              </button>
                              {cls.agora_channel && (
                                <button
                                  onClick={() => navigate(`/live/${cls.agora_channel}?classId=${cls.id}`)}
                                  className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}
                                >
                                  دخول الحصة
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {courses.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-white mb-4">دوراتي</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={DK.card}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 flex items-center justify-center text-4xl"
                          style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(245,166,35,0.08))' }}>
                          <svg className="w-12 h-12" fill="none" stroke="rgba(245,166,35,0.3)" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-bold text-white text-sm">{course.title}</p>
                        <p className="text-xs mt-1.5" style={{ color: DK.dimTxt }}>
                          {course.category?.grade?.name} · {course.category?.name}
                        </p>
                        <p className="text-sm font-bold mt-3" style={{ color: course.is_free ? '#34d399' : DK.gold }}>
                          {course.is_free ? 'مجاني' : course.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length === 0 && upcoming.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                  <svg className="w-8 h-8" fill="none" stroke="rgba(245,166,35,0.4)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: DK.dimTxt }}>لا توجد دورات أو حصص مسندة إليك حالياً</p>
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
