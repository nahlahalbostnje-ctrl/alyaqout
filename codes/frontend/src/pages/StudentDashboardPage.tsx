import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';
import type { StudentLiveClass, ActiveSubscription } from '../features/student/studentSlice';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  cardHov: { border: '1px solid rgba(245,166,35,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
};

function StatusBadge({ status }: { status: StudentLiveClass['status'] }) {
  if (status === 'live') return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
    >
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}
    >
      مجدولة
    </span>
  );
  return null;
}

function SubscriptionCard({ sub }: { sub: ActiveSubscription }) {
  const pct = Math.min(100, Math.round((sub.days_remaining / 30) * 100));
  const barColor = pct > 50 ? '#34d399' : pct > 20 ? '#f5a623' : '#f87171';
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 mb-6"
      style={{
        background: 'linear-gradient(135deg, #0d1b4b 0%, #060d1f 60%, #070e22 100%)',
        border: '1px solid rgba(245,166,35,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Gold shimmer corners */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: DK.gold, filter: 'blur(40px)', transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-8"
        style={{ background: DK.goldL, filter: 'blur(30px)', transform: 'translate(-40%, 40%)' }} />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: DK.gold, opacity: 0.7 }}>
            اشتراكك الفعّال
          </p>
          <p className="text-white font-black text-2xl leading-tight">{sub.package_name}</p>
          <p className="text-xs mt-1.5" style={{ color: DK.dimTxt }}>ينتهي في {sub.ends_at}</p>
        </div>
        <div
          className="text-center rounded-2xl px-5 py-3 flex-shrink-0"
          style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}
        >
          <p className="font-black text-4xl leading-none" style={{ color: DK.gold }}>{sub.days_remaining}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: DK.dimTxt }}>يوم متبقي</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex justify-between text-xs mb-2" style={{ color: DK.dimTxt }}>
          <span>نسبة المدة المتبقية</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { student, courses, upcoming, subscription, loading, error } = useAppSelector((s) => s.student);
  const { totalPoints, myRank } = useAppSelector((s) => s.gamification);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchMyPoints());
  }, [dispatch]);

  return (
    <StudentLayout>
      <div className="p-7 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, #f5a623, #ffd166)` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f5a623', opacity: 0.65 }}>
              لوحة الطالب
            </span>
          </div>
          <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.5px' }}>
            {student ? `مرحباً، ${student.name.split(' ')[0]}` : 'مرحباً'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            نظرة عامة على رحلتك التعليمية
          </p>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.2), transparent)' }} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-5 py-4 mb-6 text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Subscription */}
            {subscription && <SubscriptionCard sub={subscription} />}
            {!subscription && (
              <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#fbbf24' }}>لا يوجد اشتراك فعّال</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(245,158,11,0.6)' }}>تواصل مع المدير لتفعيل اشتراكك</p>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 cursor-default" style={DK.card}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-black text-white" style={{ lineHeight: 1 }}>{courses.length}</p>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: '#60a5fa' }}>الدورات المتاحة</p>
                </div>
              </div>

              <div className="rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 cursor-default" style={DK.card}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#a78bfa" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-black text-white" style={{ lineHeight: 1 }}>{upcoming.length}</p>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: '#a78bfa' }}>حصص قادمة</p>
                </div>
              </div>
            </div>

            {/* Points Mini Card */}
            <div
              className="mb-8 flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={DK.card}
              onClick={() => navigate('/student/points')}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', boxShadow: '0 4px 14px rgba(245,166,35,0.3)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#040a18" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-black text-white" style={{ lineHeight: 1 }}>{totalPoints}</p>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: '#f5a623' }}>إجمالي نقاطي</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {myRank && (
                  <div className="text-center px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.15)' }}>
                    <p className="font-black text-xl" style={{ color: '#f5a623', lineHeight: 1 }}>#{myRank}</p>
                    <p className="text-xs mt-0.5 font-semibold" style={{ color: DK.dimTxt }}>ترتيبك</p>
                  </div>
                )}
                <svg className="w-4 h-4" style={{ color: DK.dimTxt }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>

            {/* Upcoming Classes */}
            {upcoming.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white text-base">الحصص القادمة</h2>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(245,166,35,0.1)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.15)' }}
                  >
                    {upcoming.length} حصة
                  </span>
                </div>
                <div className="space-y-3">
                  {upcoming.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                      style={DK.card}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                          <svg className="w-5 h-5" fill="none" stroke="#a78bfa" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{cls.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
                            {cls.course.title} · {cls.teacher.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
                            {new Date(cls.scheduled_at).toLocaleString('ar-EG')} · {cls.duration_minutes} دقيقة
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={cls.status} />
                        {cls.status === 'live' && (
                          <button
                            onClick={() => navigate(`/live/${cls.agora_channel ?? ''}?classId=${cls.id}`)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}
                          >
                            انضم الآن
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white text-base">الدورات المتاحة</h2>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.15)' }}
                  >
                    {courses.length} دورة
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.slice(0, 6).map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                      style={DK.card}
                    >
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div
                          className="w-full h-36 flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(167,139,250,0.08))' }}
                        >
                          <svg className="w-12 h-12" fill="none" stroke="rgba(96,165,250,0.4)" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-white font-bold text-sm leading-snug">{course.title}</p>
                        <p className="text-xs mt-1.5" style={{ color: DK.dimTxt }}>
                          {course.category?.grade?.name} · {course.category?.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{course.teacher?.name ?? '—'}</p>
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          {course.is_free
                            ? <span className="text-sm font-black" style={{ color: '#34d399' }}>مجاني</span>
                            : <span className="text-sm font-black" style={{ color: '#f5a623' }}>{course.price}</span>
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                  <svg className="w-8 h-8" fill="none" stroke="rgba(245,166,35,0.5)" viewBox="0 0 24 24">
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
    </StudentLayout>
  );
}
