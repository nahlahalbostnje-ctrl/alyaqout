import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties
};

interface Page     { id: number; slug: string; title: string; content: string; updated_at: string | null; }
interface Faq      { id: number; question: string; answer: string; sort_order: number; is_active: boolean; }
interface SocialLink { id: number; platform: string; url: string; icon: string | null; is_active: boolean; }
type Tab = 'pages' | 'faqs' | 'social';

const PREDEFINED_SLUGS = [
  { slug: 'about',   label: 'من نحن'          },
  { slug: 'privacy', label: 'سياسة الخصوصية' },
  { slug: 'terms',   label: 'الشروط والأحكام' },
];

function inputFocusStyle(focused: boolean) {
  return { ...DK.inputStyle, border: focused ? '1px solid #C9952A' : '1px solid #EDE3CE' };
}

// ─── Pages Tab ────────────────────────────────────────────────────────────────

function PagesTab() {
  const [pages, setPages]       = useState<Page[]>([]);
  const [selected, setSelected] = useState<Page | null>(null);
  const [form, setForm]         = useState({ title: '', content: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get('/admin/cms/pages');
    setPages(data.pages);
  };

  useEffect(() => { load(); }, []);

  const openPage = async (slug: string, label: string) => {
    setError(null); setSuccess(null);
    try {
      const { data } = await api.get(`/admin/cms/pages/${slug}`);
      setSelected(data.page);
      setForm({ title: data.page.title, content: data.page.content });
    } catch {
      setSelected({ id: 0, slug, title: label, content: '', updated_at: null });
      setForm({ title: label, content: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      await api.put(`/admin/cms/pages/${selected.slug}`, form);
      setSuccess('تم الحفظ بنجاح');
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-2">
        {PREDEFINED_SLUGS.map((p) => {
          const existing = pages.find((pg) => pg.slug === p.slug);
          const isActive = selected?.slug === p.slug;
          return (
            <button key={p.slug} onClick={() => openPage(p.slug, p.label)}
              className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between"
              style={isActive
                ? { background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.2)', color: DK.gold }
                : { background: '#F9FAFB', border: '1px solid #EDE3CE', color: '#1B2038' }}>
              <span>{p.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={existing
                  ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                  : { background: '#F9FAFB', color: DK.dimTxt }}>
                {existing ? 'موجود' : 'جديد'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="col-span-2">
        {!selected ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#F9FAFB', border: '1px dashed #EDE3CE' }}>
            <p className="text-sm" style={{ color: DK.dimTxt }}>اختر صفحة لتعديلها</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 rounded-2xl space-y-4" style={DK.card}>
            {error   && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>}
            {success && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#10B981', background: 'rgba(16,185,129,0.08)' }}>{success}</p>}
            <div>
              <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>عنوان الصفحة</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                onFocus={() => setFocusedInput('title')} onBlur={() => setFocusedInput(null)}
                style={inputFocusStyle(focusedInput === 'title')} />
            </div>
            <div>
              <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>المحتوى (HTML أو نص)</label>
              <textarea required rows={12} value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                onFocus={() => setFocusedInput('content')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputFocusStyle(focusedInput === 'content'), resize: 'vertical', fontFamily: 'monospace' }}
                dir="auto" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
              {saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}
            </button>
          </form>
        )}
      </div>
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleSubmit} className="w-full max-w-lg p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1B2038' }}>{editing ? 'تعديل السؤال' : 'سؤال جديد'}</h3>
            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>السؤال</label>
                <input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                  onFocus={() => setFocusedInput('q')} onBlur={() => setFocusedInput(null)}
                  style={inputFocusStyle(focusedInput === 'q')} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>الجواب</label>
                <textarea required rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  onFocus={() => setFocusedInput('a')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputFocusStyle(focusedInput === 'a'), resize: 'none' }} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>ترتيب العرض</label>
                <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  onFocus={() => setFocusedInput('sort')} onBlur={() => setFocusedInput(null)}
                  style={inputFocusStyle(focusedInput === 'sort')} dir="ltr" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة السؤال')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="text-sm px-4 py-2 rounded-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
          + سؤال جديد
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
        </div>
      )}

      {!loading && faqs.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: '#F9FAFB', border: '1px dashed #EDE3CE' }}>
          <p className="text-sm" style={{ color: DK.dimTxt }}>لا توجد أسئلة شائعة بعد</p>
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-4 rounded-xl" style={DK.card}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={faq.is_active
                      ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                      : { background: '#F9FAFB', color: DK.dimTxt }}>
                    {faq.is_active ? 'فعّال' : 'مخفي'}
                  </span>
                  <span className="text-xs" style={{ color: DK.dimTxt }}>ترتيب: {faq.sort_order}</span>
                </div>
                <p className="font-semibold mb-1" style={{ color: '#1B2038' }}>{faq.question}</p>
                <p className="text-sm leading-relaxed" style={{ color: DK.dimTxt }}>{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(faq)} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>تعديل</button>
                <button onClick={() => handleToggle(faq)} className="text-xs px-3 py-1.5 rounded-lg"
                  style={faq.is_active
                    ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                    : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                  {faq.is_active ? 'إخفاء' : 'إظهار'}
                </button>
                <button onClick={() => handleDelete(faq.id)} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Social Links Tab ─────────────────────────────────────────────────────────

const PLATFORMS = ['whatsapp', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'telegram', 'snapchat'];

function SocialTab() {
  const [links, setLinks]       = useState<SocialLink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ platform: 'whatsapp', url: '', icon: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/cms/social'); setLinks(data.links); }
    finally { setLoading(false); }
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

  const platformLabel: Record<string, string> = {
    whatsapp: 'واتساب', facebook: 'فيسبوك', instagram: 'انستجرام',
    twitter: 'تويتر / X', youtube: 'يوتيوب', tiktok: 'تيك توك',
    telegram: 'تيليجرام', snapchat: 'سناب شات',
  };

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleSubmit} className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1B2038' }}>إضافة / تحديث رابط</h3>
            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>المنصة</label>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  onFocus={() => setFocusedInput('plat')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputFocusStyle(focusedInput === 'plat'), cursor: 'pointer' }}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{platformLabel[p] ?? p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>الرابط</label>
                <input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocusedInput('url')} onBlur={() => setFocusedInput(null)}
                  style={inputFocusStyle(focusedInput === 'url')} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>أيقونة (اختياري)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="fa-brands fa-whatsapp" dir="ltr"
                  onFocus={() => setFocusedInput('icon')} onBlur={() => setFocusedInput(null)}
                  style={inputFocusStyle(focusedInput === 'icon')} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                {saving ? 'جاري الحفظ...' : 'حفظ الرابط'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button onClick={() => { setShowForm(true); setError(null); }} className="text-sm px-4 py-2 rounded-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
          + إضافة / تحديث
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
        </div>
      )}

      {!loading && links.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: '#F9FAFB', border: '1px dashed #EDE3CE' }}>
          <p className="text-sm" style={{ color: DK.dimTxt }}>لا توجد روابط بعد</p>
        </div>
      )}

      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="p-4 rounded-xl flex items-center gap-4" style={DK.card}>
            <div className="flex-1">
              <p className="font-semibold capitalize" style={{ color: '#1B2038' }}>{platformLabel[link.platform] ?? link.platform}</p>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline" style={{ color: DK.gold }} dir="ltr">
                {link.url}
              </a>
            </div>
            <button onClick={() => handleDelete(link.id)} className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pages');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pages',  label: 'الصفحات'         },
    { key: 'faqs',   label: 'الأسئلة الشائعة' },
    { key: 'social', label: 'روابط التواصل'   },
  ];

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>إدارة المحتوى (CMS)</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>تحرير صفحات الموقع والأسئلة الشائعة وروابط التواصل</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2 text-sm font-semibold rounded-xl transition"
              style={activeTab === tab.key
                ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }
                : { background: '#FFFFFF', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pages'  && <PagesTab />}
        {activeTab === 'faqs'   && <FaqsTab />}
        {activeTab === 'social' && <SocialTab />}
      </div>
    </AdminLayout>
  );
}
