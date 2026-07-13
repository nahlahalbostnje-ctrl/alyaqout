import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSuperAdminStats } from '../features/superAdmin/superAdminSlice';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);
const sH = (t:string, a?:string, onAction?:()=>void) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{t}</p>
    {a&&<button onClick={onAction ?? (()=>alert(`"${a}" لـ"${t}" قيد التطوير.`))} style={{ color:C.gold, fontSize:11, fontWeight:600, border:'none', background:'none', cursor:'pointer' }}>{a}</button>}
  </div>
);

function fmt(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString('en-US');
}

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

function LineChart({ data }: { data: { month: string; total: number }[] }) {
  if (data.length === 0) {
    return <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, fontSize:13 }}>لا توجد بيانات</div>;
  }
  const W=380,H=150,PX=24,PY=14;
  const max=Math.max(...data.map(d=>d.total), 1); const min=0; const range=max-min||1;
  const denom = Math.max(data.length - 1, 1);
  const gx=(i:number)=>PX+(i/denom)*(W-PX*2);
  const gy=(v:number)=>H-PY-((v-min)/range)*(H-PY*2);
  const pts=data.map((d,i)=>`${gx(i)},${gy(d.total)}`).join(' ');
  const area=`M${gx(0)},${gy(data[0].total)} ${data.map((d,i)=>`L${gx(i)},${gy(d.total)}`).join(' ')} L${gx(data.length-1)},${H-PY} L${gx(0)},${H-PY}Z`;
  const label = (v: number) => v >= 1000 ? `${(v/1000).toFixed(v >= 10000 ? 0 : 1)}K` : String(v);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity="0.18"/><stop offset="100%" stopColor={C.gold} stopOpacity="0"/></linearGradient></defs>
      {[0,1,2,3].map(i=>{const yy=H-PY-(i/3)*(H-PY*2);return <line key={i} x1={PX} y1={yy} x2={W-PX} y2={yy} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>;})}
      <path d={area} fill="url(#ag)"/>
      <polyline points={pts} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={gx(i)} cy={gy(d.total)} r="4" fill={C.gold} stroke="#fff" strokeWidth="2"/>
          <text x={gx(i)} y={gy(d.total)-9} textAnchor="middle" fontSize="9" fill={C.text} fontWeight="700" fontFamily="Cairo,sans-serif">{label(d.total)}</text>
          <text x={gx(i)} y={H-1} textAnchor="middle" fontSize="8" fill={C.dim} fontFamily="Cairo,sans-serif">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

type DonutSeg = { label: string; pct: number; color: string; count: number };

