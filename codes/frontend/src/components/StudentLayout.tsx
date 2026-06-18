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
    <div className="flex min-h-screen" style={{ background: '#f5f4ff', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: 'linear-gradient(180deg, #6d28d9 0%, #5b21b6 50%, #4c1d95 100%)', boxShadow: '4px 0 24px rgba(109,40,217,0.15)' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ياقوت" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <p className="text-white font-black text-xl leading-none" style={{ fontFamily: "'Cairo', sans-serif", letterSpacing: '-0.3px' }}>منصة الياقوت</p>
              <p className="text-purple-200/70 text-xs mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>بوابة الطالب</p>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-white/10 mb-3" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-purple-600' : 'text-white/60'}>
                    <NavIcon>{item.icon}</NavIcon>
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="m-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-700 text-sm font-black flex-shrink-0 bg-white shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Cairo', sans-serif" }}>{user?.name}</p>
              <p className="text-purple-200/60 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>طالب</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-300 hover:text-white hover:bg-red-500/30 transition-all"
            style={{ fontFamily: "'Cairo', sans-serif" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 bg-white"
          style={{ borderBottom: '1px solid #ede9fe', boxShadow: '0 1px 8px rgba(109,40,217,0.06)' }}>
          <div>
            <span className="text-slate-400 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
              مرحباً، <span className="text-purple-700 font-bold">{user?.name}</span>
            </span>
          </div>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto" style={{ background: '#f5f4ff' }}>{children}</main>
      </div>

      <EmergencyButton />
      <ChatbotWidget />
    </div>
  );
}
