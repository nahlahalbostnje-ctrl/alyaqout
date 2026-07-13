import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { fetchSuperAdminStats } from '../features/superAdmin/superAdminSlice';
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

function countryFlag(name: string): string {
  if (name.includes('فلسطين') || /palestine/i.test(name)) return '🇵🇸';
  if (name.includes('سعود') || /saudi/i.test(name)) return '🇸🇦';
  if (name.includes('مصر') || /egypt/i.test(name)) return '🇪🇬';
  if (name.includes('أردن') || name.includes('الاردن') || /jordan/i.test(name)) return '🇯🇴';
  if (name.includes('إمارات') || name.includes('الامارات') || /emirates|uae/i.test(name)) return '🇦🇪';
  if (name.includes('كويت') || /kuwait/i.test(name)) return '🇰🇼';
  if (name.includes('قطر') || /qatar/i.test(name)) return '🇶🇦';
  if (name.includes('بحرين') || /bahrain/i.test(name)) return '🇧🇭';
  return '🌍';
}

function fmt(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString('en-US');
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data }: { data:{month:string;v:number}[] }) {
  if (data.length === 0) {
    return <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, fontSize:13 }}>لا توجد بيانات</div>;
  }
  const W=420,H=160,PX=28,PY=16;
  const max=Math.max(...data.map(d=>d.v), 1); const min=0;
  const range=max-min||1;
  const denom = Math.max(data.length - 1, 1);
  const gx=(i:number)=>PX+(i/denom)*(W-PX*2);
  const gy=(v:number)=>H-PY-((v-min)/range)*(H-PY*2);
  const pts=data.map((d,i)=>`${gx(i)},${gy(d.v)}`).join(' ');
  const area=`M${gx(0)},${gy(data[0].v)} ${data.map((d,i)=>`L${gx(i)},${gy(d.v)}`).join(' ')} L${gx(data.length-1)},${H-PY} L${gx(0)},${H-PY}Z`;
  const label = (v: number) => v >= 1000 ? `${(v/1000).toFixed(v >= 10000 ? 0 : 1)}K` : String(v);
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
            {label(d.v)}
          </text>
          <text x={gx(i)} y={H-2} textAnchor="middle" fontSize="8" fill={C.dim} fontFamily="Cairo,sans-serif">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