function DonutChart({ segs, total }: { segs: DonutSeg[]; total: number }) {
  const R=55,cx=70,cy=70,circ=2*Math.PI*R; let rot=-90;
  if (total === 0) {
    return (
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="22"/>
        <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.sub} fontFamily="Cairo,sans-serif">لا توجد بيانات</text>
      </svg>
    );
  }
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="22"/>
      {segs.map((s,i)=>{
        const dash=(s.pct/100)*circ;
        const el=<circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="22" strokeDasharray={`${dash} ${circ}`} style={{ transform:`rotate(${rot}deg)`, transformOrigin:`${cx}px ${cy}px` }}/>;
        rot+=(s.pct/100)*360; return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="900" fill={C.text} fontFamily="Cairo,sans-serif">{fmt(total)}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="Cairo,sans-serif">مستخدمون</text>
    </svg>
  );
}

export default function SAAnalyticsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, countryStats, growthChart, loading, error } = useAppSelector(s => s.superAdmin);
  const [period, setPeriod] = useState('6');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    dispatch(fetchSuperAdminStats());
  }, [dispatch]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const periodN = Number(period) || 6;
  const chartData = useMemo(
    () => (growthChart ?? []).slice(-periodN),
    [growthChart, periodN]
  );

  const revChange = stats?.revenue_change_pct ?? 0;
  const totalUsers = (stats?.total_students ?? 0) + (stats?.total_teachers ?? 0) + (stats?.total_parents ?? 0);
  const stuDelta = (stats?.students_this_month ?? 0) - (stats?.students_last_month ?? 0);

  const kpis = [
    {
      label: 'إجمالي المستخدمين',
      value: fmt(totalUsers),
      change: loading && !stats ? '...' : `${stuDelta >= 0 ? '+' : ''}${fmt(stuDelta)} طلاب`,
      up: stuDelta >= 0,
      icon: '👥',
      color: C.blue,
    },
    {
      label: 'إجمالي الطلاب',
      value: fmt(stats?.total_students),
      change: `${fmt(stats?.total_teachers)} معلمون`,
      up: true,
      icon: '🎓',
      color: C.green,
    },
    {
      label: 'إجمالي الدورات',
      value: fmt(stats?.total_courses),
      change: `${fmt(stats?.total_countries)} فرع`,
      up: true,
      icon: '⚡',
      color: C.orange,
    },
    {
      label: 'إيرادات الشهر الحالي',
      value: fmt(stats?.revenue_this_month),
      change: `${revChange >= 0 ? '+' : ''}${revChange}%`,
      up: revChange >= 0,
      icon: '💰',
      color: C.gold,
      currency: 'ريال',
    },
  ];

  const donutSegs = useMemo((): DonutSeg[] => {
    const students = stats?.total_students ?? 0;
    const teachers = stats?.total_teachers ?? 0;
    const parents  = stats?.total_parents ?? 0;
    const total = students + teachers + parents;
    const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 1000) / 10;
    return [
      { label: 'طلاب', pct: pct(students), count: students, color: '#3B82F6' },
      { label: 'معلمون', pct: pct(teachers), count: teachers, color: C.gold },
      { label: 'أولياء أمور', pct: pct(parents), count: parents, color: C.green },
    ];
  }, [stats]);

  const countries = useMemo(
    () => [...(countryStats ?? [])].sort((a, b) => b.students - a.students),
    [countryStats]
  );

  return (
    <SuperAdminShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>مؤشرات المنصة</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>تحليلات شاملة لأداء المنصة</p>
        </div>
        <select value={period} onChange={e=>setPeriod(e.target.value)} style={{ padding:'7px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontSize:12, outline:'none', cursor:'pointer' }}>
          <option value="6">آخر 6 أشهر</option>
          <option value="3">آخر 3 أشهر</option>
          <option value="12">آخر 12 شهر</option>
        </select>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:14 }}>
        {kpis.map((k,i)=>(
          <div key={i} style={card({ padding:'16px 14px' })}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:`${k.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{k.icon}</div>
              <span style={{ color:k.up?C.green:C.red, fontSize:11, fontWeight:700, background:k.up?'rgba(22,163,74,0.1)':'rgba(239,68,68,0.1)', padding:'2px 8px', borderRadius:20 }}>{k.change}</span>
            </div>
            <p style={{ color:C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>{loading && !stats ? '—' : k.value}</p>
            {k.currency&&<p style={{ color:C.sub, fontSize:9.5, marginTop:1 }}>{k.currency}</p>}
            <p style={{ color:C.sub, fontSize:11, marginTop:5 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap:12, marginBottom:14 }}>
        <div style={card()}>
          {sH('نمو المستخدمين الشهري')}
          <div style={{ height:170 }}><LineChart data={chartData}/></div>
          <div style={{ display:'flex', gap:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:10, height:3, borderRadius:2, background:C.gold }}/><span style={{ color:C.sub, fontSize:10 }}>الطلاب</span></div>
          </div>
        </div>
        <div style={card()}>
          {sH('توزيع المستخدمين', 'عرض الكل', () => navigate('/dashboard/students'))}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <DonutChart segs={donutSegs} total={totalUsers}/>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {donutSegs.every(s => s.count === 0) ? (
                <p style={{ color:C.sub, fontSize:12 }}>لا توجد بيانات</p>
              ) : donutSegs.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }}/>
                  <div>
                    <p style={{ color:C.text, fontSize:11, fontWeight:600 }}>{s.label}</p>
                    <p style={{ color:C.sub, fontSize:10 }}>{fmt(s.count)} ({s.pct}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Country breakdown */}
      <div style={card()}>
        {sH('توزيع الأفرع حسب الدولة', 'عرض الكل', () => navigate('/dashboard/schools'))}
        {countries.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px', color:C.sub, fontSize:13 }}>لا توجد بيانات</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.03)' }}>
                  {['الدولة','الطلاب','المعلمون'].map((h,i)=>(
                    <th key={i} style={{ padding:'10px 12px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map((r,i)=>(
                  <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':'rgba(0,0,0,0.015)' }}>
                    <td style={{ padding:'11px 12px', color:C.text, fontWeight:700, fontSize:12.5 }}>
                      <span style={{ marginLeft:8 }}>{countryFlag(r.name)}</span>{r.name}
                    </td>
                    <td style={{ padding:'11px 12px', color:C.text, fontWeight:700, fontSize:12 }}>{fmt(r.students)}</td>
                    <td style={{ padding:'11px 12px', color:C.sub, fontSize:12 }}>{fmt(r.teachers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}
