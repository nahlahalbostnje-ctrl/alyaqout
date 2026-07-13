import { useState, useEffect, useCallback, useMemo } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface StaffUser {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  country_id: number | null;
  country: string | null;
  is_active: boolean;
  created_at: string | null;
}

interface CountryOpt {
  id: number;
  name: string;
}

interface MetaCounts {
  teachers: number;
  supervisors: number;
  active_teachers: number;
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  password: '',
  country_id: '',
  role: 'teacher' as 'teacher' | 'supervisor',
};

export default function SAStaffPage() {
  const [tab, setTab] = useState<'teachers'|'staff'>('teachers');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [meta, setMeta] = useState<MetaCounts>({ teachers: 0, supervisors: 0, active_teachers: 0 });
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/users', {
        params: { role: tab === 'teachers' ? 'teacher' : 'supervisor', q: search || undefined },
      });
      setUsers(data.data ?? []);
      if (data.meta) {
        setMeta({
          teachers: data.meta.teachers ?? 0,
          supervisors: data.meta.supervisors ?? 0,
          active_teachers: data.meta.active_teachers ?? 0,
        });
      }
    } catch {
      setError('فشل جلب قائمة الكوادر');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(() => { loadUsers(); }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadUsers, search]);

  useEffect(() => {
    api.get('/super-admin/countries')
      .then(({ data }) => {
        const list = (data.data ?? data.countries ?? data ?? []) as CountryOpt[];
        setCountries(Array.isArray(list) ? list.map((c: CountryOpt) => ({ id: c.id, name: c.name })) : []);
      })
      .catch(() => setCountries([]));
  }, []);

  const openAdd = () => {
    setForm({
      ...emptyForm,
      role: tab === 'teachers' ? 'teacher' : 'supervisor',
      country_id: countries[0] ? String(countries[0].id) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.country_id) {
      alert('يرجى تعبئة الاسم والجوال والدولة');
      return;
    }
    setSaving(true);
    try {
      await api.post('/super-admin/users', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        password: form.password || null,
        country_id: Number(form.country_id),
        role: form.role,
      });
      setShowModal(false);
      await loadUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = e.response?.data?.message
        ?? (e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' — ') : null)
        ?? 'تعذّر إنشاء الحساب';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleUser = async (u: StaffUser) => {
    try {
      await api.patch(`/super-admin/users/${u.id}/toggle`);
      await loadUsers();
    } catch {
      alert('تعذّر تغيير حالة الحساب');
    }
  };

  const askDeleteUser = (u: StaffUser) => {
    setDeleteError(null);
    setPendingDelete({ id: u.id, label: u.name });
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/super-admin/users/${pendingDelete.id}`);
      setPendingDelete(null);
      await loadUsers();
    } catch {
      setDeleteError('تعذّر حذف الحساب');
    } finally {
      setDeleteBusy(false);
    }
  };

  const roleLabel = (r: string) => r === 'supervisor' ? 'مشرف' : 'معلم';

  const inactiveTeachers = useMemo(
    () => Math.max(0, meta.teachers - meta.active_teachers),
    [meta]
  );

  return (
    <SuperAdminShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>المعلمون والموظفون</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>إدارة كوادر المنصة البشرية</p>
        </div>
        <button onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.3)' }}>
          <span>+</span> إضافة جديد
        </button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
        {[
          {label:'إجمالي المعلمين',value:String(meta.teachers),icon:'👨‍🏫',color:C.teal},
          {label:'المعلمون النشطون',value:String(meta.active_teachers),icon:'✅',color:C.green},
          {label:'إجمالي المشرفين',value:String(meta.supervisors),icon:'👨‍💼',color:C.blue},
          {label:'معلمون غير نشطين',value:String(inactiveTeachers),icon:'⏸️',color:C.orange},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:12})}>
            <div style={{width:42,height:42,borderRadius:13,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:20}}>{loading ? '…' : s.value}</p>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <div style={{ display:'flex', borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}`, flexShrink:0 }}>
          {(['teachers','staff'] as const).map((t,i)=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:700, background:tab===t?C.goldGrad:'transparent', color:tab===t?'#1B2038':C.sub, transition:'all 0.15s', borderLeft:i===0?'none':`1px solid ${C.border}` }}>
              {t==='teachers'?'المعلمون':'المشرفون'}
            </button>
          ))}
        </div>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو البريد..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
      </div>

      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الاسم','الدور','رقم الهاتف','البريد الإلكتروني','الدولة','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>جارٍ التحميل...</p></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p></td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{u.name}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{roleLabel(u.role)}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontSize:12, direction:'ltr', textAlign:'right' }}>{u.phone}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{u.email || '—'}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontSize:12 }}>{u.country || '—'}</td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:u.is_active?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)', color:u.is_active?C.green:C.orange }}>
                    {u.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>toggleUser(u)} title={u.is_active?'إيقاف':'تفعيل'} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>🔒</button>
                    <button onClick={()=>askDeleteUser(u)} title="حذف" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background:C.card, borderRadius:20, padding:28, width:480, maxWidth:'90vw', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:17 }}>إضافة معلم / مشرف</h2>
              <button onClick={()=>setShowModal(false)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:C.sub }}>×</button>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الدور</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value as 'teacher'|'supervisor'}))}
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                <option value="teacher">معلم</option>
                <option value="supervisor">مشرف</option>
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الاسم</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} placeholder="الاسم الكامل"
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>رقم الجوال</label>
              <input value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} placeholder="05xxxxxxxx أو +970..."
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', direction:'ltr', textAlign:'right' }}/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الدولة</label>
              <select value={form.country_id} onChange={e=>setForm(f=>({...f, country_id:e.target.value}))}
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                <option value="">اختر الدولة</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>البريد الإلكتروني (اختياري — للدخول بالإيميل)</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="teacher@example.com"
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', direction:'ltr', textAlign:'right' }}/>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>كلمة المرور (اختياري مع البريد)</label>
              <input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} placeholder="6 أحرف على الأقل"
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
            </div>

            <p style={{ color:C.sub, fontSize:11, marginBottom:16, background:C.bg, borderRadius:10, padding:'10px 14px' }}>
              بدون بريد وكلمة سر يمكن الدخول لاحقاً عبر رقم الجوال ورمز واتساب OTP.
            </p>

            <div style={{ display:'flex', gap:10 }}>
              <button disabled={saving} onClick={handleSubmit} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', opacity:saving?0.7:1 }}>
                {saving ? 'جارٍ الحفظ...' : 'إنشاء الحساب'}
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
        onConfirm={() => void confirmDeleteUser()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </SuperAdminShell>
  );
}
