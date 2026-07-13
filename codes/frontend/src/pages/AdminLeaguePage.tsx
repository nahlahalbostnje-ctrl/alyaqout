import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6', orange: '#F59E0B', purple: '#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});
const btn = (v: 'gold' | 'outline' | 'danger' = 'gold'): React.CSSProperties => ({
  padding: '9px 20px', borderRadius: 12, border: v === 'outline' ? '1px solid #EDE3CE' : 'none',
  background: v === 'gold' ? '#C59341' : v === 'danger' ? '#EF4444' : '#FFFFFF',
  color: v === 'outline' ? '#1B2038' : '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  fontFamily: "'Cairo',sans-serif",
});
const inp = (focused = false): React.CSSProperties => ({
  background: '#FFFFFF', border: `1.5px solid ${focused ? '#C59341' : '#EDE3CE'}`,
  color: '#1B2038', borderRadius: 12, padding: '10px 14px', fontSize: 13,
  width: '100%', outline: 'none', fontFamily: "'Cairo',sans-serif",
});

interface League {
  id: number;
  name: string;
  type: '1v1' | 'group';
  status: 'pending' | 'active' | 'ended';
  participants_count?: number;
  max_participants: number | null;
  starts_at: string | null;
  ends_at: string | null;
}

interface LeaderboardEntry {
  rank: number;
  student_id: number;
  student_name: string;
  score: number;
  avatar?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قريباً',
  active: 'جارٍ الآن',
  ended: 'منتهٍ',
};

