import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/teacher/dashboard',    label: 'الرئيسية',       icon: '🏠' },
  { to: '/teacher/courses',      label: 'دوراتي',         icon: '🎬' },
  { to: '/teacher/live-classes', label: 'حصصي المباشرة',  icon: '📡' },
  { to: '/teacher/exams',        label: 'امتحاناتي',      icon: '📝' },
  { to: '/teacher/homework',     label: 'واجباتي',        icon: '📚' },
  { to: '/teacher/emergency',    label: 'طلبات الطوارئ',  icon: '🚨' },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
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
              <h1 className="text-lg font-black text-teal-800 leading-tight">منصة الياقوت</h1>
              <p className="text-xs text-gray-400">بوابة المعلم</p>
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
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-gray-400">مرحباً،</p>
            <p className="text-sm font-semibold text-gray-700 truncate">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-500 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition text-right"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex items-center justify-end px-6 gap-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
