import { useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';

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

interface QuizResult {
  id: number; student: string; quiz: string; subject: string;
  score: number; maxScore: number; hasEssay: boolean; essayGraded: boolean;
  status: 'struggling' | 'average' | 'excellent';
}

const MOCK: QuizResult[] = [
  { id:1, student:'أحمد محمد',   quiz:'اختبار الوحدة 3',        subject:'الرياضيات',      score:45,  maxScore:100, hasEssay:false, essayGraded:true,  status:'struggling' },
  { id:2, student:'سارة علي',    quiz:'اختبار الفصل الثاني',    subject:'اللغة العربية',  score:82,  maxScore:100, hasEssay:true,  essayGraded:false, status:'average' },
  { id:3, student:'خالد أحمد',   quiz:'اختبار الكيمياء',        subject:'العلوم',          score:91,  maxScore:100, hasEssay:false, essayGraded:true,  status:'excellent' },
  { id:4, student:'نورة سلمان',  quiz:'Grammar Test Unit 5',    subject:'الإنجليزية',     score:38,  maxScore:100, hasEssay:true,  essayGraded:false, status:'struggling' },
  { id:5, student:'فيصل ناصر',  quiz:'اختبار الوحدة 3',        subject:'الرياضيات',      score:74,  maxScore:100, hasEssay:false, essayGraded:true,  status:'average' },
  { id:6, student:'ريم الشمري', quiz:'اختبار الفصل الثاني',    subject:'اللغة العربية',  score:95,  maxScore:100, hasEssay:true,  essayGraded:true,  status:'excellent' },
];

const STATUS_MAP = {
  struggling:{ label:'متعثر',  color:C.red,   bg:C.redBg },
  average:   { label:'متوسط',  color:C.amber, bg:C.amberBg },
  excellent: { label:'متميز',  color:C.green, bg:C.greenBg },
};

function Ring({ pct, size=80, color=C.gold }: { pct:number; size?:number; color?:string }) {
  const r = (size-10)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE3CE" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"/>
    </svg>
  );
}

export default function SupervisorQuizMonitoringPage() {
  const [alertSent, setAlertSent] = useState<Set<number>>(new Set());
  const [essayScores, setEssayScores] = useState<Record<number,string>>({});
  const [essayApproved, setEssayApproved] = useState<Set<number>>(new Set());

  const avg = Math.round(MOCK.reduce((s,r)=>s+r.score,0)/MOCK.length);
  const struggling = MOCK.filter(r=>r.status==='struggling').length;
  const needEssay = MOCK.filter(r=>r.hasEssay && !r.essayGraded && !essayApproved.has(r.id)).length;

  const sendAlert = (id:number) => setAlertSent(prev=>new Set([...prev,id]));
  const approveEssay = (id:number) => setEssayApproved(prev=>new Set([...prev,id]));

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>غرف الاختبارات والتقييم ✏️</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مراقبة نتائج الاختبارات واعتماد الأسئلة المقالية وتتبع الطلاب المتعثرين</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:20 }}>
          {[
            { label:'متوسط الدرجات', value:`${avg}%`, icon:'📊', color:C.gold, bg:C.goldBg },
            { label:'اختبارات مُقدَّمة', value:MOCK.length, icon:'📋', color:C.navy, bg:'rgba(13,30,58,0.06)' },
            { label:'طلاب متعثرون', value:struggling, icon:'⚠️', color:C.red, bg:C.redBg },
            { label:'مقالي يحتاج مراجعة', value:needEssay, icon:'✍️', color:C.amber, bg:C.amberBg },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'16px 18px', boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <span style={{ padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, fontSize:11, fontWeight:700 }}>الكل</span>
              </div>
              <p style={{ color:C.text, fontWeight:900, fontSize:22 }}>{s.value}</p>
              <p style={{ color:C.sub, fontSize:12 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>

          {/* Results table */}
          <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>📋</span>
              <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>نتائج الاختبارات</span>
            </div>
            <div style={{ maxHeight:480, overflowY:'auto' }}>
              {MOCK.map((r, i) => {
                const st = STATUS_MAP[r.status];
                const pct = Math.round(r.score/r.maxScore*100);
                const color = pct>=80?C.green:pct>=60?C.amber:C.red;
                return (
                  <div key={r.id} style={{ padding:'14px 20px', borderBottom: i<MOCK.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <Ring pct={pct} size={56} color={color}/>
                      <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:C.text, fontWeight:900, fontSize:11 }}>{pct}%</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{r.student}</p>
                      <p style={{ color:C.dim, fontSize:11.5 }}>{r.quiz} · {r.subject}</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                      <span style={{ padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
                      {r.status==='struggling' && !alertSent.has(r.id) && (
                        <button onClick={()=>sendAlert(r.id)} style={{ padding:'3px 9px', borderRadius:8, border:'none', background:C.redBg, color:C.red, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>إرسال تنبيه</button>
                      )}
                      {alertSent.has(r.id) && <span style={{ color:C.green, fontSize:11, fontWeight:600 }}>✓ تم الإرسال</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Essay grading */}
          <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>✍️</span>
              <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>الأسئلة المقالية — تصحيح يدوي</span>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              {MOCK.filter(r=>r.hasEssay).map(r => {
                const done = r.essayGraded || essayApproved.has(r.id);
                return (
                  <div key={r.id} style={{ padding:14, borderRadius:12, border:`1px solid ${done?'rgba(16,185,129,0.25)':C.border}`, background: done?C.greenBg:'#FDFAF4' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:done?0:10 }}>
                      <div>
                        <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{r.student}</p>
                        <p style={{ color:C.dim, fontSize:11.5 }}>{r.quiz}</p>
                      </div>
                      {done ? (
                        <span style={{ color:C.green, fontSize:12, fontWeight:700 }}>✓ تم التصحيح</span>
                      ) : (
                        <span style={{ padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:C.amberBg, color:C.amber }}>ينتظر</span>
                      )}
                    </div>
                    {!done && (
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <input value={essayScores[r.id]??''} onChange={e=>setEssayScores(s=>({...s,[r.id]:e.target.value}))}
                          placeholder="الدرجة" maxLength={3}
                          style={{ width:70, padding:'6px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:'#fff', color:C.text, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none', textAlign:'center' }}/>
                        <button onClick={()=>approveEssay(r.id)} style={{
                          padding:'6px 14px', borderRadius:10, border:'none', background:C.goldGrad,
                          color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
                        }}>اعتماد الدرجة</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
