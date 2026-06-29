import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import EmergencyButton from './EmergencyButton';
import ChatbotWidget from './ChatbotWidget';

const C = {
  sidebar: '#0D1E3A',
  active:  '#C59341',
  gold:    '#C59341',
  goldL:   '#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:      '#F5EDD8',
  border:  '#EDE3CE',
  text:    '#1B2038',
};

const navItems = [
  { to: '/student/dashboard',    label: 'الرئيسية',             icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/student/courses',      label: 'الدورات',              icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/student/live-classes', label: 'الحصص المباشرة',       icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { to: '/student/exams',        label: 'امتحاناتي',             icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/student/homework',     label: 'واجباتي',               icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { to: '/student/report',       label: 'مستوى التطور',          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/student/points',       label: 'نقاطي وإنجازاتي',       icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { to: '/student/league',       label: 'دوري الياقوت',          icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { to: '/student/challenges',   label: 'نظام التحديات',         icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { to: '/student/study-room',   label: 'معلمي الذكي',           icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/student/library',      label: 'مكتبة الياقوت',         icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
  { to: '/student/talents',      label: 'حاضنة المواهب',         icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/student/study-buddy',  label: 'صديق الدراسة',          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/student/counselor',    label: 'مرشد الياقوت',          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { to: '/student/time-capsule',    label: 'الكبسولة الزمنية',      icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
  { to: '/student/review-videos',  label: 'فيديوهات المراجعة',    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { to: '/student/emergency',      label: 'غرفة الطوارئ',          icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

const PAGE_NAMES: Record<string, string> = {
  '/student/dashboard':    'الرئيسية',
  '/student/courses':      'الدورات',
  '/student/live-classes': 'الحصص المباشرة',
  '/student/exams':        'امتحاناتي',
  '/student/homework':     'واجباتي',
  '/student/report':       'مستوى التطور',
  '/student/points':       'نقاطي وإنجازاتي',
  '/student/league':       'دوري الياقوت',
  '/student/challenges':   'نظام التحديات',
  '/student/study-room':   'معلمي الذكي',
  '/student/library':      'مكتبة الياقوت',
  '/student/talents':      'حاضنة المواهب',
  '/student/study-buddy':  'صديق الدراسة الفردي',
  '/student/counselor':    'مرشد الياقوت الطلابي',
  '/student/time-capsule': 'الكبسولة الزمنية',
  '/student/emergency':      'غرفة الطوارئ',
  '/student/review-videos':  'فيديوهات المراجعة',
  '/student/peer-league':    'دوري الزملاء',
  '/student/study-24':     'غرفة الدراسة 24/7',
  '/student/messages':     'الرسائل',
  '/student/teacher-contact': 'تواصل مع المعلم',
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAppSelector((s) => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'ط';
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  const pageName = PAGE_NAMES[location.pathname] ?? 'بوابة الطالب';

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

      {/* ── Mobile Backdrop ── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, backdropFilter:'blur(2px)' }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', height:'100vh', position: isMobile ? 'fixed' : 'sticky', top:0, right:0, zIndex: isMobile ? 50 : undefined, background:C.sidebar, borderLeft:'1px solid rgba(255,255,255,0.06)', transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none', transition:'transform 0.25s ease' }}>

        {/* Logo */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(197,147,65,0.35)' }}>
              <img src="/logo.png" alt="ياقوت" style={{ width:26, height:26, objectFit:'contain' }} />
            </div>
            <div>
              <p style={{ color:'#fff', fontWeight:900, fontSize:13, lineHeight:1.2 }}>منصة الياقوت</p>
              <p style={{ color:C.gold, fontSize:10.5, marginTop:2 }}>بوابة الطالب</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto', scrollbarWidth:'none' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration:'none' }}>
              {({ isActive }) => (
                <div style={{
                  display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:10, marginBottom:2,
                  fontSize:12, fontWeight: isActive ? 700 : 500,
                  background: isActive ? C.active : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? '0 4px 12px rgba(197,147,65,0.35)' : 'none',
                  transition:'all 0.15s',
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div style={{ padding:'10px 8px 14px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px', borderRadius:12, background:'rgba(255,255,255,0.06)', marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#1B2038', fontWeight:900, fontSize:12, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontWeight:700, fontSize:12, lineHeight:1.2 }}>{user?.name ?? 'طالب'}</p>
              <p style={{ color:C.gold, fontSize:10.5 }}>طالب</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:12, fontFamily:"'Cairo',sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.4)'; }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header + Breadcrumb */}
        <header style={{ height:54, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:'#fff', borderBottom:'1px solid #EDE3CE', position:'sticky', top:0, zIndex:30, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(o => !o)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:C.sidebar, display:'flex', alignItems:'center' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <span style={{ color:'#9CA3AF' }}>بوابة الطالب</span>
            <span style={{ color:'#D1D5DB' }}>›</span>
            <span style={{ color:C.text, fontWeight:700 }}>{pageName}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {!isMobile && <span style={{ color:'#9CA3AF', fontSize:12 }}>{dateStr}</span>}
            <NotificationBell />
          </div>
        </header>

        <main style={{ flex:1, overflowY:'auto', background:C.bg }}>
          {children}
        </main>
      </div>

      <EmergencyButton />
      <ChatbotWidget />
    </div>
  );
}
