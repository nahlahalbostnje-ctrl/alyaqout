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

interface UserItem { id: number; name: string; phone?: string; role: string; is_active?: boolean; }

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

  // Merge & Transfer state
  const [mergeUser, setMergeUser]     = useState<UserItem | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string>('');
  const [mergeMsg, setMergeMsg]       = useState('');
  const [transferUser, setTransferUser] = useState<UserItem | null>(null);
  const [transferRole, setTransferRole] = useState<Role>('parent');

  // Subscription / Package state
  const [subUser, setSubUser]         = useState<UserItem | null>(null);
  const [subPackage, setSubPackage]   = useState('basic');
  const [subDuration, setSubDuration] = useState('monthly');
  const [subMsg, setSubMsg]           = useState('');

  // Unlink state
  const [unlinkUser, setUnlinkUser]   = useState<UserItem | null>(null);
  const [unlinkDone, setUnlinkDone]   = useState(false);

  const handleUnlink = () => {
    if (!unlinkUser) return;
    setUnlinkDone(true);
    setTimeout(() => { setUnlinkUser(null); setUnlinkDone(false); }, 2200);
  };

  // Messaging state
  const [msgUser, setMsgUser]     = useState<UserItem | null>(null);
  const [msgText, setMsgText]     = useState('');
  const [msgChannel, setMsgChannel] = useState<'whatsapp'|'notification'>('notification');
  const [msgSent, setMsgSent]     = useState(false);

  const handleSendMsg = () => {
    if (!msgText.trim() || !msgUser) return;
    setMsgSent(true);
    setTimeout(() => { setMsgUser(null); setMsgText(''); setMsgSent(false); }, 2200);
  };

  const handleMerge = () => {
    if (!mergeTarget || !mergeUser) return;
    setMergeMsg(`تم دمج الحساب "${mergeUser.name}" مع الحساب المحدد بنجاح.`);
    setTimeout(() => { setMergeUser(null); setMergeMsg(''); setMergeTarget(''); }, 2200);
  };

  const handleTransfer = () => {
    if (!transferUser) return;
    setMergeMsg(`تم تحويل "${transferUser.name}" إلى دور "${transferRole === 'parent' ? 'ولي أمر' : transferRole === 'teacher' ? 'معلم' : 'طالب'}" بنجاح.`);
    setTimeout(() => { setTransferUser(null); setMergeMsg(''); }, 2200);
  };

  const handleSubChange = () => {
    if (!subUser) return;
    const pkgLabel = { basic:'الأساسية', standard:'الذهبية', premium:'الماسية' }[subPackage] ?? subPackage;
    const durLabel = { monthly:'شهري', quarterly:'ربع سنوي', annual:'سنوي' }[subDuration] ?? subDuration;
    setSubMsg(`✅ تم تغيير باقة "${subUser.name}" إلى ${pkgLabel} (${durLabel}) بنجاح.`);
    setTimeout(() => { setSubUser(null); setSubMsg(''); }, 2500);
  };

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
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                          <button title="تعديل"
                            style={{ width:30, height:30, borderRadius:8, border:'1px solid #EDE3CE', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                            ✏️
                          </button>
                          {user.role === 'student' && (
                            <button title="تحويل الطالب" onClick={() => { setTransferUser(user as UserItem); setTransferRole('parent'); }}
                              style={{ height:30, padding:'0 10px', borderRadius:8, border:`1px solid rgba(37,99,235,0.3)`, background:`rgba(37,99,235,0.06)`, cursor:'pointer', fontSize:11.5, fontWeight:700, color: DK.blue, fontFamily:"'Cairo',sans-serif" }}>
                              تحويل
                            </button>
                          )}
                          {user.role === 'student' && (
                            <button title="فك الربط بولي الأمر" onClick={() => { setUnlinkUser(user as UserItem); setUnlinkDone(false); }}
                              style={{ height:30, padding:'0 10px', borderRadius:8, border:`1px solid rgba(239,68,68,0.3)`, background:`rgba(239,68,68,0.06)`, cursor:'pointer', fontSize:11.5, fontWeight:700, color: DK.red, fontFamily:"'Cairo',sans-serif" }}>
                              فك الربط
                            </button>
                          )}
                          {(user.role === 'parent') && (
                            <button title="إرسال رسالة" onClick={() => { setMsgUser(user as UserItem); setMsgText(''); setMsgSent(false); }}
                              style={{ height:30, padding:'0 10px', borderRadius:8, border:`1px solid rgba(16,185,129,0.3)`, background:`rgba(16,185,129,0.06)`, cursor:'pointer', fontSize:11.5, fontWeight:700, color:'#10B981', fontFamily:"'Cairo',sans-serif" }}>
                              رسالة
                            </button>
                          )}
                          <button title="تغيير الباقة" onClick={() => { setSubUser(user as UserItem); setSubPackage('basic'); setSubDuration('monthly'); }}
                            style={{ height:30, padding:'0 10px', borderRadius:8, border:`1px solid rgba(139,92,246,0.3)`, background:`rgba(139,92,246,0.06)`, cursor:'pointer', fontSize:11.5, fontWeight:700, color:'#8B5CF6', fontFamily:"'Cairo',sans-serif" }}>
                            باقة
                          </button>
                          <button title="دمج الحساب" onClick={() => { setMergeUser(user as UserItem); setMergeTarget(''); }}
                            style={{ height:30, padding:'0 10px', borderRadius:8, border:`1px solid rgba(217,119,6,0.3)`, background:`rgba(217,119,6,0.06)`, cursor:'pointer', fontSize:11.5, fontWeight:700, color: DK.orange, fontFamily:"'Cairo',sans-serif" }}>
                            دمج
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

      {/* Merge Modal */}
      {mergeUser && (
        <Modal title={`دمج حساب: ${mergeUser.name}`} onClose={() => { setMergeUser(null); setMergeMsg(''); }}>
          <p style={{ color: DK.sub, fontSize:13, marginBottom:16 }}>
            اختر الحساب الآخر لدمجه مع هذا الحساب. سيتم الاحتفاظ ببيانات الحساب الأصلي ونقل كل الأنشطة من الحساب المختار.
          </p>
          {mergeMsg ? (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'14px 18px', color:'#10B981', fontWeight:700, fontSize:14, textAlign:'center' }}>
              ✅ {mergeMsg}
            </div>
          ) : (
            <>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الحساب المراد دمجه</label>
                <select value={mergeTarget} onChange={e=>setMergeTarget(e.target.value)}
                  style={{ ...inp(false), cursor:'pointer' }}>
                  <option value="">— اختر حساباً —</option>
                  {users.filter(u => u.id !== mergeUser.id && u.role === mergeUser.role).map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.phone}</option>
                  ))}
                </select>
              </div>
              <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#DC2626', marginBottom:16 }}>
                ⚠️ هذه العملية لا يمكن التراجع عنها — سيتم حذف الحساب المختار بعد الدمج.
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleMerge} disabled={!mergeTarget}
                  style={{ ...btn('gold'), flex:1, opacity: !mergeTarget ? 0.5 : 1 }}>
                  تأكيد الدمج
                </button>
                <button onClick={() => setMergeUser(null)} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Transfer Modal */}
      {transferUser && (
        <Modal title={`تحويل الطالب: ${transferUser.name}`} onClose={() => { setTransferUser(null); setMergeMsg(''); }}>
          <p style={{ color: DK.sub, fontSize:13, marginBottom:16 }}>
            تحويل هذا الطالب إلى دور آخر في المنصة مع الاحتفاظ بسجله الأكاديمي.
          </p>
          {mergeMsg ? (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'14px 18px', color:'#10B981', fontWeight:700, fontSize:14, textAlign:'center' }}>
              ✅ {mergeMsg}
            </div>
          ) : (
            <>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الدور الجديد</label>
                <select value={transferRole} onChange={e=>setTransferRole(e.target.value as Role)}
                  style={{ ...inp(false), cursor:'pointer' }}>
                  <option value="parent">ولي أمر</option>
                  <option value="teacher">معلم</option>
                </select>
              </div>
              <div style={{ background:'rgba(37,99,235,0.06)', border:'1px solid rgba(37,99,235,0.15)', borderRadius:10, padding:'10px 14px', fontSize:12, color: DK.blue, marginBottom:16 }}>
                💡 سيحتاج الطالب إلى إعادة تسجيل الدخول بعد التحويل.
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleTransfer} style={{ ...btn('gold'), flex:1 }}>تأكيد التحويل</button>
                <button onClick={() => setTransferUser(null)} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Subscription / Package Modal */}
      {subUser && (
        <Modal title={`تغيير باقة: ${subUser.name}`} onClose={() => { setSubUser(null); setSubMsg(''); }}>
          {subMsg ? (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'14px 18px', color:'#10B981', fontWeight:700, fontSize:14, textAlign:'center' }}>
              {subMsg}
            </div>
          ) : (
            <>
              <p style={{ color: DK.sub, fontSize:13, marginBottom:16 }}>
                تغيير الباقة والمدة لهذا المستخدم، سيسري التغيير فوراً.
              </p>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الباقة</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[['basic','⚡ الأساسية'], ['standard','⭐ الذهبية'], ['premium','💎 الماسية']].map(([v, l]) => (
                    <button key={v} onClick={() => setSubPackage(v)}
                      style={{ flex:1, padding:'10px 6px', borderRadius:10, border:`1px solid ${subPackage===v?'rgba(139,92,246,0.4)':'#EDE3CE'}`, background: subPackage===v?'rgba(139,92,246,0.08)':'#F8FAFC', color: subPackage===v?'#8B5CF6': DK.sub, fontWeight: subPackage===v?800:500, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>مدة الاشتراك</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[['monthly','شهري'], ['quarterly','ربع سنوي'], ['annual','سنوي 🎁']].map(([v, l]) => (
                    <button key={v} onClick={() => setSubDuration(v)}
                      style={{ flex:1, padding:'10px 6px', borderRadius:10, border:`1px solid ${subDuration===v?'rgba(139,92,246,0.4)':'#EDE3CE'}`, background: subDuration===v?'rgba(139,92,246,0.08)':'#F8FAFC', color: subDuration===v?'#8B5CF6': DK.sub, fontWeight: subDuration===v?800:500, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleSubChange} style={{ ...btn('gold'), flex:1 }}>تأكيد التغيير</button>
                <button onClick={() => setSubUser(null)} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Unlink Modal */}
      {unlinkUser && (
        <Modal title={`فك الربط: ${unlinkUser.name}`} onClose={() => { setUnlinkUser(null); setUnlinkDone(false); }}>
          {unlinkDone ? (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'14px 18px', color:'#10B981', fontWeight:700, fontSize:14, textAlign:'center' }}>
              ✅ تم فك الربط بنجاح. الطالب الآن بدون ولي أمر مرتبط.
            </div>
          ) : (
            <>
              <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
                <p style={{ color: DK.red, fontWeight:700, fontSize:13, marginBottom:4 }}>⚠️ تحذير — هذا الإجراء غير قابل للتراجع</p>
                <p style={{ color: DK.sub, fontSize:12 }}>
                  سيتم إزالة ارتباط الطالب <strong>{unlinkUser.name}</strong> بولي أمره الحالي. لن يتمكن ولي الأمر من رؤية بيانات هذا الطالب بعد الآن.
                </p>
              </div>
              <p style={{ color: DK.sub, fontSize:13, marginBottom:16 }}>هل أنت متأكد من فك الربط؟</p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleUnlink} style={{ ...btn('red' as 'outline'), flex:1, background:'rgba(239,68,68,0.9)', color:'#fff', border:'none' }}>تأكيد فك الربط</button>
                <button onClick={() => setUnlinkUser(null)} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Message Modal */}
      {msgUser && (
        <Modal title={`رسالة لـ: ${msgUser.name}`} onClose={() => { setMsgUser(null); setMsgText(''); setMsgSent(false); }}>
          {msgSent ? (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'14px 18px', color:'#10B981', fontWeight:700, fontSize:14, textAlign:'center' }}>
              ✅ تم إرسال الرسالة بنجاح لـ {msgUser.name}
            </div>
          ) : (
            <>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {(['notification','whatsapp'] as const).map(ch => (
                  <button key={ch} onClick={() => setMsgChannel(ch)}
                    style={{ flex:1, padding:'9px', borderRadius:10, border:`1px solid ${msgChannel===ch?'rgba(197,147,65,0.4)':'#EDE3CE'}`, background: msgChannel===ch?'rgba(197,147,65,0.08)':'#F8FAFC', color: msgChannel===ch? DK.gold: DK.sub, fontWeight: msgChannel===ch?700:500, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    {ch==='notification' ? '🔔 إشعار داخلي' : '💬 واتساب'}
                  </button>
                ))}
              </div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>نص الرسالة</label>
              <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={4}
                placeholder="اكتب رسالتك هنا..."
                style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid #EDE3CE', fontSize:13, fontFamily:"'Cairo',sans-serif", resize:'none', outline:'none', marginBottom:14 }} />
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleSendMsg} disabled={!msgText.trim()} style={{ ...btn('gold'), flex:1, opacity: msgText.trim()?1:0.5 }}>إرسال</button>
                <button onClick={() => setMsgUser(null)} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </>
          )}
        </Modal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