type DonutSeg = { label:string; pct:number; count:number; color:string };

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ segs, total }: { segs: DonutSeg[]; total: number }) {
  const R=68; const cx=95; const cy=95; const circ=2*Math.PI*R;
  let rot=-90;
  if (total === 0 || segs.every(s => s.pct === 0)) {
    return (
      <svg width="190" height="190" viewBox="0 0 190 190">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="26"/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="900" fill={C.sub} fontFamily="Cairo,sans-serif">لا توجد بيانات</text>
      </svg>
    );
  }
  return (
    <svg width="190" height="190" viewBox="0 0 190 190">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="26"/>
      {segs.map((s,i)=>{
        const dash=(s.pct/100)*circ;
        const el=(
          <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="26"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="butt"
            style={{ transform:`rotate(${rot}deg)`, transformOrigin:`${cx}px ${cy}px` }}/>
        );
        rot+=(s.pct/100)*360; return el;
      })}
      <text x={cx} y={cy-10} textAnchor="middle" fontSize="17" fontWeight="900" fill={C.text} fontFamily="Cairo,sans-serif">{fmt(total)}</text>
      <text x={cx} y={cy+8}  textAnchor="middle" fontSize="9"  fill={C.sub}  fontFamily="Cairo,sans-serif">إجمالي المستخدمين</text>
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
const emptyBox = (
  <div style={{ padding:'28px 12px', textAlign:'center', color:C.sub, fontSize:13 }}>لا توجد بيانات</div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useAppSelector(s=>s.auth.user);
  const { stats, approvals, countryStats, growthChart, loading, error } = useAppSelector(s => s.superAdmin);
  const [sem, setSem] = useState('الفصل الدراسي الثاني 2025-2026');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSuperAdminStats());
  }, [dispatch]);

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
  const fullName = user?.name ?? 'السوبر أدمن';

  const handleLogout = ()=>{ dispatch(logout()); navigate('/login',{ replace:true }); };

  const kpiCards = useMemo(() => {
    const s = stats;
    const revChange = s?.revenue_change_pct ?? 0;
    const stuDelta = (s?.students_this_month ?? 0) - (s?.students_last_month ?? 0);
    return [
      { label:'إجمالي الأفرع',           value: fmt(s?.total_countries),     sub: loading ? 'جارٍ التحميل...' : 'أفرع / دول', icon:'🌍', color:C.blue },
      { label:'إجمالي الطلاب',           value: fmt(s?.total_students),      sub: stuDelta >= 0 ? `+${fmt(stuDelta)} هذا الشهر` : `${fmt(stuDelta)} هذا الشهر`, icon:'🎓', color:C.purple },
      { label:'إجمالي المعلمين',         value: fmt(s?.total_teachers),      sub: 'معلمون مسجّلون', icon:'👨‍🏫', color:C.teal },
      { label:'إجمالي الدورات',          value: fmt(s?.total_courses),       sub: 'دورات معتمدة', icon:'✅', color:C.green },
      { label:'الاشتراكات',              value: fmt(s?.total_subscriptions), sub: 'اشتراكات نشطة', icon:'⭐', color:C.orange },
      { label:'الإيرادات هذا الشهر',     value: fmt(s?.revenue_this_month),  sub: `${revChange >= 0 ? '+' : ''}${revChange}% عن الشهر الماضي`, icon:'💰', color:C.green, currency:'ريال سعودي' as string | undefined },
    ];
  }, [stats, loading]);

  const growthData = useMemo(
    () => (growthChart ?? []).map(g => ({ month: g.month, v: g.total })),
    [growthChart]
  );

  const donutSegs = useMemo((): DonutSeg[] => {
    const students = stats?.total_students ?? 0;
    const teachers = stats?.total_teachers ?? 0;
    const parents  = stats?.total_parents ?? 0;
    const total = students + teachers + parents;
    const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 1000) / 10;
    return [
      { label:'طلاب',        pct: pct(students), count: students, color:'#3B82F6' },
      { label:'معلمون',      pct: pct(teachers), count: teachers, color:'#10B981' },
      { label:'أولياء أمور', pct: pct(parents),  count: parents,  color:'#F59E0B' },
    ];
  }, [stats]);

  const donutTotal = (stats?.total_students ?? 0) + (stats?.total_teachers ?? 0) + (stats?.total_parents ?? 0);

  const approvalItems = useMemo(() => {
    const exams = approvals?.exams ?? 0;
    const homeworks = approvals?.homeworks ?? 0;
    return [
      { type:'واجبات بانتظار الاعتماد',   count: homeworks, icon:'📚', color:C.orange },
      { type:'اختبارات بانتظار الاعتماد', count: exams,     icon:'📝', color:C.blue },
    ].filter(a => a.count > 0);
  }, [approvals]);

  const topBranches = useMemo(() => {
    return [...(countryStats ?? [])]
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)
      .map((c, i) => ({
        rank: i + 1,
        flag: countryFlag(c.name),
        name: `فرع ${c.name}`,
        loc: `${fmt(c.students)} طالب`,
        students: c.students,
      }));
  }, [countryStats]);

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
              { e:'🔔', n: approvals ? (approvals.exams + approvals.homeworks) : 0, to:'/dashboard/notifications' },
              { e:'✉️', n:0,  to:'/dashboard/messages' },
              { e:'🚩', n: approvals ? (approvals.exams + approvals.homeworks) : 0,  to:'/dashboard/content-approvals' },
            ].map((ic,i)=>(
              <div key={i} onClick={()=>navigate(ic.to)} style={{ position:'relative', width:38, height:38, borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, cursor:'pointer' }}>
                {ic.e}
                {ic.n > 0 && (
                  <div style={{ position:'absolute', top:-5, right:-5, width:18, height:18, borderRadius:'50%', background:i===0?C.red:i===1?C.blue:C.orange, color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{ic.n}</div>
                )}
              </div>
            ))}
            <button onClick={handleLogout} title="تسجيل الخروج" style={{ width:38, height:38, borderRadius:11, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, cursor:'pointer' }}>
              🚪
            </button>
          </div>

          {!isMobile && (
            <>
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:16 }}>{timeStr}</p>
                <p style={{ color:C.sub, fontSize:10 }}>{dateStr}</p>
              </div>

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

          {error && (
            <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
              {error}
            </div>
          )}

          {/* ── 6 STATS CARDS ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10, marginBottom:14 }}>
            {kpiCards.map((s,i)=>(
              <div key={i} style={{ ...card(), padding:'14px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <p style={{ color:C.sub, fontSize:10.5, lineHeight:1.3 }}>{s.label}</p>
                  <div style={{ width:32, height:32, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{s.icon}</div>
                </div>
                <p style={{ color:C.text, fontWeight:900, fontSize:i===5?18:22, lineHeight:1 }}>{loading && !stats ? '—' : s.value}</p>
                {s.currency&&<p style={{ color:C.sub, fontSize:9.5, marginTop:1 }}>{s.currency}</p>}
                <p style={{ color:s.color, fontSize:10.5, fontWeight:600, marginTop:5 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── ROW 2: Approvals | Growth | Alerts+Donut ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12, marginBottom:14 }}>

            {/* Approvals */}
            <div style={card()}>
              {sH('مراقبة الاعتمادات', 'عرض الكل', () => navigate('/dashboard/content-approvals'))}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {approvalItems.length === 0 ? emptyBox : approvalItems.map((a,i)=>(
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
              </div>
              <div style={{ height:185 }}>
                <LineChart data={growthData}/>
              </div>
            </div>

            {/* Alerts + Donut stacked */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Alerts — no live data source yet */}
              <div style={{ ...card(), flex:1 }}>
                {sH('تنبيهات مهمة')}
                {emptyBox}
              </div>

              {/* Donut */}
              <div style={card()}>
                {sH('توزيع المستخدمين', 'تفاصيل المستخدمين', () => navigate('/dashboard/students'))}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <DonutChart segs={donutSegs} total={donutTotal}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {donutSegs.map((s,i)=>(
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
              {sH('أعلى الأفرع أداءً', 'عرض الكل', () => navigate('/dashboard/schools'))}
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {topBranches.length === 0 ? emptyBox : topBranches.map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 11px', borderRadius:12, background:i<3?`${medalColor(s.rank)}09`:'transparent', border:`1px solid ${i<3?`${medalColor(s.rank)}22`:C.border}` }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{medalEmoji(s.rank)}</span>
                    <span style={{ fontSize:20, flexShrink:0 }}>{s.flag}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:11.5, lineHeight:1.3 }}>{s.name}</p>
                      <p style={{ color:C.sub, fontSize:10 }}>{s.loc}</p>
                    </div>
                    <span style={{ color:i<3?medalColor(s.rank):C.text, fontWeight:800, fontSize:13.5, flexShrink:0 }}>{fmt(s.students)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity — no live data source yet */}
            <div style={card()}>
              {sH('نشاط المنصة المباشر', 'عرض الكل', () => navigate('/dashboard/activity-log'))}
              {emptyBox}
            </div>

            {/* Servers + Revenue stacked */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              <div style={card()}>
                {sH('حالة الخوادم والنظام')}
                {emptyBox}
                <button onClick={()=>navigate('/dashboard/reports')} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:12, background:C.navy2, color:'#fff', fontWeight:700, fontSize:11.5, border:'none', cursor:'pointer' }}>
                  عرض تقرير النظام الكامل
                </button>
              </div>

              <div style={card()}>
                {sH('الإيرادات والمبيعات', 'عرض التفاصيل', () => navigate('/dashboard/billing'))}
                {(stats?.revenue_this_month ?? 0) === 0 && (stats?.revenue_last_month ?? 0) === 0 ? emptyBox : (
                  <>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                      <span style={{ color:C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>{fmt(stats?.revenue_this_month)}</span>
                      <span style={{ color:C.sub, fontSize:11 }}>ريال سعودي</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
                      <span style={{ color:(stats?.revenue_change_pct ?? 0) >= 0 ? C.green : C.red, fontSize:11, fontWeight:700 }}>
                        {(stats?.revenue_change_pct ?? 0) >= 0 ? '+' : ''}{stats?.revenue_change_pct ?? 0}% عن الشهر الماضي
                      </span>
                    </div>
                    <div style={{ padding:'16px 8px', textAlign:'center', color:C.sub, fontSize:12 }}>لا توجد بيانات</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW: 4 sections ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>

            <div style={card()}>
              {sH('التقارير السريعة')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:8, marginBottom:12 }}>
                {[{e:'📋',l:'تقرير المنصة'},{e:'👨‍🏫',l:'تقرير المعلمين'},{e:'🎓',l:'تقرير الطلاب'},{e:'💰',l:'التقرير المالي'},{e:'✅',l:'تقرير الاعتمادات'}].map((r,i)=>(
                  <button key={i} onClick={()=>navigate('/dashboard/reports')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'11px 6px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:20 }}>{r.e}</span>
                    <span style={{ color:C.text, fontSize:10, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>{r.l}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>navigate('/dashboard/reports')} style={{ width:'100%', padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                جميع التقارير
              </button>
            </div>

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

            <div style={card()}>
              {sH('نظرة عامة على الاشتراكات')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:9, marginBottom:12 }}>
                <div style={{ textAlign:'center', padding:'12px 8px', borderRadius:14, background:'rgba(22,163,74,0.09)', border:`1px solid ${C.green}22` }}>
                  <p style={{ color:C.green, fontWeight:900, fontSize:26, lineHeight:1 }}>{fmt(stats?.total_subscriptions)}</p>
                  <p style={{ color:C.sub, fontSize:10.5, marginTop:4, lineHeight:1.3 }}>اشتراكات نشطة</p>
                </div>
              </div>
              <button onClick={()=>navigate('/dashboard/plans')} style={{ width:'100%', padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>
                إدارة الاشتراكات
              </button>
            </div>

            <div style={card()}>
              {sH('الدعم والمساعدة')}
              {emptyBox}
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
