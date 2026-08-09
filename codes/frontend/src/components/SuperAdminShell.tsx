import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { fetchSuperAdminStats } from '../features/superAdmin/superAdminSlice';
import BrandLogo from './BrandLogo';
import { C } from '../theme/palette';

export { C };

export const SW = 280;

type SaNavItem = { label: string; to: string; icon: string; end?: boolean };
type SaNavGroup = { id: string; label: string; items: SaNavItem[]; alwaysOpen?: boolean };

const NAV_GROUPS: SaNavGroup[] = [
  {
    id: 'home',
    label: '',
    alwaysOpen: true,
    items: [
      { label: 'الرئيسية', to: '/dashboard', icon: '🏠', end: true },
    ],
  },
  {
    id: 'insights',
    label: 'المؤشرات والتقارير',
    items: [
      { label: 'مؤشرات المنصة', to: '/dashboard/analytics', icon: '📊' },
      { label: 'التقارير والتحليلات', to: '/dashboard/reports', icon: '📈' },
    ],
  },
  {
    id: 'network',
    label: 'الشبكة والفروع',
    items: [
      { label: 'الأفرع', to: '/dashboard/schools', icon: '🌍' },
      { label: 'الدول', to: '/dashboard/countries', icon: '🗺️' },
    ],
  },
  {
    id: 'people',
    label: 'المستخدمون والمحتوى',
    items: [
      { label: 'المعلمون والموظفون', to: '/dashboard/staff', icon: '👨‍🏫' },
      { label: 'الطلاب وأولياء الأمور', to: '/dashboard/students', icon: '👥' },
      { label: 'المحتوى والاعتمادات', to: '/dashboard/content-approvals', icon: '✅' },
      { label: 'الأسئلة الشائعة', to: '/dashboard/faqs', icon: '❓' },
    ],
  },
  {
    id: 'finance',
    label: 'المالية',
    items: [
      { label: 'المالية والفواتير', to: '/dashboard/billing', icon: '💰' },
      { label: 'الخطط والاشتراكات', to: '/dashboard/plans', icon: '📋' },
    ],
  },
  {
    id: 'comms',
    label: 'التواصل والدعم',
    items: [
      { label: 'نظام التنبيهات', to: '/dashboard/notifications', icon: '🔔' },
      { label: 'الرسائل', to: '/dashboard/messages', icon: '💬' },
      { label: 'الدعم الفني', to: '/dashboard/support', icon: '🎧' },
    ],
  },
  {
    id: 'system',
    label: 'النظام والأمان',
    items: [
      { label: 'الإعدادات العامة', to: '/dashboard/settings', icon: '⚙️' },
      { label: 'الصلاحيات والأدوار', to: '/dashboard/roles', icon: '🔑' },
      { label: 'سجل العمليات', to: '/dashboard/activity-log', icon: '📝' },
      { label: 'مركز الأمان', to: '/super-admin/security', icon: '🔐' },
      { label: 'مركز التطوير', to: '/dashboard/dev-center', icon: '🛠️' },
    ],
  },
];

