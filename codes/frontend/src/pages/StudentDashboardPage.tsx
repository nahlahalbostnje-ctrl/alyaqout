import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints } from '../features/student/gamificationSlice';
import { logout } from '../features/auth/authSlice';

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
const SW = 195;   // sidebar width
const BH = 60;    // bottom nav height

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

// ─── Quick Actions (static template — badges computed in-component) ───────────
const ACTIONS_TEMPLATE = [
  { label:'دخول الحصة',        desc:'انضم لحصتك الآن',            emoji:'📹', bg:'linear-gradient(135deg,#1D4ED8,#2563EB)', badgeKey:'live',     to:'/student/live-classes', highlight:true },
  { label:'الواجبات',           desc:'تابع واجباتك',               emoji:'📚', bg:'linear-gradient(135deg,#0369A1,#0284C7)', badgeKey:'homework', to:'/student/homework',    highlight:false },
  { label:'الامتحانات',         desc:'استعد لامتحاناتك',           emoji:'📋', bg:'linear-gradient(135deg,#4338CA,#6366F1)', badgeKey:'exams',    to:'/student/exams',       highlight:false },
  { label:'جدول الحصص',        desc:'عرض جدولك',                  emoji:'📅', bg:'linear-gradient(135deg,#0E7490,#06B6D4)', badgeKey:null,       to:'/student/live-classes',highlight:false },
  { label:'دوري الياقوت',      desc:'نافس وتقدم',                 emoji:'💎', bg:C.goldGrad,                                badgeKey:null,       to:'/student/league',      highlight:false },
  { label:'مستوى التطور',      desc:'تابع تقدمك',                 emoji:'📈', bg:'linear-gradient(135deg,#C9952A,#DDAD50)', badgeKey:null,       to:'/student/report',      highlight:false },
  { label:'غرفة الطوارئ',      desc:'مساعدة فورية',               emoji:'🚨', bg:'linear-gradient(135deg,#DC2626,#EF4444)', badgeKey:'lock',     to:'/student/emergency',   highlight:false },
  { label:'معلمي الذكي',       desc:'اسأل الذكاء الاصطناعي',     emoji:'🤖', bg:'linear-gradient(135deg,#374151,#4B5563)', badgeKey:null,       to:'/student/study-room',  highlight:false },
  { label:'دوري الزملاء',      desc:'تحدى أصدقاءك',              emoji:'⚔️', bg:'linear-gradient(135deg,#1E40AF,#3B82F6)', badgeKey:null,       to:'/student/peer-league',  highlight:false },
  { label:'غرفة الدراسة 24/7', desc:'دعم مباشر على مدار الساعة', emoji:'🎧', bg:'linear-gradient(135deg,#111827,#1F2937)', badgeKey:'always',   to:'/student/study-24',     highlight:false },
  { label:'الرسائل',            desc:'للمعلم والمدير',             emoji:'✉️', bg:'linear-gradient(135deg,#0369A1,#2563EB)', badgeKey:null,       to:'/student/messages',     highlight:false },
  { label:'النتائج',            desc:'نتائجك وتقاريرك',            emoji:'📊', bg:'linear-gradient(135deg,#C9952A,#F59E0B)', badgeKey:null,       to:'/student/points',       highlight:false },
  { label:'مكتبة الياقوت',     desc:'كتب وأسئلة سنوات سابقة',    emoji:'📖', bg:'linear-gradient(135deg,#065F46,#059669)', badgeKey:null,       to:'/student/library',      highlight:false },
  { label:'حاضنة المواهب',     desc:'اكتشف موهبتك وطوّرها',       emoji:'💡', bg:'linear-gradient(135deg,#92400E,#D97706)', badgeKey:null,       to:'/student/talents',      highlight:false },
  { label:'صديق الدراسة',      desc:'مؤقت + ملاحظات ذكية',        emoji:'⏱️', bg:'linear-gradient(135deg,#1E3A5F,#1D4ED8)', badgeKey:null,       to:'/student/study-buddy',  highlight:false },
  { label:'مرشد الياقوت',      desc:'احجز موعد استشارة',           emoji:'💬', bg:'linear-gradient(135deg,#4C1D95,#7C3AED)', badgeKey:null,       to:'/student/counselor',    highlight:false },
  { label:'الكبسولة الزمنية',  desc:'أهدافك الشهرية',              emoji:'🎯', bg:'linear-gradient(135deg,#831843,#BE185D)', badgeKey:null,       to:'/student/time-capsule', highlight:false },
  { label:'نظام التحديات',     desc:'تحديات فردية وعائلية',        emoji:'⚡', bg:'linear-gradient(135deg,#713F12,#CA8A04)', badgeKey:null,       to:'/student/challenges',   highlight:false },
];

