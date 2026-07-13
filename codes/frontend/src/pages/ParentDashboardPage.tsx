import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import BrandLogo from '../components/BrandLogo';
import NearestBranchWidget from '../components/NearestBranchWidget';
import type { ChildSummary } from '../features/parent/parentSlice';

// ─── Colors ────────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F5EDD8',
  card:     '#FFFFFF',
  border:   '#EDE3CE',
  shadow:   '0 2px 12px rgba(0,0,0,0.06)',
  shadowLg: '0 8px 28px rgba(0,0,0,0.10)',
  gold:     '#C9952A',
  goldL:    '#DDAD50',
  goldGrad: 'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:   'rgba(201,149,42,0.08)',
  goldBdr:  'rgba(201,149,42,0.22)',
  text:     '#1B2038',
  sub:      '#6B7280',
  dim:      '#9CA3AF',
  navy:     '#1B2038',
  blue:     '#3B82F6',
  blueBg:   'rgba(59,130,246,0.08)',
  teal:     '#0D9488',
  tealBg:   'rgba(13,148,136,0.08)',
  green:    '#10B981',
  greenBg:  'rgba(16,185,129,0.08)',
  purple:   '#8B5CF6',
  purpleBg: 'rgba(139,92,246,0.08)',
  amber:    '#F59E0B',
  red:      '#EF4444',
} as const;

