import { useCallback, useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

interface Child { id: number; name: string }
interface Req {
  id: number;
  subject: string;
  message: string | null;
  response: string | null;
  student: { id: number; name: string } | null;
  created_at: string | null;
}

export default function ParentCounselingPage() {
  const [items, setItems] = useState<Req[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([
      api.get('/parent/counseling'),
      api.get('/parent/children'),
    ]);
    setItems(r.data.requests ?? []);
    const kids = c.data.data ?? [];
    setChildren(Array.isArray(kids) ? kids.map((k: Child) => ({ id: k.id, name: k.name })) : []);
  }, []);

  useEffect(() => { void load().catch(() => setError('تعذّر التحميل')); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/parent/counseling', {
        student_id: studentId ? Number(studentId) : null,
        subject: subject.trim(),
        message: message.trim() || null,
      });
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
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", padding: 24, maxWidth: 640 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>طلب جلسة إرشاد</h1>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>احجز متابعة تربوية لأبنائك</p>
        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}
        <form onSubmit={(e) => void submit(e)} style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #EDE3CE', marginBottom: 16 }}>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={inp}>
            <option value="">كل الأبناء / عام</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع الجلسة" style={{ ...inp, marginTop: 8 }} />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="التفاصيل" rows={3} style={{ ...inp, marginTop: 8, resize: 'vertical' }} />
          <button type="submit" disabled={saving} style={btn}>{saving ? '...' : 'إرسال'}</button>
        </form>
        {items.map((r) => (
          <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE' }}>
            <p style={{ margin: 0, fontWeight: 800 }}>{r.subject}{r.student ? ` · ${r.student.name}` : ''}</p>
            {r.response && <p style={{ margin: '8px 0 0', fontSize: 13, background: 'rgba(201,149,42,0.08)', padding: 10, borderRadius: 10 }}>{r.response}</p>}
          </div>
        ))}
      </div>
    </ParentLayout>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE', fontFamily: "'Cairo', sans-serif", boxSizing: 'border-box' };
const btn: React.CSSProperties = { marginTop: 10, width: '100%', padding: 12, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C59341,#D4A65A)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" };
