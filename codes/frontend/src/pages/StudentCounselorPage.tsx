import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

interface Req {
  id: number;
  subject: string;
  message: string | null;
  status: string;
  response: string | null;
  created_at: string | null;
}

const font = { fontFamily: "'Cairo', sans-serif" };

export default function StudentCounselorPage() {
  const [items, setItems] = useState<Req[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/student/counselor');
      setItems(data.requests ?? []);
    } catch {
      setError('تعذّر التحميل');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/student/counselor', { subject: subject.trim(), message: message.trim() || null });
      setSubject('');
      setMessage('');
      await load();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'تعذّر الإرسال');
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl', padding: '20px 20px 40px', maxWidth: 640 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>مرشد الياقوت الطلابي</h1>
        <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: 13 }}>اكتب مشكلتك واحصل على رد فوري، أو تحدّث مع معلمي الذكي</p>
        <Link to="/student/study-room" style={{ fontSize: 13, fontWeight: 700, color: '#C9952A' }}>← معلمي الذكي</Link>
        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}

        <form onSubmit={(e) => void submit(e)} style={{
          background: '#fff', borderRadius: 16, padding: 16, margin: '16px 0', border: '1px solid #EDE3CE',
        }}>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع الطلب"
            style={inp} />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="تفاصيل (اختياري)" rows={3}
            style={{ ...inp, marginTop: 8, resize: 'vertical' }} />
          <button type="submit" disabled={saving} style={btn}>{saving ? 'جاري...' : 'إرسال طلب إرشاد'}</button>
        </form>

        {items.map((r) => (
          <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE' }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#1B2038' }}>{r.subject}</p>
            {r.message && <p style={{ margin: '6px 0', fontSize: 13, color: '#6B7280' }}>{r.message}</p>}
            {r.response && (
              <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: 'rgba(201,149,42,0.08)' }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#C9952A' }}>الرد</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1B2038', lineHeight: 1.6 }}>{r.response}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
  fontSize: 13, fontFamily: "'Cairo', sans-serif", boxSizing: 'border-box',
};
const btn: React.CSSProperties = {
  marginTop: 10, width: '100%', padding: 12, borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg,#C9952A,#DDAD50)', color: '#1B2038', fontWeight: 800,
  cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
};
