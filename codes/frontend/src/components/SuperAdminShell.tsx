import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import BrandLogo from './BrandLogo';

export const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.22)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.06)', green:'#16A34A', orange:'#D97706',
  red:'#EF4444', blue:'#2563EB', purple:'#7C3AED', teal:'#0E7490',
};

export const SW = 222;

const NAV = [
  { label:'الرئيسية',               to:'/dashboard',                   icon:'🏠', end:true },
  { label:'مؤشرات المنصة',         to:'/dashboard/analytics',         icon:'📊', end:false },
  { label:'الأفرع',                to:'/dashboard/schools',           icon:'🌍', end:false },
  { label:'المعلمون والموظفون',     to:'/dashboard/staff',             icon:'👨‍🏫', end:false },
  { label:'الطلاب وأولياء الأمور', to:'/dashboard/students',          icon:'👥', end:false },
  { label:'المحتوى والاعتمادات',    to:'/dashboard/content-approvals', icon:'✅', end:false },
  { label:'المالية والفواتير',      to:'/dashboard/billing',           icon:'💰', end:false },
  { label:'الخطط والاشتراكات',      to:'/dashboard/plans',             icon:'📋', end:false },
  { label:'التقارير والتحليلات',    to:'/dashboard/reports',           icon:'📈', end:false },
  { label:'نظام التنبيهات',         to:'/dashboard/notifications',     icon:'🔔', end:false },
  { label:'الإعدادات العامة',       to:'/dashboard/settings',          icon:'⚙️', end:false },
  { label:'الصلاحيات والأدوار',     to:'/dashboard/roles',             icon:'🔑', end:false },
  { label:'سجل العمليات',          to:'/dashboard/activity-log',      icon:'📝', end:false },
  { label:'الرسائل',               to:'/dashboard/messages',          icon:'💬', end:false },
  { label:'الدعم الفني',           to:'/dashboard/support',           icon:'🎧', end:false },
  { label:'مركز التطوير',          to:'/dashboard/dev-center',        icon:'🛠️', end:false },
];

export default function SuperAdminShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(s => s.auth.user);
  const [sem, setSem] = useState('الفصل الدراسي الثاني 2025-2026');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname, isMobile]);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fullName = user?.name ?? 'عبد الله الشمري';
  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif" }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, backdropFilter:'blur(2px)' }} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:SW, flexShrink:0, background:C.navy, height:'100vh', position: isMobile ? 'fixed' : 'sticky', top:0, right:0, zIndex: isMobile ? 50 : undefined, display:'flex', flexDirection:'column', overflowY:'auto', scrollbarWidth:'none', transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none', transition:'transform 0.25s ease' }}>
        <div style={{ padding:'18px 12px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
          <BrandLogo size={52} style={{ margin:'0 auto 10px', borderRadius:12 }} />
          <p style={{ color:'#fff', fontWeight:900, fontSize:14, lineHeight:1.3 }}>مركز القيادة</p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:3 }}>الإدارة العليا للمنصة</p>
        </div>
        <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map((item, i) => (
            <NavLink key={i} to={item.to} end={item.end} style={{ textDecoration:'none' }}>
              {({ isActive }) => (
                <div style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px', borderRadius:10, fontSize:12, fontWeight:isActive?700:500, background:isActive?C.goldGrad:'transparent', color:isActive?'#fff':'rgba(255,255,255,0.55)', cursor:'pointer', transition:'all 0.15s' }}>
                  <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
          <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px', borderRadius:10, fontSize:12, fontWeight:500, color:'rgba(239,68,68,0.8)', cursor:'pointer', marginTop:4 }}>
            <span style={{ fontSize:13 }}>🚪</span>تسجيل الخروج
          </div>
        </nav>
        <div style={{ margin:'0 8px 10px', padding:'14px 12px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:14, border:`1px solid ${C.goldBdr}`, textAlign:'center' }}>
          <BrandLogo size={40} style={{ margin:'0 auto 8px', borderRadius:8 }} />
          <p style={{ color:C.goldL, fontSize:10, marginBottom:10 }}>التميز في التعليم</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }}/>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>حالة المنصة:</span>
            <span style={{ color:C.green, fontSize:10, fontWeight:700 }}>ممتاز</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>
        <header style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 8px rgba(0,0,0,0.05)', gap:12 }}>
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
            {[
              { e:'🔔', n:12, to:'/dashboard/notifications' },
              { e:'✉️', n:7,  to:'/dashboard/messages' },
              { e:'🚩', n:5,  to:'/dashboard/content-approvals' },
            ].map((ic,i)=>(
              <div key={i} onClick={()=>navigate(ic.to)} style={{ position:'relative', width:38, height:38, borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, cursor:'pointer' }}>
                {ic.e}
                <div style={{ position:'absolute', top:-5, right:-5, width:18, height:18, borderRadius:'50%', background:i===0?C.red:i===1?C.blue:C.orange, color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{ic.n}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <p style={{ color:C.text, fontWeight:800, fontSize:16 }}>{timeStr}</p>
            <p style={{ color:C.sub, fontSize:10 }}>{dateStr}</p>
          </div>
          <select value={sem} onChange={e=>setSem(e.target.value)} style={{ padding:'7px 12px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:11.5, fontWeight:600, cursor:'pointer', outline:'none', flexShrink:0 }}>
            <option>الفصل الدراسي الثاني 2025-2026</option>
            <option>الفصل الدراسي الأول 2025-2026</option>
          </select>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ textAlign:'left' }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:13.5, lineHeight:1.2 }}>مرحباً بك أ. {fullName}</p>
              <span style={{ background:C.goldGrad, color:'#1B2038', fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>مالك المنصة</span>
            </div>
            <div style={{ width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(201,149,42,0.35)', flexShrink:0 }}>👨‍💼</div>
          </div>
        </header>
        <div style={{ padding:'16px 18px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
