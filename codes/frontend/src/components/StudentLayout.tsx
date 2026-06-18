import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';
import EmergencyButton from './EmergencyButton';
import ChatbotWidget from './ChatbotWidget';

const navItems = [
  {
    to: '/student/dashboard', label: 'الرئيسية',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    to: '/student/courses', label: 'الدورات',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  },
  {
    to: '/student/live-classes', label: 'الحصص المباشرة',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />,
  },
  {
    to: '/student/exams', label: 'امتحاناتي',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  },
  {
    to: '/student/homework', label: 'واجباتي',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  },
  {
    to: '/student/report', label: 'تقريري',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
  {
    to: '/student/points', label: 'نقاطي',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  },
  {
    to: '/student/league', label: 'دوري ياقوت',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
  },
  {
    to: '/student/study-room', label: 'غرفة الواجبات',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  },
];

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

export default function StudentLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'ط';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#060d1f', fontFamily: "'Cairo', sans-serif" }}
      dir="rtl"
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
        style={{
          background: 'linear-gradient(180deg, #040a18 0%, #060d1f 100%)',
          borderLeft: '1px solid rgba(245,166,35,0.1)',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'rgba(245,166,35,0.25)',
                  filter: 'blur(14px)',
                  transform: 'scale(1.4)',
                }}
              />
              <img src="/logo.png" alt="ياقوت" className="relative w-10 h-10 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-none" style={{ letterSpacing: '-0.2px' }}>
                منصة الياقوت
              </p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#f5a623', opacity: 0.65 }}>
                بوابة الطالب
              </p>
            </div>
          </div>
          <div
            className="mt-4 h-px"
            style={{
              background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.3), transparent)',
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? '' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #f5a623 0%, #ffd166 100%)',
                      color: '#040a18',
                      boxShadow: '0 4px 18px rgba(245,166,35,0.28)',
                    }
                  : { color: 'rgba(255,255,255,0.45)' }
              }
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? '#040a18' : 'rgba(255,255,255,0.3)' }}>
                    <NavIcon>{item.icon}</NavIcon>
                  </span>
                  <span className="flex-1" style={isActive ? {} : { color: 'rgba(255,255,255,0.45)' }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(4,10,24,0.45)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div
          className="px-2.5 py-3 space-y-1"
          style={{ borderTop: '1px solid rgba(245,166,35,0.08)' }}
        >
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{
              background: 'rgba(245,166,35,0.06)',
              border: '1px solid rgba(245,166,35,0.1)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f5a623, #ffd166)',
                color: '#040a18',
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#f5a623', opacity: 0.55 }}>
                طالب
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-14 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10"
          style={{
            background: 'rgba(7,14,34,0.95)',
            borderBottom: '1px solid rgba(245,166,35,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            مرحباً،{' '}
            <span style={{ color: '#f5a623', fontWeight: 700 }}>{user?.name}</span>
          </span>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto" style={{ background: '#060d1f' }}>
          {children}
        </main>
      </div>

      <EmergencyButton />
      <ChatbotWidget />
    </div>
  );
}
