import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import type { CountryAdmin } from '../features/countries/countriesSlice';
import {
  fetchCountries,
  createCountryAdmin,
  updateCountryAdmin,
  toggleCountryAdmin,
  deleteCountryAdmin,
} from '../features/countries/countriesSlice';
import SuperAdminLayout from '../components/SuperAdminLayout';

export default function CountryAdminsPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate       = useNavigate();
  const dispatch       = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.countries);

  const country = list.find((c) => c.id === Number(countryId));

  const [form, setForm]       = useState({ name: '', phone: '' });
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<CountryAdmin | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [editAdmin, setEditAdmin]         = useState<CountryAdmin | null>(null);
  const [editForm, setEditForm]           = useState({ name: '', phone: '' });
  const [editSaving, setEditSaving]       = useState(false);
  const [editErr, setEditErr]             = useState('');

  useEffect(() => {
    if (list.length === 0) dispatch(fetchCountries());
  }, [dispatch, list.length]);

  async function handleAdd() {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormErr('الاسم ورقم الهاتف مطلوبان');
      return;
    }
    setSaving(true); setFormErr('');
    try {
      await dispatch(createCountryAdmin({ countryId: Number(countryId), name: form.name, phone: form.phone })).unwrap();
      setForm({ name: '', phone: '' });
    } catch (e: any) { setFormErr(e as string); }
    finally { setSaving(false); }
  }

  async function handleToggle(adminId: number) {
    await dispatch(toggleCountryAdmin({ countryId: Number(countryId), adminId }));
  }

  function openEdit(admin: CountryAdmin) {
    setEditAdmin(admin);
    setEditForm({ name: admin.name, phone: admin.phone });
    setEditErr('');
  }

  async function handleUpdate() {
    if (!editAdmin) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) { setEditErr('الاسم ورقم الهاتف مطلوبان'); return; }
    setEditSaving(true); setEditErr('');
    try {
      await dispatch(updateCountryAdmin({ countryId: Number(countryId), adminId: editAdmin.id, name: editForm.name, phone: editForm.phone })).unwrap();
      setEditAdmin(null);
    } catch (e: any) { setEditErr(e as string); }
    finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteCountryAdmin({ countryId: Number(countryId), adminId: confirmDelete.id })).unwrap();
      setConfirmDelete(null);
    } catch { /* error handled silently */ }
    finally { setDeleting(false); }
  }

  if (loading && !country) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">جاري التحميل…</div>
      </SuperAdminLayout>
    );
  }

  if (!country) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3" dir="rtl">
          <p className="text-gray-500">الدولة غير موجودة</p>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline text-sm">العودة للوحة التحكم</button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-6" dir="rtl">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">مسؤولو {country.name}</h2>
            <p className="text-gray-400 text-sm">{country.admins.length} مسؤول مسجّل</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Admins list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-700 text-sm">قائمة المسؤولين</h3>
              </div>
              {country.admins.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  لا يوجد مسؤولون لهذه الدولة بعد
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {country.admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">{admin.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{admin.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${admin.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {admin.is_active ? 'نشط' : 'معطّل'}
                        </span>
                        <button
                          onClick={() => openEdit(admin)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleToggle(admin.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition ${
                            admin.is_active
                              ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                              : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {admin.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(admin)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add form */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">إضافة مسؤول جديد</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: محمد أحمد"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+970599000000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                {formErr && <p className="text-red-500 text-xs">{formErr}</p>}
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {saving ? 'جاري الإضافة…' : 'إضافة المسؤول'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit admin modal */}
      {editAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl" onClick={() => setEditAdmin(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">تعديل بيانات المسؤول</h3>
              <button onClick={() => setEditAdmin(null)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {editErr && <p className="text-red-500 text-xs">{editErr}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleUpdate}
                  disabled={editSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {editSaving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
                </button>
                <button onClick={() => setEditAdmin(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 mb-5">
              هل تريد حذف المسؤول <strong>{confirmDelete.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50">
                {deleting ? 'جاري الحذف…' : 'حذف'}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
