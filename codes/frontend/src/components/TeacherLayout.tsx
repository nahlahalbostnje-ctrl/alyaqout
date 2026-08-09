import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';
import { C, brand } from '../theme/palette';

const navItems = [
  { to: '/teacher/dashboard',    label: 'الرئيسية',       d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/teacher/courses',      label: 'دوراتي',          d: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/teacher/live-classes', label: 'حصصي المباشرة',  d: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { to: '/teacher/exams',        label: 'امتحاناتي',      d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/teacher/homework',     label: 'واجباتي',        d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { to: '/teacher/emergency',    label: 'طلبات الطوارئ',  d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { to: '/teacher/attendance',   label: 'الحضور والسلوك', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/teacher/schedule',     label: 'جدولي',           d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/teacher/my-items',     label: 'مذكراتي',        d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

const PAGE_NAMES: Record<string, string> = Object.fromEntries(navItems.map((n) => [n.to, n.label]));

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const initials = user?.name?.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? 'م';
  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const pageName = PAGE_NAMES[location.pathname] ?? 'بوابة المعلم';
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Cairo',sans-serif", direction: 'rtl' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(36,55,70,0.35)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      )}

      <aside style={{
        width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
        height: '100dvh', maxHeight: '100vh', overflow: 'hidden',
        position: isMobile ? 'fixed' : 'sticky', top: 0, right: 0,
        zIndex: isMobile ? 50 : undefined,
        background: C.sidebar, borderLeft: `1px solid ${C.sidebarBorder}`,
        boxShadow: isMobile ? C.shadow : 'none',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={38} style={{ flexShrink: 0, borderRadius: 10, boxShadow: '0 4px 12px rgba(197,147,65,0.25)' }} />
            <div>
              <p style={{ color: C.text, fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>منصة الياقوت</p>
              <p style={{ color: brand.gold, fontSize: 10.5, marginTop: 2 }}>بوابة المعلم</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderRadius: 10, marginBottom: 2,
                  fontSize: 14.5, fontWeight: isActive ? 800 : 600,
                  background: isActive ? C.sidebarActiveBg : 'transparent',
                  color: isActive ? C.primary : C.text,
                  borderRight: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                  </svg>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ flexShrink: 0, padding: '10px 8px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, background: C.bg, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: C.goldGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.text, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{user?.name ?? 'معلم'}</p>
              <p style={{ color: C.primary, fontSize: 10.5 }}>معلم</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub, fontSize: 12, fontFamily: "'Cairo',sans-serif",
          }}>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            {isMobile && (
              <button type="button" onClick={() => setSidebarOpen((o) => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.text }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <span style={{ color: C.dim }}>بوابة المعلم</span>
            <span style={{ color: C.border }}>›</span>
            <span style={{ color: C.text, fontWeight: 700 }}>{pageName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isMobile && <span style={{ color: C.dim, fontSize: 12 }}>{dateStr}</span>}
            <NotificationBell />
            <button type="button" onClick={handleLogout} title="تسجيل الخروج" style={{
              width: 36, height: 36, borderRadius: 10, background: C.redBg, border: '1px solid rgba(224,122,122,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.red,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>{children}</main>
      </div>
    </div>
  );
}
