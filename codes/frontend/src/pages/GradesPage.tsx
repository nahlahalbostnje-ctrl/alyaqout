import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchGrades,
  addGrade,
  toggleGrade,
  deleteGrade,
} from '../features/admin/gradesSlice';
import AdminLayout from '../components/AdminLayout';

/* ─── Design tokens ─────────────────────────────────────────── */
const DK = {
  gold: '#C59341',
  goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8',
  card: '#FFFFFF',
  navy: '#0D1E3A',
  text: '#1B2038',
  sub: '#6B7280',
  dim: '#9CA3AF',
  border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981',
  red: '#EF4444',
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
        style={{ background: '#fff', borderRadius: 20, padding: 28, width: 460, maxWidth: '95vw' }}
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

/* ─── Toggle Switch component ───────────────────────────────── */
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
export default function GradesPage() {
  const dispatch = useAppDispatch();
  const { list: grades, loading } = useAppSelector((s) => s.grades);

  const [showModal, setShowModal]     = useState(false);
  const [name, setName]               = useState('');
  const [sortOrder, setSortOrder]     = useState(0);
  const [addError, setAddError]       = useState<string | null>(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [toggling, setToggling]       = useState<number | null>(null);
  const [deleting, setDeleting]       = useState<number | null>(null);
  const [nameF, setNameF]             = useState(false);
  const [sortF, setSortF]             = useState(false);

  useEffect(() => { dispatch(fetchGrades()); }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addGrade({ name: name.trim(), sort_order: sortOrder }));
    setAddLoading(false);
    if (addGrade.fulfilled.match(result)) {
      setShowModal(false);
      setName('');
      setSortOrder(0);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleGrade(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصف؟')) return;
    setDeleting(id);
    await dispatch(deleteGrade(id));
    setDeleting(null);
  };

  const inp = (focused: boolean): React.CSSProperties => ({
    background: '#FFFFFF',
    border: `1.5px solid ${focused ? '#C59341' : '#EDE3CE'}`,
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
          title="الصفوف الدراسية"
          sub="إدارة الصفوف الدراسية وترتيبها"
          action={
            <button
              onClick={() => { setShowModal(true); setAddError(null); }}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg,#C59341,#D4A65A)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif",
                boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
              }}
            >
              + إضافة صف جديد
            </button>
          }
        />

        {/* Grade Cards Grid */}
        {!loading && grades.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
            {grades.map((grade) => (
              <div key={grade.id} style={cardStyle({ padding: 16 })}>
                {/* Icon + sort badge row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(16,185,129,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    📚
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: DK.gold,
                    background: 'rgba(197,147,65,0.10)',
                    borderRadius: 20, padding: '2px 8px',
                  }}>
                    #{grade.sort_order}
                  </span>
                </div>

                {/* Grade name */}
                <div style={{ fontWeight: 800, fontSize: 15, color: DK.text, marginBottom: 14, lineHeight: 1.3 }}>
                  {grade.name}
                </div>

                {/* Toggle + Delete row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ToggleSwitch
                      on={grade.is_active}
                      onClick={() => handleToggle(grade.id)}
                      disabled={toggling === grade.id}
                    />
                    <span style={{ fontSize: 12, color: grade.is_active ? DK.green : DK.sub, fontWeight: 600 }}>
                      {toggling === grade.id ? '...' : grade.is_active ? 'نشط' : 'معطّل'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(grade.id)}
                    disabled={deleting === grade.id}
                    style={{
                      padding: '4px 10px', borderRadius: 8, border: 'none',
                      background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      opacity: deleting === grade.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === grade.id ? '...' : 'حذف'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={cardStyle({ padding: 0, overflow: 'hidden' })}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid rgba(197,147,65,0.15)',
                borderTopColor: '#C59341',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : grades.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(197,147,65,0.08)',
                border: '1px solid #EDE3CE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>📚</div>
              <p style={{ color: DK.sub, fontSize: 14, fontWeight: 600, margin: 0 }}>
                لا توجد صفوف بعد. أضف أول صف!
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr>
                  {['الترتيب', 'اسم الصف', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(197,147,65,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    style={{ transition: 'background 0.15s' }}
                  >
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(197,147,65,0.10)',
                        color: DK.gold, fontWeight: 700, fontSize: 12,
                      }}>
                        {grade.sort_order}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight: 700 }}>{grade.name}</td>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ToggleSwitch
                          on={grade.is_active}
                          onClick={() => handleToggle(grade.id)}
                          disabled={toggling === grade.id}
                        />
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: grade.is_active ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.08)',
                          color: grade.is_active ? '#10B981' : '#EF4444',
                        }}>
                          {toggling === grade.id ? '...' : grade.is_active ? 'نشط' : 'معطّل'}
                        </span>
                      </div>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggle(grade.id)}
                          disabled={toggling === grade.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: 'none',
                            background: grade.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                            color: grade.is_active ? '#EF4444' : '#10B981',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: toggling === grade.id ? 0.5 : 1,
                          }}
                        >
                          {toggling === grade.id ? '...' : grade.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          disabled={deleting === grade.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: '1px solid #EDE3CE',
                            background: '#fff', color: '#EF4444',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: deleting === grade.id ? 0.5 : 1,
                          }}
                        >
                          {deleting === grade.id ? '...' : 'حذف'}
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

      {/* Add Grade Modal */}
      {showModal && (
        <Modal title="إضافة صف دراسي" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                اسم الصف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الصف الأول"
                required
                autoFocus
                style={inp(nameF)}
                onFocus={() => setNameF(true)}
                onBlur={() => setNameF(false)}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                الترتيب
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                dir="ltr"
                style={inp(sortF)}
                onFocus={() => setSortF(true)}
                onBlur={() => setSortF(false)}
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
    </AdminLayout>
  );
}
