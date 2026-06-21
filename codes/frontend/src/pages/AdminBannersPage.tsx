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
  }
};

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>البانرات</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إدارة بانرات الصفحة الرئيسية</p>
            </div>
          </div>
          <button onClick={openCreate} className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
            + بانر جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="font-semibold mb-1" style={{ color: '#1B2038' }}>لا توجد بانرات بعد</p>
            <p className="text-sm" style={{ color: DK.dimTxt }}>أضف أول بانر للصفحة الرئيسية</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 rounded-xl flex items-start gap-4"
                style={{ ...DK.card, borderRadius: '12px' }}>
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ background: '#F9FAFB' }}>
                  <img src={banner.image_url} alt={banner.title ?? 'بانر'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={banner.is_active
                        ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                        : { background: '#F9FAFB', color: DK.dimTxt }}>
                      {banner.is_active ? 'فعّال' : 'معطّل'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F9FAFB', color: DK.dimTxt }}>
                      ترتيب: {banner.sort_order}
                    </span>
                    {banner.title && <span className="font-bold truncate" style={{ color: '#1B2038' }}>{banner.title}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: DK.dimTxt }}>
                    <span>{formatDate(banner.starts_at)} — {formatDate(banner.ends_at)}</span>
                    {banner.link_url && (
                      <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
                        className="hover:underline truncate max-w-xs" style={{ color: DK.gold }} dir="ltr">
                        {banner.link_url}
                      </a>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(banner)} className="text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                    style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>تعديل</button>
                  <button onClick={() => handleToggle(banner)} className="text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                    style={banner.is_active
                      ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                      : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                    {banner.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="text-xs px-3 py-1.5 rounded-lg transition"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleSubmit} className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1B2038' }}>{editing ? 'تعديل البانر' : 'بانر جديد'}</h3>

            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>العنوان (اختياري)</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عرض الصيف 2026"
                  onFocus={() => setFocusedInput('title')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('title')} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>رابط الصورة</label>
                <input required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocusedInput('img')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('img')} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>رابط الوجهة (اختياري)</label>
                <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..." dir="ltr"
                  onFocus={() => setFocusedInput('link')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('link')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>يبدأ من</label>
                  <input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    onFocus={() => setFocusedInput('start')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('start')} />
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>ينتهي في</label>
                  <input type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    onFocus={() => setFocusedInput('end')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('end')} />
                </div>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>ترتيب العرض</label>
                <input type="number" min="0" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  dir="ltr"
                  onFocus={() => setFocusedInput('sort')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('sort')} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة البانر')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