// ─── Atoms ──────────────────────────────────────────────────────────────────────
function Ico({ d, size = 16, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function SecHead({ title, action, badge, onAction }: { title: string; action?: string; badge?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 4, height: 18, borderRadius: 3, background: C.goldGrad }} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{title}</span>
        {badge && (
          <span style={{ background: C.goldBg, color: C.gold, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: `1px solid ${C.goldBdr}` }}>
            {badge}
          </span>
        )}
      </div>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', color: C.gold, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, d, color, bg }: {
  label: string; value: string | number; sub: string; d: string; color: string; bg: string;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ico d={d} color={color} size={22} />
      </div>
      <div>
        <p style={{ color: C.sub, fontSize: 11.5, fontWeight: 500, marginBottom: 1 }}>{label}</p>
        <p style={{ color: C.text, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</p>
        <p style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Child Row — with mini per-subject progress bars ────────────────────────────
function ChildRow({ name, grade, progress, color }: {
  name: string; grade: string; progress: number; color: string;
}) {
  const init = name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
          {init}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: color, fontSize: 13, fontWeight: 800 }}>{progress}%</span>
            </div>
          </div>
          <p style={{ color: C.sub, fontSize: 11 }}>{grade}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Diamond SVG ────────────────────────────────────────────────────────────────
function DiamondGem() {
  return (
    <svg viewBox="0 0 100 130" style={{ width: 120, height: 140, filter: 'drop-shadow(0 8px 20px rgba(2,136,209,0.4))' }}>
      <defs>
        <linearGradient id="dg-crown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B3E5FC" />
          <stop offset="100%" stopColor="#0288D1" />
        </linearGradient>
        <linearGradient id="dg-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0277BD" />
          <stop offset="100%" stopColor="#01579B" />
        </linearGradient>
        <linearGradient id="dg-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0288D1" />
          <stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
        <linearGradient id="dg-ped" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDAD50" />
          <stop offset="100%" stopColor="#C9952A" />
        </linearGradient>
        <linearGradient id="dg-ped2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEC560" />
          <stop offset="100%" stopColor="#DDAD50" />
        </linearGradient>
      </defs>
      <polygon points="50,4 28,28 50,20 72,28"                fill="url(#dg-crown)" />
      <polygon points="12,46 28,28 50,20 50,60"               fill="url(#dg-left)"  opacity="0.9" />
      <polygon points="88,46 72,28 50,20 50,60"               fill="#0277BD"        opacity="0.85" />
      <polygon points="4,64 12,46 50,60 50,98"                fill="url(#dg-left)"  opacity="0.8" />
      <polygon points="96,64 88,46 50,60 50,98"               fill="#01579B"        opacity="0.9" />
      <polygon points="4,64 50,98 96,64"                      fill="url(#dg-right)" opacity="0.7" />
      <polygon points="50,4 60,22 50,20 40,22"                fill="white"          opacity="0.55" />
      <polygon points="50,20 62,30 55,48 50,42"               fill="white"          opacity="0.18" />
      <ellipse cx="50" cy="105" rx="33" ry="9"               fill="url(#dg-ped)"   opacity="0.9" />
      <ellipse cx="50" cy="110" rx="23" ry="6"               fill="url(#dg-ped2)"  opacity="0.6" />
      <ellipse cx="50" cy="114" rx="14" ry="4"               fill="#C9952A"        opacity="0.4" />
    </svg>
  );
}

// ─── Hub Button ──────────────────────────────────────────────────────────────────
function HubBtn({ label, d, style: s, onClick }: { label: string; d: string; style: CSSProperties; onClick?: () => void }) {
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2, ...s }}>
      <div
        onClick={onClick}
        style={{ width: 50, height: 50, borderRadius: '50%', background: C.card, border: `2px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(201,149,42,0.18)', cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
      >
        <Ico d={d} color={C.gold} size={20} />
      </div>
      <span style={{ color: C.text, fontSize: 9, fontWeight: 700, textAlign: 'center', width: 68, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

// ─── League Card (نسخة مختصرة) ────────────────────────────────────────────────
function LeagueCard({ userName: _userName }: { userName: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/parent/league')} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'right',
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px',
      boxShadow: C.shadow, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
    }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ico d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color={C.gold} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 12 }}>دوري أولياء الأمور</span>
        <p style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>عرض الترتيب</p>
      </div>
    </button>
  );
}

// ─── AI Card ──────────────────────────────────────────────────────────────────
function AICard({ userName }: { userName: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, boxShadow: C.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Ico d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color={C.gold} size={17} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 13.5 }}>مساعد الياقوت الذكي</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ width: 82, height: 82, margin: '0 auto 12px', background: 'linear-gradient(135deg, #1B2038 0%, #2D3561 100%)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, boxShadow: '0 8px 24px rgba(27,32,56,0.35)' }}>
          🤖
        </div>
        <p style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>مرحباً أ. {userName}</p>
        <p style={{ color: C.sub, fontSize: 12, lineHeight: 1.7 }}>
          أنا هنا لمساعدتك في<br />دعم رحلة أبنائك التعليمية
        </p>
      </div>
      <button onClick={() => navigate('/parent/ai-assistant')} style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg, #1B2038, #2D3561)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(27,32,56,0.3)' }}>
        <span>✨</span>تحديث التحليل
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ParentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { parent, children, stats, loading } = useAppSelector((s) => s.parent);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchParentDashboard()); }, [dispatch]);

  const childData: { id: number; name: string; grade: string; progress: number; color: string }[] =
    children.map((c: ChildSummary, i: number) => ({
      id: c.id,
      name: c.name,
      grade: 'طالب',
      progress: Math.min(99, 60 + c.courses_count * 8),
      color: [C.gold, C.blue, C.green, C.purple][i % 4],
    }));

  const firstName     = parent?.name?.split(' ')[0] ?? '...';
  const totalKids     = stats.total_children || childData.length;
  const hour          = new Date().getHours();
  const timeGreeting  = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <ParentLayout>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', height: isMobile ? 'auto' : '100%', minHeight: '100%' }}>

        {/* ═══ CENTER CONTENT ═══ */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Welcome Card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '20px 24px', boxShadow: C.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>👋</span>
                  <h1 style={{ color: C.text, fontSize: 21, fontWeight: 800, margin: 0 }}>
                    {timeGreeting}، أ. {firstName}
                  </h1>
                </div>
                <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>نحن هنا لمساعدتك في رحلة التميز</p>
              </div>
              <BrandLogo size={52} style={{ flexShrink: 0, borderRadius: 14, boxShadow: '0 6px 20px rgba(201,149,42,0.35)' }} />
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.goldBg}`, borderTopColor: C.gold, animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && <>

            {/* ── 1. Attendance Summary ── */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 20px', boxShadow: C.shadow }}>
              <SecHead title="الحضور والغياب" action="عرض التقرير" onAction={() => navigate('/parent/attendance')} />
              {childData.length === 0 ? (
                <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا توجد بيانات حضور</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(childData.length, 3)}, 1fr)`, gap: 12 }}>
                  {childData.map((a) => (
                    <div key={a.id} style={{ background: `${a.color}08`, borderRadius: 12, padding: '12px 14px', border: `1px solid ${a.color}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{a.name.split(' ')[0]}</span>
                        <span style={{ color: a.color, fontWeight: 800, fontSize: 13 }}>{a.progress}%</span>
                      </div>
                      <p style={{ color: C.sub, fontSize: 10.5 }}>{a.grade} · {a.progress}% نشاط</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 2. Smart Recommendations ── */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 20px', boxShadow: C.shadow }}>
              <SecHead title="التوصيات الذكية" action="عرض الكل" onAction={() => navigate('/parent/reports')} />
              <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا توجد توصيات حالياً</p>
            </div>

            {/* ── 3. Children | Hub | Notifications ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr 1fr', gap: 12 }}>

              {/* أبنائي List with per-subject mini bars */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: C.shadow }}>
                <SecHead title="أبنائي" action="عرض الكل" onAction={() => navigate('/parent/children')} />
                <div>
                  {childData.length === 0 ? (
                    <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا يوجد أبناء مسجّلون</p>
                  ) : childData.map((c) => (
                    <ChildRow key={c.id} {...c} />
                  ))}
                </div>
                <button
                  onClick={() => navigate('/parent/children')}
                  style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 12, border: `1px solid ${C.goldBdr}`, background: C.goldBg, color: C.gold, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  عرض جميع الأبناء
                </button>
              </div>

              {/* Central Diamond Hub — simplified (no academic/attendance, adds reports/contact) */}
              <div style={{ background: 'linear-gradient(160deg, #FBF5E6, #F5EDD8)', border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>مركز العائلة</p>

                <div style={{ position: 'relative', width: 230, height: 230 }}>
                  {/* Orbit ring — ties the 4 satellite buttons visually to the gem */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 176, height: 176, borderRadius: '50%', border: `1.5px dashed ${C.goldBdr}` }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -52%)' }}>
                    <DiamondGem />
                  </div>

                  {/* Top — التقارير */}
                  <HubBtn
                    label="التقارير"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    style={{ top: 2, left: '50%', transform: 'translateX(-50%)' }}
                    onClick={() => navigate('/parent/reports')}
                  />
                  {/* Right — التواصل */}
                  <HubBtn
                    label="التواصل"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    style={{ top: '50%', right: 2, transform: 'translateY(-50%)' }}
                    onClick={() => navigate('/parent/communication')}
                  />
                  {/* Bottom — المدفوعات */}
                  <HubBtn
                    label="المدفوعات"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    style={{ bottom: 2, left: '50%', transform: 'translateX(-50%)' }}
                    onClick={() => navigate('/parent/billing')}
                  />
                  {/* Left — الإنجازات */}
                  <HubBtn
                    label="الإنجازات"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    style={{ top: '50%', left: 2, transform: 'translateY(-50%)' }}
                    onClick={() => navigate('/parent/reports')}
                  />
                </div>

                <button onClick={() => navigate('/parent/children')} style={{ padding: '10px 28px', borderRadius: 22, border: 'none', background: C.goldGrad, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,149,42,0.35)' }}>
                  مركز العائلة
                </button>
              </div>

              {/* Notifications */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: C.shadow }}>
                <SecHead title="آخر الإشعارات" action="عرض الكل" onAction={() => navigate('/parent/notifications')} />
                <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا توجد إشعارات</p>
                <button onClick={() => navigate('/parent/notifications')} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 12, border: `1px solid ${C.goldBdr}`, background: C.goldBg, color: C.gold, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                  عرض جميع الإشعارات
                </button>
              </div>
            </div>

            {/* ── 4. Quick Stats (الثانوية) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              <StatCard
                label="عدد الأبناء" value={totalKids} sub="أبناء"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                color={C.gold} bg={C.goldBg}
              />
              <StatCard
                label="متوسط الأداء الأكاديمي" value="—" sub="من التقرير"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                color={C.teal} bg={C.tealBg}
              />
              <StatCard
                label="نسبة الحضور" value="—" sub="من الحضور"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                color={C.green} bg={C.greenBg}
              />
              <StatCard
                label="الإشعارات الجديدة" value={0} sub="جديدة"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                color={C.blue} bg={C.blueBg}
              />
            </div>

            {/* ── 5. Parent Academy ── */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: C.shadow }}>
              <SecHead title="أكاديمية ولي الأمر" action="عرض الكل" onAction={() => navigate('/parent/academy')} />
              <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>لا توجد دورات متاحة حالياً</p>
            </div>

            {/* ── 6. Achievements + Invoices ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>

              {/* Achievements */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: C.shadow }}>
                <SecHead title="الإنجازات والشارات" action="عرض الكل" onAction={() => navigate('/parent/achievements')} />
                <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>لا توجد إنجازات بعد</p>
              </div>

              {/* Invoices */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: C.shadow }}>
                <SecHead title="آخر الفواتير" action="عرض الكل" onAction={() => navigate('/parent/billing')} />
                <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>لا توجد فواتير — راجع صفحة المدفوعات للأقساط</p>
              </div>
            </div>

          </>}
        </div>

        {/* ═══ LEFT SIDE PANEL ═══ */}
        <div style={{
          width: isMobile ? '100%' : 288, flexShrink: 0, overflowY: 'auto',
          padding: isMobile ? '0 18px 18px' : '18px 18px 18px 0',
          display: 'flex', flexDirection: 'column', gap: 14,
          position: isMobile ? 'static' : 'sticky', top: 0, height: isMobile ? 'auto' : '100%',
        }}>
          <LeagueCard userName={firstName} />
          <AICard userName={firstName} />
          <NearestBranchWidget />
        </div>

      </div>
    </ParentLayout>
  );
}
