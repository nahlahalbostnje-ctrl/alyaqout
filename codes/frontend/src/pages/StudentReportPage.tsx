import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyReport } from '../features/student/reportSlice';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

const SUBJECTS = [
  { name:'الرياضيات',         pct:90, color:'#4F46E5' },
  { name:'اللغة الإنجليزية',  pct:87, color:'#2563EB' },
  { name:'العلوم',             pct:85, color:'#059669' },
  { name:'اللغة العربية',      pct:76, color:'#D97706' },
  { name:'التربية الإسلامية', pct:92, color:'#DC2626' },
];

const PERIODS = ['هذا الشهر', 'الفصل الأول', 'الفصل الثاني', 'العام الكامل'] as const;

function CircProgress({ pct, size = 130 }: { pct: number; size?: number }) {
  const r = size/2 - 12;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEE8D8" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gold} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ} strokeLinecap="round" />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:C.navy2, fontWeight:900, fontSize:28, lineHeight:1 }}>{pct}%</span>
        <span style={{ color:C.sub, fontSize:11, marginTop:4, textAlign:'center', lineHeight:1.3 }}>المستوى العام</span>
      </div>
    </div>
  );
}

export default function StudentReportPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { report } = useAppSelector(s => s.studentReport);
  const [period, setPeriod] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { dispatch(fetchMyReport()); }, [dispatch]);

  const subjects = (report?.subjects ?? []).length > 0
    ? (report?.subjects ?? []).map((s: any) => ({ name: s.subject_name ?? s.name, pct: Math.round(s.percentage ?? s.score ?? 80), color: '#C9952A' }))
    : SUBJECTS;

  const overall = Math.round(subjects.reduce((a: number, s: { pct: number }) => a + s.pct, 0) / subjects.length) || 87;

  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif", paddingBottom:BH+16 }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>مستوى التطور</h1>
        <div style={{ width:36 }} />
      </div>

      <div style={{ padding:'14px 16px 0' }}>

        {/* Filter */}
        <div style={{ position:'relative', marginBottom:16 }}>
          <button onClick={()=>setShowPicker(p=>!p)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:12, background:C.card, border:`1px solid ${C.border}`, cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, color:C.text, fontWeight:600, boxShadow:C.shadow }}>
            <span>{PERIODS[period]}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {showPicker && (
            <div style={{ position:'absolute', top:'110%', right:0, background:C.card, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:`1px solid ${C.border}`, zIndex:50, minWidth:160 }}>
              {PERIODS.map((p,i) => (
                <button key={i} onClick={()=>{ setPeriod(i); setShowPicker(false); }}
                  style={{ width:'100%', padding:'11px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, color:period===i?C.gold:C.text, fontWeight:period===i?700:500, textAlign:'right' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Card */}
        <div style={{ background:C.card, borderRadius:20, padding:'20px', marginBottom:14, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            {/* Subjects */}
            <div style={{ flex:1 }}>
              {subjects.map((s: { name: string; pct: number; color: string }, i: number) => (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                    <span style={{ color:C.text, fontWeight:600 }}>{s.name}</span>
                    <span style={{ color:s.color, fontWeight:700 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height:7, borderRadius:4, background:`${s.color}18` }}>
                    <div style={{ height:'100%', width:`${s.pct}%`, borderRadius:4, background:`linear-gradient(90deg,${s.color},${s.color}bb)`, transition:'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Circle */}
            <CircProgress pct={overall} />
          </div>
        </div>

        {/* AI Analysis Card */}
        <div style={{ background:'linear-gradient(135deg,#0D1535,#1B2038)', borderRadius:20, padding:'18px 20px', marginBottom:14, boxShadow:'0 8px 24px rgba(13,21,53,0.45)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:24 }}>🤖</span>
            <p style={{ color:'#fff', fontWeight:800, fontSize:15 }}>تحليل ذكي</p>
          </div>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.65, marginBottom:16 }}>
            أنت تتقدم بشكل رائع! استمر في نفس المستوى. ننصحك بمراجعة دروس الكسور في الرياضيات لتحسين نتيجتك.
          </p>
          <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'12px', borderRadius:13, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>
            عرض التقرير الكامل
          </button>
        </div>
      </div>

      <StudentBottomNav cur="/student/report" />
    </div>
  );
}
