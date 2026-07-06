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

interface Page     { id: number; slug: string; title: string; content: string; updated_at: string | null; }
interface Faq      { id: number; question: string; answer: string; sort_order: number; is_active: boolean; }
interface SocialLink { id: number; platform: string; url: string; icon: string | null; is_active: boolean; }
type Tab = 'pages' | 'faqs' | 'social';

const PREDEFINED_SLUGS = [
  { slug: 'about',   label: 'من نحن',           icon: 'ℹ️' },
  { slug: 'privacy', label: 'سياسة الخصوصية',   icon: '🔒' },
  { slug: 'terms',   label: 'الشروط والأحكام',   icon: '📜' },
];

function inputFocusStyle(focused: boolean): React.CSSProperties {
  return inp(focused);
}

// ─── Pages Tab ────────────────────────────────────────────────────────────────

function PagesTab() {
  const [pages, setPages]           = useState<Page[]>([]);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form, setForm]             = useState({ title: '', content: '' });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [focused, setFocused]       = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get('/admin/cms/pages');
    setPages(data.pages);
  };

  useEffect(() => { load(); }, []);

  const openPage = async (slug: string, label: string) => {
    setError(null); setSuccess(null);
    try {
      const { data } = await api.get(`/admin/cms/pages/${slug}`);
      setEditingPage(data.page);
      setForm({ title: data.page.title, content: data.page.content });
    } catch {
      setEditingPage({ id: 0, slug, title: label, content: '', updated_at: null });
      setForm({ title: label, content: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      await api.put(`/admin/cms/pages/${editingPage.slug}`, form);
      setSuccess('تم الحفظ بنجاح');
      setEditingPage(null);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        {PREDEFINED_SLUGS.map(p => {
          const existing = pages.find(pg => pg.slug === p.slug);
          return (
            <div key={p.slug} style={card({ padding:18 })}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <span style={{ fontSize:22 }}>{p.icon}</span>
                <div>
                  <p style={{ color:DK.text, fontWeight:800, fontSize:14, margin:0 }}>{p.label}</p>
                  <p style={{ color:DK.dim, fontSize:11, margin:0 }}>/{p.slug}</p>
                </div>
              </div>
              {existing?.updated_at && (
                <p style={{ color:DK.dim, fontSize:11, margin:'0 0 12px' }}>
                  آخر تحديث: {new Date(existing.updated_at).toLocaleDateString('ar-EG')}
                </p>
              )}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{
                  display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700,
                  background: existing ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)',
                  color: existing ? DK.green : DK.dim,
                }}>
                  {existing ? 'موجود' : 'جديد'}
                </span>
                <button
                  onClick={() => openPage(p.slug, p.label)}
                  style={btn('outline')}
                >
                  تعديل
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <Modal title={`تعديل: ${editingPage.title}`} onClose={() => { setEditingPage(null); setError(null); setSuccess(null); }}>
          <form onSubmit={handleSave}>
            {error   && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>{error}</div>}
            {success && <div style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'10px 14px', color:DK.green, fontSize:13, marginBottom:14 }}>{success}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>عنوان الصفحة</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  onFocus={() => setFocused('ptitle')} onBlur={() => setFocused(null)}
                  style={inputFocusStyle(focused==='ptitle')} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>المحتوى (HTML أو نص)</label>
                <textarea required rows={12} value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  onFocus={() => setFocused('pcontent')} onBlur={() => setFocused(null)}
                  style={{ ...inputFocusStyle(focused==='pcontent'), resize:'vertical', fontFamily:'monospace', minHeight:200 }}
                  dir="auto" />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ ...btn('gold'), flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}
              </button>
              <button type="button" onClick={() => { setEditingPage(null); setError(null); setSuccess(null); }} style={{ ...btn('outline'), flex:1 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── FAQs Tab ─────────────────────────────────────────────────────────────────

function FaqsTab() {
  const [faqs, setFaqs]         = useState<Faq[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Faq | null>(null);
  const [form, setForm]         = useState({ question: '', answer: '', sort_order: '0' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focused, setFocused]   = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/cms/faqs'); setFaqs(data.faqs); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ question: '', answer: '', sort_order: '0' }); setError(null); setShowForm(true); };
  const openEdit = (faq: Faq) => { setEditing(faq); setForm({ question: faq.question, answer: faq.answer, sort_order: String(faq.sort_order) }); setError(null); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    try {
      if (editing) await api.put(`/admin/cms/faqs/${editing.id}`, payload);
      else         await api.post('/admin/cms/faqs', payload);
      setShowForm(false); await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleToggle = async (faq: Faq) => {
    try { await api.put(`/admin/cms/faqs/${faq.id}`, { is_active: !faq.is_active }); await load(); } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا السؤال؟')) return;
    try { await api.delete(`/admin/cms/faqs/${id}`); await load(); } catch { /* ignore */ }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={openCreate} style={btn('gold')}>+ إضافة سؤال جديد</button>
      </div>

      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor:DK.gold, animation:'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && faqs.length === 0 && (
        <div style={{ ...card(), textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>❓</div>
          <p style={{ color:DK.sub, fontSize:13, margin:0 }}>لا توجد أسئلة شائعة بعد</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {faqs.map(faq => (
          <div key={faq.id} style={card({ padding:0, overflow:'hidden' })}>
            {/* Question header - clickable to expand */}
            <div
              onClick={() => setExpanded(expanded===faq.id ? null : faq.id)}
              style={{ padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                <span style={{ color:DK.gold, fontWeight:900, fontSize:16 }}>{expanded===faq.id ? '▲' : '▼'}</span>
                <p style={{ color:DK.text, fontWeight:700, fontSize:13, margin:0 }}>{faq.question}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                <span style={{
                  padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
                  background: faq.is_active?'rgba(16,185,129,0.1)':'rgba(156,163,175,0.1)',
                  color: faq.is_active?DK.green:DK.dim,
                }}>
                  {faq.is_active ? 'فعّال' : 'مخفي'}
                </span>
                <button onClick={e => { e.stopPropagation(); openEdit(faq); }}
                  style={{ padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(197,147,65,0.1)', color:DK.gold }}>
                  تعديل
                </button>
                <button onClick={e => { e.stopPropagation(); handleToggle(faq); }}
                  style={{ padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'Cairo',sans-serif",
                    background: faq.is_active?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.08)',
                    color: faq.is_active?DK.red:DK.green }}>
                  {faq.is_active ? 'إخفاء' : 'إظهار'}
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(faq.id); }}
                  style={{ padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(239,68,68,0.08)', color:DK.red }}>
                  حذف
                </button>
              </div>
            </div>
            {/* Answer - expanded */}
            {expanded === faq.id && (
              <div style={{ padding:'0 18px 14px 18px', borderTop:'1px solid #F3EDE0' }}>
                <p style={{ color:DK.sub, fontSize:13, lineHeight:1.7, margin:'12px 0 0' }}>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit FAQ Modal */}
      {showForm && (
        <Modal title={editing ? 'تعديل السؤال' : 'سؤال جديد'} onClose={() => { setShowForm(false); setEditing(null); setError(null); }}>
          <form onSubmit={handleSubmit}>
            {error && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>السؤال</label>
                <input required value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                  onFocus={() => setFocused('fq')} onBlur={() => setFocused(null)}
                  style={inputFocusStyle(focused==='fq')} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>الجواب</label>
                <textarea required rows={5} value={form.answer} onChange={e => setForm({...form, answer: e.target.value})}
                  onFocus={() => setFocused('fa')} onBlur={() => setFocused(null)}
                  style={{ ...inputFocusStyle(focused==='fa'), resize:'none' }} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>ترتيب العرض</label>
                <input type="number" min="0" value={form.sort_order}
                  onChange={e => setForm({...form, sort_order: e.target.value})}
                  onFocus={() => setFocused('fsort')} onBlur={() => setFocused(null)}
                  style={inputFocusStyle(focused==='fsort')} dir="ltr" />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ ...btn('gold'), flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة السؤال')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }} style={{ ...btn('outline'), flex:1 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Social Links Tab ─────────────────────────────────────────────────────────

const PLATFORMS = ['whatsapp', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'telegram', 'snapchat'];

const PLATFORM_EMOJIS: Record<string, string> = {
  whatsapp:  '💬',
  facebook:  '📘',
  instagram: '📸',
  twitter:   '🐦',
  youtube:   '▶️',
  tiktok:    '🎵',
  telegram:  '✈️',
  snapchat:  '👻',
};

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'واتساب', facebook: 'فيسبوك', instagram: 'انستجرام',
  twitter: 'تويتر / X', youtube: 'يوتيوب', tiktok: 'تيك توك',
  telegram: 'تيليجرام', snapchat: 'سناب شات',
};

function SocialTab() {
  const [links, setLinks]       = useState<SocialLink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ platform: 'whatsapp', url: '', icon: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focused, setFocused]   = useState<string | null>(null);
  // Local URL edits per existing link
  const [editUrls, setEditUrls] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cms/social');
      setLinks(data.links);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.post('/admin/cms/social', { ...form, icon: form.icon || null });
      setForm({ platform: 'whatsapp', url: '', icon: '' });
      setShowForm(false); await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الرابط؟')) return;
    try { await api.delete(`/admin/cms/social/${id}`); await load(); } catch { /* ignore */ }
  };

  const handleSaveUrl = async (link: SocialLink) => {
    const url = editUrls[link.id] ?? link.url;
    setSavingId(link.id);
    try {
      await api.put(`/admin/cms/social/${link.id}`, { url, is_active: link.is_active });
      await load();
    } finally { setSavingId(null); }
  };

  const handleToggleActive = async (link: SocialLink) => {
    try {
      await api.put(`/admin/cms/social/${link.id}`, { url: link.url, is_active: !link.is_active });
      await load();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={() => { setShowForm(true); setError(null); }} style={btn('gold')}>+ إضافة رابط</button>
      </div>

      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor:DK.gold, animation:'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && links.length === 0 && (
        <div style={{ ...card(), textAlign:'center', padding:'40px 20px' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🔗</div>
          <p style={{ color:DK.sub, fontSize:13, margin:0 }}>لا توجد روابط بعد</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {links.map(link => (
          <div key={link.id} style={card({ padding:14, display:'flex', alignItems:'center', gap:14 })}>
            {/* Icon + Platform */}
            <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:120 }}>
              <span style={{ fontSize:24 }}>{PLATFORM_EMOJIS[link.platform] ?? '🔗'}</span>
              <div>
                <p style={{ color:DK.text, fontWeight:700, fontSize:13, margin:0 }}>{PLATFORM_LABELS[link.platform] ?? link.platform}</p>
                <span style={{
                  display:'inline-block', padding:'1px 8px', borderRadius:20, fontSize:10, fontWeight:700, marginTop:2,
                  background: link.is_active?'rgba(16,185,129,0.1)':'rgba(156,163,175,0.1)',
                  color: link.is_active?DK.green:DK.dim,
                }}>
                  {link.is_active ? 'نشط' : 'مخفي'}
                </span>
              </div>
            </div>

            {/* URL input */}
            <input
              value={editUrls[link.id] ?? link.url}
              onChange={e => setEditUrls({...editUrls, [link.id]: e.target.value})}
              dir="ltr"
              placeholder="https://..."
              onFocus={() => setFocused(`url-${link.id}`)} onBlur={() => setFocused(null)}
              style={{ ...inp(focused===`url-${link.id}`), flex:1 }}
            />

            {/* Actions */}
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button
                onClick={() => handleSaveUrl(link)}
                disabled={savingId===link.id}
                style={{ padding:'7px 14px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:DK.gold, color:'#fff', opacity:savingId===link.id?0.6:1 }}
              >
                {savingId===link.id ? '...' : 'حفظ'}
              </button>
              <button
                onClick={() => handleToggleActive(link)}
                style={{ padding:'7px 10px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif",
                  background: link.is_active?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.08)',
                  color: link.is_active?DK.red:DK.green,
                }}
              >
                {link.is_active ? 'إخفاء' : 'إظهار'}
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                style={{ padding:'7px 10px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(239,68,68,0.08)', color:DK.red }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Social Modal */}
      {showForm && (
        <Modal title="إضافة رابط تواصل" onClose={() => { setShowForm(false); setError(null); }}>
          <form onSubmit={handleSubmit}>
            {error && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:DK.red, fontSize:13, marginBottom:14 }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>المنصة</label>
                <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
                  onFocus={() => setFocused('splat')} onBlur={() => setFocused(null)}
                  style={{ ...inputFocusStyle(focused==='splat'), cursor:'pointer' }}>
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{PLATFORM_EMOJIS[p]} {PLATFORM_LABELS[p] ?? p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>الرابط</label>
                <input required value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocused('surl')} onBlur={() => setFocused(null)}
                  style={inputFocusStyle(focused==='surl')} />
              </div>
              <div>
                <label style={{ color:DK.sub, fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>أيقونة (اختياري)</label>
                <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                  placeholder="fa-brands fa-whatsapp" dir="ltr"
                  onFocus={() => setFocused('sicon')} onBlur={() => setFocused(null)}
                  style={inputFocusStyle(focused==='sicon')} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ ...btn('gold'), flex:1, opacity:saving?0.6:1 }}>
                {saving ? 'جاري الحفظ...' : 'حفظ الرابط'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }} style={{ ...btn('outline'), flex:1 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pages');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'pages',  label: 'الصفحات',          icon: '📄' },
    { key: 'faqs',   label: 'الأسئلة الشائعة',  icon: '❓' },
    { key: 'social', label: 'روابط التواصل',    icon: '🔗' },
  ];

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background:DK.bg, minHeight:'100vh', padding:24 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ width:4, height:28, borderRadius:4, background:DK.goldGrad }} />
          <div>
            <h1 style={{ color:DK.text, fontWeight:900, fontSize:20, margin:0 }}>إدارة المحتوى</h1>
            <p style={{ color:DK.sub, fontSize:12, margin:'2px 0 0' }}>تحرير صفحات الموقع والأسئلة الشائعة وروابط التواصل</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding:'9px 20px', borderRadius:24, fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:"'Cairo',sans-serif", border:'none',
                background: activeTab===tab.key ? DK.gold : '#FFFFFF',
                color: activeTab===tab.key ? '#fff' : DK.sub,
                boxShadow: activeTab===tab.key ? '0 2px 10px rgba(197,147,65,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pages'  && <PagesTab />}
        {activeTab === 'faqs'   && <FaqsTab />}
        {activeTab === 'social' && <SocialTab />}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
