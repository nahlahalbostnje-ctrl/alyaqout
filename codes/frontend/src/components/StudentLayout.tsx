import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import NotificationBell from './NotificationBell';
import EmergencyButton from './EmergencyButton';
import ChatbotWidget from './ChatbotWidget';
import BrandLogo from './BrandLogo';
import { ST } from '../theme/studentTheme';
import { STUDENT_PAGE_NAMES } from '../features/student/studentNav';

type Props = {
  children: ReactNode;
  /** XP في وسط الهيدر — الرئيسية فقط */
  xp?: { inLevel: number; forNext: number; level: number };
};

/**
 * بوابة الطالب — هيدر موحّد بدون سايدبار ولا درج مخفي على الرئيسية.
 * الصفحات الداخلية: رجوع للرئيسية + عنوان الصفحة.
 */
export default function StudentLayout({ children, xp }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'ط';
  const isHome = location.pathname === '/student/dashboard';
  const pageName = STUDENT_PAGE_NAMES[location.pathname] ?? 'بوابة الطالب';
  const xpPct = xp
    ? Math.min(100, Math.round((xp.inLevel / Math.max(xp.forNext, 1)) * 100))
    : 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: ST.bg, fontFamily: ST.font, direction: 'rtl',
    }}>
      <header style={{
        minHeight: isHome ? (isMobile ? 64 : 72) : 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap',
        padding: isMobile ? '10px 12px' : '0 24px',
        background: ST.card,
        borderBottom: `1px solid ${ST.border}`,
        boxShadow: ST.shadow,
        position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
      }}>
        {/* Right: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: isHome && !isMobile ? '0 1 240px' : '1 1 auto' }}>
          {!isHome && (
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              title="الرئيسية"
              style={{
                width: 36, height: 36, borderRadius: 12, border: `1px solid ${ST.border}`,
                background: ST.bg, cursor: 'pointer', color: ST.primary, fontWeight: 800, fontSize: 14,
              }}
            >
              ←
            </button>
          )}
          <Link to="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
            <BrandLogo size={isHome ? 40 : 34} style={{ flexShrink: 0, borderRadius: 12 }} />
            {!isMobile && (
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, color: ST.navy, fontWeight: 800, fontSize: 13, lineHeight: 1.25 }}>
                  منصة الياقوت لخدمات التعليم
                </p>
                {!isHome && (
                  <p style={{ margin: '2px 0 0', color: ST.sub, fontSize: 11, fontWeight: 600 }}>{pageName}</p>
                )}
              </div>
            )}
            {isMobile && !isHome && (
              <span style={{ color: ST.text, fontWeight: 700, fontSize: 13 }}>{pageName}</span>
            )}
          </Link>
        </div>

        {/* Center: XP (home only) */}
        {isHome && xp && (
          <div style={{
            flex: isMobile ? '1 1 100%' : '1 1 280px',
            maxWidth: isMobile ? '100%' : 360,
            order: isMobile ? 3 : 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
              <span style={{ color: ST.sub, fontSize: 11, fontWeight: 700 }}>المستوى {xp.level}</span>
              <span style={{ color: ST.primary, fontSize: 11, fontWeight: 800 }}>{xp.inLevel} / {xp.forNext} XP</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: ST.bg, overflow: 'hidden', border: `1px solid ${ST.border}` }}>
              <div style={{
                height: '100%', width: `${xpPct}%`, borderRadius: 99,
                background: ST.blueGrad, transition: 'width 0.35s ease',
              }} />
            </div>
          </div>
        )}

        {/* Left: alerts + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginInlineStart: 'auto' }}>
          <NotificationBell />
          <button
            type="button"
            onClick={() => navigate('/student/messages')}
            title="الرسائل"
            style={{
              width: 38, height: 38, borderRadius: 12, border: `1px solid ${ST.border}`,
              background: ST.bg, cursor: 'pointer', color: ST.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="تسجيل الخروج"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 10px',
              borderRadius: 14, border: `1px solid ${ST.border}`, background: ST.card,
              cursor: 'pointer', fontFamily: ST.font,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: ST.blueGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 11,
            }}>
              {initials}
            </div>
            {!isMobile && (
              <span style={{ color: ST.text, fontWeight: 700, fontSize: 12.5, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0] ?? 'طالب'}
              </span>
            )}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', background: ST.bg }}>{children}</main>

      <EmergencyButton />
      <ChatbotWidget />
    </div>
  );
}
