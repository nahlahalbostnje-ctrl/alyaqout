import { useState, useEffect } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSupervisedStudents, fetchStudentPerformance } from '../features/supervisor/supervisorSlice';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  amber:'#F59E0B', amberBg:'rgba(245,158,11,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
};

type Row = { id:number; name:string; attendance:number; progress:number; completion:number; exams:number; hw:number; trend:'up'|'down'|'stable' };
const WEEKS = ['أسبوع 1','أسبوع 2','أسبوع 3','أسبوع 4','أسبوع 5','أسبوع 6'];

function Bar({ val, color=C.gold }: { val:number; color?:string }) {
  return (
    <div style={{ height:6, borderRadius:3, background:'#EDE3CE', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${val}%`, background:color, borderRadius:3, transition:'width 0.5s' }}/>
    </div>
  );
}

function Ring({ pct, size=70, color=C.gold, label='' }: { pct:number; size?:number; color?:string; label?:string }) {
  const r=(size-8)/2, circ=2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE3CE" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
        <span style={{ color:C.text, fontWeight:900, fontSize:size>60?14:11 }}>{pct}%</span>
        {label && <span style={{ color:C.dim, fontSize:9 }}>{label}</span>}
      </div>
    </div>
  );
}

function LineChart({ data }: { data:number[] }) {
  if (data.length < 2) return null;
  const W=340, H=90, pad=10;
  const max=100, min=0;
  const pts = data.map((v,i) => {
    const x = pad + (i/(data.length-1))*(W-2*pad);
    const y = H - pad - ((v-min)/(max-min))*(H-2*pad);
    return [x,y];
  });
  const d = pts.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${d} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`;
  return (
    <svg width={W} height={H}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} stopOpacity={0.2}/>
          <stop offset="100%" stopColor={C.gold} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)"/>
      <path d={d} fill="none" stroke={C.gold} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={C.gold} stroke="#fff" strokeWidth={1.5}/>
      ))}
    </svg>
  );
}

