import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import BrandLogo from '../components/BrandLogo';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.22)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.06)', green:'#16A34A', orange:'#D97706',
  red:'#EF4444', blue:'#2563EB', purple:'#7C3AED', teal:'#0E7490',
};
const SW = 222;

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV = [
  { label:'الرئيسية',                to:'/dashboard',                    icon:'🏠', end:true  },
  { label:'مؤشرات المنصة',           to:'/dashboard/analytics',          icon:'📊', end:false },
  { label:'المعلمون والموظفون',       to:'/dashboard/staff',              icon:'👨‍🏫', end:false },
  { label:'الطلاب وأولياء الأمور',   to:'/dashboard/students',           icon:'👥', end:false },
  { label:'المحتوى والاعتمادات',      to:'/dashboard/content-approvals',  icon:'✅', end:false },
  { label:'المالية والفواتير',        to:'/dashboard/billing',            icon:'💰', end:false },
  { label:'الخطط والاشتراكات',        to:'/dashboard/plans',              icon:'📋', end:false },
  { label:'التقارير والتحليلات',      to:'/dashboard/reports',            icon:'📈', end:false },
  { label:'نظام التنبيهات',           to:'/dashboard/notifications',      icon:'🔔', end:false },
  { label:'الإعدادات العامة',         to:'/dashboard/settings',           icon:'⚙️', end:false },
  { label:'الصلاحيات والأدوار',       to:'/dashboard/roles',              icon:'🔑', end:false },
  { label:'سجل العمليات',            to:'/dashboard/activity-log',       icon:'📝', end:false },
  { label:'مركز الأمان',             to:'/super-admin/security',         icon:'🔐', end:false },
  { label:'الدعم الفني',             to:'/dashboard/support',            icon:'🎧', end:false },
  { label:'مركز التطوير',            to:'/dashboard/dev-center',         icon:'🛠️', end:false },
];

// ─── Static data ──────────────────────────────────────────────────────────────
const STATS = [
  { label:'إجمالي الأفرع',           value:'8',        sub:'+1 هذا الشهر',             icon:'🌍', color:C.blue   },
  { label:'إجمالي الطلاب',           value:'12,842',   sub:'+1,250 هذا الشهر',         icon:'🎓', color:C.purple },
  { label:'إجمالي المعلمين',         value:'936',      sub:'+82 هذا الشهر',            icon:'👨‍🏫', color:C.teal  },
  { label:'المحتوى المعتمد',          value:'2,451',    sub:'+215 هذا الشهر',           icon:'✅', color:C.green  },
  { label:'نسبة رضا المستخدمين',     value:'94.6%',    sub:'+3.2% عن الشهر السابق',   icon:'⭐', color:C.orange },
  { label:'الإيرادات هذا الشهر',     value:'245,680',  sub:'+18% عن الشهر الماضي',    icon:'💰', color:C.green, currency:'ريال سعودي' },
];

const APPROVALS = [
  { type:'واجبات بانتظار الاعتماد',  count:24, icon:'📚', color:C.orange },
  { type:'اختبارات بانتظار الاعتماد',count:18, icon:'📝', color:C.blue   },
  { type:'ملفات بانتظار الاعتماد',   count:36, icon:'📂', color:C.purple },
  { type:'رسائل بانتظار الاعتماد',   count:15, icon:'✉️', color:C.teal   },
  { type:'درجات بانتظار الاعتماد',   count:27, icon:'📊', color:C.red    },
];

const GROWTH_DATA = [
  { month:'ديسمبر 2025', v:8450  },
  { month:'يناير 2026',  v:9120  },
  { month:'فبراير 2026', v:9850  },
  { month:'مارس 2026',   v:10421 },
  { month:'أبريل 2026',  v:11612 },
  { month:'مايو 2026',   v:12842 },
];

