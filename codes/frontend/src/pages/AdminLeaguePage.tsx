import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

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

function leagueStatusStyle(s: string): React.CSSProperties {
  if (s === 'active')  return { background: 'rgba(52,211,153,0.12)',  color: '#34d399' };
  if (s === 'pending') return { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' };
  return { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' };
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = { name: '', type: '1v1' as '1v1' | 'group', max_participants: '', starts_at: '', ends_at: '' };

export default function AdminLeaguePage() {
  const [leagues, setLeagues]   = useState<League[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
    setSaving(true); setError(null);
    try {
      await api.post('/admin/leagues', {
        name:             form.name,
        type:             form.type,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        starts_at:        form.starts_at || null,
        ends_at:          form.ends_at   || null,
      });
      setForm(emptyForm); setShowForm(false); await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleStatus = async (id: number, status: 'active' | 'ended') => {
    try { await api.patch(`/admin/leagues/${id}/status`, { status }); await load(); } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف هذا الدوري؟')) return;
    try { await api.delete(`/admin/leagues/${id}`); await load(); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #f5a623' : '1px solid rgba(245,166,35,0.15)',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <div>
              <h2 className="text-xl font-bold text-white">دوري ياقوت</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إدارة الدوريات التنافسية للطلاب</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
            + دوري جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="font-semibold text-white mb-1">لا توجد دوريات بعد</p>
            <p className="text-sm" style={{ color: DK.dimTxt }}>أضف أول دوري للطلاب</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leagues.map((league) => (
              <div key={league.id} className="p-4 rounded-xl" style={DK.card}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={leagueStatusStyle(league.status)}>
                        {STATUS_LABELS[league.status]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                        {league.type === '1v1' ? '⚔️ 1v1' : '👥 جماعي'}
                      </span>
                      <span className="font-bold text-white">{league.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: DK.dimTxt }}>
                      <span>👥 {league.participants_count ?? 0} مشارك</span>
                      {league.max_participants && <span>الحد الأقصى: {league.max_participants}</span>}
                      <span>{formatDate(league.starts_at)} — {formatDate(league.ends_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {league.status === 'pending' && (
                      <button onClick={() => handleStatus(league.id, 'active')}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                        بدء الدوري
                      </button>
                    )}
                    {league.status === 'active' && (
                      <button onClick={() => handleStatus(league.id, 'ended')}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        إنهاء الدوري
                      </button>
                    )}
                    {league.status === 'pending' && (
                      <button onClick={() => handleDelete(league.id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleCreate} className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)' }}>
            <h3 className="text-lg font-bold text-white mb-4">دوري جديد</h3>
            {error && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>اسم الدوري</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="دوري رمضان 2026"
                  onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('name')} />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>النوع</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as '1v1' | 'group' })}
                  onFocus={() => setFocusedInput('type')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('type'), cursor: 'pointer' }}>
                  <option value="1v1"   style={{ background: '#070e22' }}>⚔️ منازلة فردية (1v1)</option>
                  <option value="group" style={{ background: '#070e22' }}>👥 دوري جماعي</option>
                </select>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>أقصى عدد مشاركين (اختياري)</label>
                <input type="number" min="2" value={form.max_participants}
                  onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                  placeholder="بلا حد" dir="ltr"
                  onFocus={() => setFocusedInput('max')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('max')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>تاريخ البداية</label>
                  <input type="datetime-local" value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    onFocus={() => setFocusedInput('start')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('start'), colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: DK.dimTxt }}>تاريخ النهاية</label>
                  <input type="datetime-local" value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    onFocus={() => setFocusedInput('end')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('end'), colorScheme: 'dark' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                {saving ? 'جاري الحفظ...' : 'إنشاء الدوري'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
