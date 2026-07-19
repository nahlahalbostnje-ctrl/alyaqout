import { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

interface Capsule {
  id: number;
  year: number;
  month: number;
  message: string | null;
  sealed: boolean;
  remind_at: string;
  opened_at: string | null;
}

const MONTHS = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const font = { fontFamily: "'Cairo', sans-serif" };

export default function StudentTimeCapsulePage() {
  const [items, setItems] = useState<Capsule[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/student/time-capsules');
      setItems(data.capsules ?? []);
    } catch {
      setError('تعذّر التحميل');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/student/time-capsules', { message: message.trim() });
      setMessage('');
      await load();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      setError(ex.response?.data?.errors?.month?.[0] || ex.response?.data?.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function openCapsule(id: number) {
    try {
      const { data } = await api.post(`/student/time-capsules/${id}/open`);
      setItems((prev) => prev.map((c) => (c.id === id ? data.capsule : c)));
    } catch {
      setError('ما زالت الكبسولة مغلقة حتى نهاية الشهر');
    }
  }

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl', padding: '20px 20px 40px', maxWidth: 640 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>الكبسولة الزمنية</h1>
        <p style={{ margin: '0 0 18px', color: '#6B7280', fontSize: 13 }}>اكتب هدفاً/رسالة لنفسك هذا الشهر — تُفتح في نهايته</p>
        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}

        <form onSubmit={(e) => void create(e)} style={{
          background: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, border: '1px solid #EDE3CE',
        }}>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="رسالتي لنفسي هذا الشهر..."
            rows={4}
            style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #EDE3CE', fontFamily: "'Cairo', sans-serif", boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={saving} style={{
            marginTop: 10, width: '100%', padding: 12, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#C9952A,#DDAD50)', color: '#1B2038', fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
          }}>{saving ? 'جاري...' : 'كبس الرسالة'}</button>
        </form>

        {loading ? <p style={{ color: '#6B7280' }}>جاري التحميل...</p> : items.map((c) => (
          <div key={c.id} style={{
            background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE',
          }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#1B2038' }}>
              {MONTHS[c.month]} {c.year}
              <span style={{ marginRight: 8, fontSize: 11, color: c.sealed ? '#D97706' : '#16A34A' }}>
                {c.sealed ? 'مغلقة' : 'مفتوحة'}
              </span>
            </p>
            {c.sealed ? (
              <button onClick={() => void openCapsule(c.id)} style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
                background: '#F9FAFB', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 700,
              }}>محاولة الفتح</button>
            ) : (
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#1B2038', lineHeight: 1.6 }}>{c.message}</p>
            )}
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}