const DONUT_SEGS = [
  { label:'طلاب',                pct:90.2, count:12842, color:'#3B82F6' },
  { label:'معلمون',               pct:6.6,  count:936,   color:'#10B981' },
  { label:'أولياء أمور',          pct:2.8,  count:399,   color:'#F59E0B' },
  { label:'إدارة وموظفون',        pct:0.4,  count:58,    color:'#8B5CF6' },
];

const ALERTS_DATA = [
  { text:'انخفاض في حضور الطلاب',          sub:'18 طالب بحاجة متابعة',             color:C.red,    bg:'rgba(239,68,68,0.07)',    icon:'🚨', time:'منذ 30 دقيقة' },
  { text:'اعتمادات بانتظار المراجعة',       sub:'120 عنصر بانتظار اعتمادك',         color:C.orange, bg:'rgba(217,119,6,0.07)',    icon:'⚠️', time:'منذ ساعتين'   },
  { text:'نسخ احتياطي',                     sub:'تم إجراء النسخ الاحتياطي بنجاح',   color:C.blue,   bg:'rgba(37,99,235,0.07)',    icon:'ℹ️', time:'منذ 5 ساعات'  },
  { text:'تحديث النظام',                    sub:'تم تحديث النظام بنجاح',             color:C.green,  bg:'rgba(22,163,74,0.07)',    icon:'✅', time:'منذ يوم'       },
];

const TOP_BRANCHES = [
  { rank:1, flag:'🇸🇦', name:'فرع السعودية',  loc:'3,410 طالب', pct:97.1 },
  { rank:2, flag:'🇵🇸', name:'فرع فلسطين',    loc:'2,840 طالب', pct:98.7 },
  { rank:3, flag:'🇪🇬', name:'فرع مصر',       loc:'2,980 طالب', pct:94.8 },
  { rank:4, flag:'🇯🇴', name:'فرع الأردن',    loc:'2,120 طالب', pct:96.2 },
  { rank:5, flag:'🇦🇪', name:'فرع الإمارات',  loc:'1,620 طالب', pct:95.3 },
];

const ACTIVITY = [
  { name:'محمد أحمد',   action:'رفع واجب جديد',       sub:'الصف الخامس - اللغة الإنجليزية',       time:'الآن',           avatar:'👦', live:false },
  { name:'سارة خالد',   action:'بدأت حصة مباشرة',    sub:'الرياضيات - الصف الثالث المتوسط',       time:'منذ 2 دقيقة',   avatar:'👩', live:true  },
  { name:'أحمد محمد',   action:'رفع ملف جديد',        sub:'العلوم - الصف الأول ثانوي',            time:'منذ 5 دقائق',   avatar:'👦', live:false },
  { name:'نورة عبدالله',action:'أرسلت رسالة',         sub:'الطلاب - علي حسن',                     time:'منذ 7 دقائق',   avatar:'👩', live:false },
  { name:'اختبار شهري', action:'تم إنشاؤه',           sub:'الفيزياء - الصف الثاني ثانوي',         time:'منذ 10 دقائق',  avatar:'📋', live:false },
];

const SERVERS = [
  { name:'الخادم الرئيسي',       icon:'🖥️' },
  { name:'خدمة السيرفرات',      icon:'⚙️' },
  { name:'قاعدة البيانات',       icon:'🗄️' },
  { name:'خدمة التخزين',         icon:'💾' },
  { name:'نظام النسخ الاحتياطي', icon:'🔄' },
];

