import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints, fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';
import StudentHomeShortcuts from '../components/StudentHomeShortcuts';
import { C } from '../theme/palette';
import { typeScale } from '../features/student/studentNav';

/**
 * Phase A — Student home information hierarchy:
 * 1) Welcome (light) + subscription alert if needed
 * 2) Primary 2-col: Now (single class source) | Today’s tasks
 * 3) My courses progress (honest %)
 * 4) Secondary 2-col: ranking | points
 * Alerts only render when they have real data. No navy hero stack. No duplicate class cards.
 */

const card: CSSProperties = {
  background: C.card,
  borderRadius: 16,
  padding: '16px 18px',
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  height: '100%',
  boxSizing: 'border-box',
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{
      margin: '0 0 12px', color: C.text,
      fontWeight: typeScale.h2.fontWeight,
      fontSize: typeScale.h2.fontSize,
      lineHeight: typeScale.h2.lineHeight,
    }}>{children}</p>
  );
}

function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 'auto',
        width: '100%',
        padding: '9px 12px',
        borderRadius: 11,
        background: C.bg,
        border: `1px solid ${C.border}`,
        color: C.primary,
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: "'Cairo',sans-serif",
        minHeight: 38,
      }}
    >
      {label}
    </button>
  );
}

function PrimaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 'auto',
        width: '100%',
        padding: '10px 12px',
        borderRadius: 11,
        background: C.goldGrad,
        border: 'none',
        color: '#1B2038',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: "'Cairo',sans-serif",
        minHeight: 40,
      }}
    >
      {label}
    </button>
  );
}

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { student, upcoming, courses, dashStats, subscription } = useAppSelector((s) => s.student);
  const { totalPoints, leaderboard } = useAppSelector((s) => s.gamification);
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
    dispatch(fetchMyPoints());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const firstName = student?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';
  const pts = dashStats?.total_points ?? totalPoints ?? 0;
  const level = dashStats?.level ?? Math.floor(pts / 500) + 1;
  const xpIn = dashStats?.xp_in_level ?? (pts % 500);
  const xpNext = dashStats?.xp_for_next ?? 500;
  const xpPct = Math.min(100, Math.round((xpIn / Math.max(xpNext, 1)) * 100));

  // Single source of truth for class: live first, else next scheduled
  const focusClass = upcoming.find((c) => c.status === 'live')
    ?? upcoming.find((c) => c.status === 'scheduled')
    ?? upcoming[0]
    ?? null;
  const isLive = focusClass?.status === 'live';

  const leagueTop = [...leaderboard].sort((a, b) => a.rank - b.rank).slice(0, 3);
  const pendingHw = dashStats?.pending_homework ?? 0;
  const upcomingExams = dashStats?.upcoming_exams ?? 0;
  const daysLeft = subscription?.days_remaining;

  const coursesWithProgress = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      progress: typeof c.progress === 'number' ? c.progress : null,
    }))
    .slice(0, 4);

  const twoCol = isMobile ? '1fr' : '1.2fr 1fr';
  const gap = isMobile ? 10 : 12;

  return (
    <StudentLayout>
      <div dir="rtl" style={{ fontFamily: typeScale.font, background: C.bg, minHeight: '100%' }}>
        <div style={{ padding: isMobile ? '14px 12px 28px' : '18px 20px 32px', maxWidth: 980, margin: '0 auto' }}>

          {/* ── Row 1: Welcome ── */}
          <div style={{ ...card, marginBottom: gap, minHeight: 'auto', height: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  margin: 0, color: C.text,
                  fontWeight: typeScale.h1.fontWeight,
                  fontSize: isMobile ? 18 : typeScale.h1.fontSize,
                  lineHeight: typeScale.h1.lineHeight,
                }}>
                  مرحباً {firstName}
                </h1>
                <p style={{
                  margin: '6px 0 0', color: C.sub,
                  fontSize: typeScale.caption.fontSize,
                  fontWeight: typeScale.caption.fontWeight,
                  lineHeight: typeScale.caption.lineHeight,
                }}>
                  المستوى {level} · {pts.toLocaleString()} نقطة
                </p>
              </div>
              <div style={{ minWidth: 140, flex: isMobile ? '1 1 100%' : '0 0 200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.dim, marginBottom: 5 }}>
                  <span>XP</span>
                  <span>{xpIn}/{xpNext}</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: C.bg, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${xpPct}%`, background: C.primary, borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {daysLeft != null && daysLeft <= 14 && (
              <div style={{
                marginTop: 14, padding: '10px 12px', borderRadius: 12,
                background: C.amberBg, border: `1px solid ${C.amber}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
              }}>
                <p style={{ margin: 0, color: C.text, fontSize: 12.5, fontWeight: 600 }}>
                  اشتراكك ينتهي خلال {daysLeft} يوم
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/student/messages')}
                  style={{
                    padding: '7px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: C.amber, color: '#fff', fontWeight: 700, fontSize: 12,
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  تواصل مع الإدارة
                </button>
              </div>
            )}
          </div>

          {/* ── Row 2: Now | Tasks ── */}
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap, marginBottom: gap, alignItems: 'stretch' }}>
            <div style={card}>
              <SectionTitle>{isLive ? 'حصة مباشرة الآن' : 'الحصة القادمة'}</SectionTitle>
              {focusClass ? (
                <>
                  <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>
                    {focusClass.title || focusClass.course?.title || 'حصة'}
                  </p>
                  <p style={{ margin: '6px 0 0', color: C.sub, fontSize: 12.5 }}>
                    {focusClass.teacher?.name ? `أ. ${focusClass.teacher.name}` : '—'}
                    {focusClass.scheduled_at
                      ? ` · ${new Date(focusClass.scheduled_at).toLocaleString('ar-EG', {
                          weekday: 'short', hour: '2-digit', minute: '2-digit',
                        })}`
                      : ''}
                  </p>
                  {isLive ? (
                    <PrimaryBtn
                      label="دخول الحصة الآن"
                      onClick={() => navigate(`/live/${focusClass.agora_channel ?? 'demo'}?classId=${focusClass.id}`)}
                    />
                  ) : (
                    <GhostBtn label="عرض الجدول" onClick={() => navigate('/student/live-classes')} />
                  )}
                </>
              ) : (
                <>
                  <p style={{ margin: 0, color: C.sub, fontSize: 13, lineHeight: 1.6 }}>
                    لا توجد حصة مجدولة الآن.
                  </p>
                  <GhostBtn label="عرض الجدول" onClick={() => navigate('/student/live-classes')} />
                </>
              )}
            </div>

            <div style={card}>
              <SectionTitle>مهام اليوم</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate('/student/homework')}
                  style={{
                    textAlign: 'right', padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    border: `1px solid ${C.border}`, background: pendingHw > 0 ? C.amberBg : C.bg,
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  <span style={{ display: 'block', color: C.text, fontWeight: 700, fontSize: 13 }}>واجبات معلّقة</span>
                  <span style={{ color: C.sub, fontSize: 12 }}>{pendingHw} واجب</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/student/exams')}
                  style={{
                    textAlign: 'right', padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    border: `1px solid ${C.border}`, background: upcomingExams > 0 ? 'rgba(59,130,160,0.08)' : C.bg,
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  <span style={{ display: 'block', color: C.text, fontWeight: 700, fontSize: 13 }}>امتحانات قادمة</span>
                  <span style={{ color: C.sub, fontSize: 12 }}>{upcomingExams} امتحان</span>
                </button>
              </div>
              <GhostBtn label="فتح الواجبات" onClick={() => navigate('/student/homework')} />
            </div>
          </div>

          {/* ── Row 3: Courses ── */}
          <div style={{ ...card, marginBottom: gap, minHeight: 'auto', height: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
              <SectionTitle>دوراتي</SectionTitle>
              <button
                type="button"
                onClick={() => navigate('/student/courses')}
                style={{
                  border: 'none', background: 'transparent', color: C.primary,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                }}
              >
                عرض الكل
              </button>
            </div>
            {coursesWithProgress.length === 0 ? (
              <p style={{ margin: 0, color: C.sub, fontSize: 13 }}>
                لا توجد دورات متاحة بعد.
                {' '}
                <button
                  type="button"
                  onClick={() => navigate('/student/catalog')}
                  style={{
                    border: 'none', background: 'transparent', color: C.primary,
                    fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", padding: 0,
                  }}
                >
                  تصفّح الكتالوج
                </button>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {coursesWithProgress.map((c) => {
                  const p = c.progress ?? 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => navigate(`/student/courses/${c.id}/content`)}
                      style={{
                        textAlign: 'right', padding: 0, border: 'none', background: 'transparent',
                        cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                        <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{c.title}</span>
                        <span style={{ color: C.primary, fontWeight: 800, fontSize: 12 }}>{p}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: C.bg, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.min(100, p)}%`,
                          background: C.primary, borderRadius: 4,
                        }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Row 4: Ranking | Points ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap, alignItems: 'stretch' }}>
            <div style={card}>
              <SectionTitle>ترتيب الصف</SectionTitle>
              {leagueTop.length === 0 ? (
                <p style={{ margin: '0 0 12px', color: C.sub, fontSize: 13 }}>لا يوجد ترتيب بعد.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {leagueTop.map((p) => (
                    <div
                      key={p.rank}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
                        borderRadius: 10, background: p.rank === 1 ? C.goldBg : C.bg,
                      }}
                    >
                      <span style={{ width: 22, color: p.rank === 1 ? C.gold : C.sub, fontSize: 12, fontWeight: 800 }}>
                        #{p.rank}
                      </span>
                      <span style={{
                        flex: 1, color: C.text, fontSize: 12.5, fontWeight: 700,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </span>
                      <span style={{ color: C.sub, fontSize: 11, fontWeight: 700 }}>
                        {p.points.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <GhostBtn label="الترتيب الكامل" onClick={() => navigate('/student/league')} />
            </div>

            <div style={card}>
              <SectionTitle>نقاطي</SectionTitle>
              <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 28, lineHeight: 1.1 }}>
                {pts.toLocaleString()}
              </p>
              <p style={{ margin: '6px 0 12px', color: C.sub, fontSize: 12.5 }}>
                المستوى {level} · متجر المكافآت والنقاط في مكان واحد
              </p>
              <PrimaryBtn label="فتح نقاطي" onClick={() => navigate('/student/points')} />
            </div>
          </div>

          {/* ── Row 5: Icon shortcuts (replaces sidebar) ── */}
          <div style={{ ...card, marginTop: gap, minHeight: 'auto', height: 'auto' }}>
            <StudentHomeShortcuts />
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
