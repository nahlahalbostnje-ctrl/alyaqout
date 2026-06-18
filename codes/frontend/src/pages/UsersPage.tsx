import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchUsers,
  addUser,
  toggleUser,
  deleteUser,
  type UserRole,
} from '../features/admin/usersSlice';
import AdminLayout from '../components/AdminLayout';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'teacher', label: 'المعلمون' },
  { value: 'student', label: 'الطلاب' },
  { value: 'parent',  label: 'أولياء الأمور' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  teacher: 'معلم',
  student: 'طالب',
  parent:  'ولي أمر',
};

const ROLE_COLORS: Record<UserRole, string> = {
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-purple-100 text-purple-700',
  parent:  'bg-orange-100 text-orange-700',
};

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list: users, loading } = useAppSelector((s) => s.adminUsers);

  const [activeTab, setActiveTab] = useState<UserRole>('teacher');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', role: 'teacher' as UserRole });
  const [addError, setAddError]   = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);
  const [deleting, setDeleting]   = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchUsers(null));
  }, [dispatch]);

  const openModal = () => {
    setForm({ name: '', phone: '', role: activeTab });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addUser(form));
    setAddLoading(false);
    if (addUser.fulfilled.match(result)) {
      setShowModal(false);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleUser(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    setDeleting(id);
    await dispatch(deleteUser(id));
    setDeleting(null);
  };

  const displayed = users.filter((u) => u.role === activeTab);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h2>
          <button
            onClick={openModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + إضافة {ROLE_LABELS[activeTab]}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-200 p-1 rounded-xl w-fit">
          {ROLES.map((r) => {
            const count = users.filter((u) => u.role === r.value).length;
            return (
              <button
                key={r.value}
                onClick={() => setActiveTab(r.value)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === r.value
                    ? 'bg-white text-teal-700 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {r.label}
                <span className={`mr-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === r.value ? 'bg-teal-100 text-teal-700' : 'bg-gray-300 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
          ) : displayed.length === 0 ? (
            <p className="text-center py-12 text-gray-400">
              لا يوجد {ROLE_LABELS[activeTab]} بعد.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right font-medium">الاسم</th>
                  <th className="px-6 py-3 text-right font-medium">رقم الهاتف</th>
                  <th className="px-6 py-3 text-right font-medium">الدور</th>
                  <th className="px-6 py-3 text-right font-medium">الحالة</th>
                  <th className="px-6 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500" dir="ltr">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleToggle(user.id)}
                        disabled={toggling === user.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                          user.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {toggling === user.id ? '...' : user.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleting === user.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        {deleting === user.id ? '...' : 'حذف'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              إضافة {ROLE_LABELS[form.role]}
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">الدور</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label.replace(/ون$/, '')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+962791234567"
                  required
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
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
                  {addLoading ? 'جاري الإنشاء...' : 'إنشاء'}
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
