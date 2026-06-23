import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchPackages,
  addPackage,
  togglePackage,
  deletePackage,
} from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';

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

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:480,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:'#1B2038',fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16,color:'#6B7280'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({ on, onToggle, loading=false }: { on:boolean; onToggle:()=>void; loading?:boolean }) {
  return (
    <div onClick={!loading?onToggle:undefined} style={{width:42,height:24,borderRadius:12,background:on?'#10B981':'rgba(0,0,0,0.15)',position:'relative',cursor:loading?'wait':'pointer',transition:'background 0.2s',flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,right:on?20:4,transition:'right 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
    </div>
  );
}

const emptyForm = { name: '', description: '', price: 0, duration_days: 30, sort_order: 0 };

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const { list: packages, loading } = useAppSelector((s) => s.packages);

  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [focused, setFocused]       = useState<string | null>(null);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addPackage(form));
    setAddLoading(false);
    if (addPackage.fulfilled.match(result)) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(togglePackage(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setDeleting(id);
    await dispatch(deletePackage(id));
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: DK.bg, minHeight:'100vh', padding:24 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: DK.goldGrad }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: DK.text }}>الباقات</h1>
          </div>
          <button onClick={() => { setShowModal(true); setAddError(null); setForm(emptyForm); }}
            style={{ ...btn('gold'), display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:400 }}>+</span> إضافة باقة
          </button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:80 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : packages.length === 0 ? (
          <p style={{ textAlign:'center', padding:60, color: DK.sub, fontSize:14 }}>لا توجد باقات بعد.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {packages.map((pkg) => {
              const active = !!pkg.is_active;
              return (
                <div key={pkg.id} style={{
                  ...card({ padding:24 }),
                  border: active ? '2px solid #C59341' : '1px solid #EDE3CE',
                  boxShadow: active ? '0 0 0 4px rgba(197,147,65,0.1), 0 2px 16px rgba(0,0,0,0.06)' : DK.shadow,
                  opacity: active ? 1 : 0.65,
                  transition:'all 0.2s',
                }}>
                  {/* Price badge */}
                  <div style={{ textAlign:'center', marginBottom:16 }}>
                    <div style={{ display:'inline-block', background: DK.goldGrad, borderRadius:16, padding:'12px 24px', marginBottom:8 }}>
                      <span style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1 }} dir="ltr">
                        {Number(pkg.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.85)', marginRight:4, fontWeight:600 }}>ر.س/شهر</span>
                    </div>
                  </div>

                  {/* Package name */}
                  <h3 style={{ margin:'0 0 8px', fontSize:18, fontWeight:900, color: DK.text, textAlign:'center' }}>{pkg.name}</h3>

                  {/* Description */}
                  {pkg.description && (
                    <p style={{ margin:'0 0 16px', fontSize:13, color: DK.sub, textAlign:'center', lineHeight:1.6 }}>{pkg.description}</p>
                  )}

                  {/* Duration badge */}
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
                    <span style={{ background:'rgba(197,147,65,0.1)', color: DK.gold, border:'1px solid rgba(197,147,65,0.3)', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700 }}>
                      {pkg.duration_days} يوم
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, padding:'10px 14px', background:'#F8F5EE', borderRadius:10 }}>
                    <div style={{ fontSize:12, color: DK.sub }}>
                      الترتيب: <strong style={{ color: DK.text }}>{pkg.sort_order}</strong>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color: DK.sub }}>
                      <span>👤</span>
                      <strong style={{ color: DK.text }}>{(pkg as any).subscribers_count ?? 0}</strong>
                      <span>مشترك</span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Toggle on={active} onToggle={() => handleToggle(pkg.id)} loading={toggling === pkg.id} />
                      <span style={{ fontSize:12, color: active ? DK.green : DK.dim, fontWeight:700 }}>
                        {active ? 'نشط' : 'معطّل'}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(pkg.id)} disabled={deleting === pkg.id}
                      style={{ padding:'6px 14px', borderRadius:10, border:'none', background: 'rgba(239,68,68,0.1)', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", opacity: deleting === pkg.id ? 0.5 : 1 }}>
                      {deleting === pkg.id ? '...' : '🗑️ حذف'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Package Modal */}
      {showModal && (
        <Modal title="إضافة باقة اشتراك" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>اسم الباقة</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="مثال: الباقة الشهرية" required autoFocus
                style={inp(focused==='name')}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الوصف (اختياري)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="ما تشمله الباقة..." rows={3}
                style={{ ...inp(focused==='desc'), resize:'none' }}
                onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>السعر (ر.س)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
                  min={0} step={0.01} required dir="ltr"
                  style={inp(focused==='price')}
                  onFocus={() => setFocused('price')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المدة (أيام)</label>
                <input type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: Number(e.target.value)})}
                  min={1} required dir="ltr"
                  style={inp(focused==='days')}
                  onFocus={() => setFocused('days')} onBlur={() => setFocused(null)} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الترتيب</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})}
                min={0} dir="ltr"
                style={inp(focused==='sort')}
                onFocus={() => setFocused('sort')} onBlur={() => setFocused(null)} />
            </div>
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
