import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchUsers, addUser, toggleUser, deleteUser } from '../features/admin/usersSlice';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6', orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background:'#FFFFFF', borderRadius:16, padding:20,
  boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #EDE3CE', ...e,
});
const btn = (v:'gold'|'outline'|'danger'='gold'): React.CSSProperties => ({
  padding:'9px 20px', borderRadius:12, border: v==='outline'?'1px solid #EDE3CE':'none',
  background: v==='gold'?'#C59341': v==='danger'?'#EF4444':'#FFFFFF',
  color: v==='outline'?'#1B2038':'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?'#C59341':'#EDE3CE'}`,
  color:'#1B2038', borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});
const TH: React.CSSProperties = {
  padding:'11px 16px', textAlign:'right', color:'#6B7280', fontSize:12,
  fontWeight:700, background:'#F8F5EE', borderBottom:'1px solid #EDE3CE',
};
const TD: React.CSSProperties = {
  padding:'12px 16px', borderBottom:'1px solid #F3EDE0', fontSize:13, color:'#1B2038',
};

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:480,maxWidth:'95vw'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:'#1B2038',fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16,color:'#6B7280'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ label, color, bg }: { label:string; color:string; bg:string }) {
  return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:bg,color}}>{label}</span>;
}

function Toggle({ on, onToggle, loading=false }: { on:boolean; onToggle:()=>void; loading?:boolean }) {
  return (
    <div onClick={!loading?onToggle:undefined} style={{width:42,height:24,borderRadius:12,background:on?'#10B981':'rgba(0,0,0,0.15)',position:'relative',cursor:loading?'wait':'pointer',transition:'background 0.2s',flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,right:on?20:4,transition:'right 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
    </div>
  );
}

type Role = 'teacher' | 'student' | 'parent';
type TabKey = 'all' | Role;

interface City { id: number; name: string; }

const ROLE_LABEL: Record<Role, string> = { teacher:'معلم', student:'طالب', parent:'ولي أمر' };
const ROLE_COLOR: Record<Role, { color:string; bg:string }> = {
  teacher: { color: DK.blue,   bg: 'rgba(59,130,246,0.1)'  },
  student: { color: DK.green,  bg: 'rgba(16,185,129,0.1)'  },
  parent:  { color: DK.purple, bg: 'rgba(139,92,246,0.1)'  },
};

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list: users, loading } = useAppSelector((s) => s.adminUsers);

  const [activeTab, setActiveTab]   = useState<TabKey>('all');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ name: '', phone: '', role: 'teacher' as Role, address: '', city_id: '' });
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [focused, setFocused]       = useState<string | null>(null);
  const [cities, setCities]         = useState<City[]>([]);

  useEffect(() => { dispatch(fetchUsers(null)); }, [dispatch]);

  useEffect(() => {
    api.get('/cities').then(r => setCities(r.data.data ?? [])).catch(() => {});
  }, []);

  const filtered = users.filter((u) => {
    const matchTab = activeTab === 'all' || u.role === activeTab;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || (u.phone ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const openModal = () => {
    setForm({ name: '', phone: '', role: activeTab !== 'all' ? activeTab as Role : 'teacher', address: '', city_id: '' });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true); setAddError(null);
    const payload: Parameters<typeof addUser>[0] = { name: form.name, phone: form.phone, role: form.role };
    if (form.role === 'teacher' && form.address.trim()) payload.address = form.address.trim();
    if (form.role === 'student' && form.city_id) payload.city_id = Number(form.city_id);
    const result = await dispatch(addUser(payload));
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all',     label: 'الكل' },
    { key: 'teacher', label: 'المدربون' },
    { key: 'student', label: 'الطلاب' },
    { key: 'parent',  label: 'أولياء الأمور' },
  ];

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: DK.bg, minHeight:'100vh', padding:24 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: DK.goldGrad }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: DK.text }}>المستخدمون</h1>
          </div>
          <button onClick={openModal} style={{ ...btn('gold'), display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:400 }}>+</span> إضافة مستخدم
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                borderRadius:10, padding:'8px 20px', border:'none', cursor:'pointer',
                fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700,
                background: activeTab === t.key ? DK.gold : 'transparent',
                color: activeTab === t.key ? '#fff' : DK.sub,
                transition:'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:20, maxWidth:360 }}>
          <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color: DK.dim, fontSize:15, pointerEvents:'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الهاتف..."
            style={{ ...inp(focused==='search'), paddingRight:40 }}
            onFocus={() => setFocused('search')}
            onBlur={() => setFocused(null)}
          />
        </div>

        {/* Table card */}
        <div style={{ ...card({ padding:0 }), overflow:'hidden' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign:'center', padding:48, color: DK.sub, fontSize:14 }}>
              {search ? 'لا توجد نتائج مطابقة للبحث.' : 'لا يوجد مستخدمون في هذه الفئة بعد.'}
            </p>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['#','الاسم','رقم الهاتف','الدور','الحالة','إجراءات'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const rc = ROLE_COLOR[user.role as Role] ?? { color: DK.sub, bg: '#F3F4F6' };
                  return (
                    <tr key={user.id}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,147,65,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ ...TD, width:48, color: DK.dim, fontWeight:700 }}>{idx + 1}</td>
                      <td style={TD}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:`rgba(197,147,65,0.1)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:13, color: DK.gold, flexShrink:0 }}>
                            {(user.name?.[0] ?? '?').toUpperCase()}
                          </div>
                          <span style={{ fontWeight:700 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ ...TD, color: DK.sub, direction:'ltr', unicodeBidi:'embed' }}>{user.phone ?? '—'}</td>
                      <td style={TD}>
                        <StatusBadge label={ROLE_LABEL[user.role as Role] ?? user.role} color={rc.color} bg={rc.bg} />
                      </td>
                      <td style={TD}>
                        <Toggle on={!!user.is_active} onToggle={() => handleToggle(user.id)} loading={toggling === user.id} />
                      </td>
                      <td style={TD}>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          {/* Edit pencil — placeholder, no handler yet */}
                          <button title="تعديل"
                            style={{ width:30, height:30, borderRadius:8, border:'1px solid #EDE3CE', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                            ✏️
                          </button>
                          <button title="حذف" onClick={() => handleDelete(user.id)} disabled={deleting === user.id}
                            style={{ width:30, height:30, borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, opacity: deleting === user.id ? 0.5 : 1 }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <Modal title="إضافة مستخدم" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الاسم الكامل</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="الاسم الكامل" required autoFocus
                style={inp(focused==='name')}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>رقم الهاتف (واتساب)</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+9665xxxxxxxx" required dir="ltr"
                style={inp(focused==='phone')}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الدور</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as Role, address: '', city_id: ''})}
                style={{ ...inp(focused==='role'), cursor:'pointer' }}
                onFocus={() => setFocused('role')} onBlur={() => setFocused(null)}>
                <option value="teacher">معلم</option>
                <option value="student">طالب</option>
                <option value="parent">ولي أمر</option>
              </select>
            </div>

            {form.role === 'teacher' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>العنوان (اختياري)</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="مثال: رام الله، شارع الإرسال"
                  style={inp(focused==='address')}
                  onFocus={() => setFocused('address')} onBlur={() => setFocused(null)} />
              </div>
            )}

            {form.role === 'student' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المدينة (اختياري)</label>
                <select value={form.city_id} onChange={e => setForm({...form, city_id: e.target.value})}
                  style={{ ...inp(focused==='city'), cursor:'pointer' }}
                  onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}>
                  <option value="">— اختر المدينة —</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {cities.length === 0 && (
                  <p style={{ fontSize:11, color: DK.dim, marginTop:4 }}>لا توجد مدن مضافة بعد — يمكن للأدمن إضافتها من صفحة المدن</p>
                )}
              </div>
            )}
            {addError && (
              <p style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{addError}</p>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={addLoading}
                style={{ ...btn('gold'), flex:1, opacity: addLoading ? 0.7 : 1 }}>
                {addLoading ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
