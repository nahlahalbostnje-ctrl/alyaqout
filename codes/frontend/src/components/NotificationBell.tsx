import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../features/notifications/notificationsSlice';

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, loading } = useAppSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Initial fetch + poll unread count every 60 s (cache-friendly lightweight endpoint)
  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 60_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleRead(id: number) {
    dispatch(markNotificationRead(id));
  }

  function handleReadAll() {
    dispatch(markAllNotificationsRead());
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return `منذ ${m} دقيقة`;
    const h = Math.floor(m / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    return `منذ ${Math.floor(h / 24)} يوم`;
  }

  return (
    <div ref={ref} className="relative" dir="rtl">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        aria-label="الإشعارات"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
          style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">الإشعارات</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleReadAll}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  تحديد الكل كمقروء
                </button>
              )}
              <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                {unreadCount} غير مقروء
              </span>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-white/40 text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleRead(n.id)}
                  className={`w-full text-right px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 ${
                    !n.is_read ? 'bg-teal-500/5' : ''
                  }`}
                >
                  {/* Dot indicator */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${!n.is_read ? 'bg-teal-400' : 'bg-white/20'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-white' : 'text-white/60'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-white/30 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
