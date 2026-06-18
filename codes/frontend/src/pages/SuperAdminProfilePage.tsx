import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateProfile } from '../features/auth/authSlice';
import SuperAdminLayout from '../components/SuperAdminLayout';

export default function SuperAdminProfilePage() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);

  const [form, setForm]     = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')
    : 'م';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await dispatch(updateProfile({ name: form.name, phone: form.phone })).unwrap();
      setMsg({ type: 'success', text: 'تم تحديث بياناتك بنجاح.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err as string });
    } finally { setSaving(false); }
  }

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-2xl mx-auto" dir="rtl">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">الملف الشخصي</h2>
          <p className="text-gray-400 text-sm mt-0.5">إدارة بيانات حسابك الشخصي</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.phone}</p>
            <span className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              سوبر أدمن
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">المعلومات الأساسية</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف (واتساب)</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-indigo-700">
                تسجيل الدخول يتم عبر رمز OTP على واتساب — لا توجد كلمة مرور. تأكد من صحة رقم الهاتف.
              </p>
            </div>

            {msg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {msg.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </SuperAdminLayout>
  );
}
