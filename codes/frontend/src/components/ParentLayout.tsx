import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import type { ReactNode } from 'react';
import NotificationBell from './NotificationBell';

const C = {
  sidebar:      '#1B2038',
  sidebarDeep:  '#131929',
  sidebarBdr:   'rgba(255,255,255,0.07)',
  gold:         '#C9952A',
  goldL:        '#DDAD50',
  goldGrad:     'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:       'rgba(201,149,42,0.12)',
  pageBg:       '#F5EDD8',
  cardBg:       '#FFFFFF',
  cardBorder:   '#EDE3CE',
  text:         '#1B2038',
  textSub:      '#6B7280',
};

function Icon({ d, size = 17 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ALL_NAV = [
  { to: '/parent/dashboard',  label: 'الرئيسية',                 d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
  { to: '/parent/children',   label: 'أبنائي',                   d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', active: true },
  { to: null, label: 'مؤشر التطور الأكاديمي', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', active: false },
  { to: null, label: 'الحضور والغياب',         d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', active: false },
  { to: null, label: 'التواصل',                d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', active: false },
  { to: null, label: 'طلب جلسة إرشاد',         d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', active: false },
  { to: null, label: 'المدفوعات والفواتير',     d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', active: false },
  { to: null, label: 'دوري الياقوت للآباء',    d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', active: false },
  { to: null, label: 'أكاديمية ولي الأمر',     d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', active: false },
  { to: null, label: 'الإنجازات والشارات',     d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', active: false },
  { to: null, label: 'التقارير',               d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', active: false },
  { to: null, label: 'مساعد الياقوت الذكي',   d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', active: false },
  { to: null, label: 'الإعدادات',              d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', active: false },
];

const navLinkStyle = (isActive: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 12px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: isActive ? '700' : '500',
  transition: 'all 0.2s',
  textDecoration: 'none',
  background: isActive ? C.goldGrad : 'transparent',
  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
  boxShadow: isActive ? '0 4px 12px rgba(201,149,42,0.3)' : 'none',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'right' as const,
  direction: 'rtl' as const,
});

export default function ParentLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')
    : 'و';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: C.pageBg, fontFamily: "'Cairo', sans-serif" }}>

      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: 258, flexShrink: 0, background: C.sidebar,
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${C.sidebarBdr}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Shield logo */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: C.goldGrad, boxShadow: '0 4px 16px rgba(201,149,42,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="ياقوت" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>منصة الياقوت</p>
              <p style={{ color: C.goldL, fontSize: 11, marginTop: 2 }}>لخدمات التعليم</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ALL_NAV.map((item, idx) => {
              if (item.active && item.to) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={({ isActive }) => navLinkStyle(isActive)}
                  >
                    <Icon d={item.d} size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              }
              if (idx === 2) {
                return (
                  <div key="divider-top" style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ height: 1, background: C.sidebarBdr, margin: '4px 4px 6px' }} />
                    <div style={navLinkStyle(false)}>
                      <Icon d={item.d} size={16} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={item.label} style={navLinkStyle(false)}>
                  <Icon d={item.d} size={16} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.sidebarBdr}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 14, marginBottom: 8,
            background: 'rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: C.goldGrad, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14,
              boxShadow: '0 3px 10px rgba(201,149,42,0.4)',
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                أ. {user?.name}
              </p>
              <p style={{ color: C.goldL, fontSize: 10.5, marginTop: 1 }}>
                ولي أمر منذ 2023 ⭐
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 7, padding: '9px', borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={15} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', background: C.cardBg, borderBottom: `1px solid ${C.cardBorder}`,
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)', flexShrink: 0,
        }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" fill="none" stroke={C.textSub} viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ color: C.textSub, fontSize: 12.5 }}>{dateStr}</span>
          </div>

          {/* Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Search */}
            <button style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: C.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke={C.textSub} viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Messages */}
            <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: C.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" stroke={C.textSub} viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, borderRadius: '50%', background: C.goldGrad, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </button>
            {/* Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
