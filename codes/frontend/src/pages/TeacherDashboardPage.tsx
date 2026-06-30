import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherDashboard } from '../features/teacher/teacherSlice';
import { logout } from '../features/auth/authSlice';
import BrandLogo from '../components/BrandLogo';
import DailyRemindersWidget from '../components/DailyRemindersWidget';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.22)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.06)', green:'#16A34A', orange:'#D97706', red:'#EF4444', blue:'#2563EB',
};
const SW = 232;  // sidebar width

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { label:'الرئيسية',              to:'/teacher/dashboard',    icon:'🏠',  badge:0 },
  { label:'الحصص المباشرة',        to:'/teacher/live-classes', icon:'📹',  badge:0 },
  { label:'الواجبات والأنشطة',     to:'/teacher/homework',     icon:'📚',  badge:0 },
  { label:'الاختبارات',            to:'/teacher/exams',        icon:'📝',  badge:0 },
  { label:'بنك الدروس والملفات',   to:null,                    icon:'📂',  badge:0 },
  { label:'التقييم والدرجات',      to:null,                    icon:'⭐',  badge:0 },
  { label:'الطلاب',                to:null,                    icon:'👥',  badge:0 },
  { label:'التقارير والتحليلات',   to:null,                    icon:'📊',  badge:0 },
  { label:'الرسائل',               to:null,                    icon:'✉️',  badge:0 },
  { label:'مركز الاعتمادات',       to:null,                    icon:'✅',  badge:-1 },
  { label:'مساعد المعلم الذكي',    to:null,                    icon:'🤖',  badge:0 },
  { label:'الإعدادات',             to:null,                    icon:'⚙️',  badge:0 },
];

// ─── Static data ──────────────────────────────────────────────────────────────
const SCHEDULE = [
  { time:'06:00 م', subject:'اللغة الإنجليزية', cls:'الصف الخامس A', live:true  },
  { time:'07:00 م', subject:'اللغة الإنجليزية', cls:'الصف الخامس B', live:false },
  { time:'08:00 م', subject:'مراجعة وتدريب',    cls:'الصف الخامس A', live:false },
  { time:'09:00 م', subject:'استشارة طلابية',   cls:'جميع الصفوف',   live:false },
];

const UPCOMING = [
  { subject:'اللغة الإنجليزية', cls:'الصف الخامس B', time:'غداً 06:00 م' },
  { subject:'اللغة الإنجليزية', cls:'الصف الخامس A', time:'غداً 07:00 م' },
  { subject:'مراجعة عامة',       cls:'جميع الصفوف',   time:'بعد غد 08:00 م' },
];

const APPROVALS = [
  { title:'واجب الدرس 3',           sub:'اللغة الإنجليزية',  status:'قيد المراجعة', sc:'#D97706', sbg:'rgba(217,119,6,0.09)' },
  { title:'اختبار قصير 2 - Unit 2', sub:'اللغة الإنجليزية',  status:'معتمد',        sc:'#16A34A', sbg:'rgba(22,163,74,0.09)' },
  { title:'رسالة لولي أمر',          sub:'الصف الخامس A',    status:'يحتاج تعديل',  sc:'#EF4444', sbg:'rgba(239,68,68,0.09)' },
  { title:'ورقة عمل تفاعلية',        sub:'اللغة الإنجليزية',  status:'قيد المراجعة', sc:'#D97706', sbg:'rgba(217,119,6,0.09)' },
];

const AI_TASKS = [
  { label:'مراجعة قاعدة Future Simple', emoji:'📄' },
  { label:'اختبار قصير (5 دقائق)',      emoji:'⏱️' },
  { label:'نشاط تفاعلي جماعي',          emoji:'👥' },
  { label:'فيديو تعليمي قصير',          emoji:'▶️' },
];

const AI_SUGGESTIONS = [
  { label:'إنشاء اختبار تفاعلي', emoji:'📝' },
  { label:'تحليل أداء الطلاب',   emoji:'📊' },
  { label:'إنشاء خطة درس',       emoji:'📋' },
  { label:'كتابة تقرير لولي أمر',emoji:'✍️' },
];

const QUICK_TOOLS = [
  { label:'رفع ملف',       emoji:'📤' },
  { label:'إنشاء نشاط',   emoji:'⚡' },
  { label:'بنك الأسئلة',  emoji:'❓' },
  { label:'استيراد محتوى',emoji:'📥' },
  { label:'نسخ حصة سابقة',emoji:'📋' },
];

