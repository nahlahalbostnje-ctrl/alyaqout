import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchUsers, addUser, toggleUser, deleteUser } from '../features/admin/usersSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
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

type Role = 'teacher' | 'student' | 'parent';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list: users, loading } = useAppSelector((s) => s.adminUsers);

  const [role, setRole]           = useState<Role>('teacher');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', role: 'teacher' as Role });
  const [addError, setAddError]   = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchUsers(null)); }, [dispatch]);

  const filtered = users.filter((u) => u.role === role);

  const openModal = () => {
    setForm({ name: '', phone: '', role });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true); setAddError(null);
    const result = await dispatch(addUser(form));
    setAddLoading(false);
    if (addUser.fulfilled.match(result)) setShowModal(false);
    else setAddError(result.payload as string);
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleUser(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    setDeleting(id);
    await dispatch(deleteUser(id));
    setDeleting(null);
  };

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  const tabs: { key: Role; label: string }[] = [
    { key: 'teacher', label: 'المعلمون' },
    { key: 'student', label: 'الطلاب' },
    { key: 'parent',  label: 'أولياء الأمور' },
  ];

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>المستخدمون</h2>
          </div>
          <button onClick={openModal} className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
            + إضافة مستخدم
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setRole(t.key)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition"
              style={role === t.key
                ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }
                : { background: '#FFFFFF', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12" style={{ color: DK.dimTxt }}>لا يوجد مستخدمون من هذه الفئة بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                <tr>
                  {['الاسم', 'رقم الهاتف', 'تاريخ التسجيل', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} className="px-6 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                      style={{ color: DK.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="transition"
                    style={{ borderBottom: '1px solid #EDE3CE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>
                          {user.name?.[0] ?? '?'}
                        </div>
                        <span className="font-medium" style={{ color: '#1B2038' }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: DK.dimTxt }} dir="ltr">{user.phone}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: DK.dimTxt }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={user.is_active
                          ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                          : { background: '#F9FAFB', color: DK.dimTxt }}>
                        {user.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle(user.id)} disabled={toggling === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          style={user.is_active
                            ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                          {toggling === user.id ? '...' : user.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button onClick={() => handleDelete(user.id)} disabled={deleting === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                          {deleting === user.id ? '...' : 'حذف'}
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

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1B2038' }}>إضافة مستخدم</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الدور</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  onFocus={() => setFocusedInput('role')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('role'), cursor: 'pointer' }}>
                  <option value="teacher">معلم</option>
                  <option value="student">طالب</option>
                  <option value="parent">ولي أمر</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الاسم</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="الاسم الكامل" required autoFocus
                  onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('name')} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>رقم الهاتف (واتساب)</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="مثال: 9665xxxxxxxx+" required dir="ltr"
                  onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('phone')} />
              </div>
              {addError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