function saItemMatches(item: SaNavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

export default function SuperAdminShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(s => s.auth.user);
  const badges = useAppSelector(s => s.superAdmin.badges);
  const approvals = useAppSelector(s => s.superAdmin.approvals);
  const [sem, setSem] = useState('الفصل الدراسي الثاني 2025-2026');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of NAV_GROUPS) {
      if (g.alwaysOpen || !g.label) {
        init[g.id] = true;
        continue;
      }
      init[g.id] = g.items.some((item) => saItemMatches(item, typeof window !== 'undefined' ? window.location.pathname : '/dashboard'));
    }
    return init;
  });

  useEffect(() => {
    dispatch(fetchSuperAdminStats());
  }, [dispatch]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (isMobile) setSidebarOpen(false); setProfileMenuOpen(false); }, [location.pathname, isMobile]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of NAV_GROUPS) {
        if (g.alwaysOpen || !g.label) {
          next[g.id] = true;
          continue;
        }
        if (g.items.some((item) => saItemMatches(item, location.pathname))) {
          next[g.id] = true;
        }
      }
      return next;
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDoc = () => setProfileMenuOpen(false);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [profileMenuOpen]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fullName = user?.name ?? 'السوبر أدمن';
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
    : 'SA';
  const handleLogout = () => { setProfileMenuOpen(false); dispatch(logout()); navigate('/login', { replace: true }); };

  const pendingApprovals = badges?.approvals
    ?? ((approvals?.exams ?? 0) + (approvals?.homeworks ?? 0));
  const messagesCount = badges?.messages ?? 0;
  const notifCount = badges?.notifications ?? 0;

  const headerIcons = [
    { e:'🔔', n: notifCount, to:'/dashboard/notifications', color: C.red },
    { e:'✉️', n: messagesCount, to:'/dashboard/messages', color: C.blue },
    { e:'🚩', n: pendingApprovals, to:'/dashboard/content-approvals', color: C.orange },
  ];

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif" }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, backdropFilter:'blur(2px)' }} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:SW, flexShrink:0, background:C.sidebar, borderLeft:`1px solid ${C.sidebarBorder}`, height:'100dvh', maxHeight:'100vh', overflow:'hidden', position: isMobile ? 'fixed' : 'sticky', top:0, right:0, zIndex: isMobile ? 50 : undefined, display:'flex', flexDirection:'column', transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none', transition:'transform 0.25s ease' }}>
        <div style={{ padding:'18px 12px 14px', borderBottom:`1px solid ${C.border}`, textAlign:'center', flexShrink:0 }}>
          <BrandLogo size={52} style={{ margin:'0 auto 10px', borderRadius:12, boxShadow:'0 4px 12px rgba(197,147,65,0.25)' }} />
          <p style={{ color:C.text, fontWeight:900, fontSize:14, lineHeight:1.3 }}>مركز القيادة</p>
          <p style={{ color:C.primary, fontSize:10, marginTop:3 }}>الإدارة العليا للمنصة</p>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto', minHeight:0, WebkitOverflowScrolling:'touch', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.25) transparent' }}>
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups[group.id] !== false;
            const hasHeader = Boolean(group.label) && !group.alwaysOpen;
            const groupActive = group.items.some((item) => saItemMatches(item, location.pathname));

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
                  <NavLink key={item.to} to={item.to} end={item.end} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
                        fontSize: 14.5, fontWeight: isActive ? 800 : 700, lineHeight: 1.35,
                        background: isActive ? C.sidebarActiveBg : 'transparent',
                        color: isActive ? C.primary : C.text,
                        borderRight: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
        <div style={{ flexShrink:0, margin:'10px 10px 12px', padding:'14px 12px', background:C.bg, borderRadius:14, border:`1px solid ${C.border}`, textAlign:'center' }}>
          <BrandLogo size={40} style={{ margin:'0 auto 8px', borderRadius:8 }} />
          <p style={{ color:C.sub, fontSize:11, marginBottom:10 }}>التميز في التعليم</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }}/>
            <span style={{ color:C.sub, fontSize:11 }}>حالة المنصة:</span>
            <span style={{ color:C.green, fontSize:11, fontWeight:700 }}>ممتاز</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>
        <header style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 8px rgba(0,0,0,0.05)', gap:12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(o => !o)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:C.navy, display:'flex', alignItems:'center', minWidth:44, minHeight:44, justifyContent:'center' }}
                aria-label="القائمة">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            )}
            <BrandLogo size={38} style={{ borderRadius:10 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            {headerIcons.map((ic,i)=>(
              <div key={i} onClick={()=>navigate(ic.to)} title={ic.to} style={{ position:'relative', width:38, height:38, borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, cursor:'pointer' }}>
                {ic.e}
                {ic.n > 0 && (
                  <div style={{ position:'absolute', top:-5, right:-5, minWidth:18, height:18, padding:'0 4px', borderRadius:20, background:ic.color, color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {ic.n > 99 ? '99+' : ic.n}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!isMobile && (
            <>
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:16 }}>{timeStr}</p>
                <p style={{ color:C.sub, fontSize:10 }}>{dateStr}</p>
              </div>
              <select value={sem} onChange={e=>setSem(e.target.value)} style={{ padding:'7px 12px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:11.5, fontWeight:600, cursor:'pointer', outline:'none', flexShrink:0 }}>
                <option>الفصل الدراسي الثاني 2025-2026</option>
                <option>الفصل الدراسي الأول 2025-2026</option>
              </select>
            </>
          )}
          <div style={{ position:'relative', flexShrink:0 }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              title="الحساب"
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'4px 6px 4px 8px', borderRadius:14,
                border: profileMenuOpen ? `1.5px solid ${C.gold}` : '1.5px solid transparent',
                background: profileMenuOpen ? C.goldBg : 'transparent',
                cursor:'pointer', fontFamily:"'Cairo',sans-serif",
              }}
            >
              {!isMobile && (
                <div style={{ textAlign:'left' }}>
                  <p style={{ color:C.text, fontWeight:800, fontSize:13.5, lineHeight:1.2, margin:0 }}>مرحباً بك أ. {fullName}</p>
                  <span style={{ background:C.goldGrad, color:'#fff', fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>مالك المنصة</span>
                </div>
              )}
              <div style={{ width:44, height:44, borderRadius:12, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff', border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(59,130,160,0.35)', flexShrink:0 }}>
                {initials}
              </div>
              <span style={{ color:C.sub, fontSize:10, transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.15s' }}>▼</span>
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                style={{
                  position:'absolute', top:'calc(100% + 8px)', left:0, minWidth:200,
                  background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
                  boxShadow:'0 10px 32px rgba(0,0,0,0.12)', padding:6, zIndex:60,
                  fontFamily:"'Cairo',sans-serif",
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileMenuOpen(false); navigate('/super-admin/profile'); }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 12px',
                    borderRadius:10, border:'none', background:'transparent', color:C.text,
                    fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", textAlign:'right',
                  }}
                >
                  <span>👤</span> الملف الشخصي
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 12px',
                    borderRadius:10, border:'none', background:'transparent', color:C.red,
                    fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", textAlign:'right',
                  }}
                >
                  <span>🚪</span> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </header>
        <div style={{ padding:'16px 18px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
