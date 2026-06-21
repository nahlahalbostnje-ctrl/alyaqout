import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchGrades,
  addGrade,
  toggleGrade,
  deleteGrade,
} from '../features/admin/gradesSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  goldL:  '#DDAD50',
  navy:   '#fff',
  dimTxt: '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties,
};

export default function GradesPage() {
  const dispatch = useAppDispatch();
  const { list: grades, loading } = useAppSelector((s) => s.grades);

  const [showModal, setShowModal]   = useState(false);
  const [name, setName]             = useState('');
  const [sortOrder, setSortOrder]   = useState(0);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);

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

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }}>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>إدارة المحتوى</span>
              </div>
              <h1 className="text-2xl font-black" style={{ color: '#1B2038' }}>الصفوف الدراسية</h1>
            </div>
            <button
              onClick={() => { setShowModal(true); setAddError(null); }}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff', boxShadow: '0 4px 18px rgba(201,149,42,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              إضافة صف
            </button>
          </div>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={DK.card}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full animate-spin"
                style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: DK.gold }} />
            </div>
          ) : grades.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid #EDE3CE' }}>
                <svg className="w-7 h-7" fill="none" stroke="rgba(201,149,42,0.4)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: DK.dimTxt }}>لا توجد صفوف بعد. أضف أول صف!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                  {['اسم الصف', 'الترتيب', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide"
                      style={{ color: DK.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr
                    key={grade.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #EDE3CE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-6 py-4 font-bold" style={{ color: '#1B2038' }}>{grade.name}</td>
                    <td className="px-6 py-4" style={{ color: DK.dimTxt }}>{grade.sort_order}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={grade.is_active
                          ? { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                          : { background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }
                        }
                      >
                        {grade.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(grade.id)}
                          disabled={toggling === grade.id}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
                          style={grade.is_active
                            ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                          }
                        >
                          {toggling === grade.id ? '...' : grade.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          disabled={deleting === grade.id}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
                          style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}
                        >
                          {deleting === grade.id ? '...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Grade Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: '#1B2038' }}>إضافة صف دراسي</h3>
              <button onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-black/5"
                style={{ color: DK.dimTxt }}>×</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>اسم الصف</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الصف الأول"
                  required
                  autoFocus
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>الترتيب</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  min={0}
                  dir="ltr"
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                />
              </div>
              {addError && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {addError}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                >
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
