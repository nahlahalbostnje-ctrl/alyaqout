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
  } as React.CSSProperties,
};

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
  const [toggling, setToggling]           = useState<number | null>(null);

  useEffect(() => {
    if (list.length === 0) dispatch(fetchCountries());
  }, [dispatch, list.length]);

  async function handleAdd() {
    if (!form.name.trim() || !form.phone.trim()) { setFormErr('الاسم ورقم الهاتف مطلوبان'); return; }
    setSaving(true); setFormErr('');
    try {
      await dispatch(createCountryAdmin({ countryId: Number(countryId), name: form.name, phone: form.phone })).unwrap();
      setForm({ name: '', phone: '' });
    } catch (e: any) { setFormErr(e as string); }
    finally { setSaving(false); }
  }

  async function handleToggle(adminId: number) {
    setToggling(adminId);
    await dispatch(toggleCountryAdmin({ countryId: Number(countryId), adminId }));
    setToggling(null);
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
    } catch { /* ignored */ }
    finally { setDeleting(false); }
  }

  if (loading && !country) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full animate-spin"
            style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: DK.gold }} />
        </div>
      </SuperAdminLayout>
    );
  }

  if (!country) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4" dir="rtl">
          <p style={{ color: DK.dimTxt }}>الدولة غير موجودة</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-bold transition hover:opacity-70"
            style={{ color: DK.gold }}
          >
            العودة للوحة التحكم
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-black/5"
              style={{ background: '#F9FAFB', border: '1px solid #EDE3CE', color: DK.dimTxt }}
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>
              إدارة الدول
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1" style={{ color: '#1B2038' }}>مسؤولو {country.name}</h1>
          <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>{country.admins.length} مسؤول مسجّل</p>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Admins list */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={DK.card}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #EDE3CE' }}>
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: DK.gold }}>قائمة المسؤولين</h3>
              </div>
              {country.admins.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid #EDE3CE' }}>
                    <svg className="w-5 h-5" fill="none" stroke="rgba(201,149,42,0.4)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: DK.dimTxt }}>لا يوجد مسؤولون لهذه الدولة بعد</p>
                </div>
              ) : (
                <div>
                  {country.admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between px-5 py-4 transition-colors"
                      style={{ borderBottom: '1px solid #EDE3CE' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                        >
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#1B2038' }}>{admin.name}</p>
                          <p className="text-xs mt-0.5 dir-ltr" style={{ color: DK.dimTxt }}>{admin.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={admin.is_active
                            ? { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                            : { background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }
                          }
                        >
                          {admin.is_active ? 'نشط' : 'معطّل'}
                        </span>
                        <button
                          onClick={() => openEdit(admin)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-80"
                          style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleToggle(admin.id)}
                          disabled={toggling === admin.id}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-40"
                          style={admin.is_active
                            ? { background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
                          }
                        >
                          {toggling === admin.id ? '...' : admin.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(admin)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-80"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
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
            <div className="rounded-2xl p-5" style={DK.card}>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: DK.gold }}>
                إضافة مسؤول جديد
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>الاسم الكامل</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: محمد أحمد"
                    style={DK.inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                    onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>رقم الهاتف</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+970599000000"
                    dir="ltr"
                    style={DK.inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                    onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                  />
                </div>
                {formErr && (
                  <p className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {formErr}
                  </p>
                )}
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                >
                  {saving ? 'جاري الإضافة…' : 'إضافة المسؤول'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit modal */}
      {editAdmin && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          dir="rtl"
          onClick={() => setEditAdmin(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: '#1B2038' }}>تعديل بيانات المسؤول</h3>
              <button onClick={() => setEditAdmin(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-black/5"
                style={{ color: DK.dimTxt }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>الاسم الكامل</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: DK.gold }}>رقم الهاتف</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  dir="ltr"
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                />
              </div>
              {editErr && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {editErr}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleUpdate}
                  disabled={editSaving}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                >
                  {editSaving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
                </button>
                <button onClick={() => setEditAdmin(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          dir="rtl"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg className="w-6 h-6" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-center mb-2" style={{ color: '#1B2038' }}>تأكيد الحذف</h3>
            <p className="text-sm text-center mb-5" style={{ color: DK.dimTxt }}>
              هل تريد حذف المسؤول <span className="font-bold" style={{ color: '#1B2038' }}>{confirmDelete.name}</span>؟ لا يمكن التراجع.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {deleting ? 'جاري الحذف…' : 'حذف'}
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
