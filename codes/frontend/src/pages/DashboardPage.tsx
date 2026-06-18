import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import type { Country } from '../features/countries/countriesSlice';
import {
  fetchCountries,
  addCountry,
  updateCountry,
  deleteCountry,
  toggleCountry,
} from '../features/countries/countriesSlice';
import SuperAdminLayout from '../components/SuperAdminLayout';

const emptyForm = { name: '', code: '', currency: '', phone_code: '', sort_order: 0, is_active: true };

export default function DashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { list, loading, error } = useAppSelector((s) => s.countries);

  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [actionErr, setActionErr] = useState('');

  const [modal, setModal] = useState<
    | { type: 'add' }
    | { type: 'edit';   country: Country }
    | { type: 'view';   country: Country }
    | { type: 'delete'; country: Country }
    | null
  >(null);

  useEffect(() => { dispatch(fetchCountries()); }, [dispatch]);

  function openAdd()              { setForm(emptyForm); setActionErr(''); setModal({ type: 'add' }); }
  function openEdit(c: Country)   { setForm({ name: c.name, code: c.code, currency: c.currency, phone_code: c.phone_code ?? '', sort_order: c.sort_order, is_active: c.is_active }); setActionErr(''); setModal({ type: 'edit', country: c }); }
  function openView(c: Country)   { setModal({ type: 'view', country: c }); }
  function openDelete(c: Country) { setActionErr(''); setModal({ type: 'delete', country: c }); }
  function closeModal()           { setModal(null); setActionErr(''); }

  const f = (k: keyof typeof emptyForm, v: string | number | boolean) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSave() {
    setSaving(true); setActionErr('');
    try {
      if (modal?.type === 'add')  await dispatch(addCountry(form)).unwrap();
      if (modal?.type === 'edit') await dispatch(updateCountry({ id: modal.country.id, ...form })).unwrap();
      closeModal();
    } catch (e: any) { setActionErr(e as string); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return;
    setSaving(true); setActionErr('');
    try { await dispatch(deleteCountry(modal.country.id)).unwrap(); closeModal(); }
    catch (e: any) { setActionErr(e as string); }
    finally { setSaving(false); }
  }

  async function handleToggle(id: number) { await dispatch(toggleCountry(id)); }

  const liveView = modal?.type === 'view'
    ? list.find((c) => c.id === modal.country.id) ?? modal.country
    : null;

  return (
    <SuperAdminLayout>
      <div className="p-6" dir="rtl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">إدارة الدول</h2>
            <p className="text-gray-400 text-sm mt-0.5">عرض وإدارة الدول المسجّلة في المنصة</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            إضافة دولة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="إجمالي الدول" value={list.length}                               icon="🌍" color="indigo" />
          <StatCard label="دول نشطة"     value={list.filter((c) => c.is_active).length}    icon="✅" color="green"  />
          <StatCard label="دول معطّلة"   value={list.filter((c) => !c.is_active).length}   icon="⏸" color="gray"   />
        </div>

        {/* Table */}
        {loading && <p className="text-center text-gray-400 py-12 text-sm">جاري التحميل…</p>}
        {error   && <p className="text-center text-red-500 py-6 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">#</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">الدولة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">الرمز</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">العملة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">كود الهاتف</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">الحالة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((country, i) => (
                  <tr key={country.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 text-xs font-medium">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {country.code}
                        </div>
                        <span className="font-semibold text-gray-800">{country.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{country.code}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{country.currency}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{country.phone_code || '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(country.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                          country.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${country.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {country.is_active ? 'نشط' : 'معطّل'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Btn onClick={() => openView(country)}                                    variant="gray">عرض</Btn>
                        <Btn onClick={() => openEdit(country)}                                    variant="indigo">تعديل</Btn>
                        <Btn onClick={() => navigate(`/dashboard/countries/${country.id}/admins`)} variant="purple">المسؤولون</Btn>
                        <Btn onClick={() => openDelete(country)}                                  variant="red">حذف</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-16">لا توجد دول. أضف دولة جديدة.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'add' ? 'إضافة دولة جديدة' : 'تعديل بيانات الدولة'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="اسم الدولة"              value={form.name}       onChange={(v) => f('name', v)} />
            <Field label="الرمز (مثال: PS)"         value={form.code}       onChange={(v) => f('code', v)} />
            <Field label="العملة (مثال: ILS)"       value={form.currency}   onChange={(v) => f('currency', v)} />
            <Field label="كود الهاتف (مثال: +970)"  value={form.phone_code} onChange={(v) => f('phone_code', v)} />
            <Field label="الترتيب"                  value={String(form.sort_order)} onChange={(v) => f('sort_order', parseInt(v) || 0)} type="number" />
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={(e) => f('is_active', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">دولة نشطة</span>
            </label>
            {actionErr && <p className="text-red-500 text-xs">{actionErr}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50">
                {saving ? 'جاري الحفظ…' : 'حفظ'}
              </button>
              <button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: View */}
      {modal?.type === 'view' && liveView && (
        <Modal title={liveView.name} onClose={closeModal}>
          <dl className="space-y-0 divide-y divide-gray-50 mb-4">
            <DR k="الرمز"      v={liveView.code} />
            <DR k="العملة"     v={liveView.currency} />
            <DR k="كود الهاتف" v={liveView.phone_code || '—'} />
            <DR k="الترتيب"    v={String(liveView.sort_order)} />
            <DR k="الحالة"     v={liveView.is_active ? 'نشط' : 'معطّل'} />
            <DR k="المسؤولون"  v={`${liveView.admins.length} مسؤول`} />
          </dl>
          <div className="flex gap-3">
            <button onClick={() => { closeModal(); navigate(`/dashboard/countries/${liveView.id}/admins`); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm">
              إدارة المسؤولين
            </button>
            <button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">إغلاق</button>
          </div>
        </Modal>
      )}

      {/* Modal: Delete */}
      {modal?.type === 'delete' && (
        <Modal title="تأكيد الحذف" onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-5">هل تريد حذف دولة <strong>{modal.country.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</p>
          {actionErr && <p className="text-red-500 text-xs mb-3">{actionErr}</p>}
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
              {saving ? 'جاري الحذف…' : 'حذف'}
            </button>
            <button onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">إلغاء</button>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  );
}

/* ── Micro components ── */

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green:  'bg-emerald-50 text-emerald-700',
    gray:   'bg-gray-50 text-gray-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

type BtnVariant = 'gray' | 'indigo' | 'purple' | 'red';
function Btn({ onClick, variant, children }: { onClick: () => void; variant: BtnVariant; children: React.ReactNode }) {
  const s: Record<BtnVariant, string> = {
    gray:   'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100',
    indigo: 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
    purple: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100',
    red:    'border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
  };
  return (
    <button onClick={onClick} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${s[variant]}`}>{children}</button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-xl leading-none transition">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
    </div>
  );
}

function DR({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 py-3">
      <dt className="text-gray-400 text-xs w-24 shrink-0 pt-0.5">{k}</dt>
      <dd className="text-gray-800 font-semibold text-sm">{v}</dd>
    </div>
  );
}
