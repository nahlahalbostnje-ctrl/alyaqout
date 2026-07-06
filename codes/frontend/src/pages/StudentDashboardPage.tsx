import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints } from '../features/student/gamificationSlice';
import { logout } from '../features/auth/authSlice';
import BrandLogo from '../components/BrandLogo';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#F2EDE4',
  card:     '#FFFFFF',
  navy:     '#0D1535',
  navy2:    '#1B2038',
  gold:     '#C9952A',
  goldL:    '#DDAD50',
  goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:   'rgba(201,149,42,0.09)',
  goldBdr:  'rgba(201,149,42,0.25)',
  text:     '#1B2038',
  sub:      '#6B7280',
  dim:      '#9CA3AF',
  border:   'rgba(0,0,0,0.07)',
  shadow:   '0 2px 14px rgba(0,0,0,0.07)',
  red:      '#EF4444',
  blue:     '#2563EB',
  green:    '#16A34A',
  purple:   '#7C3AED',
};
const SW = 195;
const BH = 60;

// ─── Feature flag: set false to hide sidebar task card & rely on WhatsApp reminders ──
// When false: the daily-tasks card is hidden from the sidebar.
// The WhatsApp reminder is sent via NotificationService::sendWhatsApp() on the backend
// (triggered by a scheduled job) to inform students of pending tasks.
const SHOW_DAILY_TASKS_CARD = true;

// ─── Semantic SVG icons for each action (stroke-based, white on colored bg) ──
const SVG_ICONS: Record<string, string> = {
  'دخول الحصة':        'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  'الواجبات':           'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  'الامتحانات':         'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  'جدول الحصص':        'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'دوري الياقوت':      'M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7m-8 0V5a2 2 0 012-2h4a2 2 0 012 2v2m-8 0h8',
  'مستوى التطور':      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'غرفة الطوارئ':      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  'معلمي الذكي':       'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'دوري الزملاء':      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'غرفة الدراسة 24/7': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'الرسائل':            'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  'النتائج':            'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  'مكتبة الياقوت':     'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'حاضنة المواهب':     'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'صديق الدراسة':      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'مرشد الياقوت':      'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  'الكبسولة الزمنية':  'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'نظام التحديات':     'M13 10V3L4 14h7v7l9-11h-7z',
};

function ActionIcon({ path }: { path?: string }) {
  if (!path) return null;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { to:'/student/dashboard',       label:'الرئيسية',           emoji:'🏠' },
  { to:'/student/exams',           label:'الامتحانات',          emoji:'📝' },
  { to:'/student/homework',        label:'الواجبات',            emoji:'📚' },
  { to:'/student/live-classes',    label:'جدول الحصص',         emoji:'📅' },
  { to:'/student/league',          label:'دوري الياقوت',        emoji:'🏆' },
  { to:'/student/challenges',      label:'نظام التحديات',       emoji:'⚡' },
  { to:'/student/report',          label:'مستوى التطور',        emoji:'📊' },
  { to:'/student/library',         label:'مكتبة الياقوت',       emoji:'📖' },
  { to:'/student/talents',         label:'حاضنة المواهب',       emoji:'💡' },
  { to:'/student/study-buddy',     label:'صديق الدراسة',        emoji:'⏱️' },
  { to:'/student/counselor',       label:'مرشد الياقوت',        emoji:'💬' },
  { to:'/student/time-capsule',    label:'الكبسولة الزمنية',    emoji:'🎯' },
  { to:'/student/emergency',       label:'غرفة الطوارئ',        emoji:'🚨' },
  { to:'/student/study-room',      label:'معلمي الذكي',         emoji:'🤖' },
  { to:'/student/peer-league',     label:'دوري الزملاء',        emoji:'⚔️' },
  { to:'/student/study-24',        label:'غرفة الدراسة 24/7',  emoji:'🎧' },
  { to:'/student/messages',        label:'الرسائل',             emoji:'✉️' },
  { to:'/student/points',          label:'النتائج',             emoji:'🏅' },
  { to:'/student/teacher-contact', label:'تواصل مع المعلم',     emoji:'👨‍🏫' },
];

