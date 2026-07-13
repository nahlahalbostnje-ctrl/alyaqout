import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCountries,
  addCountry,
  updateCountry,
  toggleCountry,
  deleteCountry,
  type Country,
} from '../features/countries/countriesSlice';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../components/Toast';
import { getApiError } from '../utils/apiError';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const emptyForm = {
  name: '',
  code: '',
  currency: '',
  phone_code: '',
  sort_order: '0',
};

export default function SACountriesPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, loading, error } = useAppSelector((s) => s.countries);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Country | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  useEffect(() => { dispatch(fetchCountries()); }, [dispatch]);

  const filtered = list.filter((c) =>
    !search || c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (c: Country) => {
    setEditTarget(c);
    setForm({
      name: c.name,
      code: c.code,
      currency: c.currency,
      phone_code: c.phone_code || '',
      sort_order: String(c.sort_order ?? 0),
    });
    setFormErr('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.currency.trim()) {
      setFormErr('الاسم والكود والعملة مطلوبة');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      if (editTarget) {
        await dispatch(updateCountry({
          id: editTarget.id,
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
          phone_code: form.phone_code.trim() || '',
          sort_order: Number(form.sort_order) || 0,
        })).unwrap();
      } else {
        await dispatch(addCountry({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
          phone_code: form.phone_code.trim() || '',
          is_active: true,
          sort_order: Number(form.sort_order) || 0,
        })).unwrap();
      }
      setShowModal(false);
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      setFormErr(typeof e === 'string' ? e : 'تعذّر حفظ الدولة');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Country) => {
    try {
      await dispatch(toggleCountry(c.id)).unwrap();
    } catch (err: unknown) {
      toast.error(getApiError(err, 'تعذّر تغيير حالة الدولة'));
    }
  };

  const askDelete = (c: Country) => {
    setDeleteErr('');
    setDeleteTarget(c);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteErr('');
    try {
      await dispatch(deleteCountry(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      const msg = typeof e === 'string' ? e : 'تعذّر حذف الدولة';
      const friendly = /No query results|not found|ModelNotFound/i.test(msg)
        ? 'هذه الدولة غير موجودة أو سبق حذفها. سيتم تحديث القائمة.'
        : msg;
      setDeleteErr(friendly);
      await dispatch(fetchCountries());
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SuperAdminShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>إدارة الدول</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>
            {loading ? 'جارٍ التحميل...' : `${list.length} دولة في قاعدة البيانات`}
          </p>
        </div>
        <button onClick={openAdd}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.3)' }}>
          + إضافة دولة
        </button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      <div style={card({ marginBottom:14, padding:'12px 16px' })}>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..."
          style={{ width:'100%', padding:'8px 14px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
      </div>

      <div style={card({ padding:0, overflowX:'auto' })}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
          <thead>
            <tr style={{ background:'rgba(0,0,0,0.03)' }}>
              {['الدولة','الكود','العملة','مفتاح الهاتف','المدراء','الحالة','إجراءات'].map((h)=>(
                <th key={h} style={{ padding:'12px 14px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>جارٍ التحميل...</p></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد دول — أضف دولة جديدة من الزر أعلاه</p></td></tr>
            ) : filtered.map((c)=>(
              <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{c.name}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12, direction:'ltr', textAlign:'right' }}>{c.code}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{c.currency}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12, direction:'ltr', textAlign:'right' }}>{c.phone_code || '—'}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontSize:12 }}>{c.admins?.length ?? 0}</td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:c.is_active?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)', color:c.is_active?C.green:C.orange }}>
                    {c.is_active ? 'نشطة' : 'موقوفة'}
                  </span>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <button onClick={()=>openEdit(c)} title="تعديل" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>✏️</button>
                    <button onClick={()=>handleToggle(c)} title={c.is_active?'إيقاف':'تفعيل'} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>🔒</button>
                    <button onClick={()=>navigate(`/dashboard/countries/${c.id}/admins`)} title="المدراء" style={{ padding:'0 10px', height:30, borderRadius:8, border:`1px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, cursor:'pointer', fontSize:11, fontWeight:700 }}>المدراء</button>
                    <button onClick={()=>askDelete(c)} title="حذف" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background:C.card, borderRadius:20, padding:28, width:460, maxWidth:'90vw' }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:17 }}>{editTarget ? `تعديل ${editTarget.name}` : 'إضافة دولة جديدة'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:C.sub }}>×</button>
            </div>

            {[
              { l:'اسم الدولة', key:'name' as const, p:'مثال: فلسطين' },
              { l:'الكود (ISO)', key:'code' as const, p:'مثال: PS' },
              { l:'العملة', key:'currency' as const, p:'مثال: ILS' },
              { l:'مفتاح الهاتف', key:'phone_code' as const, p:'مثال: +970' },
              { l:'ترتيب العرض', key:'sort_order' as const, p:'0' },
            ].map((f)=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>{f.l}</label>
                <input value={form[f.key]} onChange={(e)=>setForm((prev)=>({...prev, [f.key]:e.target.value}))} placeholder={f.p}
                  style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
              </div>
            ))}

            {formErr && (
              <p style={{ background:'rgba(239,68,68,0.08)', color:C.red, borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:12 }}>{formErr}</p>
            )}

            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button disabled={saving} onClick={handleSubmit} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', opacity:saving?0.7:1 }}>
                {saving ? 'جارٍ الحفظ...' : (editTarget ? 'حفظ التعديلات' : 'إضافة الدولة')}
              </button>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, background:C.bg, color:C.sub, fontWeight:600, fontSize:13, border:`1px solid ${C.border}`, cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="تأكيد حذف الدولة"
        itemLabel={deleteTarget?.name}
        message={deleteTarget ? (
          <>
            هل أنت متأكد من حذف دولة <strong style={{ color: C.text }}>«{deleteTarget.name}»</strong>؟
            <br />
            قد تفشل العملية إن وُجدت أفرع أو مستخدمون مرتبطون بهذه الدولة.
          </>
        ) : null}
        busy={deleting}
        error={deleteErr || null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => { if (!deleting) { setDeleteTarget(null); setDeleteErr(''); } }}
      />
    </SuperAdminShell>
  );
}