function statusStyle(s: string): React.CSSProperties {
  if (s === 'active') return { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' };
  if (s === 'pending') return { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' };
  return { background: '#F5F5F5', color: '#9CA3AF', border: '1px solid #E5E7EB' };
}

function typeStyle(t: string): React.CSSProperties {
  if (t === '1v1') return { background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' };
  return { background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)' };
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function rankEmoji(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 500, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = { name: '', type: '1v1' as '1v1' | 'group', max_participants: '', starts_at: '', ends_at: '' };

export default function AdminLeaguePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<League | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboardLeague, setLeaderboardLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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

  const toLocalInput = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (league: League) => {
    setEditTarget(league);
    setForm({
      name: league.name,
      type: league.type,
      max_participants: league.max_participants != null ? String(league.max_participants) : '',
      starts_at: toLocalInput(league.starts_at),
      ends_at: toLocalInput(league.ends_at),
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const body = {
      name: form.name,
      type: form.type,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    try {
      if (editTarget) {
        await api.put(`/admin/leagues/${editTarget.id}`, body);
      } else {
        await api.post('/admin/leagues', body);
      }
      closeForm();
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleStatus = async (id: number, status: 'active' | 'ended') => {
    try { await api.patch(`/admin/leagues/${id}/status`, { status }); await load(); } catch { /* ignore */ }
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
      await api.delete(`/admin/leagues/${pendingDelete.id}`);
      setPendingDelete(null);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setDeleteError(e.response?.data?.message || 'فشل الحذف');
    } finally {
      setDeleteBusy(false);
    }
  };

  const openLeaderboard = async (league: League) => {
    setLeaderboardLeague(league);
    setLoadingLeaderboard(true);
    try {
      const { data } = await api.get(`/admin/leagues/${league.id}/leaderboard`);
      setLeaderboard(data.leaderboard ?? []);
    } finally { setLoadingLeaderboard(false); }
  };

  const inputStyle = (field: string) => inp(focusedInput === field);

  // Stats
  const active = leagues.filter(l => l.status === 'active').length;
  const pending = leagues.filter(l => l.status === 'pending').length;
  const ended = leagues.filter(l => l.status === 'ended').length;
  const totalParticipants = leagues.reduce((s, l) => s + (l.participants_count ?? 0), 0);

  const statCards = [
    { label: 'دوري نشط', value: active, icon: '🏆', color: DK.green, bg: 'rgba(16,185,129,0.08)' },
    { label: 'قيد الانتظار', value: pending, icon: '⏳', color: DK.orange, bg: 'rgba(245,158,11,0.08)' },
    { label: 'منتهٍ', value: ended, icon: '🏁', color: DK.dim, bg: '#F5F5F5' },
    { label: 'إجمالي المشاركين', value: totalParticipants, icon: '👥', color: DK.blue, bg: 'rgba(59,130,246,0.08)' },
  ];

  return (
    <AdminLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
              <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>🏆 دوري الياقوت</h1>
            </div>
            <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>إدارة الدوريات التنافسية للطلاب</p>
          </div>
          <button onClick={openCreate}
            style={{ ...btn('gold'), display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 14, boxShadow: '0 4px 14px rgba(197,147,65,0.3)' }}>
            <span style={{ fontSize: 16 }}>+</span> إنشاء بطولة جديدة
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} style={card({ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 })}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: DK.sub, margin: '3px 0 0' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leagues Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : leagues.length === 0 ? (
          <div style={card({ padding: '60px 0', textAlign: 'center' })}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: DK.text, margin: '0 0 6px' }}>لا توجد دوريات بعد</p>
            <p style={{ color: DK.sub, fontSize: 13 }}>أضف أول بطولة للطلاب</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {leagues.map((league) => (
              <div key={league.id} style={card({ padding: 0, overflow: 'hidden' })}>
                {/* Card top accent */}
                <div style={{
                  height: 4,
                  background: league.status === 'active' ? 'linear-gradient(90deg,#10B981,#34D399)'
                    : league.status === 'pending' ? 'linear-gradient(90deg,#F59E0B,#FBBF24)'
                      : '#E5E7EB',
                }} />

                <div style={{ padding: 18 }}>
                  {/* Badges row */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, ...statusStyle(league.status) }}>
                      {STATUS_LABELS[league.status]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, ...typeStyle(league.type) }}>
                      {league.type === '1v1' ? '⚔️ فردي' : '👥 جماعي'}
                    </span>
                  </div>

                  {/* Name */}
                  <p style={{ fontSize: 16, fontWeight: 900, color: DK.text, margin: '0 0 8px', lineHeight: 1.3 }}>
                    {league.name}
                  </p>

                  {/* Info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: DK.sub }}>
                      👥 {league.participants_count ?? 0} مشارك
                      {league.max_participants ? ` / ${league.max_participants}` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: DK.dim, marginBottom: 16 }}>
                    📅 {formatDate(league.starts_at)} — {formatDate(league.ends_at)}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openEdit(league)}
                      title="تعديل"
                      style={{
                        padding: '8px 12px', borderRadius: 10, border: '1px solid #EDE3CE', cursor: 'pointer',
                        background: '#fff', color: DK.gold, fontSize: 12, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif",
                      }}>
                      ✏️
                    </button>
                    <button
                      onClick={() => openLeaderboard(league)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(197,147,65,0.1)', color: DK.gold, fontSize: 12, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif",
                      }}>
                      🏅 المتصدرون
                    </button>
                    {league.status === 'pending' && (
                      <button onClick={() => handleStatus(league.id, 'active')}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'rgba(16,185,129,0.1)', color: DK.green, fontSize: 12, fontWeight: 700,
                          fontFamily: "'Cairo',sans-serif",
                        }}>
                        تفعيل
                      </button>
                    )}
                    {league.status === 'active' && (
                      <button onClick={() => handleStatus(league.id, 'ended')}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 12, fontWeight: 700,
                          fontFamily: "'Cairo',sans-serif",
                        }}>
                        إنهاء
                      </button>
                    )}
                    {league.status === 'pending' && (
                      <button onClick={() => askDelete(league.id, league.name)}
                        style={{
                          padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.06)', color: DK.red, fontSize: 12, fontWeight: 700,
                          fontFamily: "'Cairo',sans-serif",
                        }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Modal */}
      {leaderboardLeague && (
        <Modal title={`🏅 متصدرو: ${leaderboardLeague.name}`} onClose={() => { setLeaderboardLeague(null); setLeaderboard([]); }}>
          {loadingLeaderboard ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: DK.sub }}>
              <p style={{ fontSize: 32 }}>🏆</p>
              <p style={{ fontSize: 14 }}>لا توجد نتائج بعد</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {leaderboard.map((entry) => (
                <div key={entry.student_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12,
                  background: entry.rank <= 3 ? 'rgba(197,147,65,0.06)' : '#F8F5EE',
                  border: entry.rank <= 3 ? '1px solid rgba(197,147,65,0.2)' : '1px solid #EDE3CE',
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: entry.rank <= 3 ? DK.goldGrad : '#F0EBE0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: entry.rank <= 3 ? 18 : 13, fontWeight: 800, color: entry.rank <= 3 ? '#fff' : DK.sub,
                  }}>
                    {rankEmoji(entry.rank)}
                  </div>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: 'rgba(197,147,65,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: DK.gold, flexShrink: 0,
                  }}>
                    {entry.student_name[0]}
                  </div>
                  {/* Name */}
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: DK.text }}>{entry.student_name}</span>
                  {/* Score */}
                  <span style={{
                    fontSize: 14, fontWeight: 900, color: DK.gold,
                    background: 'rgba(197,147,65,0.1)', padding: '4px 10px', borderRadius: 8,
                  }}>
                    {entry.score} نقطة
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Create / Edit League Modal */}
      {showForm && (
        <Modal title={editTarget ? `تعديل ${editTarget.name}` : 'إنشاء بطولة جديدة'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: DK.red, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>اسم البطولة</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="دوري رمضان 2026"
                onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                style={inputStyle('name')} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>نوع البطولة</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as '1v1' | 'group' })}
                onFocus={() => setFocusedInput('type')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('type'), cursor: 'pointer' }}>
                <option value="1v1">⚔️ منازلة فردية (1v1)</option>
                <option value="group">👥 دوري جماعي</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>
                أقصى عدد مشاركين <span style={{ fontWeight: 400, color: DK.dim }}>(اختياري)</span>
              </label>
              <input type="number" min="2" value={form.max_participants}
                onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                placeholder="بلا حد" dir="ltr"
                onFocus={() => setFocusedInput('max')} onBlur={() => setFocusedInput(null)}
                style={inputStyle('max')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>تاريخ البداية</label>
                <input type="datetime-local" value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  onFocus={() => setFocusedInput('start')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('start')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>تاريخ النهاية</label>
                <input type="datetime-local" value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  onFocus={() => setFocusedInput('end')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('end')} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={saving}
                style={{
                  ...btn('gold'), flex: 1, padding: '11px 0', borderRadius: 12, fontSize: 14,
                  boxShadow: '0 4px 14px rgba(197,147,65,0.25)', opacity: saving ? 0.6 : 1,
                }}>
                {saving ? 'جارٍ الحفظ...' : (editTarget ? 'حفظ التعديلات' : 'إنشاء البطولة')}
              </button>
              <button type="button" onClick={closeForm}
                style={{ ...btn('outline'), flex: 1, padding: '11px 0', borderRadius: 12, fontSize: 14 }}>
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