// ─── Quick Actions ─────────────────────────────────────────────────────────────
// نكتفي هنا بالاختصارات ذات الطابع اللحظي/العاجل (تحمل badge حي) فقط.
// باقي الروابط متاحة كاملة عبر السايدبار — تفادياً لتكرار نفس العناصر يمين ويسار.
const ACTIONS_TEMPLATE = [
  { label:'دخول الحصة',  desc:'انضم لحصتك',        bg:'linear-gradient(135deg,#1D4ED8,#2563EB)', badgeKey:'live',     to:'/student/live-classes', highlight:true  },
  { label:'الواجبات',     desc:'واجباتك المعلقة',   bg:'linear-gradient(135deg,#0369A1,#0284C7)', badgeKey:'homework', to:'/student/homework',     highlight:false },
  { label:'الامتحانات',   desc:'امتحاناتك القادمة', bg:'linear-gradient(135deg,#4338CA,#6366F1)', badgeKey:'exams',    to:'/student/exams',        highlight:false },
  { label:'غرفة الطوارئ', desc:'مساعدة فورية',      bg:'linear-gradient(135deg,#DC2626,#EF4444)', badgeKey:'lock',     to:'/student/emergency',    highlight:false },
];

// ─── Smart Recommendations with dynamic contact buttons ───────────────────────
const RECS = [
  {
    type: 'teacher' as const,
    color: '#2563EB', bg: 'rgba(37,99,235,0.07)',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    label: 'واجب متأخر',
    title: 'واجب غير مُسلَّم',
    desc: 'لديك واجبان لم يُسلَّما — راجع مع أستاذك لتحديد الموعد البديل',
    contactLabel: 'تواصل مع الأستاذ',
    contactTo: '/student/teacher-contact',
  },
  {
    type: 'supervisor' as const,
    color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    label: 'إرشاد معلق',
    title: 'طلب إرشاد بانتظارك',
    desc: 'جلسة إرشاد مجدولة لم تُؤكَّد — تابع مع المشرف المخصص',
    contactLabel: 'تواصل مع المشرف',
    contactTo: '/student/messages',
  },
  {
    type: 'admin' as const,
    color: '#C9952A', bg: 'rgba(201,149,42,0.07)',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    label: 'اشتراك',
    title: 'اشتراكك ينتهي قريباً',
    desc: 'يتبقى 7 أيام — تواصل مع الإدارة لتجديد اشتراكك في الوقت المناسب',
    contactLabel: 'تواصل مع الإدارة',
    contactTo: '/student/messages',
  },
];

// ─── Static data ──────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name:'الرياضيات',  pct:90, color:'#2563EB' },
  { name:'الإنجليزية', pct:88, color:'#7C3AED' },
  { name:'العلوم',     pct:85, color:'#16A34A' },
  { name:'العربية',    pct:76, color:'#D97706' },
  { name:'التربية',   pct:92, color:'#DC2626' },
];

const LEAGUE = [
  { rank:2, name:'سارة محمد', pts:5210, avatar:'👩' },
  { rank:1, name:'أحمد سالم', pts:5820, avatar:'👦' },
  { rank:3, name:'علي خالد',  pts:4980, avatar:'🧒'  },
];

const CHALLENGES = [
  { text:'حل 20 سؤال رياضيات', xp:150, emoji:'📐' },
  { text:'قراءة 30 دقيقة',      xp:100, emoji:'📖' },
  { text:'تسليم واجب اليوم',    xp:100, emoji:'✅' },
];

// ─── CircProg ─────────────────────────────────────────────────────────────────
function CircProg({ pct, size=78 }: { pct:number; size?:number }) {
  const r = size/2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEE8D8" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gold} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c-(pct/100)*c} strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:C.text, fontWeight:900, fontSize:16, lineHeight:1 }}>{pct}%</span>
        <span style={{ color:C.dim, fontSize:8, marginTop:2 }}>ممتاز ◆</span>
      </div>
    </div>
  );
}

