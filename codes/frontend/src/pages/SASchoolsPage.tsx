import { useState, useEffect, useCallback, useMemo } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface BranchRow {
  id: number | null;
  country_id: number;
  country: string;
  admin_name: string | null;
  admin_email: string | null;
  admin_phone: string | null;
  is_active: boolean;
  notes: string | null;
  students: number;
  teachers: number;
  courses: number;
}

function countryFlag(name: string): string {
  if (name.includes('فلسطين') || /palestine/i.test(name)) return '🇵🇸';
  if (name.includes('سعود') || /saudi/i.test(name)) return '🇸🇦';
  if (name.includes('مصر') || /egypt/i.test(name)) return '🇪🇬';
  if (name.includes('أردن') || name.includes('الاردن') || /jordan/i.test(name)) return '🇯🇴';
  if (name.includes('إمارات') || name.includes('الامارات') || /emirates|uae/i.test(name)) return '🇦🇪';
  if (name.includes('كويت') || /kuwait/i.test(name)) return '🇰🇼';
  if (name.includes('قطر') || /qatar/i.test(name)) return '🇶🇦';
  if (name.includes('بحرين') || /bahrain/i.test(name)) return '🇧🇭';
  return '🌍';
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export default function SASchoolsPage() {
  const [branches,     setBranches]     = useState<BranchRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<BranchRow | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState({
    country_id: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    notes: '',
    is_active: true,
  });

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/branches');
      setBranches(data.branches ?? []);
    } catch {
      setError('فشل جلب الأفرع');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBranches(); }, [loadBranches]);

  const realBranches = useMemo(
    () => branches.filter((b): b is BranchRow & { id: number } => b.id != null),
    [branches]
  );

  const unbranchedCountries = useMemo(
    () => branches.filter(b => b.id == null),
    [branches]
  );

  const totalStudents = realBranches.reduce((s, b) => s + (b.students ?? 0), 0);
  const totalTeachers = realBranches.reduce((s, b) => s + (b.teachers ?? 0), 0);
  const activeCount   = realBranches.filter(b => b.is_active).length;

  const filtered = realBranches.filter(b => {
    const statusLabel = b.is_active ? 'نشط' : 'معلق';
    const admin = b.admin_name ?? '';
    return (search === '' || b.country.includes(search) || admin.includes(search))
      && (statusFilter === 'الكل' || statusLabel === statusFilter);
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      country_id: unbranchedCountries[0] ? String(unbranchedCountries[0].country_id) : '',
      admin_name: '',
      admin_email: '',
      admin_phone: '',
      notes: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (b: BranchRow) => {
    setEditTarget(b);
    setForm({
      country_id: String(b.country_id),
      admin_name: b.admin_name ?? '',
      admin_email: b.admin_email ?? '',
      admin_phone: b.admin_phone ?? '',
      notes: b.notes ?? '',
      is_active: b.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editTarget?.id != null) {
        await api.put(`/super-admin/branches/${editTarget.id}`, {
          admin_name: form.admin_name || null,
          admin_email: form.admin_email || null,
          admin_phone: form.admin_phone || null,
          notes: form.notes || null,
          is_active: form.is_active,
        });
      } else {
        if (!form.country_id) {
          alert('يرجى اختيار الدولة');
          setSaving(false);
          return;
        }
        await api.post('/super-admin/branches', {
          country_id: Number(form.country_id),
          admin_name: form.admin_name || null,
          admin_email: form.admin_email || null,
          admin_phone: form.admin_phone || null,
          notes: form.notes || null,
          is_active: form.is_active,
        });
      }
      setShowModal(false);
      await loadBranches();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? 'تعذّر حفظ الفرع');
    } finally {
      setSaving(false);
    }
  };

  const toggleBranch = async (b: BranchRow) => {
    if (b.id == null) return;
    try {
      await api.patch(`/super-admin/branches/${b.id}/toggle`);
      await loadBranches();
    } catch {
      alert('تعذّر تغيير حالة الفرع');
    }
  };

  const askDeleteBranch = (b: BranchRow) => {
    if (b.id == null) return;
    setDeleteError(null);
    setPendingDelete({ id: b.id, label: `فرع ${b.country}` });
  };

  const confirmDeleteBranch = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/super-admin/branches/${pendingDelete.id}`);
      setPendingDelete(null);
      await loadBranches();
    } catch {
      setDeleteError('تعذّر حذف الفرع');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <SuperAdminShell>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>إدارة الأفرع</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>
            {loading ? 'جارٍ التحميل...' : `${realBranches.length} فرع — كل فرع يمثّل دولة واحدة في المنصة`}
          </p>
        </div>
        <button onClick={openAdd}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.3)' }}>
          <span style={{ fontSize:16 }}>+</span> إضافة فرع جديد
        </button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
        {[
          { label:'إجمالي الأفرع',   value:String(realBranches.length), icon:'🌍', color:C.blue   },
          { label:'الأفرع النشطة',   value:String(activeCount),         icon:'✅', color:C.green  },
          { label:'إجمالي الطلاب',   value:fmt(totalStudents),          icon:'🎓', color:C.purple },
          { label:'إجمالي المعلمين', value:fmt(totalTeachers),          icon:'👨‍🏫', color:C.teal  },
        ].map((s,i)=>(
          <div key={i} style={card({ padding:'14px', display:'flex', alignItems:'center', gap:12 })}>
            <div style={{ width:42, height:42, borderRadius:13, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
            <div>
              <p style={{ color:C.text, fontWeight:900, fontSize:20 }}>{loading ? '—' : s.value}</p>
              <p style={{ color:C.sub, fontSize:11 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={card({ marginBottom:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 })}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث عن فرع أو مدير..."
            style={{ width:'100%', padding:'8px 38px 8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', cursor:'pointer' }}>
          {['الكل','نشط','معلق'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card({ padding:0, overflowX:'auto' })}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
          <thead>
            <tr style={{ background:'rgba(0,0,0,0.03)' }}>
              {['#','الفرع / الدولة','الدورات','الطلاب','المعلمون','مدير الفرع','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{ padding:'12px 14px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b,i)=>{
              const status = b.is_active ? 'نشط' : 'معلق';
              return (
                <tr key={b.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':'rgba(0,0,0,0.015)' }}>
                  <td style={{ padding:'12px 14px', color:C.dim, fontSize:12 }}>{b.id}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:`${C.gold}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{countryFlag(b.country)}</div>
                      <div>
                        <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>فرع {b.country}</p>
                        <p style={{ color:C.sub, fontSize:11 }}>{b.country}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{b.courses}</td>
                  <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{fmt(b.students)}</td>
                  <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{b.teachers}</td>
                  <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{b.admin_name || '—'}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:b.is_active?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)', color:b.is_active?C.green:C.orange }}>{status}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openEdit(b)} title="تعديل" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✏️</button>
                      <button onClick={()=>toggleBranch(b)} title={b.is_active?'تعليق':'تفعيل'} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🔒</button>
                      <button onClick={()=>askDeleteBranch(b)} title="حذف" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'32px', color:C.sub, fontSize:13 }}>
            {realBranches.length === 0 ? 'لا توجد أفرع' : 'لا توجد نتائج مطابقة'}
          </div>
        )}
        {loading && (
          <div style={{ textAlign:'center', padding:'32px', color:C.sub, fontSize:13 }}>جارٍ التحميل...</div>
        )}
      </div>

      {/* Modal */}
      {showModal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background:C.card, borderRadius:20, padding:28, width:500, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:17 }}>{editTarget ? `تعديل فرع ${editTarget.country}` : 'إضافة فرع جديد'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:C.sub }}>×</button>
            </div>
            <p style={{ color:C.sub, fontSize:12, marginBottom:18, background:C.bg, borderRadius:10, padding:'10px 14px' }}>
              ⚠️ كل فرع يمثّل دولة واحدة فقط — لا يمكن إنشاء أكثر من فرع لنفس الدولة.
            </p>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الدولة</label>
              {editTarget ? (
                <input value={editTarget.country} disabled
                  style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
              ) : (
                <select value={form.country_id} onChange={e=>setForm(f=>({...f, country_id:e.target.value}))}
                  style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                  <option value="">اختر الدولة</option>
                  {unbranchedCountries.map(c => (
                    <option key={c.country_id} value={c.country_id}>{c.country}</option>
                  ))}
                </select>
              )}
            </div>

            {[
              { l:'اسم مدير الفرع', key:'admin_name' as const, p:'الاسم الكامل لمدير هذا الفرع' },
              { l:'البريد الإلكتروني', key:'admin_email' as const, p:'بريد مدير الفرع' },
              { l:'رقم الهاتف', key:'admin_phone' as const, p:'رقم التواصل' },
            ].map((f)=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>{f.l}</label>
                <input value={form[f.key]} onChange={e=>setForm(prev=>({...prev, [f.key]:e.target.value}))} placeholder={f.p}
                  style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
              </div>
            ))}

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>ملاحظات</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm(prev=>({...prev, notes:e.target.value}))} placeholder="أي ملاحظات إضافية عن هذا الفرع..." style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', resize:'none', fontFamily:"'Cairo',sans-serif" }}/>
            </div>

            {editTarget && (
              <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, color:C.text, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e=>setForm(prev=>({...prev, is_active:e.target.checked}))} style={{ width:16, height:16, accentColor:C.gold }}/>
                الفرع نشط
              </label>
            )}

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button disabled={saving} onClick={handleSubmit} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', opacity:saving?0.7:1 }}>
                {saving ? 'جارٍ الحفظ...' : (editTarget ? 'حفظ التعديلات' : 'إضافة الفرع')}
              </button>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, background:C.bg, color:C.sub, fontWeight:600, fontSize:13, border:`1px solid ${C.border}`, cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDeleteBranch()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </SuperAdminShell>
  );
}
