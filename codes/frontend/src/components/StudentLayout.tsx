import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import EmergencyButton from './EmergencyButton';
import ChatbotWidget from './ChatbotWidget';
import BrandLogo from './BrandLogo';
import { C, brand } from '../theme/palette';
import {
  STUDENT_ALL_NAV,
  STUDENT_PAGE_NAMES,
  typeScale,
} from '../features/student/studentNav';

/**
 * Option 1: no desktop sidebar — slim top bar.
 * Menu drawer (all destinations) only when opened from header.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'ط';
  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  const pageName = STUDENT_PAGE_NAMES[location.pathname]
    ?? (location.pathname.startsWith('/student/') ? 'بوابة الطالب' : 'بوابة الطالب');
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };
  const isHome = location.pathname === '/student/dashboard';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: C.bg, fontFamily: typeScale.font, direction: 'rtl',
    }}>
      <header style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 20px',
        background: C.card, borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Link to="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <BrandLogo size={34} style={{ flexShrink: 0, borderRadius: 9 }} />
            {!isMobile && (
              <div>
                <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>منصة الياقوت</p>
                <p style={{ margin: 0, color: brand.gold, fontSize: 10.5 }}>بوابة الطالب</p>
              </div>
            )}
          </Link>
          {!isHome && (
            <>
              <span style={{ color: C.border }}>›</span>
              <span style={{ color: C.text, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pageName}
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!isMobile && <span style={{ color: C.dim, fontSize: 12 }}>{dateStr}</span>}
          <NotificationBell />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            title="القائمة"
            style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.text,
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: C.goldGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 11,
          }}>
            {initials}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>{children}</main>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(36,55,70,0.35)', zIndex: 50 }}
          />
          <aside style={{
            position: 'fixed', top: 0, bottom: 0, right: 0, width: Math.min(320, window.innerWidth * 0.88),
            background: C.card, zIndex: 60, display: 'flex', flexDirection: 'column',
            boxShadow: C.shadowLg, borderLeft: `1px solid ${C.border}`,
          }}>
            <div style={{ padding: '16px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: 14 }}>{user?.name ?? 'طالب'}</p>
                <p style={{ margin: '2px 0 0', color: C.sub, fontSize: 12 }}>قائمة الوجهات</p>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.bg, cursor: 'pointer', color: C.sub,
              }}>✕</button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {STUDENT_ALL_NAV.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => { navigate(item.to); setMenuOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 12px', borderRadius: 10, marginBottom: 2,
                      border: 'none', cursor: 'pointer', textAlign: 'right',
                      fontFamily: typeScale.font, fontSize: 13.5,
                      fontWeight: active ? 800 : 600,
                      background: active ? C.sidebarActiveBg : 'transparent',
                      color: active ? C.primary : C.text,
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
              <button type="button" onClick={handleLogout} style={{
                width: '100%', padding: '10px', borderRadius: 10, border: `1px solid rgba(224,122,122,0.35)`,
                background: C.redBg, color: C.red, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: typeScale.font,
              }}>
                تسجيل الخروج
              </button>
            </div>
          </aside>
        </>
      )}

      <EmergencyButton />
      <ChatbotWidget />
    </div>
  );
}
