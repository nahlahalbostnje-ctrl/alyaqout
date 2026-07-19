import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

export default function ParentAcademyPage() {
  const [items, setItems] = useState<{ id: number; title: string; description: string | null; category: string; file_url: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/academy').then((r) => setItems(r.data.items ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", padding: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>أكاديمية ولي الأمر</h1>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>محتوى تثقيفي يضيفه أدمن بلدك</p>
        {loading ? <p>جاري...</p> : items.length === 0 ? (
          <div style={{ background: '#fff', padding: 40, textAlign: 'center', borderRadius: 16, border: '1px solid #EDE3CE' }}>
            <p style={{ fontWeight: 800 }}>لا محتوى بعد</p>
            <p style={{ fontSize: 13, color: '#6B7280' }}>يضيفه الأدمن من «أكاديمية الآباء»</p>
          </div>
        ) : items.map((i) => (
          <div key={i.id} style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE' }}>
            <p style={{ margin: 0, fontWeight: 800 }}>{i.title}</p>
            {i.description && <p style={{ margin: '6px 0', fontSize: 13, color: '#6B7280' }}>{i.description}</p>}
            {i.file_url && <a href={i.file_url} target="_blank" rel="noreferrer" style={{ color: '#C59341', fontWeight: 700, fontSize: 13 }}>فتح المحتوى</a>}
          </div>
        ))}
      </div>
    </ParentLayout>
  );
}