// ─── WarriorShield ───────────────────────────────────────────────────────────
function WarriorShield({ level }: { level:number }) {
  return (
    <div style={{ position:'relative', width:100, height:110, margin:'0 auto 8px' }}>
      <svg width="100" height="110" viewBox="0 0 100 110" style={{ position:'absolute', inset:0 }}>
        <defs>
          <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D060"/><stop offset="100%" stopColor="#C9952A"/>
          </linearGradient>
          <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#0D1535"/>
          </linearGradient>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#90CAF9"/><stop offset="100%" stopColor="#1565C0"/>
          </linearGradient>
        </defs>
        {[-35,-20,-5].map((a,i) => (
          <ellipse key={`l${i}`} cx={18+i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${18+i*4} ${55+i*12})`}/>
        ))}
        {[35,20,5].map((a,i) => (
          <ellipse key={`r${i}`} cx={82-i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${82-i*4} ${55+i*12})`}/>
        ))}
        <path d="M50,8 L84,22 L84,60 Q84,82 50,95 Q16,82 16,60 L16,22 Z"
          fill="url(#sg)" stroke="url(#wg)" strokeWidth="3.5"/>
        <path d="M50,14 L79,26 L79,60 Q79,78 50,89 Q21,78 21,60 L21,26 Z"
          fill="none" stroke="rgba(240,208,96,0.2)" strokeWidth="1"/>
        <polygon points="50,28 68,44 50,72 32,44" fill="url(#gg)"/>
        <polygon points="50,28 68,44 50,50 32,44" fill="#BBDEFB" opacity="0.65"/>
        <polygon points="50,72 68,44 50,56" fill="#0D47A1"/>
        <polygon points="50,72 32,44 50,56" fill="#1565C0"/>
        <polygon points="50,28 56,36 50,33" fill="white" opacity="0.45"/>
        <path d="M33,92 Q50,102 67,92" stroke="url(#wg)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', top:2, right:2, width:26, height:26, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#1B2038', fontWeight:900, fontSize:11, border:'2px solid #fff', boxShadow:'0 2px 8px rgba(201,149,42,0.6)', zIndex:2 }}>
        {level}
      </div>
    </div>
  );
}