// ─── Static data ──────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name:'الرياضيات',         pct:90, color:'#2563EB' },
  { name:'اللغة الإنجليزية',  pct:88, color:'#7C3AED' },
  { name:'العلوم',             pct:85, color:'#16A34A' },
  { name:'اللغة العربية',      pct:76, color:'#D97706' },
  { name:'التربية الإسلامية', pct:92, color:'#DC2626' },
];

const LEAGUE = [
  { rank:2, name:'سارة محمد', pts:5210, avatar:'👩' },
  { rank:1, name:'أحمد سالم', pts:5820, avatar:'👦' },
  { rank:3, name:'علي خالد',  pts:4980, avatar:'🧒'  },
];

const CHALLENGES = [
  { text:'حل 20 سؤال رياضيات', xp:150, emoji:'📐' },
  { text:'قراءة 30 دقيقة',      xp:100, emoji:'📖' },
  { text:'حل واجب واحد',        xp:100, emoji:'✅' },
];

// ─── Helper: Circular Progress ────────────────────────────────────────────────
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

// ─── Helper: Warrior Shield SVG ───────────────────────────────────────────────
function WarriorShield({ level }: { level:number }) {
  return (
    <div style={{ position:'relative', width:100, height:110, margin:'0 auto 8px' }}>
      {/* Laurel wreath */}
      <svg width="100" height="110" viewBox="0 0 100 110" style={{ position:'absolute', inset:0 }}>
        <defs>
          <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D060"/>
            <stop offset="100%" stopColor="#C9952A"/>
          </linearGradient>
          <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#0D1535"/>
          </linearGradient>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#90CAF9"/>
            <stop offset="100%" stopColor="#1565C0"/>
          </linearGradient>
        </defs>
        {/* Laurel leaves left */}
        {[-35,-20,-5].map((a,i) => (
          <ellipse key={`l${i}`} cx={18+i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${18+i*4} ${55+i*12})`}/>
        ))}
        {/* Laurel leaves right */}
        {[35,20,5].map((a,i) => (
          <ellipse key={`r${i}`} cx={82-i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${82-i*4} ${55+i*12})`}/>
        ))}
        {/* Shield */}
        <path d="M50,8 L84,22 L84,60 Q84,82 50,95 Q16,82 16,60 L16,22 Z"
          fill="url(#sg)" stroke="url(#wg)" strokeWidth="3.5"/>
        {/* Inner shield ring */}
        <path d="M50,14 L79,26 L79,60 Q79,78 50,89 Q21,78 21,60 L21,26 Z"
          fill="none" stroke="rgba(240,208,96,0.2)" strokeWidth="1"/>
        {/* Gem */}
        <polygon points="50,28 68,44 50,72 32,44" fill="url(#gg)"/>
        <polygon points="50,28 68,44 50,50 32,44" fill="#BBDEFB" opacity="0.65"/>
        <polygon points="50,72 68,44 50,56" fill="#0D47A1"/>
        <polygon points="50,72 32,44 50,56" fill="#1565C0"/>
        <polygon points="50,28 56,36 50,33" fill="white" opacity="0.45"/>
        {/* Bottom arc */}
        <path d="M33,92 Q50,102 67,92" stroke="url(#wg)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
      {/* Level badge */}
      <div style={{ position:'absolute', top:2, right:2, width:26, height:26, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#1B2038', fontWeight:900, fontSize:11, border:'2px solid #fff', boxShadow:'0 2px 8px rgba(201,149,42,0.6)', zIndex:2 }}>
        {level}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
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

  useEffect(() => { dispatch(fetchStudentDashboard()); dispatch(fetchMyPoints()); }, [dispatch]);

  const firstName = student?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';

  // Real points: prefer dashStats (comes with dashboard call), fallback to gamification slice
  const pts      = dashStats?.total_points ?? totalPoints ?? 0;
  const rank     = myRank ?? null;
  const level    = dashStats?.level ?? Math.floor(pts / 500) + 1;
  const xpIn     = dashStats?.xp_in_level ?? (pts % 500);
  const xpNext   = dashStats?.xp_for_next ?? 500;
  const live     = upcoming[0];
  const nextClass = upcoming[1] ?? null;

  // Compute dynamic badges from real data
  const badgeMap: Record<string, string | null> = {
    live:     upcoming.some(c => c.status === 'live') ? '🔴' : (upcoming.length > 0 ? String(upcoming.length) : null),
    homework: dashStats?.pending_homework ? String(dashStats.pending_homework) : null,
    exams:    dashStats?.upcoming_exams   ? String(dashStats.upcoming_exams)   : null,
    lock:     '🚪', always: '24/7',
  };

  const ACTIONS = ACTIONS_TEMPLATE.map(a => ({
    ...a,
    badge: a.badgeKey ? (badgeMap[a.badgeKey] ?? null) : null,
  }));

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace:true }); };

  const card: CSSProperties = { background:C.card, borderRadius:18, padding:'14px 16px', boxShadow:C.shadow, border:`1px solid ${C.border}` };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

      {/* ══════════════ SIDEBAR ══════════════ */}
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
            <p style={{ color:C.dim, fontSize:8, lineHeight:1.4 }}>{rank ? 'في المتصدرين' : 'لا يوجد بيانات'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:'10px 8px', flex:1 }}>
          {NAV.map((item,i) => {
            const inner = (active=false) => (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, marginBottom:2, fontSize:12, fontWeight:active?700:500, background:active?C.goldGrad:'transparent', color:active?'#fff':C.sub, cursor:item.to?'pointer':'default', transition:'background 0.15s' }}>
                <span style={{ fontSize:15, lineHeight:1 }}>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
            );
            if (item.to) {
              return (
                <NavLink key={i} to={item.to} style={{ textDecoration:'none' }}>
                  {({ isActive }) => inner(isActive)}
                </NavLink>
              );
            }
            return <div key={i}>{inner(false)}</div>;
          })}
          {/* Logout */}
          <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, marginTop:4, fontSize:12, fontWeight:500, color:C.red, cursor:'pointer' }}>
            <span style={{ fontSize:15 }}>🚪</span>
            تسجيل الخروج
          </div>
        </nav>

        {/* Daily tasks promo */}
        <div style={{ margin:'0 10px 10px', padding:'14px 12px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:14, border:'1px solid rgba(201,149,42,0.3)', textAlign:'center' }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:11.5, lineHeight:1.55, marginBottom:8 }}>
            أكمل مهامك اليومية!<br/>واربح مكافآت رائعة!
          </p>
          <div style={{ fontSize:36, marginBottom:8 }}>💰</div>
          <button onClick={()=>navigate('/student/homework')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11.5, border:'none', cursor:'pointer', boxShadow:'0 3px 10px rgba(201,149,42,0.4)' }}>
            عرض المهام
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div dir="rtl" style={{ flex:1, overflowY:'auto', paddingBottom:BH*2+14, minWidth:0 }}>

        {/* ── Header ── */}
        <div style={{ padding:'12px 18px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', background:C.card, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>

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
              <span style={{ fontSize:22 }}>👋</span>
              <h1 style={{ color:C.navy2, fontWeight:900, fontSize:20 }}>مرحباً {firstName}</h1>
            </div>
            <p style={{ color:C.sub, fontSize:11.5, marginTop:1 }}>الصف الخامس</p>
          </div>

          {/* Avatar */}
          <div style={{ position:'relative' }}>
            <div onClick={()=>setShowProfileMenu(p=>!p)} style={{ width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(201,149,42,0.4)', cursor:'pointer' }}>
              👦
            </div>
            <div style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#1D4ED8,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, border:'1.5px solid #fff' }}>🛡️</div>
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

        <div style={{ padding:'14px 16px 0' }}>

          {/* ── Current Class Card ── */}
          <div style={{ background:'linear-gradient(135deg,#0F1E5A 0%,#0D1535 100%)', borderRadius:22, padding:'18px 20px 16px', marginBottom:14, position:'relative', overflow:'hidden', boxShadow:'0 10px 32px rgba(13,21,53,0.55)' }}>
            {/* Decorative background */}
            <div style={{ position:'absolute', insetInlineEnd:-20, top:'50%', transform:'translateY(-55%)', opacity:0.07, fontSize:110, lineHeight:1 }}>🖥️</div>
            <div style={{ position:'absolute', insetInlineStart:-10, bottom:-10, opacity:0.04, fontSize:90 }}>📚</div>

            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11.5, fontWeight:600 }}>الحصة الحالية</span>
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <h2 style={{ color:'#fff', fontWeight:900, fontSize:26, lineHeight:1.15, margin:'0 0 5px' }}>
                  {live?.title ?? 'لا توجد حصة مجدولة الآن'}
                </h2>
                <p style={{ color:C.goldL, fontSize:13, fontWeight:600 }}>
                  {live ? `الأستاذ ${live.teacher?.name}` : 'تحقق من جدولك لاحقاً'}
                </p>
              </div>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(255,255,255,0.12)', border:'2px solid rgba(221,173,80,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                👨‍🏫
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>تبدأ خلال 8 دقائق</span>
              </div>
              <span style={{ color:'rgba(255,255,255,0.35)' }}>•</span>
              <span style={{ color:'#fff', fontSize:12.5, fontWeight:700 }}>10:00 صباحاً</span>
            </div>

            <button
              onClick={()=>live?navigate(`/live/${live.agora_channel??'demo'}?classId=${live.id}`):navigate('/student/live-classes')}
              style={{ width:'100%', padding:'14px', borderRadius:15, background:C.goldGrad, color:'#1B2038', fontWeight:900, fontSize:15, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 5px 20px rgba(201,149,42,0.5)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              دخول الحصة الآن
            </button>
          </div>

          {/* ── Quick Actions 4×3 ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:9, marginBottom:14 }}>
            {ACTIONS.map((a,i) => (
              <div key={i} onClick={()=>a.to&&navigate(a.to)}
                style={{ ...card, padding:'13px 8px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative', cursor:a.to?'pointer':'default', border:`1px solid ${a.highlight?'rgba(37,99,235,0.25)':C.border}`, boxShadow:a.highlight?'0 4px 18px rgba(37,99,235,0.2)':C.shadow, transition:'transform 0.15s' }}
                onMouseEnter={e=>{if(a.to)(e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';}}
              >
                {a.badge && (
                  <div style={{ position:'absolute', top:5, left:5, minWidth:19, height:19, borderRadius:20, padding:'0 4px', background:a.badge==='🔒'||a.badge==='24/7'?'#374151':C.red, color:'#fff', fontSize:8.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }}>{a.badge}</div>
                )}
                <div style={{ width:50, height:50, borderRadius:'50%', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 4px 14px rgba(0,0,0,0.22)', flexShrink:0 }}>{a.emoji}</div>
                <p style={{ color:C.text, fontWeight:700, fontSize:10.5, textAlign:'center', lineHeight:1.3 }}>{a.label}</p>
                <p style={{ color:C.dim, fontSize:9, textAlign:'center', lineHeight:1.3 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* ── 3 Info Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>

            {/* Next Class */}
            <div style={{ ...card }}>
              <SecH title="الحصة القادمة" />
              {nextClass ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👨‍🏫</div>
                    <div>
                      <p style={{ color:C.gold, fontWeight:700, fontSize:13 }}>{nextClass.course?.title}</p>
                      <p style={{ color:C.sub, fontSize:10.5 }}>أ. {nextClass.teacher?.name}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:10, fontSize:11.5, color:C.sub }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>{new Date(nextClass.scheduled_at).toLocaleString('ar-EG',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                </>
              ) : (
                <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'12px 0' }}>لا توجد حصص قادمة</p>
              )}
              <button onClick={()=>navigate('/student/live-classes')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer' }}>
                عرض الجدول الكامل
              </button>
            </div>

            {/* Challenges */}
            <div style={{ ...card }}>
              <SecH title="تحديات اليوم" sub="🎯" />
              <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:10 }}>
                {CHALLENGES.map((ch,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#1B2038,#2D3561)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{ch.emoji}</div>
                      <span style={{ color:C.text, fontSize:10.5 }}>{ch.text}</span>
                    </div>
                    <span style={{ color:C.green, fontSize:10.5, fontWeight:700, flexShrink:0 }}>+{ch.xp} XP</span>
                  </div>
                ))}
              </div>
              <button style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer' }}>
                عرض جميع التحديات
              </button>
            </div>

            {/* Achievements */}
            <div style={{ ...card }}>
              <SecH title="إنجازاتك" />
              <div style={{ textAlign:'center', marginBottom:8 }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px', fontSize:24, boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>⭐</div>
                <p style={{ color:C.text, fontWeight:700, fontSize:12.5 }}>شارة المتفوق</p>
                <p style={{ color:C.green, fontSize:10.5, marginTop:2 }}>أنت رائع! استمر</p>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:C.dim, marginBottom:3 }}>
                  <span>التقدم</span><span>75%</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:`${C.gold}1A` }}>
                  <div style={{ height:'100%', width:'75%', borderRadius:3, background:C.goldGrad }}/>
                </div>
              </div>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer' }}>
                عرض جميع الإنجازات
              </button>
            </div>
          </div>

          {/* ── 3 Stats Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:10 }}>

            {/* Development */}
            <div style={{ ...card }}>
              <SecH title="مستوى التطور" />
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  {SUBJECTS.map(s => (
                    <div key={s.name} style={{ marginBottom:7 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ color:C.sub, fontSize:9.5 }}>{s.name}</span>
                        <span style={{ color:s.color, fontSize:9.5, fontWeight:700 }}>{s.pct}%</span>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:`${s.color}18` }}>
                        <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:3, background:s.color }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <CircProg pct={87} size={76}/>
              </div>
              <button onClick={()=>navigate('/student/report')} style={{ width:'100%', marginTop:10, padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>
                عرض التقرير الكامل
              </button>
            </div>

            {/* League */}
            <div style={{ ...card }}>
              <SecH title="دوري الياقوت للطلاب" />
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:6, marginBottom:12 }}>
                {LEAGUE.map(p => {
                  const h = ({1:64,2:50,3:40} as Record<number,number>)[p.rank];
                  const bg = ({1:C.goldGrad,2:'linear-gradient(135deg,#9CA3AF,#6B7280)',3:'linear-gradient(135deg,#B45309,#92400E)'} as Record<number,string>)[p.rank];
                  return (
                    <div key={p.rank} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <span style={{ fontSize:18 }}>{p.avatar}</span>
                      <span style={{ color:C.text, fontSize:8.5, fontWeight:700, textAlign:'center', maxWidth:52, lineHeight:1.3 }}>{p.name}</span>
                      <span style={{ color:C.sub, fontSize:7.5 }}>{p.pts.toLocaleString()}</span>
                      <div style={{ width:46, height:h, background:bg, borderRadius:'6px 6px 0 0', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:4, color:'#fff', fontSize:13, fontWeight:800 }}>
                        {p.rank===1?'👑':`#${p.rank}`}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>navigate('/student/league')} style={{ width:'100%', padding:'8px', borderRadius:10, background:'linear-gradient(135deg,#162144,#0D1535)', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>
                عرض الترتيب الكامل
              </button>
            </div>

            {/* Points */}
            <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <SecH title="نقاطي" />
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                <span style={{ fontSize:20 }}>⭐</span>
                <span style={{ color:C.text, fontWeight:900, fontSize:28, lineHeight:1 }}>{pts.toLocaleString()}</span>
              </div>
              <p style={{ color:C.sub, fontSize:12, marginBottom:10 }}>نقطة</p>
              <div style={{ fontSize:52, marginBottom:10 }}>💰</div>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>
                متجر المكافآت
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════ FIXED NOTIFICATION BAR ══════════════ */}
      <div style={{ position:'fixed', bottom:BH, right:SW, left:0, background:'linear-gradient(90deg,#0D1535,#162144)', borderTop:'1px solid rgba(201,149,42,0.3)', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', zIndex:90, boxShadow:'0 -4px 20px rgba(13,21,53,0.4)' }}>
        <span style={{ fontSize:22, flexShrink:0 }}>🎁</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:12.5, lineHeight:1.3 }}>حصتك في اللغة الإنجليزية بدأت الآن</p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>انضم الآن ولا تفوت أي معلومة</p>
        </div>
        <span style={{ color:C.goldL, fontWeight:800, fontSize:13, flexShrink:0, fontFamily:'monospace' }}>00:08:15</span>
        <button style={{ padding:'8px 14px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:5, boxShadow:'0 3px 12px rgba(201,149,42,0.45)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
          انضم للحصة
        </button>
        <button onClick={()=>navigate('/student/study-room')} style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#1B2038,#162144)', border:`2px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, cursor:'pointer', flexShrink:0, boxShadow:`0 2px 10px rgba(201,149,42,0.35)` }}>
          🤖
        </button>
      </div>

      {/* ══════════════ FIXED BOTTOM NAV (5 items) ══════════════ */}
      <div dir="rtl" style={{ position:'fixed', bottom:0, left:0, right:0, height:BH, background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-around', zIndex:100, boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>

        {/* الرئيسية */}
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:700, color:C.gold }}>الرئيسية</span>
          <div style={{ width:16, height:2.5, background:C.goldGrad, borderRadius:2 }}/>
        </button>

        {/* الإشعارات */}
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", position:'relative' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(8px)', width:20, height:20, borderRadius:'50%', background:C.red, color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(239,68,68,0.5)' }}>3</div>
          <span style={{ fontSize:10, fontWeight:600, color:C.sub, marginTop:2 }}>الإشعارات</span>
        </button>

        {/* Center Diamond */}
        <div style={{ position:'relative', top:-12 }}>
          <button style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(160deg,#1B2038,#0D1535)', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer', boxShadow:`0 6px 20px rgba(13,21,53,0.6), 0 0 0 1px ${C.gold}44`, outline:'none' }}>
            💎
          </button>
        </div>

        {/* المكتبة */}
        <button onClick={()=>navigate('/student/courses')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:500, color:C.sub }}>المكتبة</span>
        </button>

        {/* المزيد */}
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
          <span style={{ fontSize:9.5, fontWeight:500, color:C.sub }}>المزيد</span>
        </button>

      </div>
    </div>
  );
}
