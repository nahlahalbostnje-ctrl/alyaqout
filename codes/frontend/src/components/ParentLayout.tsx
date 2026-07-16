import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';

const SB = '#0D1E3A';
const GOLD = '#C59341';
const GOLD_L = '#D4A65A';

const NAV = [
  { to: '/parent/dashboard',          label: 'الرئيسية',                  d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
  { to: '/parent/children',           label: 'أبنائي',                    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/parent/academic-progress',  label: 'مؤشر التطور الأكاديمي',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/parent/attendance',         label: 'الحضور والغياب',            d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/parent/communication',      label: 'التواصل مع المعلمين',       d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/parent/counseling',         label: 'طلب جلسة إرشاد',           d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/parent/billing',            label: 'المدفوعات والفواتير',       d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { to: '/parent/packages',           label: 'الباقات والاشتراك',         d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/parent/league',             label: 'دوري الياقوت للآباء',      d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { to: '/parent/academy',            label: 'أكاديمية ولي الأمر',       d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { to: '/parent/achievements',       label: 'الإنجازات والشارات',       d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { to: '/parent/reports',            label: 'التقارير',                  d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/parent/ai-assistant',       label: 'مساعد الياقوت الذكي',     d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/parent/my-items',           label: 'ملاحظاتي',                 d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/parent/settings',           label: 'الإعدادات',                d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function ParentLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname, isMobile]);

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')
    : 'و';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currentPage = NAV.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#F5EDD8', fontFamily: "'Cairo', sans-serif" }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside style={{
        width: 280, flexShrink: 0, background: SB,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, right: 0, height: '100dvh', maxHeight: '100vh',
        zIndex: isMobile ? 50 : undefined,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
        transition: 'transform 0.25s ease',
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <BrandLogo size={44} style={{ flexShrink: 0, borderRadius: 10 }} />
            <p style={{ color: GOLD_L, fontSize: 13, fontWeight: 700 }}>بوابة ولي الأمر</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.25) transparent' }}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '11px 12px', borderRadius: 11,
                  fontSize: 15, fontWeight: isActive ? 800 : 700,
                  background: isActive ? GOLD : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.88)',
                  boxShadow: isActive ? `0 4px 12px rgba(197,147,65,0.35)` : 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <span style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                    <Icon d={item.d} size={17} />
                  </span>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ flexShrink: 0, padding: '10px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 11px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 13,
              boxShadow: '0 3px 10px rgba(197,147,65,0.4)',
            }}>{initials}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>أ. {user?.name}</p>
              <p style={{ color: GOLD_L, fontSize: 10, marginTop: 1 }}>ولي أمر ⭐</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 11px', borderRadius: 11, border: 'none',
            background: 'transparent', color: 'rgba(239,68,68,0.7)',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: '#FFFFFF',
          borderBottom: '1px solid #EDE3CE', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: SB, display: 'flex', alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                aria-label="القائمة"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>بوابة ولي الأمر</span>
            {currentPage && !isMobile && (
              <>
                <span style={{ color: '#D1C4A8', fontSize: 12 }}>/</span>
                <span style={{ color: '#0D1E3A', fontSize: 12, fontWeight: 700 }}>{currentPage.label}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
            {!isMobile && <span style={{ color: '#9CA3AF', fontSize: 12 }}>{dateStr}</span>}
            <NotificationBell />
            {!isMobile && (
              <>
                <div style={{ width: 1, height: 26, background: '#EDE3CE' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 12,
                  }}>{initials}</div>
                  <div>
                    <p style={{ color: '#1B2038', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>أ. {user?.name}</p>
                    <p style={{ color: GOLD, fontSize: 10.5 }}>ولي أمر</p>
                  </div>
                </div>
              </>
            )}
            {/* Always-visible logout — no need to open the sidebar drawer */}
            <button onClick={handleLogout} title="تسجيل الخروج" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer', flexShrink: 0, color: '#EF4444' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F5EDD8' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
