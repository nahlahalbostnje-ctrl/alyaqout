import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/supervisor/students',   label: 'طلابي',         icon: '👥' },
  { to: '/supervisor/study-room', label: 'غرف الواجبات',  icon: '💬' },
];

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <aside className="w-64 bg-white border-l border-gray-100 shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ياقوت" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <h1 className="text-lg font-black leading-tight" style={{ color: '#0f766e' }}>منصة الياقوت</h1>
              <p className="text-xs text-gray-400">بوابة المشرف</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
              {user?.name?.charAt(0) ?? 'م'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">مشرف</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-red-500 transition py-2 text-center rounded-xl hover:bg-red-50">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0d9488, #134e4a)' }}>
          <span className="text-white font-semibold text-sm">لوحة المشرف</span>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
