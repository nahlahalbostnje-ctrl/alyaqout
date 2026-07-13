import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchGrades } from '../features/admin/gradesSlice';
import {
  fetchCategories,
  addCategory,
  toggleCategory,
  deleteCategory,
} from '../features/admin/categoriesSlice';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

/* ─── Design tokens ─────────────────────────────────────────── */
const DK = {
  gold: '#C59341',
  goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8',
  text: '#1B2038',
  sub: '#6B7280',
  border: '#EDE3CE',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  border: '1px solid #EDE3CE',
  ...extra,
});

const TH: React.CSSProperties = {
  padding: '11px 16px',
  textAlign: 'right',
  color: '#6B7280',
  fontSize: 12,
  fontWeight: 700,
  background: '#F8F5EE',
  borderBottom: '1px solid #EDE3CE',
  whiteSpace: 'nowrap',
};

const TD: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #F3EDE0',
  fontSize: 13,
  color: '#1B2038',
};

/* ─── Subject icon helper ───────────────────────────────────── */
function subjectIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('رياضي') || n.includes('math')) return 'π';
  if (n.includes('انجليزي') || n.includes('إنجليزي') || n.includes('english')) return 'EN';
  if (n.includes('علوم') || n.includes('science')) return '🔬';
  if (n.includes('عربي') || n.includes('arabic')) return 'ع';
  if (n.includes('تاريخ') || n.includes('history')) return '📜';
  if (n.includes('جغراف') || n.includes('geo')) return '🌍';
  if (n.includes('فيزيا') || n.includes('physics')) return 'φ';
  if (n.includes('كيميا') || n.includes('chem')) return '⚗';
  if (n.includes('دين') || n.includes('islam')) return '☪';
  if (n.includes('حاسب') || n.includes('computer')) return '💻';
  if (n.includes('فن') || n.includes('art')) return '🎨';
  return '📖';
}

