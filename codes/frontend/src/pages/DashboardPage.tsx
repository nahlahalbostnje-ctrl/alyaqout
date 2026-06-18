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

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  input:   {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  },
};

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
      <div className="p-8 min-h-screen" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.7 }}>
              السوبر أدمن
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.5px' }}>إدارة الدول</h1>
              <p className="text-sm mt-1.5" style={{ color: DK.dimTxt }}>عرض وإدارة الدول المسجّلة في المنصة</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`,
                color: DK.navy,
                boxShadow: '0 4px 18px rgba(245,166,35,0.3)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              إضافة دولة
            </button>
          </div>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.2), transparent)' }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="إجمالي الدول"  value={list.length}                             accent="#f5a623" iconPath="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="دول نشطة"      value={list.filter((c) => c.is_active).length}  accent="#34d399" iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="دول معطّلة"    value={list.filter((c) => !c.is_active).length} accent="#f87171" iconPath="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </div>

        {/* Table */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(245,166,35,0.2)', borderTopColor: DK.gold }} />
          </div>
        )}
        {error && (
          <p className="text-center py-6 text-sm" style={{ color: '#f87171' }}>{error}</p>
        )}

        {!loading && !error && (
          <div className="rounded-2xl overflow-hidden" style={DK.card}>
            <table className="w-full text-sm text-right">
              <thead>
                <tr style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  {['#', 'الدولة', 'الرمز', 'العملة', 'كود الهاتف', 'الحالة', 'الإجراءات'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((country, i) => (
                  <tr
                    key={country.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-5 py-4 text-xs font-medium" style={{ color: DK.dimTxt }}>{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                          style={{ background: 'rgba(245,166,35,0.12)', color: DK.gold, border: '1px solid rgba(245,166,35,0.2)' }}
                        >
                          {country.code}
                        </div>
                        <span className="font-bold text-white">{country.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: DK.dimTxt }}>{country.code}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: DK.dimTxt }}>{country.currency}</td>
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: DK.dimTxt }}>{country.phone_code || '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(country.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                        style={
                          country.is_active
                            ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                            : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${country.is_active ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        {country.is_active ? 'نشط' : 'معطّل'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <ActionBtn onClick={() => openView(country)}    variant="ghost">عرض</ActionBtn>
                        <ActionBtn onClick={() => openEdit(country)}    variant="gold">تعديل</ActionBtn>
                        <ActionBtn onClick={() => navigate(`/dashboard/countries/${country.id}/admins`)} variant="blue">المسؤولون</ActionBtn>
                        <ActionBtn onClick={() => openDelete(country)}  variant="red">حذف</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="text-center py-16 text-sm" style={{ color: DK.dimTxt }}>لا توجد دول. أضف دولة جديدة.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <DarkModal title={modal.type === 'add' ? 'إضافة دولة جديدة' : 'تعديل بيانات الدولة'} onClose={closeModal}>
          <div className="space-y-4">
            <DarkField label="اسم الدولة"             value={form.name}       onChange={(v) => f('name', v)} />
            <DarkField label="الرمز (مثال: PS)"        value={form.code}       onChange={(v) => f('code', v)} />
            <DarkField label="العملة (مثال: ILS)"      value={form.currency}   onChange={(v) => f('currency', v)} />
            <DarkField label="كود الهاتف (مثال: +970)" value={form.phone_code} onChange={(v) => f('phone_code', v)} />
            <DarkField label="الترتيب"                 value={String(form.sort_order)} onChange={(v) => f('sort_order', parseInt(v) || 0)} type="number" />
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={(e) => f('is_active', e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: DK.gold }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>دولة نشطة</span>
            </label>
            {actionErr && <p className="text-xs" style={{ color: '#f87171' }}>{actionErr}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy }}>
                {saving ? 'جاري الحفظ…' : 'حفظ'}
              </button>
              <button onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                إلغاء
              </button>
            </div>
          </div>
        </DarkModal>
      )}

      {/* Modal: View */}
      {modal?.type === 'view' && liveView && (
        <DarkModal title={liveView.name} onClose={closeModal}>
          <dl className="space-y-0 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <DarkRow k="الرمز"      v={liveView.code} />
            <DarkRow k="العملة"     v={liveView.currency} />
            <DarkRow k="كود الهاتف" v={liveView.phone_code || '—'} />
            <DarkRow k="الترتيب"    v={String(liveView.sort_order)} />
            <DarkRow k="الحالة"     v={liveView.is_active ? 'نشط' : 'معطّل'} />
            <DarkRow k="المسؤولون"  v={`${liveView.admins.length} مسؤول`} />
          </dl>
          <div className="flex gap-3">
            <button onClick={() => { closeModal(); navigate(`/dashboard/countries/${liveView.id}/admins`); }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy }}>
              إدارة المسؤولين
            </button>
            <button onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
              إغلاق
            </button>
          </div>
        </DarkModal>
      )}

      {/* Modal: Delete */}
      {modal?.type === 'delete' && (
        <DarkModal title="تأكيد الحذف" onClose={closeModal}>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            هل تريد حذف دولة <strong className="text-white">{modal.country.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          {actionErr && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{actionErr}</p>}
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {saving ? 'جاري الحذف…' : 'حذف'}
            </button>
            <button onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
              إلغاء
            </button>
          </div>
        </DarkModal>
      )}
    </SuperAdminLayout>
  );
}

/* ── Micro components ── */

function StatCard({ label, value, accent, iconPath }: { label: string; value: number; accent: string; iconPath: string }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300"
      style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <svg className="w-5 h-5" fill="none" stroke={accent} viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      </div>
    </div>
  );
}

type ActionVariant = 'ghost' | 'gold' | 'blue' | 'red';
function ActionBtn({ onClick, variant, children }: { onClick: () => void; variant: ActionVariant; children: React.ReactNode }) {
  const styles: Record<ActionVariant, React.CSSProperties> = {
    ghost: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' },
    gold:  { background: 'rgba(245,166,35,0.12)',  color: '#f5a623',  border: '1px solid rgba(245,166,35,0.2)' },
    blue:  { background: 'rgba(96,165,250,0.12)',  color: '#60a5fa',  border: '1px solid rgba(96,165,250,0.2)' },
    red:   { background: 'rgba(239,68,68,0.1)',    color: '#f87171',  border: '1px solid rgba(239,68,68,0.2)' },
  };
  return (
    <button onClick={onClick}
      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
      style={styles[variant]}>
      {children}
    </button>
  );
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      dir="rtl"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DarkField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...DK.input,
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
      />
    </div>
  );
}

function DarkRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <dt className="text-xs w-24 shrink-0 pt-0.5" style={{ color: 'rgba(245,166,35,0.5)' }}>{k}</dt>
      <dd className="font-bold text-sm text-white">{v}</dd>
    </div>
  );
}
