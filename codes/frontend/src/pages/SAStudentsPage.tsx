import { useState, useEffect, useCallback } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface StudentUser {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  country_id: number | null;
  country: string | null;
  is_active: boolean;
  parent_id: number | null;
  created_at: string | null;
}

interface CountryOpt {
  id: number;
  name: string;
}

interface MetaCounts {
  students: number;
  parents: number;
  active_students: number;
}

const emptyForm = {
  name: '',
  phone: '',
  country_id: '',
  role: 'student' as 'student' | 'parent',
};

function exportCsv(rows: StudentUser[]) {
  const header = ['id', 'name', 'phone', 'email', 'role', 'country', 'is_active', 'created_at'];
  const lines = [
    header.join(','),
    ...rows.map(r => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.phone,
      r.email ?? '',
      r.role,
      `"${(r.country || '').replace(/"/g, '""')}"`,
      r.is_active ? '1' : '0',
      r.created_at ?? '',
    ].join(',')),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SAStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [meta, setMeta] = useState<MetaCounts>({ students: 0, parents: 0, active_students: 0 });
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/users', {
        params: { role: 'student', q: search || undefined },
      });
      setUsers(data.data ?? []);
      if (data.meta) {
        setMeta({
          students: data.meta.students ?? 0,
          parents: data.meta.parents ?? 0,
          active_students: data.meta.active_students ?? 0,
        });
      }
    } catch {
      setError('فشل جلب قائمة الطلاب');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

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

  const filtered = users.filter(u => {
    if (statusFilter === 'نشط') return u.is_active;
    if (statusFilter === 'موقوف') return !u.is_active;
    return true;
  });

  const openAdd = () => {
    setForm({
      ...emptyForm,
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

  const toggleUser = async (u: StudentUser) => {
    try {
      await api.patch(`/super-admin/users/${u.id}/toggle`);
      await loadUsers();
    } catch {
      alert('تعذّر تغيير حالة الحساب');
    }
  };

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الطلاب وأولياء الأمور</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>متابعة أداء وتقدم الطلاب</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            title={filtered.length === 0 ? 'لا توجد بيانات للتصدير' : 'تصدير CSV'}
            style={{padding:'9px 16px',borderRadius:12,background:C.bg,color:C.text,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:filtered.length===0?'not-allowed':'pointer',opacity:filtered.length===0?0.5:1}}
          >
            📤 تصدير
          </button>
          <button onClick={openAdd} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة طالب</button>
        </div>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:14}}>
        {[
          {label:'إجمالي الطلاب',    value:String(meta.students), icon:'🎓',color:C.purple, sub:'مسجّلون في المنصة'},
          {label:'الطلاب النشطون',   value:String(meta.active_students),icon:'⚡',color:C.green,  sub:'حسابات مفعّلة'},
          {label:'موقوفون',   value:String(Math.max(0, meta.students - meta.active_students)),icon:'⏸️',color:C.orange, sub:'غير نشطين'},
          {label:'أولياء الأمور',    value:String(meta.parents),icon:'👨‍👩‍👦',color:C.teal,  sub:'حسابات أولياء'},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px'})}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
              <div style={{width:36,height:36,borderRadius:11,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
            </div>
            <p style={{color:C.text,fontWeight:900,fontSize:21}}>{loading ? '…' : s.value}</p>
            <p style={{color:s.color,fontSize:11,fontWeight:600,marginTop:4}}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث باسم الطالب أو الهاتف..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {['الكل','نشط','موقوف'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:580}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الطالب','الهاتف','الدولة','ولي الأمر','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>جارٍ التحميل...</p></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا يوجد طلاب</p></td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{u.name}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontSize:12, direction:'ltr', textAlign:'right' }}>{u.phone}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{u.country || '—'}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{u.parent_id ? `#${u.parent_id}` : '—'}</td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:u.is_active?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)', color:u.is_active?C.green:C.orange }}>
                    {u.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <button onClick={()=>toggleUser(u)} title={u.is_active?'إيقاف':'تفعيل'} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13 }}>🔒</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background:C.card, borderRadius:20, padding:28, width:440, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:17 }}>إضافة طالب / ولي أمر</h2>
              <button onClick={()=>setShowModal(false)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:C.sub }}>×</button>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>النوع</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value as 'student'|'parent'}))}
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                <option value="student">طالب</option>
                <option value="parent">ولي أمر</option>
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

            <div style={{ marginBottom:18 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الدولة</label>
              <select value={form.country_id} onChange={e=>setForm(f=>({...f, country_id:e.target.value}))}
                style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                <option value="">اختر الدولة</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button disabled={saving} onClick={handleSubmit} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', opacity:saving?0.7:1 }}>
                {saving ? 'جارٍ الحفظ...' : 'إنشاء الحساب'}
              </button>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, background:C.bg, color:C.sub, fontWeight:600, fontSize:13, border:`1px solid ${C.border}`, cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
