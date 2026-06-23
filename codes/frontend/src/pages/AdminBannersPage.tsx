import { useEffect, useState } from 'react';
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
  background: v==='gold'?DK.gold: v==='danger'?DK.red:'#FFFFFF',
  color: v==='outline'?DK.text:'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?DK.gold:DK.border}`,
  color:DK.text, borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:500,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:DK.text,fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface Banner {
  id:         number;
  title:      string | null;
  image_url:  string;
  link_url:   string | null;
  starts_at:  string | null;
  ends_at:    string | null;
  is_active:  boolean;
  sort_order: number;
}

const emptyForm = {
  title:      '',
  image_url:  '',
  link_url:   '',
  starts_at:  '',
  ends_at:    '',
  sort_order: '0',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBannersPage() {
  const [banners, setBanners]   = useState<Banner[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Banner | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focused, setFocused]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/banners');
      setBanners(data.banners);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title:      banner.title ?? '',
      image_url:  banner.image_url,
      link_url:   banner.link_url ?? '',
      starts_at:  banner.starts_at ?? '',
      ends_at:    banner.ends_at ?? '',
      sort_order: String(banner.sort_order),
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title:      form.title || null,
      image_url:  form.image_url,
      link_url:   form.link_url || null,
      starts_at:  form.starts_at || null,
      ends_at:    form.ends_at || null,
      sort_order: parseInt(form.sort_order) || 0,
    };
    try {
      if (editing) {
        await api.put(`/admin/banners/${editing.id}`, payload);
      } else {
        await api.post('/admin/banners', payload);
      }
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' • ') : (e.response?.data?.message || 'حدث خطأ'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await api.patch(`/admin/banners/${banner.id}/toggle`);
      await load();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا البانر؟')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const isActive = (banner: Banner) => {
    const now = new Date();
    if (!banner.is_active) return false;
    if (banner.starts_at && new Date(banner.starts_at) > now) return false;
    if (banner.ends_at && new Date(banner.ends_at) < now) return false;
    return true;
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background:DK.bg, minHeight:'100vh', padding:24 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background:DK.goldGrad }} />
            <div>
              <h1 style={{ color:DK.text, fontWeight:900, fontSize:20, margin:0 }}>البانرات الإعلانية</h1>
              <p style={{ color:DK.sub, fontSize:12, margin:'2px 0 0' }}>تحكم في سلايدر الصفحة الرئيسية</p>
            </div>
          </div>
          <button style={btn('gold')} onClick={openCreate}>
            + رفع بانر جديد
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor:DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && banners.length === 0 && (
          <div style={{ ...card(), textAlign:'center', padding:'64px 20px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🖼️</div>
            <p style={{ color:DK.text, fontWeight:700, fontSize:15, margin:'0 0 6px' }}>لا توجد بانرات بعد</p>
            <p style={{ color:DK.sub, fontSize:13, margin:'0 0 20px' }}>أضف أول بانر إعلاني للصفحة الرئيسية</p>
            <button style={btn('gold')} onClick={openCreate}>+ رفع بانر جديد</button>
          </div>
        )}

        {/* Banners Grid */}
        {!loading && banners.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {banners.map(banner => {
              const active = isActive(banner);
              return (
                <div key={banner.id} style={{ background:'#FFFFFF', borderRadius:16, overflow:'hidden', boxShadow:DK.shadow, border:'1px solid #EDE3CE' }}>
                  {/* Image */}
                  <div style={{ height:140, background:'#F8F5EE', position:'relative', overflow:'hidden' }}>
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title ?? 'بانر'}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                      />
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:32, color:DK.dim }}>🖼️</div>
                    )}
                    {/* Active badge overlay */}
                    <div style={{ position:'absolute', top:8, right:8 }}>
                      <span style={{
                        display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                        background: active?'rgba(16,185,129,0.9)':'rgba(156,163,175,0.9)', color:'#fff',
                      }}>
                        {active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    {/* Sort order badge */}
                    <div style={{ position:'absolute', top:8, left:8 }}>
                      <span style={{ display:'inline-block', padding:'3px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:'rgba(0,0,0,0.5)', color:'#fff' }}>
                        #{banner.sort_order}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding:14 }}>
                    <p style={{ color:DK.text, fontWeight:800, fontSize:14, margin:'0 0 6px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                      {banner.title ?? 'بدون عنوان'}
                    </p>

                    {banner.link_url && (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color:DK.gold, fontSize:11, display:'block', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', marginBottom:8 }}
                        dir="ltr"
                      >
                        {banner.link_url}
                      </a>
                    )}

                    {/* Date Range */}
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:12 }}>
                      <span style={{ fontSize:10, color:DK.dim }}>📅</span>
                      <span style={{ fontSize:11, color:DK.dim }}>
                        {formatDate(banner.starts_at)} — {formatDate(banner.ends_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <button
                        onClick={() => openEdit(banner)}
                        style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(197,147,65,0.1)', color:DK.gold }}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggle(banner)}
                        style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif",
                          background: banner.is_active?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.08)',
                          color: banner.is_active?DK.red:DK.green,
                        }}
                      >
                        {banner.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(239,68,68,0.08)', color:DK.red }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal title={editing ? 'تعديل البانر' : 'رفع بانر جديد'} onClose={() => { setShowForm(false); setEditing(null); setError(null); }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>
                {error}
              </div>
            )}

            {/* Image preview */}
            {form.image_url && (
              <div style={{ marginBottom:14, borderRadius:12, overflow:'hidden', border:'1px solid #EDE3CE' }}>
                <img
                  src={form.image_url}
                  alt="معاينة"
                  style={{ width:'100%', height:120, objectFit:'cover', display:'block' }}
                  onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                />
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>العنوان (اختياري)</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="عرض الصيف 2026"
                  onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                  style={inp(focused==='title')} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>رابط الصورة</label>
                <input required value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocused('img')} onBlur={() => setFocused(null)}
                  style={inp(focused==='img')} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>رابط الوجهة (اختياري)</label>
                <input value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocused('link')} onBlur={() => setFocused(null)}
                  style={inp(focused==='link')} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>يبدأ من</label>
                  <input type="date" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})}
                    onFocus={() => setFocused('start')} onBlur={() => setFocused(null)}
                    style={inp(focused==='start')} />
                </div>
                <div>
                  <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>ينتهي في</label>
                  <input type="date" value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})}
                    onFocus={() => setFocused('end')} onBlur={() => setFocused(null)}
                    style={inp(focused==='end')} />
                </div>
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>ترتيب العرض</label>
                <input type="number" min="0" value={form.sort_order}
                  onChange={e => setForm({...form, sort_order: e.target.value})}
                  dir="ltr"
                  onFocus={() => setFocused('sort')} onBlur={() => setFocused(null)}
                  style={inp(focused==='sort')} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ ...btn('gold'), flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'رفع البانر')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }} style={{ ...btn('outline'), flex:1 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
