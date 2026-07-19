import { useCallback, useEffect, useRef, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

const C = {
  gold: '#C9952A', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', card: '#fff', border: 'rgba(0,0,0,0.07)',
};
const font = { fontFamily: "'Cairo', sans-serif" };

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function smartBreak(studySec: number) {
  // 5 min break per 25 min study, min 3 max 15
  const mins = Math.round(studySec / 60);
  return Math.min(15, Math.max(3, Math.round(mins / 5))) * 60;
}

export default function StudentStudyBuddyPage() {
  const [mode, setMode] = useState<'idle' | 'study' | 'break'>('idle');
  const [seconds, setSeconds] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [smart, setSmart] = useState(true);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<{ id: number; duration_seconds: number; notes: string | null; created_at: string | null }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const tick = useRef<number | null>(null);
  const startedAt = useRef<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/student/study-buddy');
      setHistory(data.sessions ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (mode === 'idle') return;
    tick.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(tick.current!);
          if (mode === 'study') {
            const studyElapsed = elapsed + (startedAt.current ? Math.floor((Date.now() - startedAt.current.getTime()) / 1000) : 0);
            void finishStudy(studyElapsed);
            if (smart) {
              setMode('break');
              setSeconds(smartBreak(25 * 60));
              return smartBreak(25 * 60);
            }
            setMode('idle');
            return 25 * 60;
          }
          setMode('idle');
          setMsg('انتهت فترة الراحة — جاهز لجلسة جديدة');
          return 25 * 60;
        }
        return s - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => { if (tick.current) window.clearInterval(tick.current); };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function finishStudy(duration: number) {
    try {
      await api.post('/student/study-buddy', {
        duration_seconds: Math.max(60, duration),
        break_seconds: smart ? smartBreak(duration) : 0,
        notes: notes.trim() || null,
        smart_mode: smart,
        started_at: startedAt.current?.toISOString() ?? null,
        ended_at: new Date().toISOString(),
      });
      setMsg('تم حفظ جلسة الدراسة');
      setNotes('');
      await load();
    } catch {
      setMsg('تعذّر حفظ الجلسة');
    }
  }

  function start() {
    startedAt.current = new Date();
    setElapsed(0);
    setSeconds(25 * 60);
    setMode('study');
    setMsg(null);
  }

  function stop() {
    if (tick.current) window.clearInterval(tick.current);
    if (mode === 'study' && elapsed >= 60) void finishStudy(elapsed);
    setMode('idle');
    setSeconds(25 * 60);
  }

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl', padding: '20px 20px 40px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: C.text }}>صديق الدراسة الفردي</h1>
        <p style={{ margin: '0 0 18px', color: C.sub, fontSize: 13 }}>مؤقت تركيز 25 دقيقة مع ملاحظات ووضع ذكي للراحة</p>
        {msg && <p style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{msg}</p>}

        <div style={{
          background: C.card, borderRadius: 18, padding: 24, border: `1px solid ${C.border}`,
          textAlign: 'center', marginBottom: 16, boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: C.sub, fontWeight: 700 }}>
            {mode === 'study' ? 'جلسة تركيز' : mode === 'break' ? 'استراحة' : 'جاهز للبدء'}
          </p>
          <p style={{ margin: '12px 0', fontSize: 56, fontWeight: 900, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(seconds)}
          </p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14 }}>
            <input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} disabled={mode !== 'idle'} />
            وضع ذكي (يقترح راحة بعد الجلسة)
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {mode === 'idle' ? (
              <button onClick={start} style={btnPrimary}>ابدأ التركيز</button>
            ) : (
              <button onClick={stop} style={btnOutline}>إيقاف وحفظ</button>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات الجلسة..."
            rows={3}
            style={{
              width: '100%', marginTop: 16, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`,
              fontFamily: "'Cairo', sans-serif", fontSize: 13, boxSizing: 'border-box',
            }}
          />
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>آخر الجلسات</h3>
        {history.length === 0 ? (
          <p style={{ color: C.sub, fontSize: 13 }}>لا جلسات محفوظة بعد</p>
        ) : history.map((s) => (
          <div key={s.id} style={{
            background: C.card, borderRadius: 12, padding: 12, marginBottom: 8, border: `1px solid ${C.border}`,
          }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.text }}>
              {Math.round(s.duration_seconds / 60)} دقيقة
              {s.created_at ? ` · ${new Date(s.created_at).toLocaleDateString('ar-EG')}` : ''}
            </p>
            {s.notes && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.sub }}>{s.notes}</p>}
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  color: '#1B2038', fontWeight: 800, cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
};
const btnOutline: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: '#fff',
  color: '#EF4444', fontWeight: 800, cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
};
