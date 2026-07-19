import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import api from '../services/axios';

type LibType = 'book' | 'dedication' | 'past_exam' | 'summary';

interface Grade {
  id: number;
  name: string;
}

interface LibraryItem {
  id: number;
  type: LibType;
  title: string;
  description: string | null;
  file_url: string | null;
  cover_url: string | null;
  author: string | null;
  grade_id: number | null;
  grade: { id: number; name: string } | null;
  is_active: boolean;
  sort_order: number;
}

const TYPE_LABELS: Record<LibType, string> = {
  book: 'كتاب',
  dedication: 'إهداء',
  past_exam: 'أسئلة سنوات',
  summary: 'ملخص',
};

const DK = {
  gold: '#C59341', goldL: '#D4A65A', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  text: '#1B2038', sub: '#6B7280', border: '#EDE3CE', red: '#EF4444', green: '#10B981',
};

const emptyForm = {
  type: 'book' as LibType,
  title: '',
  description: '',
  file_url: '',
  cover_url: '',
  author: '',
  grade_id: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filter, setFilter] = useState<'' | LibType>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<LibraryItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [libRes, gradesRes] = await Promise.all([
        api.get('/admin/library', { params: filter ? { type: filter } : undefined }),
        api.get('/admin/grades'),
      ]);
      setItems(libRes.data.items ?? []);
      const g = gradesRes.data.data ?? gradesRes.data.grades ?? [];
      setGrades(Array.isArray(g) ? g : []);
    } catch {
      setError('تعذّر تحميل المكتبة');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(item: LibraryItem) {
    setEditing(item);
    setForm({
      type: item.type,
      title: item.title,
      description: item.description ?? '',
      file_url: item.file_url ?? '',
      cover_url: item.cover_url ?? '',
      author: item.author ?? '',
      grade_id: item.grade_id != null ? String(item.grade_id) : '',
      sort_order: String(item.sort_order ?? 0),
      is_active: item.is_active,
    });
    setModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    const payload = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      file_url: form.file_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      author: form.author.trim() || null,
      grade_id: form.grade_id ? Number(form.grade_id) : null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await api.put(`/admin/library/${editing.id}`, payload);
      } else {
        await api.post('/admin/library', payload);
      }
      setModal(false);
      await load();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: LibraryItem) {
    try {
      await api.patch(`/admin/library/${item.id}/toggle`);
      await load();
    } catch {
      setError('تعذّر تغيير الحالة');
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/admin/library/${pendingDelete.id}`);
      setPendingDelete(null);
      await load();
    } catch {
      setError('تعذّر الحذف');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-5 rounded-full" style={{ background: DK.goldGrad }} />
              <span className="text-xs font-bold" style={{ color: DK.gold, opacity: 0.7 }}>أدمن البلد</span>
            </div>
            <h1 className="text-2xl font-black m-0" style={{ color: DK.text }}>مكتبة الياقوت</h1>
            <p className="text-sm mt-1 m-0" style={{ color: DK.sub }}>
              كتب، إهداءات، أسئلة سنوات سابقة، وملخصات — تُعرض للطالب حسب الدولة والصف
            </p>
          </div>
          <button
            onClick={openCreate}
            className="text-sm font-bold px-5 py-2.5 rounded-xl"
            style={{ background: DK.goldGrad, color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            + إضافة عنصر
          </button>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {([
            { id: '' as const, label: 'الكل' },
            ...((Object.keys(TYPE_LABELS) as LibType[]).map((id) => ({ id, label: TYPE_LABELS[id] }))),
          ]).map((t) => (
            <button
              key={t.id || 'all'}
              onClick={() => setFilter(t.id)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{
                border: '1px solid #EDE3CE',
                background: filter === t.id ? DK.goldGrad : '#fff',
                color: filter === t.id ? '#fff' : DK.sub,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: DK.red }}>{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16" style={{ color: DK.sub }}>جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: `1px solid ${DK.border}` }}>
            <p className="font-bold m-0 mb-2" style={{ color: DK.text }}>لا توجد عناصر بعد</p>
            <p className="text-sm m-0" style={{ color: DK.sub }}>أضف كتاباً أو ملخصاً ليظهر للطلاب</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: '#fff', border: `1px solid ${DK.border}`, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
                <div className="min-w-0">
                  <div className="flex gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(197,147,65,0.12)', color: DK.gold }}>
                      {TYPE_LABELS[item.type]}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: item.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
                        color: item.is_active ? DK.green : DK.sub,
                      }}>
                      {item.is_active ? 'نشط' : 'معطّل'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#F3F4F6', color: DK.sub }}>
                      {item.grade?.name ?? 'كل الصفوف'}
                    </span>
                  </div>
                  <p className="font-bold text-sm m-0" style={{ color: DK.text }}>{item.title}</p>
                  {item.author && <p className="text-xs m-0 mt-0.5" style={{ color: DK.sub }}>{item.author}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => void toggle(item)} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: `1px solid ${DK.border}`, background: '#fff', color: DK.sub, cursor: 'pointer' }}>
                    {item.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button onClick={() => openEdit(item)} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: `1px solid rgba(197,147,65,0.3)`, background: '#fff', color: DK.gold, cursor: 'pointer' }}>
                    تعديل
                  </button>
                  <button onClick={() => setPendingDelete(item)} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ border: `1px solid rgba(239,68,68,0.2)`, background: 'rgba(239,68,68,0.06)', color: DK.red, cursor: 'pointer' }}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setModal(false)}
        >
          <form
            onSubmit={(e) => void handleSave(e)}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3 style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 16, color: DK.text }}>
              {editing ? 'تعديل عنصر' : 'إضافة عنصر'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 10 }}>
              {(Object.keys(TYPE_LABELS) as LibType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  style={{
                    padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                    fontFamily: "'Cairo', sans-serif",
                    background: form.type === t ? DK.goldGrad : '#F9FAFB',
                    color: form.type === t ? '#fff' : DK.sub,
                  }}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="العنوان" style={inp} />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="الوصف (اختياري)" rows={2} style={{ ...inp, marginTop: 8, resize: 'vertical' }} />
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="المؤلف / المصدر (اختياري)" style={{ ...inp, marginTop: 8 }} />
            <input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              placeholder="رابط الملف / المحتوى" dir="ltr" style={{ ...inp, marginTop: 8 }} />
            <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              placeholder="رابط صورة الغلاف (اختياري)" dir="ltr" style={{ ...inp, marginTop: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <select value={form.grade_id} onChange={(e) => setForm({ ...form, grade_id: e.target.value })} style={inp}>
                <option value="">كل الصفوف</option>
                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input type="number" min={0} value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                placeholder="الترتيب" style={inp} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: DK.text, fontWeight: 700 }}>
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              نشط وظاهر للطلاب
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: 12, borderRadius: 12, border: 'none', background: DK.goldGrad,
                color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
              }}>{saving ? 'جاري...' : 'حفظ'}</button>
              <button type="button" onClick={() => setModal(false)} style={{
                flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${DK.border}`,
                background: '#F9FAFB', color: DK.sub, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
              }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          open
          title="حذف من المكتبة"
          message={`حذف «${pendingDelete.title}»؟`}
          busy={deleteBusy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </AdminLayout>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
  fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box',
};