const STUDENTS = [
  { name:'محمد أحمد',   status:'ممتاز',          color:'#16A34A', avatar:'👦' },
  { name:'أحمد خالد',   status:'ممتاز',          color:'#16A34A', avatar:'👦' },
  { name:'سارة خالد',   status:'يحتاج متابعة',   color:'#D97706', avatar:'👩' },
  { name:'علي حسن',     status:'يحتاج متابعة',   color:'#D97706', avatar:'👦' },
  { name:'نور عبدالله', status:'ممتاز',          color:'#16A34A', avatar:'👩' },
  { name:'عبدالله محمد',status:'ممتاز',          color:'#16A34A', avatar:'👦' },
  { name:'منى علي',     status:'يحتاج متابعة',   color:'#D97706', avatar:'👩' },
  { name:'يوسف سامي',   status:'ممتاز',          color:'#16A34A', avatar:'👦' },
  { name:'ليلى محمد',   status:'يحتاج متابعة',   color:'#D97706', avatar:'👩' },
  { name:'فهد أحمد',    status:'خطر',            color:'#EF4444', avatar:'👦' },
  { name:'رنا خالد',    status:'يحتاج متابعة',   color:'#D97706', avatar:'👩' },
  { name:'طلال ماجد',   status:'يحتاج متابعة',   color:'#D97706', avatar:'👦' },
  { name:'جود محمد',    status:'ممتاز',          color:'#16A34A', avatar:'👩' },
  { name:'محمد سعيد',   status:'خطر',            color:'#EF4444', avatar:'👦' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const card = (extra = {}): React.CSSProperties => ({
  background: C.card, borderRadius: 18, padding: '16px', boxShadow: C.shadow,
  border: `1px solid ${C.border}`, ...extra,
});
const secTitle = (title: string, action?: string, onAct?: ()=>void) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14.5 }}>{title}</p>
    {action && <button onClick={onAct} style={{ color:C.gold, fontSize:11.5, fontWeight:600, border:'none', background:'none', cursor:'pointer' }}>{action}</button>}
  </div>
);

