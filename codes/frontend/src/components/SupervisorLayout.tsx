import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';
import { C, brand } from '../theme/palette';

type SupNavItem = { to: string; label: string; d: string };
type SupNavGroup = { id: string; label: string; items: SupNavItem[]; alwaysOpen?: boolean };

const NAV_GROUPS: SupNavGroup[] = [
  {
    id: 'home',
    label: '',
    alwaysOpen: true,
    items: [
      { to: '/supervisor/students', label: 'طلابي', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
  {
    id: 'rooms',
    label: 'المتابعة والتقييم',
    items: [
      { to: '/supervisor/assignments-rooms', label: 'غرف الواجبات', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { to: '/supervisor/quiz-monitoring', label: 'غرف الاختبارات', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
      { to: '/supervisor/performance-tracking', label: 'تقارير الأداء', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },
  {
    id: 'support',
    label: 'الإرشاد والتواصل',
    items: [
      { to: '/supervisor/counseling-sessions', label: 'جلسات الإرشاد', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/supervisor/chat-center', label: 'الرسائل', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { to: '/supervisor/ai-assistant', label: 'المساعد الذكي', d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    ],
  },
  {
    id: 'personal',
    label: 'حسابي',
    items: [
      { to: '/supervisor/my-items', label: 'خططي الخاصة', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { to: '/supervisor/settings', label: 'الإعدادات', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    const path = typeof window !== 'undefined' ? window.location.pathname : '/supervisor/students';
    for (const g of NAV_GROUPS) {
      if (g.alwaysOpen || !g.label) {
        init[g.id] = true;
        continue;
      }
      init[g.id] = g.items.some((item) => path.startsWith(item.to));
    }
    return init;
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of NAV_GROUPS) {
        if (g.alwaysOpen || !g.label) {
          next[g.id] = true;
          continue;
        }
        if (g.items.some((item) => location.pathname.startsWith(item.to))) {
          next[g.id] = true;
        }
      }
      return next;
    });
  }, [location.pathname]);

  const initials = user?.name?.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? 'م';
  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const pageLabel = FLAT_NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'بوابة المشرف';
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };
  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

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
              <p style={{ color: brand.gold, fontSize: 10.5, marginTop: 2 }}>بوابة المشرف</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups[group.id] !== false;
            const hasHeader = Boolean(group.label) && !group.alwaysOpen;
            const groupActive = group.items.some((item) => location.pathname.startsWith(item.to));

            return (
              <div key={group.id} style={{ marginBottom: hasHeader ? 6 : 2 }}>
                {hasHeader && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: groupActive ? 'rgba(197,147,65,0.08)' : 'transparent',
                      cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      color: groupActive ? C.primary : C.sub,
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 800 }}>{group.label}</span>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      style={{
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.18s ease',
                        opacity: 0.7,
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                {isOpen && group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                        fontSize: 14.5, fontWeight: isActive ? 800 : 600,
                        background: isActive ? C.sidebarActiveBg : 'transparent',
                        color: isActive ? C.primary : C.text,
                        borderRight: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                        transition: 'all 0.15s',
                      }}>
                        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                        </svg>
                        <span>{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div style={{ flexShrink: 0, padding: '10px 8px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, background: C.bg, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: C.goldGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.text, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{user?.name ?? 'المشرف'}</p>
              <p style={{ color: C.primary, fontSize: 10.5 }}>مشرف</p>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
          flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            {isMobile && (
              <button type="button" onClick={() => setSidebarOpen((o) => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: C.text, minWidth: 44, minHeight: 44 }}
                aria-label="القائمة">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <span style={{ color: C.dim }}>بوابة المشرف</span>
            {!isMobile && (
              <>
                <span style={{ color: C.border }}>›</span>
                <span style={{ color: C.text, fontWeight: 700 }}>{pageLabel}</span>
              </>
            )}
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
