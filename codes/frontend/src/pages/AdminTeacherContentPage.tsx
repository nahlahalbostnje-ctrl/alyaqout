import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', purple: '#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});

type Tab = 'homeworks' | 'exams';
type Scope = 'active' | 'archived';

interface ContentRow {
  id: number;
  title: string;
  status: string;
  archived_at?: string | null;
  due_date?: string | null;
  duration?: number | null;
  course: { id: number; title: string } | null;
  teacher: { id: number; name: string } | null;
  submissions_count?: number;
  questions_count?: number;
  created_at?: string | null;
}

export default function AdminTeacherContentPage() {
  const [tab, setTab] = useState<Tab>('homeworks');
  const [scope, setScope] = useState<Scope>('active');
  const [items, setItems] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContentRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const path = tab === 'homeworks' ? '/admin/teacher-content/homeworks' : '/admin/teacher-content/exams';
      const { data } = await api.get(path, { params: { scope } });
      setItems(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab, scope]);

  const handleArchive = async (row: ContentRow) => {
    if (!confirm(`أرشفة «${row.title}»؟`)) return;
    setBusyId(row.id);
    try {
      const path = tab === 'homeworks'
        ? `/admin/teacher-content/homeworks/${row.id}/archive`
        : `/admin/teacher-content/exams/${row.id}/archive`;
      await api.patch(path);
      setItems((prev) => prev.filter((i) => i.id !== row.id));
      setMsg('تم الأرشفة');
      setTimeout(() => setMsg(''), 2500);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const path = tab === 'homeworks'
        ? `/admin/teacher-content/homeworks/${pendingDelete.id}`
        : `/admin/teacher-content/exams/${pendingDelete.id}`;
      await api.delete(path);
      setItems((prev) => prev.filter((i) => i.id !== pendingDelete.id));
      setPendingDelete(null);
      setMsg('تم الحذف نهائياً');
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setDeleteError('تعذّر الحذف');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>محتوى المعلمين</h1>
          </div>
          <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>أرشفة أو حذف نهائي للواجبات والامتحانات — الإضافة والتعديل للمعلم</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {([
            { key: 'homeworks' as const, label: 'الواجبات' },
            { key: 'exams' as const, label: 'الامتحانات' },
          ]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '9px 22px', borderRadius: 40, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 700,
                background: tab === t.key ? DK.goldGrad : '#FFFFFF',
                color: tab === t.key ? '#fff' : DK.sub,
                border: tab === t.key ? 'none' : '1px solid #EDE3CE',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'active' as const, label: 'النشطة' },
            { key: 'archived' as const, label: 'المؤرشفة' },
          ]).map((t) => (
            <button key={t.key} onClick={() => setScope(t.key)}
              style={{
                padding: '7px 16px', borderRadius: 40, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
                background: scope === t.key ? DK.navy : '#FFFFFF',
                color: scope === t.key ? '#fff' : DK.sub,
                border: scope === t.key ? 'none' : '1px solid #EDE3CE',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ ...card({ padding: '12px 16px', marginBottom: 16, color: DK.green, fontWeight: 700, fontSize: 13 }) }}>{msg}</div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: DK.sub, padding: 40 }}>جارٍ التحميل...</p>
        ) : items.length === 0 ? (
          <div style={card({ padding: '48px 0', textAlign: 'center' })}>
            <p style={{ fontWeight: 700, color: DK.text }}>لا توجد عناصر</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {items.map((row) => (
              <div key={row.id} style={card({ padding: 18 })}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: tab === 'homeworks' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                  color: tab === 'homeworks' ? DK.purple : '#3B82F6',
                }}>
                  {row.course?.title ?? '—'}
                </span>
                <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: '10px 0 6px' }}>{row.title}</p>
                <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 4px' }}>المعلم: {row.teacher?.name ?? '—'}</p>
                <p style={{ fontSize: 12, color: DK.dim, margin: '0 0 14px' }}>
                  الحالة: {row.status === 'approved' ? 'معتمد' : row.status === 'rejected' ? 'مرفوض' : 'بانتظار'}
                  {row.due_date ? ` · تسليم ${row.due_date}` : ''}
                  {row.duration ? ` · ${row.duration} د` : ''}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {scope === 'active' && (
                    <button onClick={() => handleArchive(row)} disabled={busyId === row.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(245,158,11,0.12)', color: DK.amber, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif",
                      }}>
                      أرشفة
                    </button>
                  )}
                  <button onClick={() => { setDeleteError(null); setPendingDelete(row); }}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 13, fontWeight: 700,
                      fontFamily: "'Cairo',sans-serif",
                    }}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.title}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
