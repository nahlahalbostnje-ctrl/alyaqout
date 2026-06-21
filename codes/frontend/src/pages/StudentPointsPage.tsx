import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyPoints, fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

const SEMESTERS = ['الفصل الدراسي الثاني', 'الفصل الدراسي الأول', 'العام الكامل'] as const;

const MOCK_RESULTS = [
  { subject:'الرياضيات',         pct:95, grade:'ممتاز',    color:'#16A34A' },
  { subject:'اللغة الإنجليزية',  pct:88, grade:'جيد جداً', color:'#2563EB' },
  { subject:'العلوم',             pct:92, grade:'ممتاز',    color:'#16A34A' },
  { subject:'اللغة العربية',      pct:90, grade:'ممتاز',    color:'#16A34A' },
  { subject:'التربية الإسلامية', pct:94, grade:'ممتاز',    color:'#16A34A' },
];

const GRADE_BADGE: Record<string, { bg:string; color:string }> = {
  'ممتاز':    { bg:'rgba(22,163,74,0.1)',   color:'#16A34A' },
  'جيد جداً': { bg:'rgba(37,99,235,0.1)',   color:'#2563EB' },
  'جيد':      { bg:'rgba(217,119,6,0.1)',   color:'#D97706' },
  'مقبول':    { bg:'rgba(220,38,38,0.1)',   color:'#DC2626' },
};

function gradeFromPct(pct: number) {
  if (pct >= 90) return 'ممتاز';
  if (pct >= 80) return 'جيد جداً';
  if (pct >= 70) return 'جيد';
  return 'مقبول';
}

export default function StudentPointsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { totalPoints } = useAppSelector(s => s.gamification);
  const [sem, setSem]     = useState(0);
  const [picker, setPicker] = useState(false);

  useEffect(() => { dispatch(fetchMyPoints()); dispatch(fetchLeaderboard()); }, [dispatch]);

  const overall = Math.round(MOCK_RESULTS.reduce((a,s)=>a+s.pct,0)/MOCK_RESULTS.length);

  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif", paddingBottom:BH+16 }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>النتائج</h1>
        <div style={{ width:36 }} />
      </div>

      <div style={{ padding:'14px 16px 0' }}>

        {/* Semester Picker */}
        <div style={{ position:'relative', marginBottom:16 }}>
          <button onClick={()=>setPicker(p=>!p)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:12, background:C.card, border:`1px solid ${C.border}`, cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, color:C.text, fontWeight:600, boxShadow:C.shadow }}>
            <span>{SEMESTERS[sem]}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {picker && (
            <div style={{ position:'absolute', top:'110%', right:0, background:C.card, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:`1px solid ${C.border}`, zIndex:50, minWidth:200 }}>
              {SEMESTERS.map((s,i) => (
                <button key={i} onClick={()=>{ setSem(i); setPicker(false); }}
                  style={{ width:'100%', padding:'11px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, color:sem===i?C.gold:C.text, fontWeight:sem===i?700:500, textAlign:'right' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overall Grade */}
        <div style={{ background:C.card, borderRadius:20, padding:'24px', marginBottom:14, boxShadow:C.shadow, border:`1px solid ${C.border}`, textAlign:'center' }}>
          <div style={{ width:70, height:70, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:36, boxShadow:'0 6px 18px rgba(201,149,42,0.4)' }}>🏅</div>
          <p style={{ color:C.sub, fontSize:12.5, marginBottom:5 }}>المعدل العام</p>
          <p style={{ color:C.navy2, fontWeight:900, fontSize:40, lineHeight:1, marginBottom:8 }}>{overall}%</p>
          <span style={{ display:'inline-block', padding:'5px 18px', borderRadius:20, background:'rgba(22,163,74,0.1)', color:'#16A34A', fontSize:14, fontWeight:700 }}>ممتاز</span>
        </div>

        {/* Subject Results */}
        <div style={{ background:C.card, borderRadius:20, overflow:'hidden', boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:16 }}>
          {MOCK_RESULTS.map((s,i) => {
            const badge = GRADE_BADGE[s.grade] ?? GRADE_BADGE['ممتاز'];
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderBottom:i<MOCK_RESULTS.length-1?`1px solid ${C.border}`:'none' }}>
                <div style={{ width:38, height:38, borderRadius:12, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.navy2, fontWeight:700, fontSize:14 }}>{s.subject}</p>
                </div>
                <div style={{ textAlign:'center', marginLeft:10 }}>
                  <p style={{ color:C.navy2, fontWeight:800, fontSize:17, lineHeight:1, marginBottom:3 }}>{s.pct}%</p>
                </div>
                <span style={{ padding:'4px 12px', borderRadius:20, background:badge.bg, color:badge.color, fontSize:11.5, fontWeight:700 }}>{s.grade}</span>
              </div>
            );
          })}
        </div>

        {/* Download */}
        <button style={{ width:'100%', padding:'14px', borderRadius:15, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(201,149,42,0.4)', marginBottom:16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          تحميل التقرير
        </button>

        {/* Points summary */}
        <div style={{ background:C.card, borderRadius:18, padding:'16px 18px', boxShadow:C.shadow, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:32 }}>⭐</span>
          <div>
            <p style={{ color:C.sub, fontSize:12, marginBottom:2 }}>مجموع نقاطك</p>
            <p style={{ color:C.navy2, fontWeight:900, fontSize:22 }}>{(totalPoints||5420).toLocaleString()} نقطة</p>
          </div>
          <button onClick={()=>{}} style={{ marginRight:'auto', padding:'8px 16px', borderRadius:12, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:12, cursor:'pointer' }}>
            متجر المكافآت
          </button>
        </div>
      </div>

      <StudentBottomNav cur="/student/points" />
    </div>
  );
}
