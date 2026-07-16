import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchGrades } from '../features/admin/gradesSlice';
import {
  fetchSubjects,
  addSubject,
  updateSubject,
  toggleSubject,
  deleteSubject,
  type Subject,
  type SubjectType,
} from '../features/admin/subjectsSlice';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DK = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', text: '#1B2038', sub: '#6B7280', border: '#EDE3CE',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...extra,
});

const TH: React.CSSProperties = {
  padding: '11px 16px', textAlign: 'right', color: '#6B7280', fontSize: 12, fontWeight: 700,
  background: '#F8F5EE', borderBottom: '1px solid #EDE3CE', whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = {
  padding: '12px 16px', borderBottom: '1px solid #F3EDE0', fontSize: 13, color: '#1B2038',
};

function PageHeader({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#C59341' }} />
          <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 20, margin: 0 }}>{title}</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      width: 44, height: 24, borderRadius: 12, background: on ? '#10B981' : '#D1D5DB',
      position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.2s' }} />
    </div>
  );
}

const TYPE_LABEL: Record<SubjectType, string> = {
  curriculum: 'منهجية',
  extracurricular: 'غير منهجية',
};

export default function SubjectsPage() {
  const dispatch = useAppDispatch();
  const { list: grades } = useAppSelector((s) => s.grades);
  const { list: subjects, loading } = useAppSelector((s) => s.subjects);

  const [filterType, setFilterType] = useState<SubjectType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', type: 'curriculum' as SubjectType, grade_ids: [] as number[], sort_order: 0 });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGrades());
    dispatch(fetchSubjects(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSubjects(filterType ? { type: filterType } : null));
  }, [dispatch, filterType]);

  const openModal = () => {
    setEditTarget(null);
    setForm({ name: '', type: 'curriculum', grade_ids: grades[0] ? [grades[0].id] : [], sort_order: 0 });
    setAddError(null);
    setShowModal(true);
  };

  const openEdit = (s: Subject) => {
    setEditTarget(s);
    setForm({
      name: s.name,
      type: s.type,
      grade_ids: (s.grades ?? []).map((g) => g.id),
      sort_order: s.sort_order,
    });
    setAddError(null);
    setShowModal(true);
  };

  const toggleGrade = (id: number) => {
    setForm((f) => ({
      ...f,
      grade_ids: f.grade_ids.includes(id) ? f.grade_ids.filter((g) => g !== id) : [...f.grade_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setAddError('اسم المادة مطلوب'); return; }
    if (form.type === 'curriculum' && form.grade_ids.length === 0) {
      setAddError('اختر صفاً واحداً على الأقل للمواد المنهجية');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      grade_ids: form.grade_ids,
      sort_order: form.sort_order,
    };
    const result = editTarget
      ? await dispatch(updateSubject({ id: editTarget.id, ...payload }))
      : await dispatch(addSubject(payload));
    setAddLoading(false);
    if (
      (editTarget && updateSubject.fulfilled.match(result)) ||
      (!editTarget && addSubject.fulfilled.match(result))
    ) {
      setShowModal(false);
      setEditTarget(null);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleSubject(id));
    setToggling(null);
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    setDeleting(pendingDelete.id);
    try {
      await dispatch(deleteSubject(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف المادة');
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  const inp = (): React.CSSProperties => ({
    background: '#FFFFFF', border: '1.5px solid #EDE3CE', color: '#1B2038', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, width: '100%', outline: 'none',
    fontFamily: "'Cairo',sans-serif", boxSizing: 'border-box',
  });

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: '#F5EDD8', minHeight: '100vh', padding: 24 }}>
        <PageHeader
          title="المواد"
          sub="مواد منهجية وغير منهجية — مع ربط بعدة صفوف"
          action={
            <button onClick={openModal} style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', background: DK.goldGrad,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
              boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
            }}>+ إضافة مادة</button>
          }
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DK.sub }}>النوع:</span>
          {([null, 'curriculum', 'extracurricular'] as const).map((t) => (
            <button key={String(t)} onClick={() => setFilterType(t)} style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
              background: filterType === t ? DK.goldGrad : '#fff',
              color: filterType === t ? '#fff' : DK.sub, fontWeight: 700, fontSize: 12,
              border: filterType === t ? 'none' : '1px solid #EDE3CE',
              fontFamily: "'Cairo',sans-serif",
            }}>
              {t === null ? 'الكل' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div style={cardStyle({ padding: 0, overflow: 'hidden' })}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 48, color: DK.sub }}>جاري التحميل...</p>
          ) : subjects.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 48, color: DK.sub }}>لا توجد مواد بعد. أضف أول مادة!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>{['الترتيب', 'المادة', 'النوع', 'الصفوف', 'الحالة', 'إجراءات'].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td style={TD}>{s.sort_order}</td>
                      <td style={{ ...TD, fontWeight: 700 }}>{s.name}</td>
                      <td style={TD}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: s.type === 'curriculum' ? 'rgba(59,130,246,0.10)' : 'rgba(197,147,65,0.12)',
                          color: s.type === 'curriculum' ? DK.blue : DK.gold,
                        }}>
                          {TYPE_LABEL[s.type]}
                        </span>
                      </td>
                      <td style={TD}>
                        {s.type === 'extracurricular' && (!s.grades || s.grades.length === 0)
                          ? <span style={{ color: DK.sub, fontSize: 12 }}>كل الصفوف</span>
                          : (s.grades ?? []).map((g) => (
                            <span key={g.id} style={{
                              display: 'inline-block', margin: 2, padding: '2px 8px', borderRadius: 20,
                              background: 'rgba(59,130,246,0.08)', color: DK.blue, fontSize: 11, fontWeight: 700,
                            }}>{g.name}</span>
                          ))}
                      </td>
                      <td style={TD}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ToggleSwitch on={s.is_active} onClick={() => handleToggle(s.id)} disabled={toggling === s.id} />
                          <span style={{ fontSize: 12, color: s.is_active ? DK.green : DK.red, fontWeight: 700 }}>
                            {s.is_active ? 'نشط' : 'معطّل'}
                          </span>
                        </div>
                      </td>
                      <td style={TD}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(s)} style={{
                            padding: '5px 12px', borderRadius: 8, border: '1px solid #EDE3CE',
                            background: '#fff', color: DK.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>تعديل</button>
                          <button onClick={() => setPendingDelete({ id: s.id, label: s.name })} disabled={deleting === s.id} style={{
                            padding: '5px 12px', borderRadius: 8, border: '1px solid #EDE3CE',
                            background: '#fff', color: DK.red, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? `تعديل ${editTarget.name}` : 'إضافة مادة'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>اسم المادة</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inp()} placeholder="مثال: الرياضيات" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>النوع</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SubjectType })} style={{ ...inp(), cursor: 'pointer' }}>
                <option value="curriculum">منهجية</option>
                <option value="extracurricular">غير منهجية</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                الصفوف {form.type === 'extracurricular' ? '(اختياري — فارغ = كل الصفوف)' : '(مطلوب)'}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {grades.map((g) => {
                  const on = form.grade_ids.includes(g.id);
                  return (
                    <button key={g.id} type="button" onClick={() => toggleGrade(g.id)} style={{
                      padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      background: on ? DK.goldGrad : '#fff', color: on ? '#fff' : DK.sub,
                      border: on ? 'none' : '1px solid #EDE3CE', fontFamily: "'Cairo',sans-serif",
                    }}>{g.name}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>الترتيب</label>
              <input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} dir="ltr" style={inp()} />
            </div>
            {addError && <p style={{ color: DK.red, fontSize: 12, marginBottom: 12 }}>{addError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={addLoading} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: DK.goldGrad,
                color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: addLoading ? 0.6 : 1,
              }}>{addLoading ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              <button type="button" onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid #EDE3CE',
                background: '#fff', color: DK.sub, fontWeight: 700, cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
