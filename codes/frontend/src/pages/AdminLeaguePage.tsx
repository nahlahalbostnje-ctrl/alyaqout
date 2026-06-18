import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

interface League {
  id:                  number;
  name:                string;
  type:                '1v1' | 'group';
  status:              'pending' | 'active' | 'ended';
  participants_count?: number;
  max_participants:    number | null;
  starts_at:           string | null;
  ends_at:             string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قريباً',
  active:  'جارٍ الآن',
  ended:   'منتهٍ',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active:  'bg-green-100 text-green-700',
  ended:   'bg-gray-100 text-gray-400',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = { name: '', type: '1v1' as '1v1' | 'group', max_participants: '', starts_at: '', ends_at: '' };

export default function AdminLeaguePage() {
  const [leagues, setLeagues]     = useState<League[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/leagues');
      setLeagues(data.leagues);
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
      await api.post('/admin/leagues', {
        name:             form.name,
        type:             form.type,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        starts_at:        form.starts_at || null,
        ends_at:          form.ends_at   || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: number, status: 'active' | 'ended') => {
    try {
      await api.patch(`/admin/leagues/${id}/status`, { status });
      await load();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الدوري؟')) return;
    try {
      await api.delete(`/admin/leagues/${id}`);
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
            <h2 className="text-xl font-bold text-gray-800">دوري ياقوت</h2>
            <p className="text-sm text-gray-400 mt-1">إدارة الدوريات التنافسية للطلاب</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            دوري جديد
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">دوري جديد</h3>

              {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">اسم الدوري</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="دوري رمضان 2026"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">النوع</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as '1v1' | 'group' })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="1v1">⚔️ منازلة فردية (1v1)</option>
                    <option value="group">👥 دوري جماعي</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">أقصى عدد مشاركين (اختياري)</label>
                  <input
                    type="number"
                    min="2"
                    value={form.max_participants}
                    onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="بلا حد"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">تاريخ البداية</label>
                    <input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">تاريخ النهاية</label>
                    <input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'إنشاء الدوري'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

        {!loading && leagues.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-500 font-semibold">لا توجد دوريات بعد</p>
            <p className="text-gray-400 text-sm mt-1">أضف أول دوري للطلاب</p>
          </div>
        )}

        <div className="space-y-3">
          {leagues.map((league) => (
            <div key={league.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[league.status]}`}>
                      {STATUS_LABELS[league.status]}
                    </span>
                    <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full font-semibold">
                      {league.type === '1v1' ? '⚔️ 1v1' : '👥 جماعي'}
                    </span>
                    <span className="font-bold text-gray-800">{league.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                    <span>👥 {league.participants_count ?? 0} مشارك</span>
                    {league.max_participants && <span>📊 الحد الأقصى: {league.max_participants}</span>}
                    <span>📅 {formatDate(league.starts_at)} — {formatDate(league.ends_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {league.status === 'pending' && (
                    <button onClick={() => handleStatus(league.id, 'active')}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                      بدء الدوري
                    </button>
                  )}
                  {league.status === 'active' && (
                    <button onClick={() => handleStatus(league.id, 'ended')}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition">
                      إنهاء الدوري
                    </button>
                  )}
                  {league.status === 'pending' && (
                    <button onClick={() => handleDelete(league.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5">
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
