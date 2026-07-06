import { useState, useEffect, useRef } from 'react';
import StudentLayout from '../components/StudentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444',
};

const SUGGESTIONS = [
  { time: 25, label:'25 دقيقة', desc:'Pomodoro الكلاسيكي', recommended: true },
  { time: 45, label:'45 دقيقة', desc:'جلسة عميقة' },
  { time: 60, label:'ساعة كاملة', desc:'للمواضيع الصعبة' },
  { time: 90, label:'90 دقيقة', desc:'جلسة مكثفة' },
];

const BREAK_TIPS = [
  'قم من كرسيك وتمشَّ قليلاً 🚶',
  'اشرب كوب ماء بارد 💧',
  'تمدد لمدة دقيقة 🧘',
  'ابتعد عن الشاشة وانظر للبعيد 👀',
  'تنفس بعمق 5 مرات 🌬️',
];

type Phase = 'idle' | 'studying' | 'break' | 'done';

export default function StudentStudyBuddyPage() {
  const [selected, setSelected] = useState(25);
  const [customTime, setCustomTime] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(25 * 60);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ text:string; time:string }[]>([]);
  const [smartMode, setSmartMode] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [breakTip, setBreakTip] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = (customTime ? parseInt(customTime) : selected) * 60;

  useEffect(() => {
    if (phase === 'studying' || phase === 'break') {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            if (phase === 'studying') {
              setSessions(n => n + 1);
              if (smartMode) {
                setBreakTip(BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)]);
                setPhase('break');
                setSeconds(5 * 60);
              } else {
                setPhase('done');
              }
            } else {
              setPhase('done');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, smartMode]);

  const start = () => {
    setSeconds(totalTime);
    setPhase('studying');
  };

  const pause = () => {
    clearInterval(intervalRef.current!);
    setPhase('idle');
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    setPhase('idle');
    setSeconds(totalTime);
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(p => [{ text:note, time: new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}) }, ...p]);
    setNote('');
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = phase === 'idle' ? 0 : ((totalTime - seconds) / totalTime) * 100;
  const r = 90;
  const circ = 2 * Math.PI * r;

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>صديق الدراسة الفردي ⏱️</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مؤقت ذكي للدراسة مع ملاحظات وتنظيم تلقائي للوقت</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>

          {/* Timer */}
          <div style={{ background:C.card, borderRadius:18, padding:28, border:`1px solid ${C.border}`, boxShadow:C.shadow, textAlign:'center' }}>

            {/* Break alert */}
            {phase === 'break' && (
              <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:12, padding:'12px 16px', marginBottom:18, textAlign:'right' }}>
                <p style={{ color:C.green, fontWeight:700, fontSize:13, marginBottom:4 }}>وقت الاستراحة! 🎉</p>
                <p style={{ color:C.sub, fontSize:12 }}>{breakTip}</p>
              </div>
            )}

            {phase === 'done' && (
              <div style={{ background:C.goldBg, border:`1px solid ${C.goldBdr}`, borderRadius:12, padding:'12px 16px', marginBottom:18 }}>
                <p style={{ color:C.gold, fontWeight:700, fontSize:14 }}>أحسنت! أكملت الجلسة 🏆</p>
                <p style={{ color:C.sub, fontSize:12 }}>جلسات مكتملة: {sessions}</p>
              </div>
            )}

            {/* SVG Timer */}
            <div style={{ position:'relative', width:220, height:220, margin:'0 auto 20px' }}>
              <svg width="220" height="220" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="110" cy="110" r={r} fill="none" stroke="#EDE3CE" strokeWidth="10" />
                <circle cx="110" cy="110" r={r} fill="none"
                  stroke={phase==='break' ? C.green : C.gold} strokeWidth="10"
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - progress / 100)}
                  strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <p style={{ color:C.text, fontWeight:900, fontSize:42, lineHeight:1, fontFamily:'monospace' }}>{mm}:{ss}</p>
                <p style={{ color:C.dim, fontSize:12, marginTop:4 }}>
                  {phase==='idle' ? 'جاهز للدراسة' : phase==='studying' ? 'جارٍ الدراسة...' : phase==='break' ? 'استراحة' : 'انتهت الجلسة!'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20 }}>
              {phase === 'idle' || phase === 'done' ? (
                <button onClick={start} style={{ padding:'11px 28px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>
                  {phase === 'done' ? 'جلسة جديدة' : 'ابدأ الدراسة'}
                </button>
              ) : (
                <>
                  <button onClick={pause} style={{ padding:'11px 20px', borderRadius:12, background:'#F3F4F6', color:C.text, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>إيقاف مؤقت</button>
                  <button onClick={reset} style={{ padding:'11px 20px', borderRadius:12, background:'rgba(239,68,68,0.1)', color:C.red, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>إعادة</button>
                </>
              )}
            </div>

            {/* Time Presets */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(70px,1fr))', gap:6, marginBottom:16 }}>
              {SUGGESTIONS.map((s,i) => (
                <div key={i} onClick={() => { setSelected(s.time); setSeconds(s.time*60); if(phase!=='idle') reset(); }}
                  style={{ padding:'8px 4px', borderRadius:10, border:`1px solid ${selected===s.time ? C.gold : C.border}`, background: selected===s.time ? C.goldBg : '#fff', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                  <p style={{ color: selected===s.time ? C.gold : C.text, fontWeight:700, fontSize:12 }}>{s.label}</p>
                  {s.recommended && <span style={{ fontSize:9, color:C.green, fontWeight:600 }}>موصى</span>}
                </div>
              ))}
            </div>

            {/* Custom Time */}
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
              <input type="number" value={customTime} onChange={e=>setCustomTime(e.target.value)} placeholder="وقت مخصص (دقيقة)" style={{ flex:1, padding:'8px 12px', borderRadius:9, border:`1px solid ${C.border}`, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none' }} />
              <button onClick={() => { if(customTime) setSeconds(parseInt(customTime)*60); }} style={{ padding:'8px 14px', borderRadius:9, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تعيين</button>
            </div>

            {/* Smart Mode Toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#F9FAFB', borderRadius:10 }}>
              <div>
                <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>الوضع الذكي 🧠</p>
                <p style={{ color:C.dim, fontSize:11 }}>اقتراح فترات راحة تلقائياً</p>
              </div>
              <div onClick={() => setSmartMode(p => !p)} style={{ width:44, height:24, borderRadius:12, cursor:'pointer', background: smartMode ? C.gold : '#D1D5DB', position:'relative', transition:'background 0.2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, right: smartMode ? 22 : 4, transition:'right 0.2s' }} />
              </div>
            </div>

            {/* Session counter */}
            <div style={{ marginTop:12, display:'flex', gap:6, justifyContent:'center' }}>
              {Array.from({length: Math.max(4, sessions + 1)}).map((_, i) => (
                <div key={i} style={{ width:24, height:8, borderRadius:4, background: i < sessions ? C.gold : '#EDE3CE' }} />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', flexDirection:'column' }}>
            <h3 style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:14 }}>ملاحظات الجلسة 📝</h3>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="أضف ملاحظة سريعة..." rows={3} style={{ flex:1, padding:'10px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none' }}
                onKeyDown={e=>{ if(e.key==='Enter' && e.ctrlKey) addNote(); }} />
            </div>
            <button onClick={addNote} style={{ width:'100%', padding:'9px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', marginBottom:16 }}>
              إضافة ملاحظة (Ctrl+Enter)
            </button>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
              {notes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:C.dim, fontSize:13 }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>✏️</p>
                  <p>لا توجد ملاحظات بعد</p>
                </div>
              ) : notes.map((n,i) => (
                <div key={i} style={{ background:'#F9FAFB', borderRadius:10, padding:'10px 14px', border:`1px solid ${C.border}` }}>
                  <p style={{ color:C.text, fontSize:13, lineHeight:1.6 }}>{n.text}</p>
                  <p style={{ color:C.dim, fontSize:10, marginTop:4 }}>{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
