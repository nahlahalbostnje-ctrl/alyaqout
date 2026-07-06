import { useState, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);
const sH = (t:string, a?:string) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{t}</p>
    {a&&<button style={{ color:C.gold, fontSize:11, fontWeight:600, border:'none', background:'none', cursor:'pointer' }}>{a}</button>}
  </div>
);

const KPIS = [
  { label:'إجمالي المستخدمين النشطين', value:'14,234', change:'+8.4%', up:true, icon:'👥', color:C.blue   },
  { label:'نسبة إتمام الدورات',          value:'73.2%',  change:'+2.1%', up:true, icon:'🎓', color:C.green  },
  { label:'معدل التفاعل اليومي',         value:'89.7%',  change:'-0.3%', up:false,icon:'⚡', color:C.orange },
  { label:'إيرادات الشهر الحالي',        value:'245,680',change:'+18%',  up:true, icon:'💰', color:C.gold, currency:'ريال' },
];

const MONTHLY = [
  {m:'ديسمبر',students:8450,teachers:820},
  {m:'يناير', students:9120,teachers:851},
  {m:'فبراير',students:9850,teachers:879},
  {m:'مارس',  students:10421,teachers:896},
  {m:'أبريل', students:11612,teachers:920},
  {m:'مايو',  students:12842,teachers:936},
];

const COURSES_DATA = [
  { name:'الرياضيات المتقدمة',    teacher:'أ. محمد السالم',   students:1840, interact:94.2, rate:4.9 },
  { name:'الفيزياء التطبيقية',    teacher:'أ. سارة العمر',    students:1420, interact:91.8, rate:4.8 },
  { name:'اللغة الإنجليزية',      teacher:'أ. خالد المنصور',  students:2150, interact:88.5, rate:4.7 },
  { name:'علم الأحياء',           teacher:'أ. نورة الزهراني', students:980,  interact:85.3, rate:4.6 },
  { name:'الكيمياء العضوية',      teacher:'أ. عبدالله القحطاني',students:760,interact:82.1, rate:4.5 },
];

const DONUT = [
  { label:'العلوم', pct:32, color:'#3B82F6' },
  { label:'الرياضيات', pct:28, color:C.gold },
  { label:'اللغات', pct:22, color:C.green },
  { label:'الإنسانيات', pct:18, color:C.purple },
];

function LineChart({ data }: { data:typeof MONTHLY }) {
  const W=380,H=150,PX=24,PY=14;
  const max=Math.max(...data.map(d=>d.students)); const min=0; const range=max-min||1;
  const gx=(i:number)=>PX+(i/(data.length-1))*(W-PX*2);
  const gy=(v:number)=>H-PY-((v-min)/range)*(H-PY*2);
  const pts=data.map((d,i)=>`${gx(i)},${gy(d.students)}`).join(' ');
  const area=`M${gx(0)},${gy(data[0].students)} ${data.map((d,i)=>`L${gx(i)},${gy(d.students)}`).join(' ')} L${gx(data.length-1)},${H-PY} L${gx(0)},${H-PY}Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity="0.18"/><stop offset="100%" stopColor={C.gold} stopOpacity="0"/></linearGradient></defs>
      {[0,1,2,3].map(i=>{const yy=H-PY-(i/3)*(H-PY*2);return <line key={i} x1={PX} y1={yy} x2={W-PX} y2={yy} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>;})}
      <path d={area} fill="url(#ag)"/>
      <polyline points={pts} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={gx(i)} cy={gy(d.students)} r="4" fill={C.gold} stroke="#fff" strokeWidth="2"/>
          <text x={gx(i)} y={gy(d.students)-9} textAnchor="middle" fontSize="9" fill={C.text} fontWeight="700" fontFamily="Cairo,sans-serif">{(d.students/1000).toFixed(1)}K</text>
          <text x={gx(i)} y={H-1} textAnchor="middle" fontSize="8" fill={C.dim} fontFamily="Cairo,sans-serif">{d.m}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart() {
  const R=55,cx=70,cy=70,circ=2*Math.PI*R; let rot=-90;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3EDE4" strokeWidth="22"/>
      {DONUT.map((s,i)=>{
        const dash=(s.pct/100)*circ;
        const el=<circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth="22" strokeDasharray={`${dash} ${circ}`} style={{ transform:`rotate(${rot}deg)`, transformOrigin:`${cx}px ${cy}px` }}/>;
        rot+=(s.pct/100)*360; return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="900" fill={C.text} fontFamily="Cairo,sans-serif">2,451</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="Cairo,sans-serif">دورة معتمدة</text>
    </svg>
  );
}

export default function SAAnalyticsPage() {
  const [period, setPeriod] = useState('6');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
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

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:14 }}>
        {KPIS.map((k,i)=>(
          <div key={i} style={card({ padding:'16px 14px' })}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:`${k.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{k.icon}</div>
              <span style={{ color:k.up?C.green:C.red, fontSize:11, fontWeight:700, background:k.up?'rgba(22,163,74,0.1)':'rgba(239,68,68,0.1)', padding:'2px 8px', borderRadius:20 }}>{k.change}</span>
            </div>
            <p style={{ color:C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>{k.value}</p>
            {k.currency&&<p style={{ color:C.sub, fontSize:9.5, marginTop:1 }}>{k.currency}</p>}
            <p style={{ color:C.sub, fontSize:11, marginTop:5 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap:12, marginBottom:14 }}>
        <div style={card()}>
          {sH('نمو المستخدمين الشهري', 'تصدير')}
          <div style={{ height:170 }}><LineChart data={MONTHLY}/></div>
          <div style={{ display:'flex', gap:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:10, height:3, borderRadius:2, background:C.gold }}/><span style={{ color:C.sub, fontSize:10 }}>الطلاب</span></div>
          </div>
        </div>
        <div style={card()}>
          {sH('توزيع الدورات')}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <DonutChart/>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {DONUT.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }}/>
                  <div>
                    <p style={{ color:C.text, fontSize:11, fontWeight:600 }}>{s.label}</p>
                    <p style={{ color:C.sub, fontSize:10 }}>{s.pct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={card()}>
        {sH('أعلى الدورات تفاعلاً', 'عرض الكل')}
        <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
          <thead>
            <tr style={{ background:'rgba(0,0,0,0.03)' }}>
              {['اسم الدورة','المعلم','الطلاب','نسبة التفاعل','التقييم'].map((h,i)=>(
                <th key={i} style={{ padding:'10px 12px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURSES_DATA.map((r,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':'rgba(0,0,0,0.015)' }}>
                <td style={{ padding:'11px 12px', color:C.text, fontWeight:700, fontSize:12.5 }}>{r.name}</td>
                <td style={{ padding:'11px 12px', color:C.sub, fontSize:12 }}>{r.teacher}</td>
                <td style={{ padding:'11px 12px', color:C.text, fontWeight:700, fontSize:12 }}>{r.students.toLocaleString()}</td>
                <td style={{ padding:'11px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(0,0,0,0.08)' }}>
                      <div style={{ width:`${r.interact}%`, height:'100%', borderRadius:3, background:C.goldGrad }}/>
                    </div>
                    <span style={{ color:C.text, fontSize:11, fontWeight:700, flexShrink:0 }}>{r.interact}%</span>
                  </div>
                </td>
                <td style={{ padding:'11px 12px', color:C.gold, fontWeight:700, fontSize:12 }}>⭐ {r.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
