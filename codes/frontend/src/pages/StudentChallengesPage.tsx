import { useCallback, useEffect, useMemo, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

type ChallengeType = 'individual' | 'family';
type ChallengeStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface Challenge {
  id: number;
  type: ChallengeType;
  title: string;
  description: string | null;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: ChallengeStatus;
  progress_pct: number;
  ends_at: string | null;
  parent: { id: number; name: string } | null;
  student: { id: number; name: string } | null;
}

const C = {
  card: '#FFFFFF', gold: '#C9952A', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', border: 'rgba(0,0,0,0.07)', shadow: '0 2px 14px rgba(0,0,0,0.07)',
  green: '#16A34A', amber: '#D97706', red: '#EF4444', purple: '#7C3AED',
};
const font = { fontFamily: "'Cairo', sans-serif" };

const CATEGORIES = [
  { id: 'reading', label: 'قراءة' },
  { id: 'homework', label: 'واجبات' },
  { id: 'study', label: 'دراسة' },
  { id: 'attendance', label: 'حضور' },
  { id: 'custom', label: 'مخصص' },
] as const;

const STATUS_LABEL: Record<ChallengeStatus, { label: string; color: string }> = {
  pending: { label: 'بانتظار ولي الأمر', color: C.amber },
  active: { label: 'نشط', color: C.green },
  completed: { label: 'مكتمل', color: C.gold },
  cancelled: { label: 'ملغى', color: C.red },
};

const emptyForm = {
  type: 'individual' as ChallengeType,
  title: '',
  description: '',
  category: 'custom',
  target_value: '5',
  unit: 'مرة',
  ends_at: '',
};

export default function StudentChallengesPage() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [tab, setTab] = useState<'all' | 'individual' | 'family'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/student/challenges');
      setItems(data.challenges ?? []);
    } catch {
      setError('تعذّر تحميل التحديات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (tab === 'all') return items;
    return items.filter((c) => c.type === tab);
  }, [items, tab]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.target_value) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/student/challenges', {
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        target_value: Number(form.target_value),
        unit: form.unit.trim() || 'مرة',
        ends_at: form.ends_at || null,
      });
      setModal(false);
      setForm(emptyForm);
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const firstErr = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0]?.[0]
        : null;
      setError(firstErr || e.response?.data?.message || 'تعذّر إنشاء التحدي');
    } finally {
      setSaving(false);
    }
  }

  async function addProgress(id: number) {
    setBusyId(id);
    try {
      const { data } = await api.post(`/student/challenges/${id}/progress`, { amount: 1 });
      setItems((prev) => prev.map((c) => (c.id === id ? data.challenge : c)));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'تعذّر تسجيل التقدم');
    } finally {
      setBusyId(null);
    }
  }

  async function cancelChallenge(id: number) {
    setBusyId(id);
    try {
      await api.post(`/student/challenges/${id}/cancel`);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('تعذّر إلغاء التحدي');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 70%)',
          padding: '28px 24px 32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>أهداف قابلة للتتبع</p>
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>نظام التحديات</h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '8px 0 0' }}>
                تحديات فردية لنفسك، وعائلية مشتركة مع ولي الأمر
              </p>
            </div>
            <button
              onClick={() => { setForm(emptyForm); setModal(true); }}
              style={{
                padding: '10px 18px', borderRadius: 12, border: 'none', background: C.goldGrad,
                color: '#1B2038', fontWeight: 800, fontSize: 13, cursor: 'pointer', ...font,
              }}
            >
              + تحدٍ جديد
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 20px 40px' }}>
          <div style={{
            display: 'flex', gap: 6, marginBottom: 16, background: C.card, padding: 5,
            borderRadius: 12, border: `1px solid ${C.border}`, width: 'fit-content', flexWrap: 'wrap',
          }}>
            {([
              { id: 'all' as const, label: 'الكل' },
              { id: 'individual' as const, label: 'فردي' },
              { id: 'family' as const, label: 'عائلي' },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, ...font,
                  background: tab === t.id ? C.goldGrad : 'transparent',
                  color: tab === t.id ? '#1B2038' : C.sub,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', color: C.red, fontSize: 13,
            }}>{error}</div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{
                width: 36, height: 36, margin: '0 auto', borderRadius: '50%',
                border: '3px solid rgba(201,149,42,0.2)', borderTopColor: C.gold,
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 48, background: C.card, borderRadius: 18,
              boxShadow: C.shadow, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚡</div>
              <p style={{ fontWeight: 800, fontSize: 15, color: C.text, margin: '0 0 6px' }}>لا توجد تحديات بعد</p>
              <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>أنشئ تحدياً فردياً أو ادعُ ولي أمرك لتحدٍ عائلي</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.map((c) => {
                const st = STATUS_LABEL[c.status];
                return (
                  <div key={c.id} style={{
                    background: C.card, borderRadius: 16, padding: 16, boxShadow: C.shadow,
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: c.type === 'family' ? 'rgba(124,58,237,0.1)' : 'rgba(201,149,42,0.1)',
                        color: c.type === 'family' ? C.purple : C.gold,
                      }}>
                        {c.type === 'family' ? 'عائلي' : 'فردي'}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: `${st.color}18`, color: st.color,
                      }}>{st.label}</span>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: C.text }}>{c.title}</h3>
                    {c.description && (
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: C.sub }}>{c.description}</p>
                    )}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: C.sub }}>
                          {c.current_value} / {c.target_value} {c.unit}
                        </span>
                        <span style={{ color: C.gold, fontWeight: 800 }}>{c.progress_pct}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.07)' }}>
                        <div style={{
                          width: `${c.progress_pct}%`, height: '100%', borderRadius: 4, background: C.goldGrad,
                        }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {c.status === 'active' && (
                        <button
                          disabled={busyId === c.id}
                          onClick={() => void addProgress(c.id)}
                          style={{
                            padding: '8px 14px', borderRadius: 10, border: 'none', background: C.goldGrad,
                            color: '#1B2038', fontWeight: 800, fontSize: 12, cursor: 'pointer', ...font,
                            opacity: busyId === c.id ? 0.7 : 1,
                          }}
                        >
                          + تقدّم (+1)
                        </button>
                      )}
                      {(c.status === 'active' || c.status === 'pending') && (
                        <button
                          disabled={busyId === c.id}
                          onClick={() => void cancelChallenge(c.id)}
                          style={{
                            padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
                            background: '#fff', color: C.red, fontWeight: 700, fontSize: 12,
                            cursor: 'pointer', ...font,
                          }}
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {modal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }}
            onClick={() => setModal(false)}
          >
            <form
              onSubmit={(e) => void handleCreate(e)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 440, background: '#fff', borderRadius: 18, padding: 20,
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900, color: C.text }}>تحدٍ جديد</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {(['individual', 'family'] as ChallengeType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    style={{
                      padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700,
                      fontSize: 13, ...font,
                      background: form.type === t ? C.goldGrad : '#F9FAFB',
                      color: form.type === t ? '#1B2038' : C.sub,
                    }}
                  >
                    {t === 'individual' ? 'فردي' : 'عائلي'}
                  </button>
                ))}
              </div>
              {form.type === 'family' && (
                <p style={{ fontSize: 12, color: C.amber, margin: '0 0 12px' }}>
                  سيُرسل لولي أمرك بانتظار الموافقة قبل البدء
                </p>
              )}
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان التحدي"
                style={inputStyle}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر (اختياري)"
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', marginTop: 8 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="الوحدة (كتاب، واجب…)"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.target_value}
                  onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                  placeholder="الهدف"
                  style={inputStyle}
                />
                <input
                  type="date"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: 12, borderRadius: 12, border: 'none', background: C.goldGrad,
                    color: '#1B2038', fontWeight: 800, cursor: 'pointer', ...font, opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'جاري...' : 'إنشاء'}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`,
                    background: '#F9FAFB', color: C.sub, fontWeight: 700, cursor: 'pointer', ...font,
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
  fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box',
};
