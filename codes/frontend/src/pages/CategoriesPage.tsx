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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">المواد الدراسية</h2>
          <button
            onClick={openModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + إضافة مادة
          </button>
        </div>

        {/* Filter by grade */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterGrade(null)}
            className={`text-sm px-4 py-1.5 rounded-full transition ${
              filterGrade === null
                ? 'bg-teal-700 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            الكل
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGrade(g.id)}
              className={`text-sm px-4 py-1.5 rounded-full transition ${
                filterGrade === g.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
          ) : displayed.length === 0 ? (
            <p className="text-center py-12 text-gray-400">
              {grades.length === 0
                ? 'أضف صفوفاً دراسية أولاً من صفحة الصفوف.'
                : 'لا توجد مواد بعد. أضف أول مادة!'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right font-medium">المادة</th>
                  <th className="px-6 py-3 text-right font-medium">الصف</th>
                  <th className="px-6 py-3 text-right font-medium">الترتيب</th>
                  <th className="px-6 py-3 text-right font-medium">الحالة</th>
                  <th className="px-6 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-6 py-4 text-gray-500">{cat.grade?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {cat.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleToggle(cat.id)}
                        disabled={toggling === cat.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                          cat.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {toggling === cat.id ? '...' : cat.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        {deleting === cat.id ? '...' : 'حذف'}
                      </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">إضافة مادة دراسية</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">الصف الدراسي</label>
                <select
                  value={form.grade_id}
                  onChange={(e) => setForm({ ...form, grade_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value={0} disabled>اختر الصف</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم المادة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: الرياضيات"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الترتيب</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  min={0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  dir="ltr"
                />
              </div>
              {addError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
                >
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200"
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
