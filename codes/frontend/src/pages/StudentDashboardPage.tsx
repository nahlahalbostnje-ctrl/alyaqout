import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';
import { ST } from '../theme/studentTheme';
import { STUDENT_HOME_GRID } from '../features/student/studentHomeGrid';

const wrap: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '14px 14px 28px',
  fontFamily: ST.font,
};

const card = (extra?: CSSProperties): CSSProperties => ({
  background: ST.card,
  borderRadius: ST.radius,
  padding: '16px 16px',
  boxShadow: ST.shadow,
  border: `1px solid ${ST.border}`,
  boxSizing: 'border-box',
  ...extra,
});

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { upcoming, courses, dashStats, subscription } = useAppSelector((s) => s.student);
  const { myRank, leaderboard } = useAppSelector((s) => s.gamification);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const level = dashStats?.level ?? Math.floor((dashStats?.total_points ?? 0) / 500) + 1;
  const xpIn = dashStats?.xp_in_level ?? ((dashStats?.total_points ?? 0) % 500);
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
  const rankTotal = leaderboard.length > 0 ? leaderboard.length : null;

  const goals = [
    { id: 'attend', label: 'حضور الحصة', done: !isLive },
    { id: 'hw', label: 'إنهاء الواجب', done: pendingHw === 0 },
    { id: 'exam', label: 'حل امتحان', done: upcomingExams === 0 },
  ];
  const goalsDone = goals.filter((g) => g.done).length;

  const avgProgress = (() => {
    const withP = courses.filter((c) => typeof c.progress === 'number');
    if (withP.length === 0) return null;
    return Math.round(withP.reduce((s, c) => s + (c.progress as number), 0) / withP.length);
  })();
  /** لا نعرض 0% كضعف — ننتظر بدء حقيقي */
  const performanceReady = avgProgress != null && avgProgress > 0;

  const inProgress = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      progress: typeof c.progress === 'number' ? c.progress : 0,
    }))
    .filter((c) => c.progress > 0 && c.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];

  const continueCourse = inProgress ?? (
    courses[0]
      ? {
          id: courses[0].id,
          title: courses[0].title,
          progress: typeof courses[0].progress === 'number' ? courses[0].progress : 0,
        }
      : null
  );

  const tasks: { text: string; tone: 'warn' | 'info' | 'ok'; to: string }[] = [];
  if (pendingHw > 0) {
    tasks.push({
      text: pendingHw === 1 ? 'لديك واجب معلّق' : `لديك ${pendingHw} واجبات معلّقة`,
      tone: 'warn',
      to: '/student/homework',
    });
  }
  if (upcomingExams > 0) {
    tasks.push({
      text: upcomingExams === 1 ? 'لديك امتحان قادم' : `لديك ${upcomingExams} امتحانات قادمة`,
      tone: 'info',
      to: '/student/exams',
    });
  }
  if (isLive && focusClass) {
    tasks.push({
      text: `حصة مباشرة: ${focusClass.title || focusClass.course?.title || 'الآن'}`,
      tone: 'info',
      to: `/live/${focusClass.agora_channel ?? 'demo'}?classId=${focusClass.id}`,
    });
  }
  if (tasks.length === 0) {
    tasks.push({ text: 'لا مهام عاجلة — أحسنت', tone: 'ok', to: '/student/courses' });
  }
  const shownTasks = tasks.slice(0, 3);

  const toneBg = { warn: ST.goldSoft, info: ST.primarySoft, ok: ST.successSoft };
  const toneBorder = { warn: ST.gold, info: ST.primary, ok: ST.success };
  const gap = isMobile ? 10 : 12;

  return (
    <StudentLayout xp={{ inLevel: xpIn, forNext: xpNext, level }}>
      <div dir="rtl" style={{ background: ST.bg, minHeight: '100%' }}>
        <div style={wrap}>

          {/* 1) Subscription */}
          {daysLeft != null && daysLeft <= 14 && (
            <div style={card({
              marginBottom: gap,
              minHeight: 72,
              padding: '14px 18px',
              background: ST.goldGrad,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
            })}>
              <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 14 }}>
                اشتراكك ينتهي خلال {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/messages')}
                style={{
                  padding: '9px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: ST.navy, color: '#fff', fontWeight: 800, fontSize: 12.5, fontFamily: ST.font,
                }}
              >
                تواصل مع الإدارة
              </button>
            </div>
          )}

          {/* 2) Hero row: goals 25% | live 50% | performance 25% */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr',
            gap,
            marginBottom: gap,
            alignItems: 'stretch',
          }}>
            {/* Goals */}
            <div style={card({ display: 'flex', flexDirection: 'column' })}>
              <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 14 }}>🎯 الأهداف اليومية</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {goals.map((g) => (
                  <li key={g.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: g.done ? ST.success : ST.text, fontSize: 12.5, fontWeight: 600,
                  }}>
                    <span>{g.done ? '✓' : '○'}</span>
                    <span>{g.label}</span>
                  </li>
                ))}
              </ul>
              <p style={{ margin: '12px 0 6px', color: ST.sub, fontSize: 11, fontWeight: 700 }}>
                {goalsDone}/3 مكتمل
              </p>
              <div style={{ height: 7, borderRadius: 99, background: ST.bg, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(goalsDone / 3) * 100}%`,
                  background: ST.success, borderRadius: 99,
                }} />
              </div>
            </div>

            {/* Live hero */}
            <div style={card({
              background: ST.blueGrad,
              border: 'none',
              color: '#fff',
              minHeight: isMobile ? 180 : 210,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: ST.shadowLg,
              position: 'relative',
              overflow: 'hidden',
            })}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.12,
                background: 'radial-gradient(circle at 30% 20%, #fff, transparent 55%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: isMobile ? 17 : 20 }}>
                    🎥 {isLive ? 'حصتك المباشرة الآن' : 'الحصة القادمة'}
                  </p>
                  {isLive && (
                    <span style={{
                      background: ST.danger, fontSize: 10, fontWeight: 800,
                      padding: '3px 9px', borderRadius: 99,
                    }}>
                      مباشر الآن
                    </span>
                  )}
                </div>
                {focusClass ? (
                  <>
                    <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 15 }}>
                      {focusClass.title || focusClass.course?.title || 'حصة'}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: 12.5, opacity: 0.92 }}>
                      {focusClass.teacher?.name ? `أ. ${focusClass.teacher.name}` : '—'}
                    </p>
                    <p style={{ margin: '0 0 14px', fontSize: 12, opacity: 0.85 }}>
                      {focusClass.scheduled_at
                        ? new Date(focusClass.scheduled_at).toLocaleString('ar-EG', {
                            weekday: 'short', hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (isLive) {
                          navigate(`/live/${focusClass.agora_channel ?? 'demo'}?classId=${focusClass.id}`);
                        } else {
                          navigate('/student/courses?tab=schedule');
                        }
                      }}
                      style={{
                        padding: '12px 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: '#fff', color: ST.primary, fontWeight: 900, fontSize: 14,
                        fontFamily: ST.font, alignSelf: 'flex-start',
                      }}
                    >
                      {isLive ? 'دخول الحصة الآن' : 'عرض الجدول'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 14px', fontSize: 13, opacity: 0.9 }}>لا حصة مجدولة الآن</p>
                    <button
                      type="button"
                      onClick={() => navigate('/student/courses?tab=schedule')}
                      style={{
                        padding: '11px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.95)', color: ST.primary, fontWeight: 800,
                        fontSize: 13, fontFamily: ST.font, alignSelf: 'flex-start',
                      }}
                    >
                      الجدول
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Performance */}
            <div style={card({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' })}>
              <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 14, alignSelf: 'stretch', textAlign: 'right' }}>
                📈 مؤشر أداء الطالب
              </p>
              {performanceReady ? (
                <>
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: `conic-gradient(${ST.primary} ${(avgProgress as number) * 3.6}deg, ${ST.border} 0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 68, height: 68, borderRadius: '50%', background: ST.card,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: ST.navy, fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
                        {avgProgress}%
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '10px 0 0', color: ST.sub, fontSize: 11.5, fontWeight: 600 }}>مستوى الأداء</p>
                </>
              ) : (
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 8px', minHeight: 100,
                }}>
                  <p style={{ margin: 0, color: ST.sub, fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>
                    لم يبدأ التقييم بعد
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3) Quick stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap,
            marginBottom: gap,
          }}>
            {[
              { label: 'دوراتي', value: String(totalCourses), to: '/student/courses' },
              { label: 'واجباتي', value: String(pendingHw), to: '/student/homework' },
              { label: 'امتحاناتي', value: String(upcomingExams), to: '/student/exams' },
              {
                label: 'ترتيبي',
                value: myRank != null
                  ? (rankTotal ? `${myRank} من ${rankTotal}` : `#${myRank}`)
                  : '—',
                to: '/student/league',
              },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(s.to)}
                style={{
                  ...card({
                    cursor: 'pointer', textAlign: 'right', fontFamily: ST.font, padding: '14px 16px',
                  }),
                }}
              >
                <p style={{ margin: 0, color: ST.navy, fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{s.value}</p>
                <p style={{ margin: '6px 0 0', color: ST.sub, fontSize: 12, fontWeight: 600 }}>{s.label}</p>
              </button>
            ))}
          </div>

          {/* 4) Tasks + notes */}
          <div style={{ ...card({ marginBottom: gap }) }}>
            <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 15 }}>📋 شريط المهام والملاحظات</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shownTasks.map((t) => (
                <button
                  key={t.text}
                  type="button"
                  onClick={() => navigate(t.to)}
                  style={{
                    textAlign: 'right', padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
                    border: `1px solid ${toneBorder[t.tone]}33`, background: toneBg[t.tone],
                    fontFamily: ST.font, color: ST.text, fontWeight: 700, fontSize: 13,
                  }}
                >
                  {t.text}
                </button>
              ))}
            </div>
          </div>

          {/* 5) Quick access 2×7 */}
          <div style={{ ...card({ marginBottom: gap }) }}>
            <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 15 }}>الوصول السريع</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)',
              gap: 8,
            }}>
              {STUDENT_HOME_GRID.map((item) => (
                <button
                  key={`${item.to}-${item.title}`}
                  type="button"
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 4px', borderRadius: 16, border: `1px solid ${ST.border}`,
                    background: ST.bg, cursor: 'pointer', fontFamily: ST.font, minHeight: 76,
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                  <span style={{ color: ST.navy, fontWeight: 700, fontSize: 10.5, textAlign: 'center', lineHeight: 1.25 }}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 6) Continue learning — always visible */}
          <div style={{ ...card({ marginBottom: gap }) }}>
            <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 15 }}>📚 أكمل من حيث توقفت</p>
            {continueCourse ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '12px 14px', borderRadius: 16, background: ST.bg, border: `1px solid ${ST.border}`,
              }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 14 }}>
                    {continueCourse.title}
                    {continueCourse.progress > 0 ? ` — متابعة المحتوى` : ' — ابدأ الدرس'}
                  </p>
                  <p style={{ margin: '4px 0 8px', color: ST.sub, fontSize: 12 }}>
                    الإنجاز {continueCourse.progress}%
                  </p>
                  <div style={{ height: 7, borderRadius: 99, background: ST.card, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${continueCourse.progress}%`,
                      background: ST.blueGrad, borderRadius: 99,
                    }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/student/courses/${continueCourse.id}/content`)}
                  style={{
                    padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: ST.blueGrad, color: '#fff', fontWeight: 800, fontSize: 12.5, fontFamily: ST.font,
                  }}
                >
                  متابعة الدرس
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/student/catalog')}
                style={{
                  width: '100%', textAlign: 'right', padding: '12px 14px', borderRadius: 14,
                  border: `1px solid ${ST.border}`, background: ST.bg, cursor: 'pointer',
                  fontFamily: ST.font, color: ST.sub, fontWeight: 600, fontSize: 13,
                }}
              >
                لا يوجد تقدّم بعد — تصفّح الكتالوج للبدء
              </button>
            )}
          </div>

          {/* 7) Challenges & rewards — light */}
          <div style={{ ...card({ marginBottom: gap }) }}>
            <p style={{ margin: '0 0 12px', color: ST.navy, fontWeight: 800, fontSize: 15 }}>🏆 التحديات والجوائز</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 10,
            }}>
              <button
                type="button"
                onClick={() => navigate('/student/challenges')}
                style={{
                  textAlign: 'right', padding: '14px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${ST.primary}33`, background: ST.primarySoft,
                  fontFamily: ST.font,
                }}
              >
                <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 13 }}>تحدي اليوم</p>
                <p style={{ margin: '6px 0 0', color: ST.text, fontSize: 12.5, fontWeight: 600 }}>
                  {pendingHw > 0 ? `أنهِ ${Math.min(pendingHw, 3)} واجب${Math.min(pendingHw, 3) > 1 ? 'ات' : ''}` : 'حل 3 أسئلة مراجعة'}
                </p>
                <p style={{ margin: '8px 0 0', color: ST.primary, fontSize: 12, fontWeight: 800 }}>المكافأة: +50 نقطة</p>
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/points')}
                style={{
                  textAlign: 'right', padding: '14px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${ST.gold}44`, background: ST.goldSoft,
                  fontFamily: ST.font,
                }}
              >
                <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 13 }}>الجوائز</p>
                <p style={{ margin: '6px 0 0', color: ST.text, fontSize: 12.5, fontWeight: 600 }}>
                  اجمع النقاط وافتح المكافآت
                </p>
                <p style={{ margin: '8px 0 0', color: ST.gold, fontSize: 12, fontWeight: 800 }}>فتح نقاطي ←</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
