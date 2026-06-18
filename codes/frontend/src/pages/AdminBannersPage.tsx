import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">البانرات</h2>
            <p className="text-sm text-gray-400 mt-1">إدارة بانرات الصفحة الرئيسية</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            بانر جديد
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editing ? 'تعديل البانر' : 'بانر جديد'}
              </h3>

              {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">العنوان (اختياري)</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="عرض الصيف 2026"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">رابط الصورة</label>
                  <input
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">رابط الوجهة (اختياري)</label>
                  <input
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">يبدأ من</label>
                    <input
                      type="date"
                      value={form.starts_at}
                      onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">ينتهي في</label>
                    <input
                      type="date"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
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
                  {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة البانر')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

        {!loading && banners.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="text-gray-500 font-semibold">لا توجد بانرات بعد</p>
            <p className="text-gray-400 text-sm mt-1">أضف أول بانر للصفحة الرئيسية</p>
          </div>
        )}

        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={banner.image_url}
                  alt={banner.title ?? 'بانر'}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {banner.is_active ? 'فعّال' : 'معطّل'}
                  </span>
                  <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full font-semibold">
                    ترتيب: {banner.sort_order}
                  </span>
                  {banner.title && <span className="font-bold text-gray-800 truncate">{banner.title}</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                  <span>📅 {formatDate(banner.starts_at)} — {formatDate(banner.ends_at)}</span>
                  {banner.link_url && (
                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
                      className="text-purple-500 hover:underline truncate max-w-xs" dir="ltr">
                      {banner.link_url}
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(banner)}
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition font-semibold">
                  تعديل
                </button>
                <button onClick={() => handleToggle(banner)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition font-semibold ${banner.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {banner.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
                <button onClick={() => handleDelete(banner.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
