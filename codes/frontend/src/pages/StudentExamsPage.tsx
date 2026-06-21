import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentExams, loadExam, submitExam, clearActiveExam } from '../features/student/examSlice';
import type { ExamQuestionItem } from '../features/student/examSlice';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function Countdown({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const [secs, setSecs] = useState(minutes * 60);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setSecs(p => { if (p <= 1) { clearInterval(ref.current!); onExpire(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [onExpire]);
  const m = Math.floor(secs / 60); const s = secs % 60;
  return <span style={{ fontFamily:'monospace', fontSize:22, fontWeight:800, color:secs<=60?C.red:C.gold }}>{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>;
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QCard({ q, idx, answer, onChange }: { q: ExamQuestionItem; idx: number; answer: string; onChange: (v: string) => void }) {
  return (
    <div style={{ background:C.card, borderRadius:16, padding:'16px 18px', marginBottom:12, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
      <p style={{ color:C.sub, fontSize:11, marginBottom:6 }}>السؤال {idx+1}</p>
      <p style={{ color:C.text, fontWeight:700, fontSize:14, marginBottom:12, lineHeight:1.55 }}>{q.question_text}</p>
      {q.type === 'mcq' && q.choices?.map((ch,ci) => (
        <label key={ci} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:11, marginBottom:7, cursor:'pointer', background:answer===ch?C.goldBg:C.bg, border:`1.5px solid ${answer===ch?C.gold:C.border}`, transition:'all 0.15s' }}>
          <input type="radio" name={`q${idx}`} value={ch} checked={answer===ch} onChange={()=>onChange(ch)} style={{ accentColor:C.gold }} />
          <span style={{ color:C.text, fontSize:13 }}>{ch}</span>
        </label>
      ))}
      {q.type === 'true_false' && ['صح','خطأ'].map(v => (
        <label key={v} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:11, marginBottom:7, cursor:'pointer', background:answer===v?C.goldBg:C.bg, border:`1.5px solid ${answer===v?C.gold:C.border}`, transition:'all 0.15s' }}>
          <input type="radio" name={`q${idx}`} value={v} checked={answer===v} onChange={()=>onChange(v)} style={{ accentColor:C.gold }} />
          <span style={{ color:C.text, fontSize:13 }}>{v}</span>
        </label>
      ))}
      {q.type === 'essay' && (
        <textarea value={answer} onChange={e=>onChange(e.target.value)} rows={4}
          style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:11, padding:'10px 14px', fontSize:13, color:C.text, background:C.bg, resize:'none', outline:'none', fontFamily:"'Cairo',sans-serif", boxSizing:'border-box' }}
          placeholder="اكتب إجابتك هنا..." />
      )}
    </div>
  );
}

const EXAM_ICONS: Record<string, { emoji: string; bg: string }> = {
  'الرياضيات':         { emoji:'π', bg:'#EDE9FE' },
  'اللغة الإنجليزية': { emoji:'EN', bg:'#DBEAFE' },
  'العلوم':            { emoji:'🧪', bg:'#D1FAE5' },
  'اللغة العربية':     { emoji:'ع', bg:'#FEF3C7' },
  'التربية الإسلامية':{ emoji:'☽', bg:'#FEE2E2' },
};

function examIcon(subject: string) {
  const s = Object.keys(EXAM_ICONS).find(k => subject?.includes(k.split(' ')[0]));
  return s ? EXAM_ICONS[s] : { emoji:'📝', bg:'#F3F4F6' };
}

const TABS = ['القادمة', 'المنتهية', 'التجريبية'] as const;
type Tab = typeof TABS[number];

export default function StudentExamsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { exams, loading, submitting, activeExam } = useAppSelector(s => s.studentExam);
  const [tab, setTab] = useState<Tab>('القادمة');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => { dispatch(fetchStudentExams()); }, [dispatch]);

  const handleSubmit = async () => {
    if (!activeExam) return;
    const formatted = (activeExam.questions ?? []).map((q, i) => ({ question_id: q.id ?? i, answer: answers[i] ?? '' }));
    await dispatch(submitExam({ examId: activeExam.exam_id, answers: formatted }));
    setAnswers({});
  };

  // ── Active exam view ──────────────────────────────────────────────────────
  if (activeExam) {
    return (
      <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif" }}>
        <div style={{ background:C.navy2, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:15 }}>{activeExam.exam_title}</p>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Countdown minutes={activeExam.duration_minutes ?? 60} onExpire={handleSubmit} />
            <button onClick={()=>dispatch(clearActiveExam())} style={{ color:'rgba(255,255,255,0.55)', fontSize:20, background:'none', border:'none', cursor:'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'14px 16px', paddingBottom:90 }}>
          {(activeExam.questions ?? []).map((q,i) => (
            <QCard key={i} q={q} idx={i} answer={answers[i]??''} onChange={v=>setAnswers(p=>({...p,[i]:v}))} />
          ))}
        </div>
        <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px', background:C.card, borderTop:`1px solid ${C.border}` }}>
          <button onClick={handleSubmit} disabled={submitting} style={{ width:'100%', padding:'13px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', opacity:submitting?0.7:1 }}>
            {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
          </button>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  const filtered = exams.filter(e =>
    tab === 'القادمة'    ? e.status === 'scheduled' || !e.status :
    tab === 'المنتهية'   ? e.status === 'ended' || e.status === 'submitted' :
    e.status === 'trial'
  );

  const MOCK_EXAMS = [
    { id:1, subject_name:'الرياضيات',         date:'25/05/2026', time:'10:00 صباحاً', duration:60  },
    { id:2, subject_name:'اللغة الإنجليزية',  date:'26/05/2026', time:'11:00 صباحاً', duration:60  },
    { id:3, subject_name:'العلوم',             date:'27/05/2026', time:'09:00 صباحاً', duration:30  },
  ];

  const display = filtered.length > 0 ? filtered : (tab === 'القادمة' ? MOCK_EXAMS : []);

  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif", paddingBottom:BH+16 }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>الامتحانات</h1>
        <div style={{ width:36 }} />
      </div>

      {/* Tabs */}
      <div style={{ background:C.card, padding:'0 16px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:4 }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'12px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:tab===t?700:500, color:tab===t?C.gold:C.sub, borderBottom:tab===t?`2.5px solid ${C.gold}`:'2.5px solid transparent', transition:'all 0.2s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Exam Cards */}
      <div style={{ padding:'14px 16px' }}>
        {loading && <p style={{ color:C.dim, textAlign:'center', padding:'40px 0', fontSize:14 }}>جاري التحميل...</p>}
        {!loading && display.length === 0 && <p style={{ color:C.dim, textAlign:'center', padding:'40px 0', fontSize:14 }}>لا توجد امتحانات</p>}
        {display.map((exam: any, i: number) => {
          const icon = examIcon(exam.subject_name ?? exam.title ?? '');
          return (
            <div key={i} style={{ background:C.card, borderRadius:18, padding:'16px 18px', marginBottom:12, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:icon.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:icon.emoji.length===1&&!/\d/.test(icon.emoji)?20:14, fontWeight:800, color:'#1B2038', flexShrink:0 }}>
                  {icon.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.navy2, fontWeight:800, fontSize:15, marginBottom:4 }}>{exam.subject_name ?? exam.title}</p>
                  {exam.date && <p style={{ color:C.sub, fontSize:12, marginBottom:2 }}>{exam.date} • {exam.time ?? ''}</p>}
                  {exam.scheduled_at && <p style={{ color:C.sub, fontSize:12, marginBottom:2 }}>{new Date(exam.scheduled_at).toLocaleString('ar-EG')}</p>}
                  <p style={{ color:C.dim, fontSize:11.5 }}>مدة الامتحان: {exam.duration ?? exam.duration_minutes} دقيقة</p>
                </div>
              </div>
              <button
                onClick={()=>{ if(exam.id) dispatch(loadExam(exam.id)); }}
                style={{ width:'100%', padding:'11px', borderRadius:13, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13.5, border:'none', cursor:'pointer', boxShadow:'0 3px 12px rgba(201,149,42,0.35)' }}>
                بدء الامتحان
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Button */}
      <div style={{ padding:'0 16px 16px' }}>
        <button style={{ width:'100%', padding:'13px', borderRadius:14, background:C.card, border:`1.5px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          عرض كل الامتحانات
        </button>
      </div>

      <StudentBottomNav cur="/student/exams" />
    </div>
  );
}
