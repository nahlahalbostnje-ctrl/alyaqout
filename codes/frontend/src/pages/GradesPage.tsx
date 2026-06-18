import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchGrades,
  addGrade,
  toggleGrade,
  deleteGrade,
} from '../features/admin/gradesSlice';
import AdminLayout from '../components/AdminLayout';

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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">الصفوف الدراسية</h2>
          <button
            onClick={() => { setShowModal(true); setAddError(null); }}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + إضافة صف
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
          ) : grades.length === 0 ? (
            <p className="text-center py-12 text-gray-400">لا توجد صفوف بعد. أضف أول صف!</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right font-medium">اسم الصف</th>
                  <th className="px-6 py-3 text-right font-medium">الترتيب</th>
                  <th className="px-6 py-3 text-right font-medium">الحالة</th>
                  <th className="px-6 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{grade.name}</td>
                    <td className="px-6 py-4 text-gray-500">{grade.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        grade.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {grade.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleToggle(grade.id)}
                        disabled={toggling === grade.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                          grade.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {toggling === grade.id ? '...' : grade.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        disabled={deleting === grade.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        {deleting === grade.id ? '...' : 'حذف'}
                      </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">إضافة صف دراسي</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم الصف</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الصف الأول"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الترتيب</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
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
