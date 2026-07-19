import { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppSelector } from '../app/hooks';
import api from '../services/axios';

interface Talent {
  id: number;
  display_name: string;
  talent_name: string;
  grade_label: string | null;
  age: number | null;
  goal: string | null;
  dream: string | null;
  bio: string | null;
}

const C = {
  card: '#FFFFFF', gold: '#C9952A', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', border: 'rgba(0,0,0,0.07)', shadow: '0 2px 14px rgba(0,0,0,0.07)',
  purple: '#7C3AED',
};
const font = { fontFamily: "'Cairo', sans-serif" };
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE3CE',
  fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box',
};

export default function StudentTalentsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    display_name: '',
    talent_name: '',
    grade_label: '',
    age: '',
    goal: '',
    dream: '',
    bio: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/student/talent');
      setTalent(data.talent ?? null);
      if (!data.talent) {
        setForm((f) => ({
          ...f,
          display_name: user?.name ?? '',
        }));
        setEditing(true);
      }
    } catch {
      setError('تعذّر تحميل ملف الموهبة');
    } finally {
      setLoading(false);
    }
  }, [user?.name]);

  useEffect(() => { void load(); }, [load]);

  function startEdit() {
    if (!talent) return;
    setForm({
      display_name: talent.display_name,
      talent_name: talent.talent_name,
      grade_label: talent.grade_label ?? '',
      age: talent.age != null ? String(talent.age) : '',
      goal: talent.goal ?? '',
      dream: talent.dream ?? '',
      bio: talent.bio ?? '',
    });
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.display_name.trim() || !form.talent_name.trim()) return;
    setSaving(true);
    setError(null);
    const payload = {
      display_name: form.display_name.trim(),
      talent_name: form.talent_name.trim(),
      grade_label: form.grade_label.trim() || null,
      age: form.age ? Number(form.age) : null,
      goal: form.goal.trim() || null,
      dream: form.dream.trim() || null,
      bio: form.bio.trim() || null,
    };
    try {
      const { data } = talent
        ? await api.put('/student/talent', payload)
        : await api.post('/student/talent', payload);
      setTalent(data.talent);
      setEditing(false);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 55%,#2a1a4a 100%)',
          padding: '28px 24px 32px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>اكتشف وطوّر</p>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>حاضنة المواهب</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '8px 0 0' }}>
            سجّل موهبتك وابنِ ملفّك الإبداعي
          </p>
        </div>

        <div style={{ padding: '20px 20px 40px', maxWidth: 640 }}>
          {error && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 13,
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
          ) : editing || !talent ? (
            <form
              onSubmit={(e) => void handleSave(e)}
              style={{
                background: C.card, borderRadius: 18, padding: 20, boxShadow: C.shadow,
                border: `1px solid ${C.border}`,
              }}
            >
              <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: C.text }}>
                {talent ? 'تعديل ملف الموهبة' : 'استبيان الانضمام'}
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: C.sub }}>
                {talent ? 'حدّث بياناتك متى شئت' : 'املأ البيانات مرة واحدة لبناء ملف موهبتك'}
              </p>

              <label style={labelS}>الاسم</label>
              <input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="اسمك كما يظهر في الملف" style={inp} />

              <label style={labelS}>الموهبة</label>
              <input required value={form.talent_name} onChange={(e) => setForm({ ...form, talent_name: e.target.value })}
                placeholder="مثال: رسم، برمجة، شعر، كرة قدم..." style={inp} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                <div>
                  <label style={{ ...labelS, marginTop: 0 }}>الصف</label>
                  <input value={form.grade_label} onChange={(e) => setForm({ ...form, grade_label: e.target.value })}
                    placeholder="مثال: العاشر" style={inp} />
                </div>
                <div>
                  <label style={{ ...labelS, marginTop: 0 }}>العمر</label>
                  <input type="number" min={5} max={25} value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="العمر" style={inp} />
                </div>
              </div>

              <label style={labelS}>الهدف من الموهبة</label>
              <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="ماذا تريد أن تحقق؟" rows={2} style={{ ...inp, resize: 'vertical' }} />

              <label style={labelS}>الحلم</label>
              <textarea value={form.dream} onChange={(e) => setForm({ ...form, dream: e.target.value })}
                placeholder="حلمك الكبير..." rows={2} style={{ ...inp, resize: 'vertical' }} />

              <label style={labelS}>نبذة مختصرة (اختياري)</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="عرّف بنفسك ومجال موهبتك" rows={2} style={{ ...inp, resize: 'vertical' }} />

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none', background: C.goldGrad,
                  color: '#1B2038', fontWeight: 800, cursor: 'pointer', ...font, opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'جاري...' : talent ? 'حفظ التعديلات' : 'إنشاء ملف الموهبة'}
                </button>
                {talent && (
                  <button type="button" onClick={() => setEditing(false)} style={{
                    flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`,
                    background: '#F9FAFB', color: C.sub, fontWeight: 700, cursor: 'pointer', ...font,
                  }}>
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div style={{
              background: C.card, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadow,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{
                background: 'linear-gradient(135deg,#1B2038,#2a1a4a)',
                padding: '28px 20px', textAlign: 'center',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                  background: C.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 900, color: '#1B2038',
                }}>
                  {talent.display_name.slice(0, 1)}
                </div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 900 }}>{talent.display_name}</h2>
                <p style={{
                  margin: '8px auto 0', display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(201,149,42,0.2)', color: '#F0D060', fontSize: 13, fontWeight: 700,
                }}>
                  ✨ {talent.talent_name}
                </p>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {talent.grade_label && (
                    <span style={chipS}>الصف: {talent.grade_label}</span>
                  )}
                  {talent.age != null && (
                    <span style={chipS}>العمر: {talent.age}</span>
                  )}
                </div>

                {talent.goal && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: C.gold }}>الهدف</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{talent.goal}</p>
                  </div>
                )}
                {talent.dream && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: C.purple }}>الحلم</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{talent.dream}</p>
                  </div>
                )}
                {talent.bio && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: C.sub }}>نبذة</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{talent.bio}</p>
                  </div>
                )}

                <button onClick={startEdit} style={{
                  width: '100%', marginTop: 8, padding: 12, borderRadius: 12, border: 'none',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, cursor: 'pointer', ...font,
                }}>
                  تعديل الملف
                </button>
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}

const labelS: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', margin: '12px 0 6px',
};
const chipS: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
  background: 'rgba(201,149,42,0.1)', color: '#C9952A',
};