/* ─── Shared helpers ─────────────────────────────────────────── */
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
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#10B981' : '#D1D5DB',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: on ? 23 : 3,
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { list: grades }                   = useAppSelector((s) => s.grades);
  const { list: categories, loading }      = useAppSelector((s) => s.categories);

  const [filterGrade, setFilterGrade]      = useState<number | null>(null);
  const [showModal, setShowModal]          = useState(false);
  const [form, setForm]                    = useState({ grade_id: 0, name: '', sort_order: 0 });
  const [addError, setAddError]            = useState<string | null>(null);
  const [addLoading, setAddLoading]        = useState(false);
  const [toggling, setToggling]            = useState<number | null>(null);
  const [deleting, setDeleting]            = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput]    = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGrades());
    dispatch(fetchCategories(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategories(filterGrade));
  }, [dispatch, filterGrade]);

  const openModal = () => {
    setForm({ grade_id: grades[0]?.id ?? 0, name: '', sort_order: 0 });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade_id) { setAddError('اختر الصف الدراسي'); return; }
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addCategory(form));
    setAddLoading(false);
    if (addCategory.fulfilled.match(result)) {
      setShowModal(false);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleCategory(id));
    setToggling(null);
  };

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    setDeleting(pendingDelete.id);
    try {
      await dispatch(deleteCategory(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف المادة');
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  const displayed = filterGrade
    ? categories.filter((c) => c.grade_id === filterGrade)
    : categories;

  const inp = (field: string): React.CSSProperties => ({
    background: '#FFFFFF',
    border: `1.5px solid ${focusedInput === field ? '#C59341' : '#EDE3CE'}`,
    color: '#1B2038',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: "'Cairo',sans-serif",
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  });

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: '#F5EDD8', minHeight: '100vh', padding: 24 }}>

        <PageHeader
          title="المواد الدراسية"
          sub="إدارة المواد الدراسية لكل صف"
          action={
            <button
              onClick={openModal}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#C59341,#D4A65A)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif",
                boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
              }}
            >
              + إضافة مادة
            </button>
          }
        />

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DK.sub, marginLeft: 4 }}>تصفية:</span>
          <button
            onClick={() => setFilterGrade(null)}
            style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
              background: filterGrade === null ? 'linear-gradient(135deg,#C59341,#D4A65A)' : '#fff',
              color: filterGrade === null ? '#fff' : DK.sub,
              fontWeight: 700, fontSize: 12,
              boxShadow: filterGrade === null ? '0 2px 8px rgba(197,147,65,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
              border: filterGrade === null ? 'none' : '1px solid #EDE3CE',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            الكل
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGrade(g.id)}
              style={{
                padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                background: filterGrade === g.id ? 'linear-gradient(135deg,#C59341,#D4A65A)' : '#fff',
                color: filterGrade === g.id ? '#fff' : DK.sub,
                fontWeight: 700, fontSize: 12,
                border: filterGrade === g.id ? 'none' : '1px solid #EDE3CE',
                boxShadow: filterGrade === g.id ? '0 2px 8px rgba(197,147,65,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Subject Cards Grid */}
        {!loading && displayed.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 24 }}>
            {displayed.map((cat) => (
              <div key={cat.id} style={cardStyle({ padding: 16 })}>
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(59,130,246,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 900, color: '#3B82F6',
                  marginBottom: 10,
                }}>
                  {subjectIcon(cat.name)}
                </div>

                {/* Name */}
                <div style={{ fontWeight: 800, fontSize: 14, color: DK.text, marginBottom: 6 }}>
                  {cat.name}
                </div>

                {/* Grade badge */}
                {cat.grade && (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px', borderRadius: 20,
                    background: 'rgba(59,130,246,0.10)',
                    color: '#3B82F6', fontSize: 11, fontWeight: 700,
                    marginBottom: 12,
                  }}>
                    {cat.grade.name}
                  </span>
                )}

                {/* Toggle + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ToggleSwitch
                      on={cat.is_active}
                      onClick={() => handleToggle(cat.id)}
                      disabled={toggling === cat.id}
                    />
                    <span style={{ fontSize: 11, color: cat.is_active ? DK.green : DK.sub, fontWeight: 600 }}>
                      {toggling === cat.id ? '...' : cat.is_active ? 'نشط' : 'معطّل'}
                    </span>
                  </div>
                  <button
                    onClick={() => askDelete(cat.id, cat.name)}
                    disabled={deleting === cat.id}
                    style={{
                      padding: '4px 10px', borderRadius: 8, border: 'none',
                      background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      opacity: deleting === cat.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === cat.id ? '...' : 'حذف'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={cardStyle({ padding: 0, overflow: 'hidden' })}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid rgba(197,147,65,0.15)',
                borderTopColor: '#C59341',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ color: DK.sub, fontSize: 14 }}>جاري التحميل...</span>
            </div>
          ) : displayed.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '48px 0', color: DK.sub, fontSize: 14 }}>
              {grades.length === 0 ? 'أضف صفوفاً دراسية أولاً من صفحة الصفوف.' : 'لا توجد مواد بعد. أضف أول مادة!'}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  {['الترتيب', 'المادة', 'الصف', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((cat) => (
                  <tr
                    key={cat.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(197,147,65,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    style={{ transition: 'background 0.15s' }}
                  >
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(197,147,65,0.10)', color: DK.gold, fontWeight: 700, fontSize: 12,
                      }}>
                        {cat.sort_order}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{subjectIcon(cat.name)}</span>
                        {cat.name}
                      </div>
                    </td>
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(59,130,246,0.10)', color: '#3B82F6', fontSize: 11, fontWeight: 700,
                      }}>
                        {cat.grade?.name ?? '—'}
                      </span>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ToggleSwitch
                          on={cat.is_active}
                          onClick={() => handleToggle(cat.id)}
                          disabled={toggling === cat.id}
                        />
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: cat.is_active ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.08)',
                          color: cat.is_active ? '#10B981' : '#EF4444',
                        }}>
                          {toggling === cat.id ? '...' : cat.is_active ? 'نشط' : 'معطّل'}
                        </span>
                      </div>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggle(cat.id)}
                          disabled={toggling === cat.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: 'none',
                            background: cat.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                            color: cat.is_active ? '#EF4444' : '#10B981',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: toggling === cat.id ? 0.5 : 1,
                          }}
                        >
                          {toggling === cat.id ? '...' : cat.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => askDelete(cat.id, cat.name)}
                          disabled={deleting === cat.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8,
                            border: '1px solid #EDE3CE', background: '#fff', color: '#EF4444',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: deleting === cat.id ? 0.5 : 1,
                          }}
                        >
                          {deleting === cat.id ? '...' : 'حذف'}
                        </button>
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

      {/* Add Category Modal */}
      {showModal && (
        <Modal title="إضافة مادة دراسية" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                الصف الدراسي
              </label>
              <select
                value={form.grade_id}
                onChange={(e) => setForm({ ...form, grade_id: Number(e.target.value) })}
                onFocus={() => setFocusedInput('grade')}
                onBlur={() => setFocusedInput(null)}
                style={{ ...inp('grade'), cursor: 'pointer' }}
              >
                <option value={0} disabled>اختر الصف الدراسي</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                اسم المادة
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: الرياضيات"
                required
                autoFocus
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                style={inp('name')}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                الترتيب
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                min={0}
                dir="ltr"
                onFocus={() => setFocusedInput('sort')}
                onBlur={() => setFocusedInput(null)}
                style={inp('sort')}
              />
            </div>
            {addError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginBottom: 14,
              }}>
                {addError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={addLoading}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#C59341,#D4A65A)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                  opacity: addLoading ? 0.6 : 1,
                }}
              >
                {addLoading ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  border: '1px solid #EDE3CE', background: '#fff', color: '#6B7280',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
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
