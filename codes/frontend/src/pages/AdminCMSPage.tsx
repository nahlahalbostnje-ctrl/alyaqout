import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id:         number;
  slug:       string;
  title:      string;
  content:    string;
  updated_at: string | null;
}

interface Faq {
  id:         number;
  question:   string;
  answer:     string;
  sort_order: number;
  is_active:  boolean;
}

interface SocialLink {
  id:        number;
  platform:  string;
  url:       string;
  icon:      string | null;
  is_active: boolean;
}

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'pages' | 'faqs' | 'social';

// ─── Pages Tab ────────────────────────────────────────────────────────────────

const PREDEFINED_SLUGS = [
  { slug: 'about',   label: 'من نحن'          },
  { slug: 'privacy', label: 'سياسة الخصوصية' },
  { slug: 'terms',   label: 'الشروط والأحكام' },
];

function PagesTab() {
  const [pages, setPages]         = useState<Page[]>([]);
  const [selected, setSelected]   = useState<Page | null>(null);
  const [form, setForm]           = useState({ title: '', content: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get('/admin/cms/pages');
    setPages(data.pages);
  };

  useEffect(() => { load(); }, []);

  const openPage = async (slug: string, label: string) => {
    setError(null);
    setSuccess(null);
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
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/admin/cms/pages/${selected.slug}`, form);
      setSuccess('تم الحفظ بنجاح');
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Page list */}
      <div className="col-span-1 space-y-2">
        {PREDEFINED_SLUGS.map((p) => {
          const existing = pages.find((pg) => pg.slug === p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => openPage(p.slug, p.label)}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${selected?.slug === p.slug ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{p.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${existing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {existing ? 'موجود' : 'جديد'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="col-span-2">
        {!selected ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-gray-400 text-sm">اختر صفحة لتعديلها</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">عنوان الصفحة</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">المحتوى (HTML أو نص)</label>
              <textarea
                required
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono resize-y"
                dir="auto"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cms/faqs');
      setFaqs(data.faqs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ question: '', answer: '', sort_order: '0' });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, sort_order: String(faq.sort_order) });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    try {
      if (editing) {
        await api.put(`/admin/cms/faqs/${editing.id}`, payload);
      } else {
        await api.post('/admin/cms/faqs', payload);
      }
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (faq: Faq) => {
    try {
      await api.put(`/admin/cms/faqs/${faq.id}`, { is_active: !faq.is_active });
      await load();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا السؤال؟')) return;
    try {
      await api.delete(`/admin/cms/faqs/${id}`);
      await load();
    } catch { /* ignore */ }
  };

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'تعديل السؤال' : 'سؤال جديد'}</h3>
            {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">السؤال</label>
                <input
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">الجواب</label>
                <textarea
                  required
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ترتيب العرض</label>
                <input
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة السؤال')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          سؤال جديد
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

      {!loading && faqs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">❓</p>
          <p className="text-gray-400 text-sm">لا توجد أسئلة شائعة بعد</p>
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {faq.is_active ? 'فعّال' : 'مخفي'}
                  </span>
                  <span className="text-xs text-gray-400">ترتيب: {faq.sort_order}</span>
                </div>
                <p className="font-semibold text-gray-800 mb-1">{faq.question}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(faq)}
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition font-semibold">
                  تعديل
                </button>
                <button onClick={() => handleToggle(faq)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition font-semibold ${faq.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {faq.is_active ? 'إخفاء' : 'إظهار'}
                </button>
                <button onClick={() => handleDelete(faq.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5">
                  حذف
                </button>
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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cms/social');
      setLinks(data.links);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/cms/social', { ...form, icon: form.icon || null });
      setForm({ platform: 'whatsapp', url: '', icon: '' });
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الرابط؟')) return;
    try {
      await api.delete(`/admin/cms/social/${id}`);
      await load();
    } catch { /* ignore */ }
  };

  const platformLabel: Record<string, string> = {
    whatsapp: 'واتساب', facebook: 'فيسبوك', instagram: 'انستجرام',
    twitter: 'تويتر / X', youtube: 'يوتيوب', tiktok: 'تيك توك',
    telegram: 'تيليجرام', snapchat: 'سناب شات',
  };

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة / تحديث رابط</h3>
            {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">المنصة</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{platformLabel[p] ?? p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">الرابط</label>
                <input
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">أيقونة (اختياري)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="fa-brands fa-whatsapp"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : 'حفظ الرابط'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة / تحديث
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

      {!loading && links.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">🔗</p>
          <p className="text-gray-400 text-sm">لا توجد روابط بعد</p>
        </div>
      )}

      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-800 capitalize">{platformLabel[link.platform] ?? link.platform}</p>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-purple-500 hover:underline" dir="ltr">
                {link.url}
              </a>
            </div>
            <button onClick={() => handleDelete(link.id)}
              className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5">
              حذف
            </button>
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
    { key: 'pages',  label: 'الصفحات'          },
    { key: 'faqs',   label: 'الأسئلة الشائعة'  },
    { key: 'social', label: 'روابط التواصل'    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">إدارة المحتوى (CMS)</h2>
          <p className="text-sm text-gray-400 mt-1">تحرير صفحات الموقع والأسئلة الشائعة وروابط التواصل</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === tab.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
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