const REVENUE_DATA = [
  { month:'ديسمبر', v:580000  },
  { month:'يناير',  v:720000  },
  { month:'فبراير', v:850000  },
  { month:'مارس',   v:990000  },
  { month:'أبريل',  v:1100000 },
  { month:'مايو',   v:1245680 },
];

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data }: { data:{month:string;v:number}[] }) {
  const W=420,H=160,PX=28,PY=16;
  const max=Math.max(...data.map(d=>d.v)); const min=0;
  const range=max-min||1;
  const gx=(i:number)=>PX+(i/(data.length-1))*(W-PX*2);
  const gy=(v:number)=>H-PY-((v-min)/range)*(H-PY*2);
  const pts=data.map((d,i)=>`${gx(i)},${gy(d.v)}`).join(' ');
  const area=`M${gx(0)},${gy(data[0].v)} ${data.map((d,i)=>`L${gx(i)},${gy(d.v)}`).join(' ')} L${gx(data.length-1)},${H-PY} L${gx(0)},${H-PY}Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow:'visible' }}>
      {[0,1,2,3,4].map(i=>{
        const yy=H-PY-(i/4)*(H-PY*2);
        return <line key={i} x1={PX} y1={yy} x2={W-PX} y2={yy} stroke="rgba(0,0,0,0.06)" strokeWidth="1"/>;
      })}
      <path d={area} fill="rgba(201,149,42,0.1)"/>
      <polyline points={pts} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={gx(i)} cy={gy(d.v)} r="4.5" fill={C.gold} stroke="#fff" strokeWidth="2"/>
          <text x={gx(i)} y={gy(d.v)-10} textAnchor="middle" fontSize="9.5" fill={C.text} fontWeight="700" fontFamily="Cairo,sans-serif">
            {(d.v/1000).toFixed(0)}K
          </text>
          <text x={gx(i)} y={H-2} textAnchor="middle" fontSize="8" fill={C.dim} fontFamily="Cairo,sans-serif">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart() {
  const R=68; const cx=95; const cy=95; const circ=2*Math.PI*R;
  let rot=-90;
  return (
    <svg width="190" height="190" viewBox="0 0 190 190">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="26"/>
      {DONUT_SEGS.map((s,i)=>{
        const dash=(s.pct/100)*circ;
        const el=(
          <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="26"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="butt"
            style={{ transform:`rotate(${rot}deg)`, transformOrigin:`${cx}px ${cy}px` }}/>
        );
        rot+=(s.pct/100)*360; return el;
      })}
      <text x={cx} y={cy-10} textAnchor="middle" fontSize="17" fontWeight="900" fill={C.text} fontFamily="Cairo,sans-serif">14,234</text>
      <text x={cx} y={cy+8}  textAnchor="middle" fontSize="9"  fill={C.sub}  fontFamily="Cairo,sans-serif">إجمالي المستخدمين</text>
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data:{month:string;v:number}[] }) {
  const W=360,H=130,PX=10,PY=20;
  const max=Math.max(...data.map(d=>d.v))||1;
  const bW=32; const gap=(W-PX*2)/data.length;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {data.map((d,i)=>{
        const bH=(d.v/max)*(H-PY*2);
        const bx=PX+i*gap+(gap-bW)/2;
        const by=H-PY-bH;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bW} height={bH} rx="5" fill={C.blue}/>
            <text x={bx+bW/2} y={H-4} textAnchor="middle" fontSize="8.5" fill={C.dim} fontFamily="Cairo,sans-serif">{d.month}</text>
            {i===data.length-1&&<text x={bx+bW/2} y={by-5} textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="Cairo,sans-serif">{(d.v/1000000).toFixed(1)}M</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const card=(e:Partial<CSSProperties>={}):CSSProperties=>({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e });
const sH=(t:string,a?:string,onAction?:()=>void)=>(
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{t}</p>
    {a&&<button onClick={onAction ?? (()=>alert(`"${a}" لـ"${t}" قيد التطوير.`))} style={{ color:C.gold, fontSize:11, fontWeight:600, border:'none', background:'none', cursor:'pointer' }}>{a}</button>}
  </div>
);
const medalColor=(r:number)=>r===1?C.gold:r===2?'#9CA3AF':'#B45309';
const medalEmoji=(r:number)=>r===1?'🥇':r===2?'🥈':r===3?'🥉':`${r}`;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAppSelector(s=>s.auth.user);
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
  const timeStr  = now.toLocaleTimeString('en-US',{ hour:'2-digit', minute:'2-digit' });
  const dateStr  = now.toLocaleDateString('ar-EG',{ weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const fullName = user?.name ?? 'عبد الله الشمري';

  const handleLogout = ()=>{ dispatch(logout()); navigate('/login',{ replace:true }); };

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif" }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, backdropFilter:'blur(2px)' }} />
      )}

      {/* ══════ SIDEBAR ══════ */}
      <aside style={{
        width:SW, flexShrink:0, background:C.navy, height:'100vh',
        position: isMobile ? 'fixed' : 'sticky', top:0, right:0,
        zIndex: isMobile ? 50 : undefined,
        display:'flex', flexDirection:'column', overflowY:'auto', scrollbarWidth:'none',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
        transition:'transform 0.25s ease',
      }}>

        {/* Brand */}
        <div style={{ padding:'18px 12px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
          <BrandLogo size={52} style={{ margin:'0 auto 10px', borderRadius:12 }} />
          <p style={{ color:'#fff', fontWeight:900, fontSize:14, lineHeight:1.3 }}>مركز القيادة</p>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, marginTop:3 }}>الإدارة العليا للمنصة</p>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto', minHeight:0 }}>
          {NAV.map((item,i)=>{
            const inner=(active=false)=>(
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px', borderRadius:10, fontSize:12, fontWeight:active?700:500, background:active?C.goldGrad:'transparent', color:active?'#fff':'rgba(255,255,255,0.55)', cursor:'pointer' }}>
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
            return (
              <NavLink key={i} to={item.to} end={item.end} style={{ textDecoration:'none' }}>
                {({ isActive })=>inner(isActive)}
              </NavLink>
            );
          })}
        </nav>

        {/* Pinned footer — always visible regardless of nav scroll position */}
        <div onClick={handleLogout} style={{ flexShrink:0, margin:'4px 8px 0', display:'flex', alignItems:'center', gap:7, padding:'10px', borderRadius:10, fontSize:12, fontWeight:700, color:'rgba(239,68,68,0.85)', cursor:'pointer', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize:13 }}>🚪</span>تسجيل الخروج
        </div>

        {/* Bottom card */}
        <div style={{ flexShrink:0, margin:'8px 8px 10px', padding:'14px 12px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:14, border:`1px solid ${C.goldBdr}`, textAlign:'center' }}>
          <BrandLogo size={40} style={{ margin:'0 auto 8px', borderRadius:8 }} />
          <p style={{ color:C.goldL, fontSize:10, marginBottom:10 }}>التميز في التعليم</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }}/>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>حالة المنصة:</span>
            <span style={{ color:C.green, fontSize:10, fontWeight:700 }}>ممتاز</span>
          </div>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>

        {/* ── HEADER ── */}
        <header style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 8px rgba(0,0,0,0.05)', gap:12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

          {/* Logo + hamburger */}
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            {isMobile && (
              <button onClick={()=>setSidebarOpen(true)} style={{ width:38, height:38, borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            )}
            <BrandLogo size={38} style={{ borderRadius:10 }} />
          </div>

          {/* Control panel button */}
          <button onClick={()=>navigate('/dashboard/settings')} style={{ display:'flex', alignItems:'center', gap:6, padding: isMobile ? '8px 10px' : '8px 16px', borderRadius:12, background:C.navy2, color:'#fff', fontWeight:700, fontSize:12.5, border:'none', cursor:'pointer', flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {!isMobile && 'لوحة التحكم'}
          </button>

          {/* Notification icons */}
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
            {/* Always-visible logout — no need to open the sidebar drawer */}
            <button onClick={handleLogout} title="تسجيل الخروج" style={{ width:38, height:38, borderRadius:11, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, cursor:'pointer' }}>
              🚪
            </button>
          </div>

          {!isMobile && (
            <>
              {/* Time + date */}
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:16 }}>{timeStr}</p>
                <p style={{ color:C.sub, fontSize:10 }}>{dateStr}</p>
              </div>

              {/* Semester dropdown */}
              <select value={sem} onChange={e=>setSem(e.target.value)}
                style={{ padding:'7px 12px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:11.5, fontWeight:600, cursor:'pointer', outline:'none', flexShrink:0 }}>
                <option>الفصل الدراسي الثاني 2025-2026</option>
                <option>الفصل الدراسي الأول 2025-2026</option>
              </select>
            </>
          )}

          {/* User */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {!isMobile && (
              <div style={{ textAlign:'left' }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:13.5, lineHeight:1.2 }}>مرحباً بك أ. {fullName}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginTop:2 }}>
                  <span style={{ background:C.goldGrad, color:'#1B2038', fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>مالك المنصة</span>
                </div>
              </div>
            )}
            <div style={{ width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(201,149,42,0.35)', flexShrink:0 }}>👨‍💼</div>
          </div>
        </header>

        <div style={{ padding:'14px 18px 24px' }}>

          {/* ── 6 STATS CARDS ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10, marginBottom:14 }}>
            {STATS.map((s,i)=>(
              <div key={i} style={{ ...card(), padding:'14px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <p style={{ color:C.sub, fontSize:10.5, lineHeight:1.3 }}>{s.label}</p>
                  <div style={{ width:32, height:32, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{s.icon}</div>
                </div>
                <p style={{ color:C.text, fontWeight:900, fontSize:i===5?18:22, lineHeight:1 }}>{s.value}</p>
                {s.currency&&<p style={{ color:C.sub, fontSize:9.5, marginTop:1 }}>{s.currency}</p>}
                <p style={{ color:s.color, fontSize:10.5, fontWeight:600, marginTop:5 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── ROW 2: Approvals | Growth | Alerts+Donut ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12, marginBottom:14 }}>

            {/* Approvals */}
            <div style={card()}>
              {sH('مراقبة الاعتمادات', 'عرض الكل')}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {APPROVALS.map((a,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 11px', borderRadius:11, background:`${a.color}09`, border:`1px solid ${a.color}22` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ fontSize:14 }}>{a.icon}</span>
                      <span style={{ color:C.text, fontSize:11.5 }}>{a.type}</span>
                    </div>
                    <span style={{ color:a.color, fontWeight:900, fontSize:16 }}>{a.count}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate('/dashboard/content-approvals')} style={{ width:'100%', marginTop:12, padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer', boxShadow:'0 3px 10px rgba(201,149,42,0.3)' }}>
                جميع الاعتمادات
              </button>
            </div>

            {/* Growth chart */}
            <div style={card()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>نمو المنصة</p>
                <div style={{ display:'flex', gap:7 }}>
                  <select style={{ padding:'4px 8px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:10.5, cursor:'pointer', outline:'none' }}>
                    <option>آخر 6 أشهر</option><option>آخر 3 أشهر</option>
                  </select>
                  <select style={{ padding:'4px 8px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:10.5, cursor:'pointer', outline:'none' }}>
                    <option>الطلاب</option><option>المعلمون</option>
                  </select>
                </div>
              </div>
              <div style={{ height:185 }}>
                <LineChart data={GROWTH_DATA}/>
              </div>
            </div>

            {/* Alerts + Donut stacked */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Alerts */}
              <div style={{ ...card(), flex:1 }}>
                {sH('تنبيهات مهمة')}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ALERTS_DATA.map((a,i)=>(
                    <div key={i} style={{ display:'flex', gap:9, padding:'9px 10px', borderRadius:11, background:a.bg, border:`1px solid ${a.color}25` }}>
                      <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{a.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <p style={{ color:C.text, fontWeight:700, fontSize:11.5 }}>{a.text}</p>
                          <span style={{ color:C.dim, fontSize:9.5, flexShrink:0, marginRight:4 }}>{a.time}</span>
                        </div>
                        <p style={{ color:C.sub, fontSize:10.5, marginTop:2 }}>{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut */}
              <div style={card()}>
                {sH('توزيع المستخدمين', 'تفاصيل المستخدمين')}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <DonutChart/>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {DONUT_SEGS.map((s,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:9, height:9, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
                        <div>
                          <p style={{ color:C.text, fontSize:10, fontWeight:600 }}>{s.label}</p>
                          <p style={{ color:C.sub, fontSize:9.5 }}>{s.count.toLocaleString()} ({s.pct}%)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Top Schools | Activity | Servers+Revenue ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12, marginBottom:14 }}>

            {/* Top Branches */}
            <div style={card()}>
              {sH('أعلى الأفرع أداءً', 'عرض الكل')}
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {TOP_BRANCHES.map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 11px', borderRadius:12, background:i<3?`${medalColor(s.rank)}09`:'transparent', border:`1px solid ${i<3?`${medalColor(s.rank)}22`:C.border}` }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{medalEmoji(s.rank)}</span>
                    <span style={{ fontSize:20, flexShrink:0 }}>{s.flag}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:11.5, lineHeight:1.3 }}>{s.name}</p>
                      <p style={{ color:C.sub, fontSize:10 }}>{s.loc}</p>
                    </div>
                    <span style={{ color:i<3?medalColor(s.rank):C.text, fontWeight:800, fontSize:13.5, flexShrink:0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity */}
            <div style={card()}>
              {sH('نشاط المنصة المباشر', 'عرض الكل')}
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {ACTIVITY.map((a,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:i<ACTIVITY.length-1?`1px solid ${C.border}`:'none' }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:a.live?'linear-gradient(135deg,#DC2626,#EF4444)':C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, border:`1px solid ${C.border}` }}>{a.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ color:C.text, fontWeight:700, fontSize:12.5 }}>{a.name}</span>
                        {a.live&&<span style={{ background:'rgba(239,68,68,0.85)', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>مباشر</span>}
                        <span style={{ color:a.live?C.red:C.sub, fontSize:12 }}>{a.action}</span>
                      </div>
                      <p style={{ color:C.dim, fontSize:10.5, marginTop:2 }}>{a.sub}</p>
                    </div>
                    <span style={{ color:C.dim, fontSize:10, flexShrink:0 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Servers + Revenue stacked */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Servers */}
              <div style={card()}>
                {sH('حالة الخوادم والنظام')}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {SERVERS.map((s,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 11px', borderRadius:11, background:'rgba(22,163,74,0.06)', border:'1px solid rgba(22,163,74,0.18)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:14 }}>{s.icon}</span>
                        <span style={{ color:C.text, fontSize:11.5 }}>{s.name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }}/>
                        <span style={{ color:C.green, fontSize:10, fontWeight:600 }}>يعمل بشكل طبيعي</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate('/dashboard/reports')} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:12, background:C.navy2, color:'#fff', fontWeight:700, fontSize:11.5, border:'none', cursor:'pointer' }}>
                  عرض تقرير النظام الكامل
                </button>
              </div>

              {/* Revenue */}
              <div style={card()}>
                {sH('الإيرادات والمبيعات', 'عرض التفاصيل')}
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                  <span style={{ color:C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>1,245,680</span>
                  <span style={{ color:C.sub, fontSize:11 }}>ريال سعودي</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <span style={{ color:C.green, fontSize:11, fontWeight:700 }}>+18% عن الشهر الماضي</span>
                </div>
                <div style={{ height:115 }}>
                  <BarChart data={REVENUE_DATA}/>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW: 4 sections ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>

            {/* Quick Reports */}
            <div style={card()}>
              {sH('التقارير السريعة')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:8, marginBottom:12 }}>
                {[{e:'📋',l:'تقرير المنصة'},{e:'👨‍🏫',l:'تقرير المعلمين'},{e:'🎓',l:'تقرير الطلاب'},{e:'💰',l:'التقرير المالي'},{e:'✅',l:'تقرير الاعتمادات'}].map((r,i)=>(
                  <button key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'11px 6px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:20 }}>{r.e}</span>
                    <span style={{ color:C.text, fontSize:10, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>{r.l}</span>
                  </button>
                ))}
                <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'11px 6px', borderRadius:12, background:C.goldBg, border:`1px solid ${C.goldBdr}`, cursor:'pointer' }}>
                  <span style={{ fontSize:20 }}>+</span>
                  <span style={{ color:C.gold, fontSize:10, fontWeight:600 }}>المزيد</span>
                </button>
              </div>
              <button onClick={()=>navigate('/dashboard/reports')} style={{ width:'100%', padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                جميع التقارير
              </button>
            </div>

            {/* Quick Admin Tools */}
            <div style={card()}>
              {sH('أدوات الإدارة السريعة')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))', gap:8, marginBottom:12 }}>
                {[
                  {e:'🌍',l:'إضافة فرع',to:'/dashboard/schools'},
                  {e:'👨‍🏫',l:'إضافة معلم',to:'/dashboard/staff'},
                  {e:'🎓',l:'إضافة طالب',to:'/dashboard/students'},
                  {e:'🔔',l:'إرسال إشعار',to:'/dashboard/notifications'},
                  {e:'📄',l:'إنشاء محتوى',to:'/dashboard/content-approvals'},
                ].map((t,i)=>(
                  <button key={i} onClick={()=>navigate(t.to)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'11px 6px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:20 }}>{t.e}</span>
                    <span style={{ color:C.text, fontSize:9.5, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>{t.l}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>navigate('/dashboard/settings')} style={{ width:'100%', padding:'9px', borderRadius:12, background:C.navy2, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                المزيد من الأدوات
              </button>
            </div>

            {/* Subscriptions */}
            <div style={card()}>
              {sH('نظرة عامة على الاشتراكات')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:9, marginBottom:12 }}>
                {[
                  { n:42, l:'اشتراكات نشطة', c:C.green,  bg:'rgba(22,163,74,0.09)'  },
                  { n:6,  l:'منتهية',          c:C.sub,    bg:C.bg                    },
                  { n:2,  l:'متأخرة',          c:C.orange, bg:'rgba(217,119,6,0.09)'  },
                  { n:3,  l:'ملغاة',           c:C.red,    bg:'rgba(239,68,68,0.09)'  },
                ].map((s,i)=>(
                  <div key={i} style={{ textAlign:'center', padding:'12px 8px', borderRadius:14, background:s.bg, border:`1px solid ${s.c}22` }}>
                    <p style={{ color:s.c, fontWeight:900, fontSize:26, lineHeight:1 }}>{s.n}</p>
                    <p style={{ color:C.sub, fontSize:10.5, marginTop:4, lineHeight:1.3 }}>{s.l}</p>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate('/dashboard/plans')} style={{ width:'100%', padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                إدارة الاشتراكات
              </button>
            </div>

            {/* Support */}
            <div style={card()}>
              {sH('الدعم والمساعدة')}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px', borderRadius:14, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)', marginBottom:12 }}>
                <span style={{ fontSize:24 }}>🎫</span>
                <div>
                  <p style={{ color:C.red, fontWeight:800, fontSize:22, lineHeight:1 }}>7</p>
                  <p style={{ color:C.sub, fontSize:11 }}>تذاكر دعم مفتوحة</p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:8, marginBottom:12 }}>
                {[{e:'❓',l:'الأسئلة الشائعة'},{e:'🏠',l:'مركز المساعدة'}].map((t,i)=>(
                  <button key={i} onClick={()=>navigate('/dashboard/support')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:20 }}>{t.e}</span>
                    <span style={{ color:C.text, fontSize:10.5, fontWeight:600, textAlign:'center' }}>{t.l}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>navigate('/dashboard/support')} style={{ width:'100%', padding:'9px', borderRadius:12, background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                فتح تذكرة جديدة
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
