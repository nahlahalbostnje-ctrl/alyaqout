import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchGrades } from '../features/admin/gradesSlice';
import {
  fetchCategories,
  addCategory,
  toggleCategory,
  deleteCategory,
} from '../features/admin/categoriesSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { list: grades }      = useAppSelector((s) => s.grades);
  const { list: categories, loading } = useAppSelector((s) => s.categories);

  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ grade_id: 0, name: '', sort_order: 0 });
  const [addError, setAddError]       = useState<string | null>(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [toggling, setToggling]       = useState<number | null>(null);
  const [deleting, setDeleting]       = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    setDeleting(id);
    await dispatch(deleteCategory(id));
    setDeleting(null);
  };

  const displayed = filterGrade
    ? categories.filter((c) => c.grade_id === filterGrade)
    : categories;

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>المواد الدراسية</h2>
          </div>
          <button
            onClick={openModal}
            className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}
          >
            + إضافة مادة
          </button>
        </div>

        {/* Filter by grade */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterGrade(null)}
            className="text-sm px-4 py-1.5 rounded-full transition"
            style={{
              background: filterGrade === null ? 'linear-gradient(135deg, #C9952A, #DDAD50)' : '#FFFFFF',
              color: filterGrade === null ? '#fff' : DK.dimTxt,
              border: filterGrade === null ? 'none' : '1px solid #EDE3CE',
            }}
          >
            الكل
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGrade(g.id)}
              className="text-sm px-4 py-1.5 rounded-full transition"
              style={{
                background: filterGrade === g.id ? 'linear-gradient(135deg, #C9952A, #DDAD50)' : '#FFFFFF',
                color: filterGrade === g.id ? '#fff' : DK.dimTxt,
                border: filterGrade === g.id ? 'none' : '1px solid #EDE3CE',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
              <span style={{ color: DK.dimTxt, fontSize: '14px' }}>جاري التحميل...</span>
            </div>
          ) : displayed.length === 0 ? (
            <p className="text-center py-12" style={{ color: DK.dimTxt }}>
              {grades.length === 0 ? 'أضف صفوفاً دراسية أولاً من صفحة الصفوف.' : 'لا توجد مواد بعد. أضف أول مادة!'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                <tr>
                  {['المادة', 'الصف', 'الترتيب', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} className="px-6 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                      style={{ color: DK.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((cat) => (
                  <tr key={cat.id} className="transition"
                    style={{ borderBottom: '1px solid #EDE3CE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-6 py-4 font-medium" style={{ color: '#1B2038' }}>{cat.name}</td>
                    <td className="px-6 py-4" style={{ color: DK.dimTxt }}>{cat.grade?.name ?? '—'}</td>
                    <td className="px-6 py-4" style={{ color: DK.dimTxt }}>{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={cat.is_active
                          ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                          : { background: '#F9FAFB', color: DK.dimTxt }}>
                        {cat.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(cat.id)}
                          disabled={toggling === cat.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50"
                          style={cat.is_active
                            ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                          {toggling === cat.id ? '...' : cat.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={deleting === cat.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                          {deleting === cat.id ? '...' : 'حذف'}
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

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1B2038' }}>إضافة مادة دراسية</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الصف الدراسي</label>
                <select
                  value={form.grade_id}
                  onChange={(e) => setForm({ ...form, grade_id: Number(e.target.value) })}
                  onFocus={() => setFocusedInput('grade')}
                  onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('grade'), cursor: 'pointer' }}>
                  <option value={0} disabled>اختر الصف</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>اسم المادة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: الرياضيات"
                  required autoFocus
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('name')} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الترتيب</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  min={0}
                  onFocus={() => setFocusedInput('sort')}
                  onBlur={() => setFocusedInput(null)}
                  style={inputStyle('sort')} dir="ltr" />
              </div>
              {addError && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{addError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
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
