import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/supervisor/students',   label: 'طلابي',         d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/supervisor/study-room', label: 'غرف الواجبات',  d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const initials = user?.name?.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? 'م';
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#F5EDD8', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
        style={{ background: '#1B2038', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', boxShadow: '0 4px 14px rgba(201,149,42,0.35)' }}>
              <img src="/logo.png" alt="ياقوت" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">منصة الياقوت</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#DDAD50' }}>بوابة المشرف</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff', boxShadow: '0 4px 14px rgba(201,149,42,0.3)' }
                : { color: 'rgba(255,255,255,0.5)' }
              }>
              <svg className="w-[17px] h-[17px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#DDAD50' }}>مشرف</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-xl transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 shadow-sm"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE3CE', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>{dateStr}</p>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto" style={{ background: '#F5EDD8' }}>{children}</main>
      </div>
    </div>
  );
}
