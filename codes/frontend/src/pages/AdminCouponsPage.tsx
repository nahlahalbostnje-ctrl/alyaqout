import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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
  background: v==='gold'?DK.gold: v==='danger'?DK.red:'#FFFFFF',
  color: v==='outline'?DK.text:'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?DK.gold:DK.border}`,
  color:DK.text, borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});
const TH: React.CSSProperties = {
  padding:'11px 16px', textAlign:'right', color:DK.sub, fontSize:12,
  fontWeight:700, background:'#F8F5EE', borderBottom:'1px solid #EDE3CE',
};
const TD: React.CSSProperties = {
  padding:'12px 16px', borderBottom:'1px solid #F3EDE0', fontSize:13, color:DK.text,
};

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:500,maxWidth:'95vw'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:DK.text,fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface Coupon {
  id:             number;
  code:           string;
  discount_type:  'percentage' | 'fixed';
  discount_value: number;
  max_uses:       number | null;
  used_count:     number;
  expires_at:     string | null;
  scope:          'all' | 'specific_course';
  course_id:      number | null;
  is_active:      boolean;
  course?:        { id: number; title: string } | null;
}

const emptyForm = {
  code:           '',
  discount_type:  'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  max_uses:       '',
  expires_at:     '',
  scope:          'all' as 'all' | 'specific_course',
  course_id:      '',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateCode() {
  return Array.from({length:6}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*36)]).join('');
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons]   = useState<Coupon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focused, setFocused]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.coupons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/coupons', {
        code:           form.code.toUpperCase(),
        discount_type:  form.discount_type,
        discount_value: parseFloat(form.discount_value),
        max_uses:       form.max_uses ? parseInt(form.max_uses) : null,
        expires_at:     form.expires_at || null,
        scope:          form.scope,
        course_id:      form.scope === 'specific_course' && form.course_id ? parseInt(form.course_id) : null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e.response?.data?.errors;
      if (msgs) {
        setError(Object.values(msgs).flat().join(' • '));
      } else {
        setError(e.response?.data?.message || 'حدث خطأ');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.patch(`/admin/coupons/${coupon.id}/toggle`);
      await load();
    } catch { /* ignore */ }
  };

  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/coupons/${pendingDelete.id}`);
      setPendingDelete(null);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setDeleteError(e.response?.data?.message || 'فشل الحذف');
    } finally {
      setDeleteBusy(false);
    }
  };

  const isExpired = (expires_at: string | null) => {
    if (!expires_at) return false;
    return new Date(expires_at) < new Date();
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background:DK.bg, minHeight:'100vh', padding:24 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background:DK.goldGrad }} />
            <div>
              <h1 style={{ color:DK.text, fontWeight:900, fontSize:20, margin:0 }}>الكوبونات</h1>
              <p style={{ color:DK.sub, fontSize:12, margin:'2px 0 0' }}>مولّد كوبونات الخصم للاشتراكات</p>
            </div>
          </div>
          <button style={btn('gold')} onClick={() => { setShowForm(true); setError(null); setForm(emptyForm); }}>
            + إنشاء كوبون جديد
          </button>
        </div>

        {/* Generator Form Card */}
        <div style={card({ marginBottom:24 })}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <span style={{ fontSize:18 }}>🎟️</span>
            <h2 style={{ color:DK.text, fontWeight:800, fontSize:15, margin:0 }}>مولّد الكوبون</h2>
          </div>
          <form onSubmit={handleCreate}>
            {error && (
              <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>
                {error}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:16, marginBottom:16 }}>
              {/* Code */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>كود الكوبون</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    required
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                    onFocus={() => setFocused('code')}
                    onBlur={() => setFocused(null)}
                    style={{ ...inp(focused==='code'), fontFamily:'monospace', fontWeight:700, letterSpacing:2, flex:1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({...form, code: generateCode()})}
                    style={{ ...btn('outline'), padding:'9px 12px', fontSize:12, whiteSpace:'nowrap', flexShrink:0 }}
                  >
                    🔀 عشوائي
                  </button>
                </div>
              </div>
              {/* Discount Value */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>
                  قيمة الخصم {form.discount_type === 'percentage' ? '(%)' : '(ر.س)'}
                </label>
                <input
                  required type="number" min="0.01" step="0.01"
                  max={form.discount_type === 'percentage' ? 100 : undefined}
                  value={form.discount_value}
                  onChange={e => setForm({...form, discount_value: e.target.value})}
                  placeholder="20" dir="ltr"
                  onFocus={() => setFocused('dval')}
                  onBlur={() => setFocused(null)}
                  style={inp(focused==='dval')}
                />
              </div>
              {/* Discount Type */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>نوع الخصم</label>
                <div style={{ display:'flex', gap:10 }}>
                  {(['percentage','fixed'] as const).map(t => (
                    <label key={t} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, color:form.discount_type===t?DK.gold:DK.text }}>
                      <input
                        type="radio" name="discount_type" value={t}
                        checked={form.discount_type===t}
                        onChange={() => setForm({...form, discount_type:t})}
                        style={{ accentColor:DK.gold }}
                      />
                      {t==='percentage' ? 'نسبة مئوية (%)' : 'مبلغ ثابت'}
                    </label>
                  ))}
                </div>
              </div>
              {/* Max Uses */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>أقصى استخدامات</label>
                <input
                  type="number" min="1"
                  value={form.max_uses}
                  onChange={e => setForm({...form, max_uses: e.target.value})}
                  placeholder="بلا حد" dir="ltr"
                  onFocus={() => setFocused('maxuses')}
                  onBlur={() => setFocused(null)}
                  style={inp(focused==='maxuses')}
                />
              </div>
              {/* Expiry */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm({...form, expires_at: e.target.value})}
                  onFocus={() => setFocused('exp')}
                  onBlur={() => setFocused(null)}
                  style={inp(focused==='exp')}
                />
              </div>
              {/* Scope */}
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>النطاق</label>
                <select
                  value={form.scope}
                  onChange={e => setForm({...form, scope: e.target.value as 'all'|'specific_course'})}
                  onFocus={() => setFocused('scope')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inp(focused==='scope'), cursor:'pointer' }}
                >
                  <option value="all">جميع الدورات</option>
                  <option value="specific_course">دورة محددة</option>
                </select>
              </div>
              {form.scope === 'specific_course' && (
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>رقم الدورة (ID)</label>
                  <input
                    type="number"
                    value={form.course_id}
                    onChange={e => setForm({...form, course_id: e.target.value})}
                    placeholder="1" dir="ltr"
                    onFocus={() => setFocused('cid')}
                    onBlur={() => setFocused(null)}
                    style={inp(focused==='cid')}
                  />
                </div>
              )}
            </div>
            <button type="submit" disabled={saving} style={{ ...btn('gold'), opacity: saving ? 0.6 : 1 }}>
              {saving ? 'جاري الإنشاء...' : '✓ إنشاء الكوبون'}
            </button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor:DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ ...card(), textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎟️</div>
            <p style={{ color:DK.text, fontWeight:700, fontSize:15, margin:'0 0 6px' }}>لا توجد كوبونات بعد</p>
            <p style={{ color:DK.sub, fontSize:13, margin:0 }}>أنشئ أول كوبون خصم للطلاب من النموذج أعلاه</p>
          </div>
        ) : (
          <div style={{ ...card({ padding:0 }), overflowX:'auto' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #EDE3CE', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:15 }}>📋</span>
              <span style={{ color:DK.text, fontWeight:800, fontSize:14 }}>الكوبونات النشطة ({coupons.length})</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
              <thead>
                <tr>
                  {['#','الكود','نوع الخصم','القيمة','الاستخدامات','تاريخ الانتهاء','الحالة','إجراءات'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, i) => {
                  const expired = isExpired(coupon.expires_at);
                  const usePct = coupon.max_uses ? (coupon.used_count / coupon.max_uses) * 100 : 0;
                  return (
                    <tr key={coupon.id}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(197,147,65,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                    >
                      <td style={{ ...TD, color:DK.dim, width:40 }}>{i+1}</td>
                      <td style={TD}>
                        <span style={{ fontFamily:'monospace', fontWeight:800, color:DK.gold, fontSize:14, letterSpacing:2 }}>
                          {coupon.code}
                        </span>
                      </td>
                      <td style={TD}>
                        <span style={{
                          display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                          background: coupon.discount_type==='percentage'?'rgba(16,185,129,0.1)':'rgba(59,130,246,0.1)',
                          color: coupon.discount_type==='percentage'?DK.green:DK.blue,
                        }}>
                          {coupon.discount_type==='percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                        </span>
                      </td>
                      <td style={{ ...TD, fontWeight:700 }}>
                        {coupon.discount_type==='percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} ر.س`}
                      </td>
                      <td style={TD}>
                        <div>
                          <span style={{ fontSize:12, color:DK.sub }}>{coupon.used_count} / {coupon.max_uses ?? '∞'}</span>
                          {coupon.max_uses && (
                            <div style={{ height:4, background:'#F3EDE0', borderRadius:4, marginTop:4, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${Math.min(usePct,100)}%`, background:usePct>=90?DK.red:DK.gold, borderRadius:4, transition:'width 0.3s' }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={TD}>
                        <span style={{ color: expired ? DK.red : DK.green, fontSize:12 }}>
                          {expired ? '⚠ ' : ''}{formatDate(coupon.expires_at)}
                        </span>
                      </td>
                      <td style={TD}>
                        <span style={{
                          display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                          background: coupon.is_active?'rgba(16,185,129,0.1)':'rgba(156,163,175,0.1)',
                          color: coupon.is_active?DK.green:DK.dim,
                        }}>
                          {coupon.is_active ? 'فعّال' : 'معطّل'}
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button
                            onClick={() => handleToggle(coupon)}
                            style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif",
                              background: coupon.is_active?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.08)',
                              color: coupon.is_active?DK.red:DK.green,
                            }}
                          >
                            {coupon.is_active ? 'تعطيل' : 'تفعيل'}
                          </button>
                          <button
                            onClick={() => askDelete(coupon.id, coupon.code)}
                            style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(239,68,68,0.08)', color:DK.red }}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <Modal title="إنشاء كوبون جديد" onClose={() => { setShowForm(false); setError(null); }}>
          <form onSubmit={handleCreate}>
            {error && (
              <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>
                {error}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>كود الكوبون</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    required value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                    onFocus={() => setFocused('mcode')} onBlur={() => setFocused(null)}
                    style={{ ...inp(focused==='mcode'), fontFamily:'monospace', fontWeight:700, letterSpacing:2, flex:1 }}
                  />
                  <button type="button" onClick={() => setForm({...form, code: generateCode()})}
                    style={{ ...btn('outline'), padding:'9px 12px', fontSize:12, flexShrink:0 }}>
                    🔀
                  </button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>نوع الخصم</label>
                  <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value as 'percentage'|'fixed'})}
                    onFocus={() => setFocused('mdtype')} onBlur={() => setFocused(null)}
                    style={{ ...inp(focused==='mdtype'), cursor:'pointer' }}>
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>القيمة</label>
                  <input required type="number" min="0.01" step="0.01"
                    max={form.discount_type==='percentage'?100:undefined}
                    value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})}
                    placeholder="20" dir="ltr"
                    onFocus={() => setFocused('mdval')} onBlur={() => setFocused(null)}
                    style={inp(focused==='mdval')} />
                </div>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>أقصى استخدامات</label>
                  <input type="number" min="1" value={form.max_uses}
                    onChange={e => setForm({...form, max_uses: e.target.value})}
                    placeholder="بلا حد" dir="ltr"
                    onFocus={() => setFocused('mmaxuses')} onBlur={() => setFocused(null)}
                    style={inp(focused==='mmaxuses')} />
                </div>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>تاريخ الانتهاء</label>
                  <input type="date" value={form.expires_at}
                    onChange={e => setForm({...form, expires_at: e.target.value})}
                    onFocus={() => setFocused('mexp')} onBlur={() => setFocused(null)}
                    style={inp(focused==='mexp')} />
                </div>
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>النطاق</label>
                <select value={form.scope} onChange={e => setForm({...form, scope: e.target.value as 'all'|'specific_course'})}
                  onFocus={() => setFocused('mscope')} onBlur={() => setFocused(null)}
                  style={{ ...inp(focused==='mscope'), cursor:'pointer' }}>
                  <option value="all">جميع الدورات</option>
                  <option value="specific_course">دورة محددة</option>
                </select>
              </div>
              {form.scope === 'specific_course' && (
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>رقم الدورة (ID)</label>
                  <input type="number" value={form.course_id}
                    onChange={e => setForm({...form, course_id: e.target.value})}
                    placeholder="1" dir="ltr"
                    onFocus={() => setFocused('mcid')} onBlur={() => setFocused(null)}
                    style={inp(focused==='mcid')} />
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ ...btn('gold'), flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }} style={{ ...btn('outline'), flex:1 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
