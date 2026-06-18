import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';
import type { StudentLiveClass, ActiveSubscription } from '../features/student/studentSlice';

const font = { fontFamily: "'Cairo', sans-serif" };

function StatusBadge({ status }: { status: StudentLiveClass['status'] }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: '#d1fae5', color: '#065f46', ...font }}>
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: '#ede9fe', color: '#5b21b6', ...font }}>مجدولة</span>
  );
  return null;
}

function SubscriptionCard({ sub }: { sub: ActiveSubscription }) {
  const pct = Math.min(100, Math.round((sub.days_remaining / 30) * 100));
  const barColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 mb-6"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 60%, #4338ca 100%)', boxShadow: '0 8px 32px rgba(109,40,217,0.3)' }}>
      <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-2" style={font}>اشتراكك الفعّال</p>
          <p className="text-white font-black text-2xl leading-tight" style={font}>{sub.package_name}</p>
          <p className="text-purple-200/70 text-xs mt-1.5" style={font}>ينتهي في {sub.ends_at}</p>
        </div>
        <div className="text-center rounded-2xl px-5 py-3 bg-white/15 backdrop-blur-sm flex-shrink-0">
          <p className="text-white font-black text-4xl leading-none" style={font}>{sub.days_remaining}</p>
          <p className="text-purple-200 text-xs mt-1 font-semibold" style={font}>يوم متبقي</p>
        </div>
      </div>
      <div className="relative mt-5">
        <div className="flex justify-between text-xs text-purple-200/60 mb-2" style={font}>
          <span>نسبة المدة المتبقية</span><span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}` }} />
        </div>
      </div>
    </div>
  );
}

const statCards = [
  {
    key: 'courses', label: 'الدورات المتاحة', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    key: 'upcoming', label: 'حصص قادمة', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd',
    iconPath: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  },
];

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { student, courses, upcoming, subscription, loading, error } = useAppSelector((s) => s.student);
  const { totalPoints, myRank } = useAppSelector((s) => s.gamification);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchMyPoints());
  }, [dispatch]);

  const counts: Record<string, number> = { courses: courses.length, upcoming: upcoming.length };

  return (
    <StudentLayout>
      <div className="p-7 min-h-screen" style={{ background: '#f5f4ff' }}>

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1" style={font}>لوحة التحكم</p>
          <h1 className="text-slate-800 font-black" style={{ fontSize: '1.75rem', ...font }}>
            {student ? `مرحباً، ${student.name}` : 'مرحباً'}
          </h1>
          <p className="text-slate-400 text-sm mt-1" style={font}>نظرة عامة على رحلتك التعليمية</p>
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ borderWidth: 3 }} />
          </div>
        )}
        {error && (
          <div className="rounded-2xl px-5 py-4 mb-6 text-sm font-semibold" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', ...font }}>
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Subscription */}
            {subscription && <SubscriptionCard sub={subscription} />}
            {!subscription && (
              <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-amber-800 font-bold text-sm" style={font}>لا يوجد اشتراك فعّال</p>
                  <p className="text-amber-600 text-xs mt-0.5" style={font}>تواصل مع المدير لتفعيل اشتراكك</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.key} className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: '#fff', border: `1px solid ${card.border}`, boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
                    <svg className="w-6 h-6" fill="none" stroke={card.color} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.iconPath} />
                    </svg>
                  </div>
                  <div>
                    <p className="font-black text-slate-800" style={{ fontSize: '2rem', lineHeight: 1, ...font }}>{counts[card.key]}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: card.color, ...font }}>{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Points Mini Card */}
            <div className="mb-8 flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md"
              style={{ background: '#fff', border: '1px solid #ddd6fe', boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}
              onClick={() => navigate('/student/points')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-slate-800" style={{ fontSize: '2rem', lineHeight: 1, ...font }}>{totalPoints}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: '#6d28d9', ...font }}>إجمالي نقاطي</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {myRank && (
                  <div className="text-center px-4 py-2 rounded-xl" style={{ background: '#ede9fe' }}>
                    <p className="font-black text-purple-700" style={{ fontSize: '1.4rem', lineHeight: 1, ...font }}>#{myRank}</p>
                    <p className="text-xs text-purple-400 font-semibold mt-0.5" style={font}>ترتيبك</p>
                  </div>
                )}
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-slate-800 text-base" style={font}>الحصص القادمة</h2>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#ede9fe', color: '#6d28d9', ...font }}>{upcoming.length} حصة</span>
                </div>
                <div className="space-y-3">
                  {upcoming.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-4 rounded-2xl transition-all hover:shadow-md"
                      style={{ background: '#fff', border: '1px solid #ede9fe', boxShadow: '0 2px 8px rgba(109,40,217,0.05)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ede9fe' }}>
                          <svg className="w-5 h-5" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-800 font-bold text-sm" style={font}>{cls.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5" style={font}>{cls.course.title} · {cls.teacher.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5" style={font}>{new Date(cls.scheduled_at).toLocaleString('ar-EG')} · {cls.duration_minutes} دقيقة</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={cls.status} />
                        {cls.meeting_link && cls.status === 'live' && (
                          <a href={cls.meeting_link} target="_blank" rel="noreferrer"
                            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', ...font }}>
                            انضم الآن
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-slate-800 text-base" style={font}>الدورات المتاحة</h2>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#ede9fe', color: '#6d28d9', ...font }}>{courses.length} دورة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.slice(0, 6).map((course) => (
                    <div key={course.id} className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                      style={{ background: '#fff', border: '1px solid #ede9fe', boxShadow: '0 2px 8px rgba(109,40,217,0.06)' }}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                          <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-slate-800 font-bold text-sm leading-snug" style={font}>{course.title}</p>
                        <p className="text-slate-400 text-xs mt-1.5" style={font}>{course.category?.grade?.name} · {course.category?.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5" style={font}>{course.teacher?.name ?? '—'}</p>
                        <div className="mt-3 pt-3 border-t border-slate-50">
                          {course.is_free
                            ? <span className="text-sm font-black text-emerald-600" style={font}>مجاني</span>
                            : <span className="text-sm font-black text-purple-700" style={font}>{course.price}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: '#ede9fe' }}>
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-semibold" style={font}>لا توجد دورات أو حصص مسندة إليك حالياً</p>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
