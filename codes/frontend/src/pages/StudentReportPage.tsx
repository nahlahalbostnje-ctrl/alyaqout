import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyReport } from '../features/student/reportSlice';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)',
  red:'#EF4444', green:'#16A34A', blue:'#2563EB', purple:'#7C3AED',
};
const BH = 60;
const font = { fontFamily:"'Cairo', sans-serif" };

const PERIODS = ['هذا الشهر', 'الفصل الأول', 'الفصل الثاني', 'العام الكامل'] as const;

const SUBJECT_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

// ── Circular Progress ─────────────────────────────────────────────────────────
function CircProgress({ pct, size=130 }: { pct:number; size?:number }) {
  const r = size/2 - 12;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEE8D8" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gold} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ} strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:C.navy2, fontWeight:900, fontSize:28, lineHeight:1 }}>{pct}%</span>
        <span style={{ color:C.sub, fontSize:11, marginTop:4 }}>المستوى العام</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentReportPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myReport, loading } = useAppSelector(s => s.report);
  const [period, setPeriod]         = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { dispatch(fetchMyReport()); }, [dispatch]);

  // Build subject list from exam history (group by title) when available
  const subjects = (myReport?.exams?.recent ?? []).map((e, i) => ({
    name: e.title ?? `امتحان ${i + 1}`,
    pct: e.pct ?? 0,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const overall = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + s.pct, 0) / subjects.length)
    : (myReport?.exams?.average != null ? Math.round(myReport.exams.average) : 0);

  // Real stats from API — no fake defaults
  const attendance = myReport?.attendance;
  const exams      = myReport?.exams;
  const homework   = myReport?.homework;

  const attRate  = attendance?.rate != null ? Math.round(attendance.rate) : 0;
  const examAvg  = exams?.average != null ? Math.round(exams.average) : 0;
  const hwAvg    = homework?.average != null ? Math.round(homework.average) : 0;

  const cardS = { background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl', paddingBottom:BH+20 }}>

      {/* ── Hero Banner ── */}
      <div style={{ background:'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#1a3a6b 100%)', padding:'28px 20px 32px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.02})`, width:120+i*100, height:120+i*100, top:'50%', right:'-20px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:680, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <button onClick={()=>navigate('/student/dashboard')} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
            <div style={{ width:50, height:50, borderRadius:14, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0, boxShadow:'0 4px 16px rgba(201,149,42,0.4)' }}>📈</div>
            <div>
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>مستوى التطور</h1>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginTop:4 }}>تابع تقدمك الأكاديمي خطوة بخطوة</p>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { icon:'✅', label:'الحضور', val:`${attRate}%`, color:'#22C55E' },
              { icon:'📝', label:'متوسط الامتحانات', val:`${examAvg}%`, color:C.goldL },
              { icon:'📚', label:'متوسط الواجبات', val:`${hwAvg}%`, color:'#60A5FA' },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', flex:1, minWidth:100 }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <div>
                  <p style={{ color:s.color, fontWeight:900, fontSize:16, lineHeight:1 }}>{s.val}</p>
                  <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1, padding:'16px 20px', maxWidth:680, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>

        {/* Period Filter */}
        <div style={{ position:'relative', marginBottom:16 }}>
          <button onClick={()=>setShowPicker(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:12, background:C.card, border:`1px solid ${C.border}`, cursor:'pointer', ...font, fontSize:13, color:C.text, fontWeight:700, boxShadow:C.shadow }}>
            <span>📅</span>
            <span>{PERIODS[period]}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight:'auto' }}><path d="M19 9l-7 7-7-7"/></svg>
          </button>
          {showPicker && (
            <div style={{ position:'absolute', top:'110%', right:0, background:C.card, borderRadius:14, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:`1px solid ${C.border}`, zIndex:50, minWidth:180, overflow:'hidden' }}>
              {PERIODS.map((p,i)=>(
                <button key={i} onClick={()=>{ setPeriod(i); setShowPicker(false); }}
                  style={{ width:'100%', padding:'12px 16px', border:'none', background:period===i ? C.goldBg : 'none', cursor:'pointer', ...font, fontSize:13, color:period===i ? C.gold : C.text, fontWeight:period===i ? 700 : 500, textAlign:'right', borderBottom:`1px solid ${C.border}` }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:30 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${C.goldBg}`, borderTopColor:C.gold, animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        )}

        {/* ── Subject Progress + Circle ── */}
        <div style={{ ...cardS, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <p style={{ color:C.text, fontWeight:900, fontSize:15 }}>الأداء بالمواد</p>
            <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>المستوى العام</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ flex:1 }}>
              {subjects.length === 0 ? (
                <p style={{ color:C.sub, fontSize:13, textAlign:'center', padding:'20px 0' }}>لا توجد بيانات أداء بالمواد بعد</p>
              ) : subjects.map((s,i)=>(
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                    <span style={{ color:C.text, fontWeight:600 }}>{s.name}</span>
                    <span style={{ color:s.color, fontWeight:800 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:`${s.color}18` }}>
                    <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:4, background:s.color, transition:'width 0.8s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
            {subjects.length > 0 && <CircProgress pct={overall} />}
          </div>
        </div>

        {/* ── Attendance Card ── */}
        <div style={{ ...cardS, marginBottom:14 }}>
          <p style={{ color:C.text, fontWeight:900, fontSize:15, marginBottom:14 }}>📅 الحضور والغياب</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10 }}>
            {[
              { label:'أيام الحضور', val:attendance?.present ?? 0, color:C.green   },
              { label:'أيام الغياب', val:attendance?.absent  ?? 0,  color:C.red     },
              { label:'التأخر',      val:attendance?.late    ?? 0,  color:'#D97706' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', padding:'14px 10px', borderRadius:14, background:`${s.color}0D`, border:`1px solid ${s.color}22` }}>
                <p style={{ color:s.color, fontWeight:900, fontSize:24 }}>{s.val}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
              <span style={{ color:C.text, fontWeight:600 }}>نسبة الحضور</span>
              <span style={{ color:C.green, fontWeight:800 }}>{attRate}%</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(0,0,0,0.07)' }}>
              <div style={{ width:`${attRate}%`, height:'100%', borderRadius:4, background:C.green }}/>
            </div>
          </div>
        </div>

        {/* ── Recent Exams ── */}
        <div style={{ ...cardS, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ color:C.text, fontWeight:900, fontSize:15 }}>📝 آخر الامتحانات</p>
            <button onClick={()=>navigate('/student/exams')} style={{ color:C.gold, fontSize:12, fontWeight:700, background:'none', border:'none', cursor:'pointer', ...font }}>عرض الكل</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {!(exams?.recent && exams.recent.length > 0) ? (
              <p style={{ color:C.sub, fontSize:13, textAlign:'center', padding:'16px 0' }}>لا توجد امتحانات حديثة</p>
            ) : exams.recent.map((e,i)=>({ title:e.title??`امتحان ${i+1}`, pct:e.pct, date:e.submitted_at?.slice(0,10)??'—' })).map((e,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background:'#F9FAFB', border:`1px solid ${C.border}` }}>
                <div style={{ width:44, height:44, borderRadius:12, background:e.pct>=85 ? 'rgba(22,163,74,0.1)' : e.pct>=70 ? C.goldBg : 'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontWeight:900, fontSize:14, color:e.pct>=85 ? C.green : e.pct>=70 ? C.gold : C.red }}>{e.pct}%</span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{e.title}</p>
                  <p style={{ color:C.dim, fontSize:11, marginTop:2 }}>{e.date}</p>
                </div>
                <div style={{ width:60, height:6, borderRadius:3, background:'rgba(0,0,0,0.07)' }}>
                  <div style={{ width:`${e.pct}%`, height:'100%', borderRadius:3, background:e.pct>=85 ? C.green : e.pct>=70 ? C.gold : C.red }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Homework Stats ── */}
        <div style={{ ...cardS, marginBottom:14 }}>
          <p style={{ color:C.text, fontWeight:900, fontSize:15, marginBottom:14 }}>📚 الواجبات المنزلية</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
            {[
              { label:'واجبات مُسلَّمة', val:homework?.submitted??0, icon:'✅', color:C.green  },
              { label:'واجبات متأخرة',  val:homework?.late??0,        icon:'⏰', color:'#D97706' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', padding:'14px 10px', borderRadius:14, background:`${s.color}0D`, border:`1px solid ${s.color}22` }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
                <p style={{ color:s.color, fontWeight:900, fontSize:22 }}>{s.val}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
              <span style={{ color:C.text, fontWeight:600 }}>متوسط الدرجات</span>
              <span style={{ color:C.blue, fontWeight:800 }}>{hwAvg}%</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(0,0,0,0.07)' }}>
              <div style={{ width:`${hwAvg}%`, height:'100%', borderRadius:4, background:C.blue }}/>
            </div>
          </div>
        </div>

        {/* ── AI Analysis ── */}
        <div style={{ background:'linear-gradient(135deg,#0D1535,#1B2038)', borderRadius:18, padding:'20px', marginBottom:14, boxShadow:'0 8px 24px rgba(13,21,53,0.45)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:26 }}>🤖</span>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16 }}>التحليل الذكي</p>
            <span style={{ marginRight:'auto', padding:'3px 10px', borderRadius:20, background:C.goldBg, color:C.goldL, fontSize:11, fontWeight:700, border:`1px solid ${C.goldBdr}` }}>AI</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.7, marginBottom:16 }}>
            {myReport
              ? `مستوى الحضور ${attRate}%. متوسط الامتحانات ${examAvg}%. متوسط الواجبات ${hwAvg}%.`
              : 'لا تتوفر بيانات كافية للتحليل بعد.'}
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>navigate('/student/points')}
              style={{ flex:1, padding:'12px', borderRadius:13, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', ...font, boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>
              📊 التقرير الكامل
            </button>
            <button onClick={()=>navigate('/student/study-room')}
              style={{ flex:1, padding:'12px', borderRadius:13, background:'rgba(255,255,255,0.08)', color:'#fff', fontWeight:700, fontSize:13, border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', ...font }}>
              🤖 اسأل معلمي الذكي
            </button>
          </div>
        </div>

      </div>

      {/* ── Bottom Nav ── */}
      <div dir="rtl" style={{ position:'fixed', bottom:0, left:0, right:0, height:BH, background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-around', zIndex:100, boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>
        <button onClick={()=>navigate('/student/dashboard')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span style={{ fontSize:9.5, color:C.sub }}>الرئيسية</span>
        </button>
        <button onClick={()=>navigate('/student/exams')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <span style={{ fontSize:9.5, color:C.sub }}>الامتحانات</span>
        </button>
        <div style={{ position:'relative', top:-12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(160deg,#1B2038,#0D1535)', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer', boxShadow:`0 6px 20px rgba(13,21,53,0.6)`, outline:'none' }}><BrandLogo size={38} /></button>
        </div>
        <button onClick={()=>navigate('/student/messages')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <span style={{ fontSize:20 }}>✉️</span>
          <span style={{ fontSize:9.5, color:C.sub }}>الرسائل</span>
        </button>
        <button onClick={()=>navigate('/student/points')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span style={{ fontSize:9.5, color:C.gold, fontWeight:700 }}>التطور</span>
          <div style={{ width:16, height:2.5, background:C.goldGrad, borderRadius:2 }}/>
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