const SecH = ({ title, sub }: { title:string; sub?:string }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{title}</p>
    {sub && <p style={{ color:C.gold, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>{sub}</p>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { student, upcoming, dashStats } = useAppSelector(s => s.student);
  const { totalPoints, myRank } = useAppSelector(s => s.gamification);
  const user = useAppSelector(s => s.auth.user);

  // Responsive: detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchStudentDashboard()); dispatch(fetchMyPoints()); }, [dispatch]);

  const firstName = student?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';
  const pts    = dashStats?.total_points ?? totalPoints ?? 0;
  const rank   = myRank ?? null;
  const level  = dashStats?.level ?? Math.floor(pts / 500) + 1;
  const xpIn   = dashStats?.xp_in_level ?? (pts % 500);
  const xpNext = dashStats?.xp_for_next ?? 500;
  const live   = upcoming[0];
  const nextClass = upcoming[1] ?? null;

  const badgeMap: Record<string, string | null> = {
    live:     upcoming.some(c => c.status === 'live') ? '🔴' : (upcoming.length > 0 ? String(upcoming.length) : null),
    homework: dashStats?.pending_homework ? String(dashStats.pending_homework) : null,
    exams:    dashStats?.upcoming_exams   ? String(dashStats.upcoming_exams)   : null,
    lock:     '🚪', always: '24/7',
  };

  const ACTIONS = ACTIONS_TEMPLATE.map(a => ({
    ...a,
    badge:   a.badgeKey ? (badgeMap[a.badgeKey] ?? null) : null,
    svgPath: SVG_ICONS[a.label],
  }));

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace:true }); };

  const card: CSSProperties = {
    background:C.card, borderRadius:18, padding:'14px 16px',
    boxShadow:C.shadow, border:`1px solid ${C.border}`,
  };

  // ── Grid columns: 4 on desktop, 3 on tablet, 2 on mobile ──
  const actionsCols = isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)';
  const infoCols    = isMobile ? '1fr' : 'repeat(3,1fr)';
  const statsCols   = isMobile ? '1fr' : 'repeat(3,1fr)';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

      {/* ══════ SIDEBAR (hidden on mobile) ══════ */}
      {!isMobile && (
        <aside dir="rtl" style={{ width:SW, flexShrink:0, background:C.card, borderLeft:`1px solid ${C.border}`, height:'100vh', position:'sticky', top:0, overflowY:'auto', scrollbarWidth:'none', display:'flex', flexDirection:'column', paddingBottom:BH+10 }}>

          {/* Warrior Card */}
          <div style={{ margin:'12px 10px 0', padding:'16px 10px 14px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:16, textAlign:'center', border:'1px solid rgba(201,149,42,0.3)', boxShadow:'0 6px 20px rgba(13,21,53,0.45)' }}>
            <WarriorShield level={12} />
            <p style={{ color:'#fff', fontWeight:800, fontSize:14, marginBottom:1 }}>المحارب الياقوتي</p>
            <p style={{ color:C.goldL, fontSize:11 }}>المستوى {level}</p>
            <div style={{ marginTop:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>
                <span>{xpIn.toLocaleString()}</span><span>{xpNext.toLocaleString()} XP</span>
              </div>
              <div style={{ height:5, background:'rgba(255,255,255,0.12)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(xpIn/xpNext)*100)}%`, background:'linear-gradient(90deg,#3B82F6,#1D4ED8)', borderRadius:3 }}/>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ margin:'8px 10px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            <div style={{ ...card, padding:'9px 8px', textAlign:'center' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, marginBottom:1 }}>
                <span style={{ fontSize:14 }}>⭐</span>
                <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>{pts.toLocaleString()}</span>
              </div>
              <p style={{ color:C.sub, fontSize:9 }}>نقاطي</p>
            </div>
            <div style={{ ...card, padding:'9px 8px', textAlign:'center' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, marginBottom:1 }}>
                <span style={{ fontSize:14 }}>🏆</span>
                <span style={{ color:C.gold, fontWeight:800, fontSize:14 }}>{rank ? `#${rank}` : '—'}</span>
              </div>
              <p style={{ color:C.sub, fontSize:9 }}>ترتيبي</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding:'10px 8px', flex:1 }}>
            {NAV.map((item,i) => {
              const inner = (active=false) => (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, marginBottom:2, fontSize:12, fontWeight:active?700:500, background:active?C.goldGrad:'transparent', color:active?'#fff':C.sub, cursor:'pointer', transition:'background 0.15s' }}>
                  <span style={{ fontSize:15, lineHeight:1 }}>{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              );
              return (
                <NavLink key={i} to={item.to} style={{ textDecoration:'none' }}>
                  {({ isActive }) => inner(isActive)}
                </NavLink>
              );
            })}
            <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, marginTop:4, fontSize:12, fontWeight:500, color:C.red, cursor:'pointer' }}>
              <span style={{ fontSize:15 }}>🚪</span>
              تسجيل الخروج
            </div>
          </nav>

          {/* Daily Tasks Card — hidden when SHOW_DAILY_TASKS_CARD = false */}
          {SHOW_DAILY_TASKS_CARD && (
            <div style={{ margin:'0 10px 10px', padding:'12px 10px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:14, border:'1px solid rgba(201,149,42,0.3)', textAlign:'center' }}>
              <p style={{ color:'#fff', fontWeight:700, fontSize:11, lineHeight:1.5, marginBottom:6 }}>
                أكمل مهامك اليومية<br/>واربح مكافآت رائعة ✨
              </p>
              <button onClick={()=>navigate('/student/homework')} style={{ width:'100%', padding:'7px', borderRadius:9, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', boxShadow:'0 3px 10px rgba(201,149,42,0.4)' }}>
                عرض المهام
              </button>
            </div>
          )}
        </aside>
      )}

      {/* ══════ MAIN CONTENT ══════ */}
      <div dir="rtl" style={{ flex:1, overflowY:'auto', paddingBottom:BH*2+14, minWidth:0 }}>

        {/* ── Header ── */}
        <div style={{ padding:'12px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', background:C.card, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>

          {/* Bell */}
          <div style={{ position:'relative', cursor:'pointer' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:C.red, color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>3</div>
          </div>

          {/* Greeting */}
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:20 }}>👋</span>
              <h1 style={{ color:C.navy2, fontWeight:900, fontSize: isMobile ? 17 : 20 }}>مرحباً {firstName}</h1>
            </div>
            <p style={{ color:C.sub, fontSize:11, marginTop:1 }}>الصف الخامس</p>
          </div>

          {/* Avatar */}
          <div style={{ position:'relative' }}>
            <div onClick={()=>setShowProfileMenu(p=>!p)} style={{ width:42, height:42, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(201,149,42,0.4)', cursor:'pointer' }}>
              👦
            </div>
            {showProfileMenu && (
              <div style={{ position:'absolute', top:'110%', left:0, background:C.card, borderRadius:14, boxShadow:'0 8px 28px rgba(0,0,0,0.15)', border:`1px solid ${C.border}`, zIndex:200, minWidth:160, overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}` }}>
                  <p style={{ color:C.navy2, fontWeight:700, fontSize:13 }}>{user?.name ?? firstName}</p>
                  <p style={{ color:C.sub, fontSize:11 }}>طالب</p>
                </div>
                <button onClick={handleLogout} style={{ width:'100%', padding:'11px 14px', border:'none', background:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, color:C.red, fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:600 }}>
                  🚪 تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: isMobile ? '12px 12px 0' : '14px 16px 0' }}>

          {/* ── Current Class Card ── */}
          <div style={{ background:'linear-gradient(135deg,#0F1E5A 0%,#0D1535 100%)', borderRadius:22, padding:'16px 18px 14px', marginBottom:12, position:'relative', overflow:'hidden', boxShadow:'0 10px 32px rgba(13,21,53,0.55)' }}>
            <div style={{ position:'absolute', insetInlineEnd:-20, top:'50%', transform:'translateY(-55%)', opacity:0.06, fontSize:90, lineHeight:1 }}>🖥️</div>

            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600 }}>الحصة الحالية</span>
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <h2 style={{ color:'#fff', fontWeight:900, fontSize: isMobile ? 20 : 24, lineHeight:1.2, margin:'0 0 4px' }}>
                  {live?.title ?? 'لا توجد حصة مجدولة الآن'}
                </h2>
                <p style={{ color:C.goldL, fontSize:12, fontWeight:600 }}>
                  {live ? `الأستاذ ${live.teacher?.name}` : 'تحقق من جدولك لاحقاً'}
                </p>
              </div>
            </div>

            <button
              onClick={()=>live?navigate(`/live/${live.agora_channel??'demo'}?classId=${live.id}`):navigate('/student/live-classes')}
              style={{ width:'100%', padding:'12px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:900, fontSize:14, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 5px 20px rgba(201,149,42,0.5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              دخول الحصة الآن
            </button>
          </div>

          {/* ── Quick Actions Grid ── */}
          <div style={{ display:'grid', gridTemplateColumns:actionsCols, gap: isMobile ? 7 : 9, marginBottom:12 }}>
            {ACTIONS.map((a,i) => (
              <div key={i} onClick={()=>a.to&&navigate(a.to)}
                style={{ ...card, padding: isMobile ? '10px 6px 8px' : '12px 8px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, position:'relative', cursor:a.to?'pointer':'default', border:`1px solid ${a.highlight?'rgba(37,99,235,0.25)':C.border}`, boxShadow:a.highlight?'0 4px 18px rgba(37,99,235,0.2)':C.shadow, transition:'transform 0.15s' }}
                onMouseEnter={e=>{if(a.to)(e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';}}
              >
                {a.badge && (
                  <div style={{ position:'absolute', top:4, left:4, minWidth:18, height:18, borderRadius:20, padding:'0 4px', background:C.red, color:'#fff', fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }}>{a.badge}</div>
                )}
                {/* Semantic SVG icon inside colored circle */}
                <div style={{ width: isMobile ? 42 : 48, height: isMobile ? 42 : 48, borderRadius:'50%', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(0,0,0,0.22)', flexShrink:0 }}>
                  <ActionIcon path={a.svgPath} />
                </div>
                <p style={{ color:C.text, fontWeight:700, fontSize: isMobile ? 9.5 : 10.5, textAlign:'center', lineHeight:1.3 }}>{a.label}</p>
                {!isMobile && <p style={{ color:C.dim, fontSize:9, textAlign:'center', lineHeight:1.3 }}>{a.desc}</p>}
              </div>
            ))}
          </div>

          {/* ── Smart Recommendations ── */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }}/>
              <p style={{ color:C.text, fontWeight:800, fontSize:13 }}>توصيات ذكية</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:8 }}>
              {RECS.map((rec, i) => (
                <div key={i} style={{ background:rec.bg, border:`1px solid ${rec.color}22`, borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:rec.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={rec.icon}/>
                      </svg>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <span style={{ background:`${rec.color}20`, color:rec.color, fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>{rec.label}</span>
                      <p style={{ color:C.text, fontWeight:700, fontSize:12, marginTop:2 }}>{rec.title}</p>
                    </div>
                  </div>
                  <p style={{ color:C.sub, fontSize:11, lineHeight:1.55, margin:0 }}>{rec.desc}</p>
                  <button onClick={()=>navigate(rec.contactTo)} style={{ width:'100%', padding:'7px', borderRadius:9, background:rec.color, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                    {rec.contactLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3 Info Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:infoCols, gap:10, marginBottom:12 }}>

            {/* Next Class */}
            <div style={{ ...card }}>
              <SecH title="الحصة القادمة" />
              {nextClass ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ color:C.gold, fontWeight:700, fontSize:12.5 }}>{nextClass.course?.title}</p>
                      <p style={{ color:C.sub, fontSize:10.5 }}>أ. {nextClass.teacher?.name}</p>
                    </div>
                  </div>
                  <p style={{ color:C.sub, fontSize:11, marginBottom:8 }}>
                    {new Date(nextClass.scheduled_at).toLocaleString('ar-EG',{weekday:'short',hour:'2-digit',minute:'2-digit'})}
                  </p>
                </>
              ) : (
                <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'10px 0' }}>لا توجد حصص قادمة</p>
              )}
              <button onClick={()=>navigate('/student/live-classes')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض الجدول الكامل
              </button>
            </div>

            {/* Challenges */}
            <div style={{ ...card }}>
              <SecH title="تحديات اليوم" sub="🎯" />
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
                {CHALLENGES.map((ch,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,#1B2038,#2D3561)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>{ch.emoji}</div>
                      <span style={{ color:C.text, fontSize:10.5 }}>{ch.text}</span>
                    </div>
                    <span style={{ color:C.green, fontSize:10.5, fontWeight:700, flexShrink:0 }}>+{ch.xp} XP</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate('/student/challenges')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض جميع التحديات
              </button>
            </div>

            {/* Achievements */}
            <div style={{ ...card }}>
              <SecH title="إنجازاتك" />
              <div style={{ textAlign:'center', marginBottom:6 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 5px', fontSize:22, boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>⭐</div>
                <p style={{ color:C.text, fontWeight:700, fontSize:12 }}>شارة المتفوق</p>
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:C.dim, marginBottom:3 }}>
                  <span>التقدم</span><span>75%</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:`${C.gold}1A` }}>
                  <div style={{ height:'100%', width:'75%', borderRadius:3, background:C.goldGrad }}/>
                </div>
              </div>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض الإنجازات
              </button>
            </div>
          </div>

          {/* ── 3 Stats Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:statsCols, gap:10, marginBottom:10 }}>

            {/* Development */}
            <div style={{ ...card }}>
              <SecH title="مستوى التطور" />
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  {SUBJECTS.map(s => (
                    <div key={s.name} style={{ marginBottom:6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                        <span style={{ color:C.sub, fontSize:9.5 }}>{s.name}</span>
                        <span style={{ color:s.color, fontSize:9.5, fontWeight:700 }}>{s.pct}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:3, background:`${s.color}18` }}>
                        <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:3, background:s.color }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <CircProg pct={87} size={72}/>
              </div>
              <button onClick={()=>navigate('/student/report')} style={{ width:'100%', marginTop:8, padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                عرض التقرير الكامل
              </button>
            </div>

            {/* League */}
            <div style={{ ...card }}>
              <SecH title="دوري الياقوت" />
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:6, marginBottom:10 }}>
                {LEAGUE.map(p => {
                  const h = ({1:60,2:46,3:36} as Record<number,number>)[p.rank];
                  const bg = ({1:C.goldGrad,2:'linear-gradient(135deg,#9CA3AF,#6B7280)',3:'linear-gradient(135deg,#B45309,#92400E)'} as Record<number,string>)[p.rank];
                  return (
                    <div key={p.rank} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:16 }}>{p.avatar}</span>
                      <span style={{ color:C.text, fontSize:8, fontWeight:700, textAlign:'center', maxWidth:50, lineHeight:1.3 }}>{p.name}</span>
                      <span style={{ color:C.sub, fontSize:7.5 }}>{p.pts.toLocaleString()}</span>
                      <div style={{ width:44, height:h, background:bg, borderRadius:'5px 5px 0 0', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:3, color:'#fff', fontSize:12, fontWeight:800 }}>
                        {p.rank===1?'👑':`#${p.rank}`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>navigate('/student/league')} style={{ width:'100%', padding:'8px', borderRadius:10, background:'linear-gradient(135deg,#162144,#0D1535)', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                عرض الترتيب الكامل
              </button>
            </div>

            {/* Points */}
            <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <SecH title="نقاطي" />
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                <span style={{ fontSize:18 }}>⭐</span>
                <span style={{ color:C.text, fontWeight:900, fontSize:26, lineHeight:1 }}>{pts.toLocaleString()}</span>
              </div>
              <p style={{ color:C.sub, fontSize:11, marginBottom:8 }}>نقطة</p>
              <div style={{ fontSize:44, marginBottom:8 }}>💰</div>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                متجر المكافآت
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══════ FIXED NOTIFICATION BAR ══════ */}
      <div style={{ position:'fixed', bottom:BH, right: isMobile ? 0 : SW, left:0, background:'linear-gradient(90deg,#0D1535,#162144)', borderTop:'1px solid rgba(201,149,42,0.3)', display:'flex', alignItems:'center', gap:8, padding:'8px 14px', zIndex:90, boxShadow:'0 -4px 20px rgba(13,21,53,0.4)' }}>
        <span style={{ fontSize:20, flexShrink:0 }}>🎁</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:12, lineHeight:1.3 }}>حصتك في اللغة الإنجليزية بدأت الآن</p>
          {!isMobile && <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>انضم الآن ولا تفوت أي معلومة</p>}
        </div>
        <span style={{ color:C.goldL, fontWeight:800, fontSize:12, flexShrink:0, fontFamily:'monospace' }}>00:08:15</span>
        <button style={{ padding:'7px 12px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11.5, border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:5, boxShadow:'0 3px 12px rgba(201,149,42,0.45)', minHeight:36, minWidth:44 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
          {!isMobile && 'انضم'}
        </button>
      </div>

      {/* ══════ FIXED BOTTOM NAV ══════ */}
      <div dir="rtl" style={{ position:'fixed', bottom:0, left:0, right:0, height:BH, background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-around', zIndex:100, boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>

        <button onClick={()=>navigate('/student/dashboard')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 12px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", minWidth:44, minHeight:44 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:700, color:C.gold }}>الرئيسية</span>
          <div style={{ width:14, height:2, background:C.goldGrad, borderRadius:2 }}/>
        </button>

        <button onClick={()=>navigate('/student/live-classes')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 12px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", minWidth:44, minHeight:44 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:500, color:C.sub }}>الجدول</span>
        </button>

        {/* Center Logo */}
        <div style={{ position:'relative', top:-12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(160deg,#1B2038,#0D1535)', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 6px 20px rgba(13,21,53,0.6), 0 0 0 1px ${C.gold}44`, outline:'none', overflow:'hidden', minWidth:52, minHeight:52 }}>
            <BrandLogo size={36} />
          </button>
        </div>

        <button onClick={()=>navigate('/student/courses')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 12px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", minWidth:44, minHeight:44 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:500, color:C.sub }}>المكتبة</span>
        </button>

        <button onClick={()=>setShowMoreMenu(true)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 12px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", minWidth:44, minHeight:44 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:500, color:C.sub }}>المزيد</span>
        </button>

      </div>

      {/* More menu — bottom sheet with the full nav list (mirrors the desktop sidebar) */}
      {showMoreMenu && (
        <div onClick={()=>setShowMoreMenu(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:300, display:'flex', alignItems:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxHeight:'70vh', overflowY:'auto', background:C.card, borderRadius:'20px 20px 0 0', padding:'10px 14px 24px' }}>
            <div style={{ width:40, height:4, borderRadius:2, background:C.border, margin:'6px auto 14px' }}/>
            {NAV.map((item,i) => (
              <div key={i} onClick={()=>{ setShowMoreMenu(false); navigate(item.to); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 10px', borderRadius:12, cursor:'pointer' }}>
                <span style={{ fontSize:18 }}>{item.emoji}</span>
                <span style={{ color:C.text, fontSize:13.5, fontWeight:600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
