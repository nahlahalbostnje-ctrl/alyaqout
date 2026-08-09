import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';
import { ST } from '../theme/studentTheme';
import { STUDENT_HOME_GRID } from '../features/student/studentHomeGrid';

const wrap: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '16px 16px 40px',
  fontFamily: ST.font,
};

const cardBase = (extra?: CSSProperties): CSSProperties => ({
  background: ST.card,
  borderRadius: ST.radius,
  padding: '18px 20px',
  boxShadow: ST.shadow,
  border: `1px solid ${ST.border}`,
  boxSizing: 'border-box',
  ...extra,
});

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 14px', color: ST.navy, fontSize: 17, fontWeight: 800, lineHeight: 1.35,
    }}>
      {children}
    </h2>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p style={{ margin: 0, color: ST.sub, fontSize: 13, lineHeight: 1.6 }}>{text}</p>;
}

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { student, upcoming, courses, dashStats, subscription } = useAppSelector((s) => s.student);
  const { myRank } = useAppSelector((s) => s.gamification);
  const user = useAppSelector((s) => s.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const firstName = student?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';
  const pts = dashStats?.total_points ?? 0;
  const level = dashStats?.level ?? Math.floor(pts / 500) + 1;
  const xpIn = dashStats?.xp_in_level ?? (pts % 500);
  const xpNext = dashStats?.xp_for_next ?? 500;

  const focusClass = upcoming.find((c) => c.status === 'live')
    ?? upcoming.find((c) => c.status === 'scheduled')
    ?? upcoming[0]
    ?? null;
  const isLive = focusClass?.status === 'live';

  const pendingHw = dashStats?.pending_homework ?? 0;
  const upcomingExams = dashStats?.upcoming_exams ?? 0;
  const totalCourses = dashStats?.total_courses ?? courses.length;
  const daysLeft = subscription?.days_remaining;

  const coursesContinue = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      progress: typeof c.progress === 'number' ? c.progress : 0,
    }))
    .filter((c) => c.progress > 0 && c.progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const avgProgress = (() => {
    const withP = courses.filter((c) => typeof c.progress === 'number');
    if (withP.length === 0) return null;
    return Math.round(withP.reduce((s, c) => s + (c.progress as number), 0) / withP.length);
  })();

  const dailyGoalsDone = (pendingHw === 0 ? 1 : 0) + (upcomingExams === 0 ? 1 : 0);
  const dailyGoalsTotal = 2;

  const gap = isMobile ? 12 : 16;

  return (
    <StudentLayout xp={{ inLevel: xpIn, forNext: xpNext, level }}>
      <div dir="rtl" style={{ background: ST.bg, minHeight: '100%' }}>
        <div style={wrap}>

          {/* 1) Subscription banner */}
          {daysLeft != null && daysLeft <= 14 && (
            <div style={{
              ...cardBase({
                marginBottom: gap,
                minHeight: 90,
                padding: isMobile ? '16px' : '18px 24px',
                background: ST.goldGrad,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }),
            }}>
              <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: isMobile ? 14 : 16 }}>
                اشتراكك ينتهي خلال {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/messages')}
                style={{
                  padding: '10px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: ST.navy, color: '#fff', fontWeight: 800, fontSize: 13,
                  fontFamily: ST.font, boxShadow: ST.shadow,
                }}
              >
                تواصل مع الإدارة
              </button>
            </div>
          )}

          {/* 2) Hero live class */}
          <div style={{
            ...cardBase({
              marginBottom: gap,
              minHeight: isMobile ? 200 : 260,
              padding: isMobile ? 20 : 28,
              background: ST.blueGrad,
              border: 'none',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: ST.shadowLg,
            }),
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.15,
              background: 'radial-gradient(circle at 20% 20%, #fff, transparent 50%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 900, lineHeight: 1.3 }}>
                  {isLive ? 'حصتك المباشرة الآن' : 'الحصة القادمة'}
                </h1>
                {isLive && (
                  <span style={{
                    background: ST.danger, color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '4px 10px', borderRadius: 99,
                  }}>
                    مباشر الآن
                  </span>
                )}
              </div>
              {focusClass ? (
                <>
                  <p style={{ margin: '0 0 6px', fontSize: isMobile ? 16 : 18, fontWeight: 800 }}>
                    {focusClass.title || focusClass.course?.title || 'حصة'}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.92 }}>
                    {focusClass.teacher?.name ? `المعلم: أ. ${focusClass.teacher.name}` : 'المعلم: —'}
                  </p>
                  <p style={{ margin: '0 0 18px', fontSize: 13, opacity: 0.85 }}>
                    {focusClass.scheduled_at
                      ? `الموعد: ${new Date(focusClass.scheduled_at).toLocaleString('ar-EG', {
                          weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}`
                      : 'الموعد: —'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLive) {
                        navigate(`/live/${focusClass.agora_channel ?? 'demo'}?classId=${focusClass.id}`);
                      } else {
                        navigate('/student/live-classes');
                      }
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '14px 28px', borderRadius: 16, border: 'none', cursor: 'pointer',
                      background: '#fff', color: ST.primary, fontWeight: 900, fontSize: 15,
                      fontFamily: ST.font, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                  >
                    {isLive ? 'دخول الحصة الآن' : 'عرض الجدول'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 18px', fontSize: 14, opacity: 0.9 }}>لا توجد حصة مجدولة حالياً.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/student/live-classes')}
                    style={{
                      padding: '12px 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.95)', color: ST.primary, fontWeight: 800,
                      fontSize: 14, fontFamily: ST.font,
                    }}
                  >
                    تصفّح الجدول
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 3) Daily goals + performance */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap,
            marginBottom: gap,
          }}>
            <div style={cardBase()}>
              <H2>الأهداف اليومية</H2>
              <p style={{ margin: '0 0 10px', color: ST.sub, fontSize: 12.5 }}>
                {dailyGoalsDone} / {dailyGoalsTotal} مكتمل اليوم
              </p>
              <div style={{ height: 8, borderRadius: 99, background: ST.bg, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(dailyGoalsDone / dailyGoalsTotal) * 100}%`,
                  background: ST.success, borderRadius: 99,
                }} />
              </div>
              <ul style={{ margin: 0, paddingInlineStart: 18, color: ST.text, fontSize: 13, lineHeight: 1.8 }}>
                <li style={{ color: pendingHw === 0 ? ST.success : ST.text }}>
                  {pendingHw === 0 ? '✓ لا واجبات معلّقة' : `○ إنهاء الواجبات المعلّقة (${pendingHw})`}
                </li>
                <li style={{ color: upcomingExams === 0 ? ST.success : ST.text }}>
                  {upcomingExams === 0 ? '✓ لا امتحانات عاجلة' : `○ التحضير للامتحانات (${upcomingExams})`}
                </li>
              </ul>
            </div>
            <div style={cardBase()}>
              <H2>مؤشر أداء الطالب</H2>
              <p style={{ margin: 0, color: ST.navy, fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
                {avgProgress != null ? `${avgProgress}%` : '—'}
              </p>
              <p style={{ margin: '8px 0 0', color: ST.sub, fontSize: 13 }}>
                متوسط إنجاز دوراتك المفعّلة
              </p>
              {avgProgress != null && (
                <div style={{ height: 8, borderRadius: 99, background: ST.bg, marginTop: 14, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${avgProgress}%`,
                    background: ST.blueGrad, borderRadius: 99,
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* 4) Quick notifications */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>إشعارات سريعة</H2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => navigate('/student/homework')}
                style={{
                  textAlign: 'right', padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${ST.danger}44`, background: ST.dangerSoft,
                  fontFamily: ST.font,
                }}
              >
                <span style={{ display: 'block', color: ST.danger, fontWeight: 800, fontSize: 13 }}>واجب مستحق</span>
                <span style={{ color: ST.text, fontSize: 12, fontWeight: 600 }}>
                  {pendingHw > 0 ? `${pendingHw} معلّق` : 'لا يوجد حالياً'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/homework')}
                style={{
                  textAlign: 'right', padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${ST.success}44`, background: ST.successSoft,
                  fontFamily: ST.font,
                }}
              >
                <span style={{ display: 'block', color: ST.success, fontWeight: 800, fontSize: 13 }}>واجب مُصحَّح</span>
                <span style={{ color: ST.text, fontSize: 12, fontWeight: 600 }}>
                  راجع نتائجك في الواجبات
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/study-24')}
                style={{
                  textAlign: 'right', padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${ST.primary}33`, background: ST.primarySoft,
                  fontFamily: ST.font,
                }}
              >
                <span style={{ display: 'block', color: ST.primary, fontWeight: 800, fontSize: 13 }}>غرفة المذاكرة</span>
                <span style={{ color: ST.text, fontSize: 12, fontWeight: 600 }}>
                  متصل الآن: —
                </span>
              </button>
            </div>
          </div>

          {/* 5) Sticky tasks notes */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>المهام</H2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '12px 14px', borderRadius: 14, background: ST.primarySoft,
                borderRight: `4px solid ${ST.primary}`,
              }}>
                <p style={{ margin: 0, color: ST.text, fontSize: 13.5, fontWeight: 700 }}>
                  مرحباً {firstName}، بقي لك {pendingHw} {pendingHw === 1 ? 'واجب' : 'واجبات'}
                </p>
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 14, background: ST.goldSoft,
                borderRight: `4px solid ${ST.gold}`,
              }}>
                <p style={{ margin: 0, color: ST.text, fontSize: 13.5, fontWeight: 700 }}>
                  {upcomingExams > 0
                    ? `تذكير: لديك ${upcomingExams} امتحان قادم — راجع مواعيدك`
                    : 'لا امتحانات مجدولة في الأيام القريبة'}
                </p>
              </div>
            </div>
          </div>

          {/* 6) Quick access grid 3×7 */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>الخدمات</H2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(2, 1fr)'
                : 'repeat(7, 1fr)',
              gap: 10,
            }}>
              {STUDENT_HOME_GRID.map((item) => (
                <button
                  key={`${item.to}-${item.title}`}
                  type="button"
                  onClick={() => navigate(item.to)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = ST.shadowLg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: isMobile ? '14px 8px' : '16px 8px',
                    borderRadius: 16, border: `1px solid ${ST.border}`,
                    background: ST.bg, cursor: 'pointer', fontFamily: ST.font,
                    minHeight: isMobile ? 100 : 118, transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{item.emoji}</span>
                  <span style={{ color: ST.navy, fontWeight: 800, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>
                    {item.title}
                  </span>
                  <span style={{ color: ST.sub, fontSize: 10, textAlign: 'center', lineHeight: 1.3 }}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 7) Quick stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap,
            marginBottom: gap,
          }}>
            {[
              { label: 'الواجبات المعلقة', value: pendingHw, icon: '📝', to: '/student/homework' },
              { label: 'الامتحانات القادمة', value: upcomingExams, icon: '📋', to: '/student/exams' },
              { label: 'عدد الدورات', value: totalCourses, icon: '📚', to: '/student/courses' },
              { label: 'ترتيبك الحالي', value: myRank ?? '—', icon: '🏅', to: '/student/league' },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(s.to)}
                style={{
                  ...cardBase({
                    cursor: 'pointer', textAlign: 'right', fontFamily: ST.font,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  }),
                }}
              >
                <div>
                  <p style={{ margin: 0, color: ST.navy, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: '6px 0 0', color: ST.sub, fontSize: 12, fontWeight: 600 }}>{s.label}</p>
                </div>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </button>
            ))}
          </div>

          {/* 8) Continue learning */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>أكمل من حيث توقفت</H2>
            {coursesContinue.length === 0 ? (
              <EmptyHint text="ابدأ درساً من دوراتك ليظهر هنا تقدّمك." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {coursesContinue.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                      padding: '12px 14px', borderRadius: 16, background: ST.bg, border: `1px solid ${ST.border}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 14 }}>{c.title}</p>
                      <p style={{ margin: '4px 0 8px', color: ST.sub, fontSize: 12 }}>متابعة المحتوى</p>
                      <div style={{ height: 7, borderRadius: 99, background: ST.card, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.progress}%`, background: ST.blueGrad, borderRadius: 99 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: ST.primary, fontWeight: 800, fontSize: 13 }}>{c.progress}%</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/student/courses/${c.id}/content`)}
                        style={{
                          padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: ST.blueGrad, color: '#fff', fontWeight: 800, fontSize: 12.5,
                          fontFamily: ST.font,
                        }}
                      >
                        متابعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 9) Announcements */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>آخر الإعلانات</H2>
            <EmptyHint text="لا توجد إعلانات جديدة حالياً." />
          </div>

          {/* 10) Achievements */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <H2>إنجازاتي</H2>
              <button
                type="button"
                onClick={() => navigate('/student/points')}
                style={{ border: 'none', background: 'transparent', color: ST.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: ST.font }}
              >
                الكل
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { t: 'أول واجب', d: 'مكتمل', on: pendingHw === 0 && pts > 0 },
                { t: 'نقاطك', d: `${pts} نقطة`, on: pts > 0 },
                { t: 'مستوى', d: `${level}`, on: true },
                { t: 'ترتيب', d: myRank != null ? `#${myRank}` : '—', on: myRank != null },
              ].map((a) => (
                <div
                  key={a.t}
                  style={{
                    padding: '14px 12px', borderRadius: 16, textAlign: 'center',
                    background: a.on ? ST.primarySoft : ST.bg,
                    border: `1px solid ${a.on ? ST.primary + '33' : ST.border}`,
                    opacity: a.on ? 1 : 0.7,
                  }}
                >
                  <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 13 }}>{a.t}</p>
                  <p style={{ margin: '6px 0 0', color: ST.sub, fontSize: 12 }}>{a.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 11) Rewards */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>المكافآت</H2>
            <p style={{ margin: '0 0 12px', color: ST.text, fontSize: 14 }}>
              رصيدك الحالي: <strong style={{ color: ST.primary }}>{pts.toLocaleString()} نقطة</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10 }}>
              {[
                { need: 100, label: 'خصم 5%' },
                { need: 500, label: 'دورة مجانية' },
                { need: 1000, label: 'دخول سحب شهري' },
              ].map((r) => (
                <div
                  key={r.need}
                  style={{
                    padding: '14px', borderRadius: 16, border: `1px solid ${ST.border}`, background: ST.bg,
                  }}
                >
                  <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 13 }}>{r.need} نقطة</p>
                  <p style={{ margin: '4px 0 0', color: ST.sub, fontSize: 12 }}>{r.label}</p>
                  <p style={{
                    margin: '8px 0 0', fontSize: 11, fontWeight: 700,
                    color: pts >= r.need ? ST.success : ST.dim,
                  }}>
                    {pts >= r.need ? 'متاح' : `متبقي ${r.need - pts}`}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/points')}
              style={{
                marginTop: 12, padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: ST.primarySoft, color: ST.primary, fontWeight: 800, fontSize: 13, fontFamily: ST.font,
              }}
            >
              فتح نقاطي
            </button>
          </div>

          {/* 12) AI section */}
          <div style={{ ...cardBase({ marginBottom: gap }) }}>
            <H2>المعلم الذكي</H2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <input
                type="text"
                readOnly
                onClick={() => navigate('/student/study-room')}
                placeholder="اسأل سؤالاً…"
                style={{
                  flex: 1, minWidth: 200, padding: '12px 14px', borderRadius: 14,
                  border: `1px solid ${ST.border}`, background: ST.bg, fontFamily: ST.font, fontSize: 13,
                  cursor: 'pointer', color: ST.text,
                }}
              />
              <button
                type="button"
                onClick={() => navigate('/student/study-room')}
                style={{
                  padding: '12px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: ST.blueGrad, color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: ST.font,
                }}
              >
                اسأل
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { t: 'مساعدة واجب', to: '/student/homework' },
                { t: 'تحضير امتحان', to: '/student/exams' },
                { t: 'توصيات تعلّم', to: '/student/catalog' },
              ].map((q) => (
                <button
                  key={q.t}
                  type="button"
                  onClick={() => navigate(q.to)}
                  style={{
                    padding: '8px 14px', borderRadius: 99, border: `1px solid ${ST.border}`,
                    background: ST.card, color: ST.text, fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', fontFamily: ST.font,
                  }}
                >
                  {q.t}
                </button>
              ))}
            </div>
          </div>

          {/* 13) Footer motivational */}
          <div style={{
            ...cardBase({
              textAlign: 'center',
              background: `linear-gradient(135deg, ${ST.navy} 0%, ${ST.primary} 100%)`,
              border: 'none',
              padding: isMobile ? '28px 20px' : '36px 28px',
            }),
          }}>
            <p style={{
              margin: 0, color: '#fff', fontSize: isMobile ? 16 : 20, fontWeight: 800, lineHeight: 1.6,
            }}>
              تعلّم اليوم… تصنع مستقبلك غداً
            </p>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              منصة الياقوت لخدمات التعليم
            </p>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
