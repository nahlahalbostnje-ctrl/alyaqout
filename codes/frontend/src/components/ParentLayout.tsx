import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import NotificationBell from './NotificationBell';
import BrandLogo from './BrandLogo';
import AccountMenu from './AccountMenu';
import { C } from '../theme/palette';
import { PARENT_HOME_ICONS } from '../features/nav/roleHomeIcons';

const PAGE_NAMES: Record<string, string> = {
  '/parent/dashboard': 'الرئيسية',
  '/parent/activity': 'الدوري والتحديات',
  '/parent/league': 'الدوري والتحديات',
  '/parent/challenges': 'الدوري والتحديات',
  '/parent/ai-assistant': 'المعلم المناوب 24/7',
  ...Object.fromEntries(PARENT_HOME_ICONS.map((i) => [i.to, i.label])),
};

export default function ParentLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isHome = location.pathname === '/parent/dashboard';
  const pageName = PAGE_NAMES[location.pathname]
    ?? (location.pathname.startsWith('/parent/children') ? 'أبنائي' : 'بوابة ولي الأمر');

  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: C.bg,
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <header
        style={{
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '10px 12px' : '0 20px',
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: C.shadow,
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          {!isHome && (
            <button
              type="button"
              onClick={() => navigate('/parent/dashboard')}
              title="الرئيسية"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bg,
                cursor: 'pointer',
                color: C.primary,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              ←
            </button>
          )}
          <Link
            to="/parent/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}
          >
            <BrandLogo size={isHome ? 40 : 34} style={{ flexShrink: 0, borderRadius: 12 }} />
            <div style={{ minWidth: 0 }}>
              {isHome ? (
                <>
                  <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: isMobile ? 14 : 15, lineHeight: 1.25 }}>
                    مرحباً أ. {user?.name?.split(' ')[0] ?? 'ولي الأمر'}
                  </p>
                  {!isMobile && (
                    <p style={{ margin: '2px 0 0', color: C.sub, fontSize: 11, fontWeight: 600 }}>
                      بوابة ولي الأمر — منصة الياقوت
                    </p>
                  )}
                </>
              ) : (
                <>
                  {!isMobile && (
                    <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 13, lineHeight: 1.25 }}>
                      بوابة ولي الأمر
                    </p>
                  )}
                  <p style={{ margin: isMobile ? 0 : '2px 0 0', color: isMobile ? C.text : C.sub, fontSize: isMobile ? 13 : 11, fontWeight: isMobile ? 700 : 600 }}>
                    {pageName}
                  </p>
                </>
              )}
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <NotificationBell />
          <AccountMenu profilePath="/parent/settings" roleLabel="ولي أمر" namePrefix="أ. " />
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', background: C.bg }}>{children}</main>
    </div>
  );
}
