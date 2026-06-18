import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchPackages,
  addPackage,
  togglePackage,
  deletePackage,
} from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';

const emptyForm = { name: '', description: '', price: 0, duration_days: 30, sort_order: 0 };

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const { list: packages, loading } = useAppSelector((s) => s.packages);

  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addPackage(form));
    setAddLoading(false);
    if (addPackage.fulfilled.match(result)) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(togglePackage(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setDeleting(id);
    await dispatch(deletePackage(id));
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">الباقات والاشتراكات</h2>
          <button
            onClick={() => { setShowModal(true); setAddError(null); setForm(emptyForm); }}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + إضافة باقة
          </button>
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
        ) : packages.length === 0 ? (
          <p className="text-center py-16 text-gray-400">لا توجد باقات بعد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`bg-white rounded-xl shadow p-5 border-2 ${
                pkg.is_active ? 'border-teal-100' : 'border-gray-100 opacity-60'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-base">{pkg.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {pkg.is_active ? 'نشط' : 'معطّل'}
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700" dir="ltr">
                      {Number(pkg.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">السعر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{pkg.duration_days}</p>
                    <p className="text-xs text-gray-400">يوم</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(pkg.id)}
                    disabled={toggling === pkg.id}
                    className={`flex-1 text-xs py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                      pkg.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {toggling === pkg.id ? '...' : pkg.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    disabled={deleting === pkg.id}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {deleting === pkg.id ? '...' : 'حذف'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">إضافة باقة اشتراك</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم الباقة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: الباقة الشهرية"
                  required autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="ما تشمله الباقة..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">السعر</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0} step={0.01} required dir="ltr"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">المدة (أيام)</label>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                    min={1} required dir="ltr"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
              {addError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50">
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">
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