export default function SupervisorPerformancePage() {
  const dispatch = useAppDispatch();
  const { students, performance, loading } = useAppSelector(s => s.supervisor);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchSupervisedStudents()); }, [dispatch]);
  useEffect(() => {
    students.forEach(st => { if (!performance[st.id]) dispatch(fetchStudentPerformance(st.id)); });
  }, [dispatch, students, performance]);

  const STUDENTS: Row[] = students.map(st => {
    const perf = performance[st.id];
    const attendance = perf?.attendance?.rate != null ? Math.round(perf.attendance.rate) : 0;
    const exams = perf?.exams?.average != null ? Math.round(perf.exams.average) : 0;
    const hw = perf?.homework?.average != null ? Math.round(perf.homework.average) : 0;
    const progress = Math.round((attendance + exams + hw) / 3) || 0;
    return { id: st.id, name: st.name, attendance, progress, completion: progress, exams, hw, trend: 'stable' as const };
  });

  const [view, setView] = useState<'group'|'individual'>('group');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  useEffect(() => { if (STUDENTS.length && selectedId == null) setSelectedId(STUDENTS[0].id); }, [STUDENTS, selectedId]);
  const selected = STUDENTS.find(s => s.id === selectedId) ?? STUDENTS[0];
  const [exported, setExported] = useState(false);
  const progressAvg = STUDENTS.length ? Math.round(STUDENTS.reduce((s,st)=>s+st.progress,0)/STUDENTS.length) : 0;
  const GROUP_PROGRESS = STUDENTS.length
    ? [Math.max(0,progressAvg-10), Math.max(0,progressAvg-6), Math.max(0,progressAvg-3), progressAvg, progressAvg, Math.min(100,progressAvg+4)]
    : [];

  const export_ = () => { setExported(true); setTimeout(()=>setExported(false),2500); };

  const groupAvg = (key: keyof Row) =>
    STUDENTS.length ? Math.round(STUDENTS.reduce((s,st)=>s+(st[key] as number),0)/STUDENTS.length) : 0;
  void loading;

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>تقارير الأداء والمتابعة 📈</h1>
            </div>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>مؤشرات الطلاب الأكاديمية والتزامهم بالمسارات التدريبية</p>
          </div>
          <button onClick={export_} style={{ padding:'10px 20px', borderRadius:12, border:'none', background:C.navy, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif", display:'flex', alignItems:'center', gap:8 }}>
            {exported ? '✓ تم التصدير' : '📥 تصدير التقرير'}
          </button>
        </div>

        {/* Toggle */}
        <div style={{ display:'flex', gap:6, background:C.card, borderRadius:12, padding:4, border:`1px solid ${C.border}`, width:'fit-content', marginBottom:20 }}>
          {(['group','individual'] as const).map(v => (
            <button key={v} onClick={()=>setView(v)} style={{
              padding:'7px 18px', borderRadius:9, border:'none', fontFamily:"'Cairo',sans-serif",
              fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
              background:view===v?C.goldGrad:'transparent', color:view===v?'#fff':C.sub,
            }}>{v==='group'?'رؤية جماعية':'رؤية فردية'}</button>
          ))}
        </div>

        {view === 'group' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>

            {/* Group rings */}
            <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:20 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:16 }}>متوسطات المجموعة</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
                {[
                  { label:'معدل الالتزام',    val:groupAvg('attendance'), color:C.green },
                  { label:'التقدم في الدروس', val:groupAvg('progress'),   color:C.gold },
                  { label:'نسبة الإتمام',     val:groupAvg('completion'), color:C.amber },
                  { label:'متوسط الاختبارات', val:groupAvg('exams'),      color:C.navy },
                ].map((m,i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <Ring pct={m.val} size={80} color={m.color}/>
                    <p style={{ color:C.sub, fontSize:12, textAlign:'center' }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Line chart */}
            <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:20 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:4 }}>تقدم المجموعة أسبوعياً</p>
              <p style={{ color:C.dim, fontSize:12, marginBottom:16 }}>متوسط نسب الإتمام خلال 6 أسابيع</p>
              <LineChart data={GROUP_PROGRESS}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                {WEEKS.map(w=><span key={w} style={{ color:C.dim, fontSize:10 }}>{w}</span>)}
              </div>
            </div>

            {/* Student table */}
            <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflowX:'auto', gridColumn:'1/-1' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}` }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>جدول مقارنة الطلاب</p>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:540 }}>
                <thead>
                  <tr style={{ background:'#FDFAF4', borderBottom:`1px solid ${C.border}` }}>
                    {['الطالب','الالتزام','التقدم','الإتمام','الاختبارات','الواجبات','التوجه'].map(h=>(
                      <th key={h} style={{ padding:'10px 16px', color:C.sub, fontSize:11.5, fontWeight:700, textAlign:'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.length === 0 && (
                    <tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:C.sub }}>لا يوجد طلاب</td></tr>
                  )}
                  {STUDENTS.map((st,i) => (
                    <tr key={st.id} style={{ borderBottom:i<STUDENTS.length-1?`1px solid ${C.border}`:'none' }}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28,height:28,borderRadius:'50%',background:C.goldGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:11,flexShrink:0 }}>{st.name.charAt(0)}</div>
                          <span style={{ color:C.text,fontWeight:600,fontSize:12.5 }}>{st.name}</span>
                        </div>
                      </td>
                      {([st.attendance,st.progress,st.completion,st.exams,st.hw] as number[]).map((v,j)=>{
                        const col=v>=80?C.green:v>=60?C.amber:C.red;
                        return (
                          <td key={j} style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ color:col,fontWeight:700,fontSize:12,minWidth:28 }}>{v}%</span>
                              <Bar val={v} color={col}/>
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:16 }}>{st.trend==='up'?'📈':st.trend==='down'?'📉':'➡️'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !selected ? (
          <p style={{ color:C.sub, textAlign:'center', padding:40 }}>لا يوجد طلاب مسجّلون تحت إشرافك</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap:16 }}>
            {/* Student list */}
            <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}` }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:13 }}>اختر طالباً</p>
              </div>
              <div style={{ padding:8, display:'flex', flexDirection:'column', gap:4 }}>
                {STUDENTS.map(st=>(
                  <button key={st.id} onClick={()=>setSelectedId(st.id)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
                    border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", textAlign:'right',
                    background:selectedId===st.id?C.goldBg:'transparent',
                    borderRight:selectedId===st.id?`3px solid ${C.gold}`:'3px solid transparent',
                  }}>
                    <div style={{ width:30,height:30,borderRadius:'50%',background:C.goldGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:12,flexShrink:0 }}>{st.name.charAt(0)}</div>
                    <span style={{ color:C.text,fontWeight:selectedId===st.id?700:500,fontSize:13 }}>{st.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual stats */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                  <div style={{ width:50,height:50,borderRadius:'50%',background:C.goldGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:20 }}>{selected.name.charAt(0)}</div>
                  <div>
                    <p style={{ color:C.text,fontWeight:900,fontSize:16 }}>{selected.name}</p>
                    <p style={{ color:C.sub,fontSize:12 }}>تقرير الأداء التفصيلي</p>
                  </div>
                  <span style={{ marginRight:'auto', fontSize:20 }}>{selected.trend==='up'?'📈':selected.trend==='down'?'📉':'➡️'}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:16 }}>
                  {[
                    { label:'الالتزام',val:selected.attendance,color:C.green },
                    { label:'التقدم', val:selected.progress,  color:C.gold },
                    { label:'الإتمام',val:selected.completion,color:C.amber },
                    { label:'الاختبارات',val:selected.exams, color:C.navy },
                    { label:'الواجبات',val:selected.hw,      color:'#8B5CF6' },
                  ].map((m,i) => (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                      <Ring pct={m.val} size={72} color={m.color}/>
                      <p style={{ color:C.sub, fontSize:11, textAlign:'center' }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <p style={{ color:C.text, fontWeight:700, fontSize:14 }}>إرسال تقرير الطالب</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={export_} style={{ padding:'9px 18px',borderRadius:11,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:"'Cairo',sans-serif" }}>📧 إرسال لولي الأمر</button>
                  <button onClick={export_} style={{ padding:'9px 18px',borderRadius:11,border:'none',background:C.navy,color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:"'Cairo',sans-serif" }}>📤 إرسال للإدارة</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
}
