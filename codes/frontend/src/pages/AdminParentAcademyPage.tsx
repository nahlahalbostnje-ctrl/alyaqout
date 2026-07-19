import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

interface Item {
  id: number;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  is_active: boolean;
}

export default function AdminParentAcademyPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const load = () => api.get('/admin/parent-academy').then((r) => setItems(r.data.items ?? []));
  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/admin/parent-academy', {
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl.trim() || null,
    });
    setTitle('');
    setDescription('');
    setFileUrl('');
    await load();
  }

  async function remove(id: number) {
    await api.delete(`/admin/parent-academy/${id}`);
    await load();
  }

  return (
    <AdminLayout>
      <div className="p-8" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100%' }} dir="rtl">
        <h1 style={{ fontWeight: 900, fontSize: 22 }}>أكاديمية الآباء (محتوى)</h1>
        <form onSubmit={(e) => void add(e)} style={{ background: '#fff', padding: 16, borderRadius: 14, border: '1px solid #EDE3CE', margin: '16px 0' }}>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان" style={inp} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={2} style={{ ...inp, marginTop: 8 }} />
          <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="رابط المحتوى" dir="ltr" style={{ ...inp, marginTop: 8 }} />
          <button type="submit" style={{ marginTop: 10, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#C59341', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>إضافة</button>
        </form>
        {items.map((i) => (
          <div key={i.id} style={{ background: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, border: '1px solid #EDE3CE', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>{i.title}</span>
            <button onClick={() => void remove(i.id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>حذف</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 10, border: '1px solid #EDE3CE', fontFamily: "'Cairo', sans-serif", boxSizing: 'border-box' };
