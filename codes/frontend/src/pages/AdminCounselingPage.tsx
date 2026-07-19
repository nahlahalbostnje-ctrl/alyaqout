import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

export default function AdminCounselingPage() {
  const [items, setItems] = useState<Array<{
    id: number; role: string; subject: string; message: string | null; response: string | null;
    user: { name: string; role: string } | null; student: { name: string } | null;
  }>>([]);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [reply, setReply] = useState('');

  const load = () => api.get('/admin/counseling').then((r) => setItems(r.data.requests ?? []));
  useEffect(() => { void load(); }, []);

  async function send(id: number) {
    if (!reply.trim()) return;
    await api.post(`/admin/counseling/${id}/respond`, { response: reply.trim() });
    setReplyId(null);
    setReply('');
    await load();
  }

  return (
    <AdminLayout>
      <div className="p-8" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100%' }} dir="rtl">
        <h1 style={{ fontWeight: 900, fontSize: 22, color: '#1B2038' }}>طلبات الإرشاد</h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>من الطلاب وأولياء الأمور</p>
        {items.map((r) => (
          <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE' }}>
            <p style={{ margin: 0, fontWeight: 800 }}>{r.subject}
              <span style={{ fontSize: 11, color: '#6B7280', marginRight: 8 }}>
                {r.role === 'parent' ? 'ولي أمر' : 'طالب'} · {r.user?.name}
                {r.student ? ` · ${r.student.name}` : ''}
              </span>
            </p>
            {r.message && <p style={{ fontSize: 13, color: '#6B7280' }}>{r.message}</p>}
            {r.response && <p style={{ fontSize: 13, background: '#F9FAFB', padding: 8, borderRadius: 8 }}>{r.response}</p>}
            {replyId === r.id ? (
              <div style={{ marginTop: 8 }}>
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #EDE3CE', fontFamily: "'Cairo', sans-serif" }} />
                <button onClick={() => void send(r.id)} style={{ marginTop: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#C59341', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>إرسال رد</button>
              </div>
            ) : (
              <button onClick={() => { setReplyId(r.id); setReply(r.response ?? ''); }} style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#C59341', background: 'none', border: 'none', cursor: 'pointer' }}>رد / تحديث</button>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
