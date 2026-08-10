import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';
import AccountMenu from './AccountMenu';
import { C, brand } from '../theme/palette';

const NAV = [
  { to: '/parent/dashboard',          label: 'الرئيسية',                  d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
  { to: '/parent/children',           label: 'أبنائي',                    d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/parent/academic-progress',  label: 'مؤشر التطور الأكاديمي',    d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/parent/attendance',         label: 'الحضور والغياب',            d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/parent/communication',      label: 'التواصل مع المعلمين',       d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/parent/counseling',         label: 'طلب جلسة إرشاد',           d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/parent/billing',            label: 'الاشتراك والفواتير',       d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { to: '/parent/packages',           label: 'الباقات والاشتراك',         d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/parent/league',             label: 'دوري الياقوت للآباء',      d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { to: '/parent/challenges',         label: 'التحديات العائلية',         d: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { to: '/parent/academy',            label: 'أكاديمية ولي الأمر',       d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { to: '/parent/achievements',       label: 'الإنجازات والشارات',       d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { to: '/parent/reports',            label: 'التقارير',                  d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/parent/ai-assistant',       label: 'مساعد الياقوت الذكي',     d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/parent/my-items',           label: 'ملاحظاتي',                 d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/parent/settings',           label: 'الإعدادات',                d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function ParentLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname, isMobile]);

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currentPage = NAV.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Cairo', sans-serif" }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(36,55,70,0.35)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      )}

      <aside style={{
        width: 280, flexShrink: 0, background: C.sidebar,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, right: 0, height: '100dvh', maxHeight: '100vh',
        zIndex: isMobile ? 50 : undefined,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderLeft: `1px solid ${C.sidebarBorder}`,
        boxShadow: isMobile ? C.shadow : 'none',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={38} style={{ flexShrink: 0, borderRadius: 10, boxShadow: '0 4px 12px rgba(197,147,65,0.25)' }} />
            <div>
              <p style={{ color: C.text, fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>منصة الياقوت</p>
              <p style={{ color: brand.gold, fontSize: 10.5, marginTop: 2 }}>بوابة ولي الأمر</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '11px 12px', borderRadius: 10,
                  fontSize: 14.5, fontWeight: isActive ? 800 : 600,
                  background: isActive ? C.sidebarActiveBg : 'transparent',
                  color: isActive ? C.primary : C.text,
                  borderRight: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                  </svg>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ flexShrink: 0, padding: '10px 8px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 6 }}>
            <AccountMenu
              profilePath="/parent/settings"
              roleLabel="ولي أمر"
              namePrefix="أ. "
              showName
              triggerStyle={{ width: '100%', justifyContent: 'flex-start', background: C.bg }}
            />
          </div>
          <button type="button" onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 11px', borderRadius: 11, border: 'none',
            background: 'transparent', color: C.red,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
          }}>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: C.card,
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <button type="button" onClick={() => setSidebarOpen((o) => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: C.text, display: 'flex', alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                aria-label="القائمة">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <span style={{ color: C.dim, fontSize: 12 }}>بوابة ولي الأمر</span>
            {currentPage && !isMobile && (
              <>
                <span style={{ color: C.border, fontSize: 12 }}>/</span>
                <span style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{currentPage.label}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
            {!isMobile && <span style={{ color: C.dim, fontSize: 12 }}>{dateStr}</span>}
            <NotificationBell />
            <AccountMenu profilePath="/parent/settings" roleLabel="ولي أمر" namePrefix="أ. " />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}
