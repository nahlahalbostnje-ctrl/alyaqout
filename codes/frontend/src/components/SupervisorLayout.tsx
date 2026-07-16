import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';

const NAV = [
  { to: '/supervisor/students',             label: 'طلابي',                      d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/supervisor/assignments-rooms',    label: 'غرف الواجبات',               d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/supervisor/quiz-monitoring',      label: 'غرف الاختبارات والتقييم',    d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { to: '/supervisor/performance-tracking', label: 'تقارير الأداء والمتابعة',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/supervisor/counseling-sessions',  label: 'جلسات الإرشاد والتوجيه',     d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/supervisor/chat-center',          label: 'مركز الرسائل والتواصل',      d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/supervisor/ai-assistant',         label: 'المساعد الذكي',              d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/supervisor/my-items',             label: 'خططي الخاصة',              d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/supervisor/settings',             label: 'الإعدادات',                  d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAppSelector((s) => s.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname, isMobile]);

  const initials  = user?.name?.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? 'م';
  const dateStr   = new Date().toLocaleDateString('ar-EG', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const pageLabel = NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'بوابة المشرف';

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace:true }); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F5EDD8', fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, backdropFilter:'blur(2px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width:280, flexShrink:0, display:'flex', flexDirection:'column',
        height:'100dvh', maxHeight:'100vh', overflow:'hidden',
        position: isMobile ? 'fixed' : 'sticky', top:0, right:0,
        zIndex: isMobile ? 50 : undefined,
        background:'#0D1E3A', borderLeft:'1px solid rgba(255,255,255,0.07)',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
        transition: 'transform 0.25s ease',
      }}>

        {/* Logo */}
        <div style={{ padding:'18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <BrandLogo size={44} style={{ flexShrink:0, borderRadius:10 }} />
            <p style={{ color:'#C59341', fontSize:13, fontWeight:700 }}>بوابة المشرف</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 10px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2, minHeight:0, WebkitOverflowScrolling:'touch', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.25) transparent' }}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:12,
                fontSize:15, fontWeight: isActive ? 800 : 700, textDecoration:'none', transition:'all 0.18s',
                ...(isActive
                  ? { background:'#C59341', color:'#fff', boxShadow:'0 4px 12px rgba(197,147,65,0.35)' }
                  : { color:'rgba(255,255,255,0.88)', background:'transparent' }),
              })}
              onMouseEnter={(e) => { const el = e.currentTarget; if (!el.style.background.includes('#C59341')) { el.style.background='rgba(255,255,255,0.07)'; el.style.color='rgba(255,255,255,0.95)'; } }}
              onMouseLeave={(e) => { const el = e.currentTarget; if (!el.style.background.includes('#C59341')) { el.style.background='transparent'; el.style.color='rgba(255,255,255,0.88)'; } }}
            >
              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ flexShrink:0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User account */}
        <div style={{ flexShrink:0, padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.06)', marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#C59341,#D4A65A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:13, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name ?? 'المشرف'}</p>
              <p style={{ color:'#C59341', fontSize:11, marginTop:2 }}>مشرف</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10,
            border:'none', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:12.5,
            fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif", transition:'all 0.15s',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background='transparent'; (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.4)'; }}
          >
            <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <header style={{ height:54, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:'#fff', borderBottom:'1px solid #EDE3CE', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', flexShrink:0, position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(o => !o)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#0D1E3A', display:'flex', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center' }}
                aria-label="القائمة">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:6, color:'#9CA3AF', fontSize:12.5 }}>
              <span>بوابة المشرف</span>
              {!isMobile && <><span>›</span><span style={{ color:'#1B2038', fontWeight:700 }}>{pageLabel}</span></>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {!isMobile && <span style={{ color:'#9CA3AF', fontSize:12 }}>{dateStr}</span>}
            <NotificationBell />
            {/* Always-visible logout — no need to open the sidebar drawer */}
            <button onClick={handleLogout} title="تسجيل الخروج" style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'#EF4444' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <main style={{ flex:1, overflowY:'auto', background:'#F5EDD8' }}>{children}</main>
      </div>
    </div>
  );
}