function CircProgress({ pct, size=90 }: { pct:number; size?:number }) {
  const r = size/2 - 9; const circ = 2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEE8D8" strokeWidth="9"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gold} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ} strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>{pct}%</span>
        <span style={{ color:C.green, fontSize:10, marginTop:1, fontWeight:700 }}>ممتاز</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const user      = useAppSelector(s => s.auth.user);
  const { teacher, upcoming, stats, recentSubmissions, courses } = useAppSelector(s => s.teacher);
  const [aiInput, setAiInput] = useState('');
  const [timer] = useState('00:35:42');

  useEffect(() => { dispatch(fetchTeacherDashboard()); }, [dispatch]);

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace:true }); };
  const firstName = teacher?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';
  const fullName  = teacher?.name ?? user?.name ?? '...';

  const pendingTotal = (stats?.pending_homework_subs ?? 0) + (stats?.pending_exam_subs ?? 0);

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"'Cairo',sans-serif" }}>

      {/* ══════ RIGHT SIDEBAR ══════ */}
      <aside style={{ width:SW, flexShrink:0, background:C.navy, height:'100vh', position:'sticky', top:0, display:'flex', flexDirection:'column', overflowY:'auto', scrollbarWidth:'none' }}>

        {/* Sidebar title */}
        <div style={{ padding:'20px 14px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <BrandLogo size={36} style={{ flexShrink:0, borderRadius:10 }} />
            <div>
              <p style={{ color:'#fff', fontWeight:800, fontSize:13.5, lineHeight:1.2 }}>مركز قيادة المعلم</p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:2 }}>بوابة المعلم</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map((item, i) => {
            const inner = (active=false) => (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:11, fontSize:12.5, fontWeight:active?700:500, background:active?C.goldGrad:'transparent', color:active?'#fff':'rgba(255,255,255,0.55)', cursor:'pointer', position:'relative' }}>
                <span style={{ fontSize:14, lineHeight:1, flexShrink:0 }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {(item.badge === -1 ? pendingTotal : item.badge) > 0 && <span style={{ background:C.red, color:'#fff', borderRadius:20, fontSize:9.5, fontWeight:700, padding:'1px 6px', minWidth:18, textAlign:'center' }}>{item.badge === -1 ? pendingTotal : item.badge}</span>}
              </div>
            );
            if (item.to) return (
              <NavLink key={i} to={item.to} style={{ textDecoration:'none' }}>
                {({ isActive }) => inner(isActive)}
              </NavLink>
            );
            return <div key={i}>{inner(false)}</div>;
          })}
          {/* Logout */}
          <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:11, fontSize:12.5, fontWeight:500, color:'rgba(239,68,68,0.75)', cursor:'pointer', marginTop:4 }}>
            <span style={{ fontSize:14 }}>🚪</span>
            <span>تسجيل الخروج</span>
          </div>
        </nav>

        {/* Rank card */}
        <div style={{ margin:'0 8px 8px', padding:'14px 12px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:14, border:`1px solid ${C.goldBdr}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 3px 10px rgba(201,149,42,0.4)', flexShrink:0 }}>🏅</div>
            <div>
              <p style={{ color:C.goldL, fontSize:11, fontWeight:600 }}>رتبتك الحالية</p>
              <p style={{ color:'#fff', fontSize:13.5, fontWeight:800 }}>معلم خبير</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <span style={{ fontSize:18 }}>💎</span>
            <span style={{ color:'#fff', fontWeight:900, fontSize:18 }}>8,420</span>
            <span style={{ color:'rgba(255,255,255,0.45)', fontSize:11 }}>نقطة</span>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:'rgba(255,255,255,0.4)', marginBottom:3 }}>
              <span>إلى رتبة سفير الياقوت</span><span>2,580 نقطة</span>
            </div>
            <div style={{ height:5, background:'rgba(255,255,255,0.1)', borderRadius:3 }}>
              <div style={{ height:'100%', width:'76%', background:C.goldGrad, borderRadius:3 }}/>
            </div>
          </div>
        </div>

        {/* Support button */}
        <div style={{ padding:'0 8px 14px' }}>
          <button style={{ width:'100%', padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#1e3a8a,#2563EB)', color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 4px 14px rgba(37,99,235,0.35)' }}>
            <span style={{ fontSize:16 }}>🎧</span>
            الدعم والمساعدة
          </button>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>

        {/* ── HEADER ── */}
        <header style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>

          {/* Logo (right in RTL) */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <BrandLogo size={40} style={{ borderRadius:12 }} />
          </div>

          {/* Center actions */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Bell */}
            <div style={{ position:'relative', cursor:'pointer' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </div>
              <div style={{ position:'absolute', top:-5, right:-5, width:18, height:18, borderRadius:'50%', background:C.red, color:'#fff', fontSize:9.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>6</div>
            </div>
            {/* Messages */}
            <div style={{ position:'relative', cursor:'pointer' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div style={{ position:'absolute', top:-5, right:-5, width:18, height:18, borderRadius:'50%', background:C.blue, color:'#fff', fontSize:9.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>3</div>
            </div>
            {/* Credits badge */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:12, background:C.goldBg, border:`1px solid ${C.goldBdr}` }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ color:C.gold, fontWeight:700, fontSize:13 }}>12</span>
              <span style={{ color:C.sub, fontSize:12 }}>اعتمادات</span>
            </div>
            {/* Pending badge */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:12, background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.2)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ color:C.orange, fontSize:12, fontWeight:600 }}>بانتظار اعتماد الإدارة</span>
            </div>
          </div>

          {/* Teacher info (left in RTL) */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'left' }}>
              <p style={{ color:C.navy2, fontWeight:800, fontSize:15 }}>مرحباً أ. {fullName}</p>
              <p style={{ color:C.sub, fontSize:11.5 }}>معلم اللغة الإنجليزية</p>
            </div>
            <div style={{ position:'relative' }}>
              <div style={{ width:46, height:46, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'2.5px solid #fff', boxShadow:'0 3px 12px rgba(201,149,42,0.35)' }}>👨‍🏫</div>
              <div style={{ position:'absolute', bottom:1, left:1, width:12, height:12, borderRadius:'50%', background:C.green, border:'2px solid #fff' }}/>
            </div>
          </div>
        </header>

        <div style={{ padding:'16px 20px 24px' }}>

          {/* ── ROW 1: Quality + Stats + Summary ── */}
          <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 240px', gap:12, marginBottom:14 }}>

            {/* Quality Card */}
            <div style={card()}>
              {secTitle('مؤشر جودة الصف')}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                <CircProgress pct={92} size={90}/>
                <div>
                  <p style={{ color:C.text, fontWeight:800, fontSize:16, lineHeight:1.3, marginBottom:4 }}>الصف الخامس A</p>
                  <div style={{ display:'flex', gap:2 }}>
                    {[1,2,3,4,5].map(s=><span key={s} style={{ color:C.gold, fontSize:16 }}>★</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Stat boxes */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { label:'المتفوقون',          n:18, pct:'18%', color:C.green,  bg:'rgba(22,163,74,0.07)',  icon:'😊' },
                { label:'يحتاجون متابعة',     n:24, pct:'24%', color:C.orange, bg:'rgba(217,119,6,0.07)', icon:'🤔' },
                { label:'يحتاجون تدخل عاجل', n:7,  pct:'7%',  color:C.red,    bg:'rgba(239,68,68,0.07)', icon:'🚨' },
              ].map((s,i)=>(
                <div key={i} style={{ ...card(), background:s.bg, border:`1px solid ${s.color}22`, textAlign:'center', padding:'14px 10px' }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{s.icon}</div>
                  <p style={{ color:s.color, fontWeight:900, fontSize:28, lineHeight:1 }}>{s.n}</p>
                  <p style={{ color:C.sub, fontSize:11, margin:'3px 0 1px' }}>طالب</p>
                  <p style={{ color:s.color, fontSize:12, fontWeight:700 }}>{s.pct}</p>
                  <p style={{ color:C.text, fontWeight:700, fontSize:12, marginTop:6 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Summary */}
            <div style={card()}>
              {secTitle('ملخص سريع')}
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {[
                  { label:'كورساتي النشطة',   val:String(stats?.total_courses ?? courses.length ?? '—'),   color:C.blue   },
                  { label:'حصص مجدولة',       val:String(stats?.total_live_classes ?? upcoming.length ?? '—'), color:C.green  },
                  { label:'واجبات نشطة',       val:String(stats?.active_homeworks ?? '—'),                  color:C.orange },
                  { label:'امتحانات نشطة',     val:String(stats?.active_exams ?? '—'),                      color:C.gold   },
                  { label:'حضور اليوم',        val:String(stats?.today_attendance ?? '—'),                   color:C.green  },
                  { label:'تسليمات تحتاج تصحيح', val:String(pendingTotal || '—'),                            color:pendingTotal>0?C.red:C.sub },
                ].map((r,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ color:C.sub, fontSize:12 }}>{r.label}</span>
                    <span style={{ color:r.color, fontWeight:800, fontSize:14 }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <button style={{ width:'100%', marginTop:14, padding:'9px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:12, border:'none', cursor:'pointer', boxShadow:'0 3px 10px rgba(201,149,42,0.35)' }}>
                عرض التقرير التفصيلي
              </button>
            </div>
          </div>

          {/* ── ROW 2: Alerts + Live Room + Upcoming ── */}
          <div style={{ display:'grid', gridTemplateColumns:'240px 1fr 240px', gap:12, marginBottom:14 }}>

            {/* Alerts / Recent Submissions */}
            <div style={card()}>
              {secTitle('تسليمات تحتاج تصحيح', 'عرض الكل')}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {recentSubmissions.length > 0 ? recentSubmissions.map((a,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'10px', borderRadius:12, background:'rgba(217,119,6,0.07)', border:'1px solid rgba(217,119,6,0.22)' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, border:`1px solid ${C.border}` }}>👦</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                        <span style={{ color:C.text, fontWeight:700, fontSize:12 }}>{a.student_name}</span>
                        <span style={{ color:C.dim, fontSize:10 }}>{a.submitted_at}</span>
                      </div>
                      <p style={{ color:C.sub, fontSize:11, lineHeight:1.4 }}>{a.homework}</p>
                      <p style={{ color:C.orange, fontSize:10, fontWeight:600, marginTop:2 }}>يحتاج تصحيح</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign:'center', padding:'20px 0', color:C.sub, fontSize:12 }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
                    <p>لا توجد تسليمات تحتاج تصحيح</p>
                  </div>
                )}
              </div>
              {recentSubmissions.length > 0 && (
                <button onClick={()=>navigate('/teacher/homework')} style={{ width:'100%', marginTop:12, padding:'9px', borderRadius:12, background:`${C.orange}0D`, border:`1px solid ${C.orange}22`, color:C.orange, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  تصحيح جميع الواجبات
                </button>
              )}
            </div>

            {/* Live Room */}
            <div style={{ ...card(), padding:0, overflow:'hidden' }}>
              {/* Video area */}
              <div style={{ background:'linear-gradient(160deg,#0F2057,#0D1535)', position:'relative', height:240 }}>
                {/* LIVE badge + timer */}
                <div style={{ position:'absolute', top:12, right:12, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(239,68,68,0.85)', color:'#fff', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:700, backdropFilter:'blur(4px)' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff', animation:'pulse 1s infinite' }}/>
                    مباشر
                  </div>
                  <div style={{ background:'rgba(0,0,0,0.45)', color:'#fff', padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:600, backdropFilter:'blur(4px)' }}>{timer}</div>
                </div>
                {/* Title */}
                <p style={{ position:'absolute', top:12, left:12, color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:700 }}>غرفة البث المباشر</p>
                {/* Content card in video */}
                <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 22px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)', textAlign:'center', minWidth:220 }}>
                  <p style={{ color:C.goldL, fontWeight:800, fontSize:16, marginBottom:8 }}>Future Simple (will)</p>
                  <p style={{ color:'rgba(255,255,255,0.85)', fontSize:13, lineHeight:2 }}>
                    I will study tomorrow.<br/>
                    She will travel next week.<br/>
                    They will finish the project.
                  </p>
                  <p style={{ color:C.goldL, fontWeight:900, fontSize:22, marginTop:8, fontStyle:'italic' }}>will</p>
                </div>
                {/* Teacher avatar in corner */}
                <div style={{ position:'absolute', bottom:10, right:10, width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2px solid rgba(255,255,255,0.4)' }}>👨‍🏫</div>
                {/* Side tool icons */}
                <div style={{ position:'absolute', top:50, left:8, display:'flex', flexDirection:'column', gap:6 }}>
                  {[{e:'🖊️',l:'السبورة'},{e:'📎',l:'مشاركة'},{e:'📊',l:'استبيان'},{e:'❓',l:'أسئلة'}].map((t,i)=>(
                    <div key={i} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(4px)' }} title={t.l}>
                      <span style={{ fontSize:16 }}>{t.e}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Controls bar */}
              <div style={{ padding:'10px 14px', background:'#0D1535', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {[{e:'🎙️',l:'مايك'},{e:'📹',l:'كاميرا'}].map((b,i)=>(
                    <button key={i} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:1 }}>
                      <span style={{ fontSize:14 }}>{b.e}</span>
                      <span style={{ color:'rgba(255,255,255,0.5)', fontSize:8 }}>{b.l}</span>
                    </button>
                  ))}
                  <button style={{ width:52, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:1 }}>
                    <span style={{ fontSize:12, color:'#fff', fontWeight:700 }}>👥 24</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:8 }}>المشاركون</span>
                  </button>
                  <button style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:1 }}>
                    <span style={{ fontSize:14 }}>💬</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:8 }}>الدردشة</span>
                  </button>
                  <button style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:1 }}>
                    <span style={{ fontSize:14 }}>⋯</span>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:8 }}>المزيد</span>
                  </button>
                </div>
                <button style={{ padding:'8px 16px', borderRadius:12, background:'linear-gradient(135deg,#DC2626,#EF4444)', color:'#fff', fontWeight:700, fontSize:12.5, border:'none', cursor:'pointer', boxShadow:'0 3px 10px rgba(239,68,68,0.4)' }}>
                  إنهاء الحصة ⏹
                </button>
              </div>
            </div>

            {/* Upcoming classes */}
            <div style={card()}>
              {secTitle('الحصص القادمة', 'عرض الكل')}
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {UPCOMING.map((u,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}` }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ color:C.text, fontWeight:700, fontSize:12.5, lineHeight:1.3 }}>{u.subject}</p>
                      <p style={{ color:C.sub, fontSize:11 }}>{u.cls}</p>
                      <p style={{ color:C.gold, fontSize:11, fontWeight:600 }}>{u.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate('/teacher/live-classes')} style={{ width:'100%', marginTop:12, padding:'9px', borderRadius:12, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                عرض الجدول الكامل
              </button>
            </div>
          </div>

          {/* ── ROW 3: Schedule + Smart Tasks + Approvals ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>

            {/* Today's schedule */}
            <div style={card()}>
              {secTitle('جدول حصصي اليوم', 'عرض الجدول الكامل')}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {SCHEDULE.map((s,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:s.live?'linear-gradient(135deg,#0D1535,#1B2038)':C.bg, border:`1px solid ${s.live?'rgba(22,163,74,0.4)':C.border}` }}>
                    <span style={{ color:s.live?C.goldL:C.sub, fontWeight:700, fontSize:12, width:45, flexShrink:0 }}>{s.time}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:s.live?'#fff':C.text, fontWeight:700, fontSize:12.5, lineHeight:1.3 }}>{s.subject}</p>
                      <p style={{ color:s.live?'rgba(255,255,255,0.5)':C.sub, fontSize:11 }}>{s.cls}</p>
                    </div>
                    {s.live && (
                      <span style={{ background:'rgba(22,163,74,0.9)', color:'#fff', fontSize:9.5, fontWeight:700, padding:'3px 8px', borderRadius:20 }}>مباشر الآن</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Tasks */}
            <div style={card()}>
              {secTitle('غرفة المهام الذكية')}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 12px', borderRadius:11, background:C.goldBg, border:`1px solid ${C.goldBdr}` }}>
                <span style={{ fontSize:16 }}>🤖</span>
                <p style={{ color:C.sub, fontSize:11.5 }}>يقترح المعلم الذكي الآن…</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
                {AI_TASKS.map((t,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:C.navy2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{t.emoji}</div>
                    <span style={{ color:C.text, fontSize:12.5 }}>{t.label}</span>
                  </div>
                ))}
              </div>
              <button style={{ width:'100%', padding:'10px', borderRadius:12, background:C.navy2, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                إرسال للإدارة للموافقة
              </button>
              <p style={{ color:C.dim, fontSize:10.5, textAlign:'center' }}>لن تظهر للطلاب إلا بعد اعتماد الإدارة</p>
            </div>

            {/* Approvals */}
            <div style={card()}>
              {secTitle('اعتماداتي')}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {APPROVALS.map((a,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, background:a.sbg, border:`1px solid ${a.sc}22` }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:12.5, lineHeight:1.3 }}>{a.title}</p>
                      <p style={{ color:C.sub, fontSize:11 }}>{a.sub}</p>
                    </div>
                    <span style={{ color:a.sc, fontSize:10.5, fontWeight:700, flexShrink:0, padding:'3px 8px', borderRadius:20, background:`${a.sc}15` }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CLASS MAP (Control Panel) ── */}
          <div style={{ ...card(), marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:14.5 }}>خريطة الصف (لوحة السيطرة)</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {/* View toggle */}
                <div style={{ display:'flex', gap:4, background:C.bg, padding:3, borderRadius:9, border:`1px solid ${C.border}` }}>
                  {['☰','⊞'].map((ic,i)=>(
                    <button key={i} style={{ width:28, height:28, borderRadius:7, background:i===1?C.navy2:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:i===1?'#fff':C.sub }}>
                      {ic}
                    </button>
                  ))}
                </div>
                {/* Filter */}
                <select style={{ padding:'5px 10px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, cursor:'pointer', outline:'none' }}>
                  <option>جميع الحالات</option>
                  <option>ممتاز</option>
                  <option>يحتاج متابعة</option>
                  <option>خطر</option>
                </select>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:12 }}>
              {STUDENTS.map((s,i)=>(
                <div key={i} style={{ background:C.bg, borderRadius:12, padding:'10px 8px', textAlign:'center', border:`1.5px solid ${s.color}40`, cursor:'pointer' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, margin:'0 auto 6px', border:`1.5px solid ${s.color}40` }}>{s.avatar}</div>
                  <p style={{ color:C.text, fontSize:10.5, fontWeight:600, lineHeight:1.3, marginBottom:4 }}>{s.name}</p>
                  <span style={{ color:s.color, fontSize:9.5, fontWeight:700, padding:'2px 6px', borderRadius:20, background:`${s.color}15` }}>{s.status}</span>
                </div>
              ))}
              {/* Add note */}
              <div style={{ background:C.bg, borderRadius:12, padding:'10px 8px', textAlign:'center', border:`1.5px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <div>
                  <p style={{ color:C.dim, fontSize:22, marginBottom:4 }}>+</p>
                  <p style={{ color:C.dim, fontSize:10 }}>إضافة ملاحظة</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {[{color:C.green,label:'ممتاز'},{color:C.orange,label:'يحتاج متابعة'},{color:C.red,label:'خطر'}].map((l,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:l.color }}/>
                  <span style={{ color:C.sub, fontSize:11.5 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM: AI + Achievements + Tools + Tips ── */}
          <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:12 }}>

            {/* AI Assistant */}
            <div style={card()}>
              <p style={{ color:C.text, fontWeight:800, fontSize:14.5, marginBottom:12 }}>مساعد المعلم الذكي</p>
              <div style={{ textAlign:'center', marginBottom:14 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#0D1535,#1B2038)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:28, border:`2px solid ${C.gold}`, boxShadow:'0 4px 16px rgba(13,21,53,0.45)' }}>🤖</div>
                <p style={{ color:C.text, fontWeight:700, fontSize:13, marginBottom:2 }}>مرجباً أ. {firstName}!</p>
                <p style={{ color:C.sub, fontSize:11.5 }}>كيف يمكنني مساعدتك اليوم؟</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
                {AI_SUGGESTIONS.map((s,i)=>(
                  <button key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer', width:'100%', textAlign:'right' }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#1B2038,#0D1535)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{s.emoji}</div>
                    <span style={{ color:C.text, fontSize:12.5, fontWeight:600 }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ position:'relative' }}>
                <input value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="جرّب سؤالاً…" style={{ width:'100%', padding:'10px 40px 10px 12px', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:"'Cairo',sans-serif" }}/>
                <button onClick={()=>setAiInput('')} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:8, background:aiInput?C.goldGrad:C.bg, border:`1px solid ${aiInput?'transparent':C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={aiInput?'#1B2038':'#9CA3AF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <p style={{ color:C.dim, fontSize:10 }}>نصائح اليوم: رأيت نسبة التفاعل في صفك هذا الأسبوع ارتفعت 12% — استمر على نفس المستوى الرائع!</p>
              </div>
            </div>

            {/* Right side: achievements + tools + tips */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {/* Achievements */}
              <div style={card()}>
                {secTitle('إنجازاتك')}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {[
                    { emoji:'🏆', val:'120', label:'حصص مكتملة' },
                    { emoji:'✅', val:'98%', label:'الالتزام بالحصص' },
                    { emoji:'👥', val:'850', label:'طلاب تفاعلوا' },
                    { emoji:'⭐', val:'25',  label:'شارات حصل عليها' },
                  ].map((a,i)=>(
                    <div key={i} style={{ textAlign:'center', padding:'12px 8px', borderRadius:14, background:C.bg, border:`1px solid ${C.border}` }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:20, boxShadow:'0 3px 10px rgba(201,149,42,0.3)' }}>{a.emoji}</div>
                      <p style={{ color:C.text, fontWeight:900, fontSize:18, lineHeight:1, marginBottom:4 }}>{a.val}</p>
                      <p style={{ color:C.sub, fontSize:10.5, lineHeight:1.3 }}>{a.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tools */}
              <div style={card()}>
                {secTitle('أدوات سريعة')}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {QUICK_TOOLS.map((t,i)=>(
                    <button key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 16px', borderRadius:14, background:C.bg, border:`1px solid ${C.border}`, cursor:'pointer', minWidth:80 }}>
                      <span style={{ fontSize:22 }}>{t.emoji}</span>
                      <span style={{ color:C.text, fontSize:11, fontWeight:600 }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div style={{ ...card(), background:'linear-gradient(135deg,#0D1535,#162144)', border:'1px solid rgba(201,149,42,0.2)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>📈</div>
                  <div>
                    <p style={{ color:C.goldL, fontWeight:700, fontSize:13, marginBottom:3 }}>نصائح اليوم</p>
                    <p style={{ color:'rgba(255,255,255,0.65)', fontSize:12, lineHeight:1.5 }}>
                      رأيت نسبة التفاعل في صفك هذا الأسبوع ارتفعت 12% — استمر على نفس المستوى الرائع!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* مهام اليوم */}
            <div style={{ padding:'0 20px 20px' }}>
              <DailyRemindersWidget role="teacher" initItems={[
                { text: 'تصحيح الواجبات المسلّمة', priority: 'high' },
                { text: 'تسجيل الحضور لجميع الفصول', priority: 'high' },
                { text: 'مراجعة تقارير الطلاب', priority: 'normal' },
                { text: 'التحضير لحصة الغد', priority: 'normal' },
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
