import { useCallback, useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

interface Child {
  id: number;
  name: string;
}

interface Challenge {
  id: number;
  type: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  progress_pct: number;
  student: { id: number; name: string } | null;
  created_by: { id: number; name: string } | null;
}

const C = {
  gold: '#C9952A', goldL: '#DDAD50', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', border: '#EDE3CE', green: '#16A34A', amber: '#D97706', red: '#EF4444',
};
const font = { fontFamily: "'Cairo', sans-serif" };

const emptyForm = {
  student_id: '',
  title: '',
  description: '',
  category: 'custom',
  target_value: '5',
  unit: 'مرة',
  ends_at: '',
};

export default function ParentChallengesPage() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
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
      const [chRes, kidsRes] = await Promise.all([
        api.get('/parent/challenges'),
        api.get('/parent/children'),
      ]);
      setItems(chRes.data.challenges ?? []);
      const kids = kidsRes.data.data ?? kidsRes.data.children ?? [];
      setChildren(Array.isArray(kids) ? kids.map((k: Child) => ({ id: k.id, name: k.name })) : []);
    } catch {
      setError('تعذّر تحميل التحديات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id || !form.title.trim()) return;
    setSaving(true);
    try {
      await api.post('/parent/challenges', {
        student_id: Number(form.student_id),
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
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'تعذّر إنشاء التحدي');
    } finally {
      setSaving(false);
    }
  }

  async function accept(id: number) {
    setBusyId(id);
    try {
      const { data } = await api.post(`/parent/challenges/${id}/accept`);
      setItems((prev) => prev.map((c) => (c.id === id ? data.challenge : c)));
    } catch {
      setError('تعذّرت الموافقة');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    setBusyId(id);
    try {
      await api.post(`/parent/challenges/${id}/reject`);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('تعذّر الرفض');
    } finally {
      setBusyId(null);
    }
  }

  async function addProgress(id: number) {
    setBusyId(id);
    try {
      const { data } = await api.post(`/parent/challenges/${id}/progress`, { amount: 1 });
      setItems((prev) => prev.map((c) => (c.id === id ? data.challenge : c)));
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'تعذّر تسجيل التقدم');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ParentLayout>
      <div style={{ ...font, direction: 'rtl', padding: '8px 4px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>التحديات العائلية</h1>
            </div>
            <p style={{ margin: 0, color: C.sub, fontSize: 13 }}>
              وافق على اقتراحات أبنائك أو أنشئ تحدياً مشتركاً وتابعوا التقدم معاً
            </p>
          </div>
          <button
            onClick={() => {
              setForm({
                ...emptyForm,
                student_id: children[0] ? String(children[0].id) : '',
              });
              setModal(true);
            }}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', background: C.goldGrad,
              color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', ...font,
            }}
          >
            + تحدٍ لابنك
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: 12, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', color: C.red, fontSize: 13,
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 48, background: '#fff', borderRadius: 18,
            border: `1px solid ${C.border}`, boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: C.text, margin: '0 0 6px' }}>لا توجد تحديات عائلية</p>
            <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>أنشئ تحدياً لابنك أو انتظر اقتراحاً منه</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((c) => (
              <div key={c.id} style={{
                background: '#fff', borderRadius: 16, padding: 16,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(124,58,237,0.1)', color: '#7C3AED',
                  }}>{c.student?.name ?? 'طالب'}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: c.status === 'pending' ? 'rgba(217,119,6,0.12)' : c.status === 'completed' ? 'rgba(201,149,42,0.12)' : 'rgba(22,163,74,0.12)',
                    color: c.status === 'pending' ? C.amber : c.status === 'completed' ? C.gold : C.green,
                  }}>
                    {c.status === 'pending' ? 'بانتظار موافقتك' : c.status === 'completed' ? 'مكتمل' : 'نشط'}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: C.text }}>{c.title}</h3>
                {c.description && <p style={{ margin: '0 0 10px', fontSize: 12, color: C.sub }}>{c.description}</p>}
                {c.status !== 'pending' && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.sub }}>{c.current_value} / {c.target_value} {c.unit}</span>
                      <span style={{ color: C.gold, fontWeight: 800 }}>{c.progress_pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.07)' }}>
                      <div style={{ width: `${c.progress_pct}%`, height: '100%', borderRadius: 4, background: C.goldGrad }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {c.status === 'pending' && (
                    <>
                      <button
                        disabled={busyId === c.id}
                        onClick={() => void accept(c.id)}
                        style={{
                          padding: '8px 14px', borderRadius: 10, border: 'none', background: C.goldGrad,
                          color: '#1B2038', fontWeight: 800, fontSize: 12, cursor: 'pointer', ...font,
                        }}
                      >
                        موافقة
                      </button>
                      <button
                        disabled={busyId === c.id}
                        onClick={() => void reject(c.id)}
                        style={{
                          padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
                          background: '#fff', color: C.red, fontWeight: 700, fontSize: 12, cursor: 'pointer', ...font,
                        }}
                      >
                        رفض
                      </button>
                    </>
                  )}
                  {c.status === 'active' && (
                    <button
                      disabled={busyId === c.id}
                      onClick={() => void addProgress(c.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, border: 'none', background: C.goldGrad,
                        color: '#1B2038', fontWeight: 800, fontSize: 12, cursor: 'pointer', ...font,
                      }}
                    >
                      + تقدّم (+1)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900, color: C.text }}>تحدٍ عائلي جديد</h3>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">اختر الابن</option>
                {children.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان التحدي"
                style={{ ...inputStyle, marginTop: 8 }}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف (اختياري)"
                rows={2}
                style={{ ...inputStyle, marginTop: 8, resize: 'vertical' }}
              />
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
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="الوحدة"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  type="submit"
                  disabled={saving || children.length === 0}
                  style={{
                    flex: 1, padding: 12, borderRadius: 12, border: 'none', background: C.goldGrad,
                    color: '#1B2038', fontWeight: 800, cursor: 'pointer', ...font,
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
      </div>
    </ParentLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
  fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box',
};
