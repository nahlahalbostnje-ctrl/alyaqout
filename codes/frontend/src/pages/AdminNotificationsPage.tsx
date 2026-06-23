import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBroadcastHistory,
  sendBroadcast,
} from '../features/notifications/notificationsSlice';
import AdminLayout from '../components/AdminLayout';

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
const inp = (focused = false): React.CSSProperties => ({
  background: '#FFFFFF', border: `1.5px solid ${focused ? '#C59341' : '#EDE3CE'}`,
  color: '#1B2038', borderRadius: 12, padding: '10px 14px', fontSize: 13,
  width: '100%', outline: 'none', fontFamily: "'Cairo',sans-serif",
});

const TARGET_TYPES = [
  { value: 'all', label: 'الجميع (طلاب + معلمون + أولياء)' },
  { value: 'role', label: 'دور محدد' },
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'الطلاب' },
  { value: 'teacher', label: 'المعلمون' },
  { value: 'parent', label: 'أولياء الأمور' },
];

function TargetBadge({ type, value }: { type: string; value: string | null }) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    all: { label: 'الجميع', style: { background: 'rgba(197,147,65,0.1)', color: '#C59341' } },
    role: { label: value ?? '-', style: { background: 'rgba(59,130,246,0.1)', color: '#3B82F6' } },
    grade: { label: value ?? '-', style: { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' } },
  };
  const meta = map[type] ?? { label: type, style: { background: '#F9FAFB', color: DK.sub } };
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700, ...meta.style }}>
      {meta.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminNotificationsPage() {
  const dispatch = useAppDispatch();
  const { broadcasts, broadcastMeta, broadcastSending } = useAppSelector((s) => s.notifications);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [targetValue, setTargetValue] = useState('');
  const [sent, setSent] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchBroadcastHistory()); }, [dispatch]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await dispatch(sendBroadcast({
      title: title.trim(),
      body: body.trim(),
      target_type: targetType,
      target_value: targetType !== 'all' ? targetValue || null : null,
    }));
    setTitle(''); setBody(''); setTargetType('all'); setTargetValue('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <AdminLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>مركز الإشعارات</h1>
          </div>
          <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>إرسال إشعارات جماعية فورية للمستخدمين</p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* LEFT — Send Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={card({ padding: 0, overflow: 'hidden' })}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE3CE', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: DK.goldGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  🔔
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: 0 }}>إرسال إشعار جديد</p>
                  <p style={{ fontSize: 12, color: DK.sub, margin: '2px 0 0' }}>يصل فوراً لجميع المستهدفين</p>
                </div>
              </div>

              <form onSubmit={handleSend} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Success banner */}
                {sent && (
                  <div style={{
                    padding: '10px 16px', borderRadius: 12,
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <span style={{ fontSize: 13, color: DK.green, fontWeight: 700 }}>تم إرسال الإشعار بنجاح!</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>
                    عنوان الإشعار <span style={{ color: DK.red }}>*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: إعلان هام لجميع الطلاب"
                    maxLength={200} required
                    onFocus={() => setFocusedInput('title')}
                    onBlur={() => setFocusedInput(null)}
                    style={inp(focusedInput === 'title')}
                  />
                </div>

                {/* Body */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>
                    نص الرسالة <span style={{ color: DK.red }}>*</span>
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="اكتب نص الإشعار هنا..."
                    maxLength={2000} rows={4} required
                    onFocus={() => setFocusedInput('body')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ ...inp(focusedInput === 'body'), resize: 'none' }}
                  />
                  <p style={{ fontSize: 11, color: DK.dim, marginTop: 4, textAlign: 'left' }}>{body.length}/2000</p>
                </div>

                {/* Target type */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 8 }}>المستهدفون</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {TARGET_TYPES.map((t) => {
                      const active = targetType === t.value;
                      return (
                        <button key={t.value} type="button"
                          onClick={() => { setTargetType(t.value); setTargetValue(''); }}
                          style={{
                            flex: 1, padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
                            background: active ? 'rgba(197,147,65,0.08)' : '#F8F5EE',
                            border: active ? `1.5px solid ${DK.gold}` : '1.5px solid #EDE3CE',
                            color: active ? DK.gold : DK.sub, transition: 'all 0.15s',
                          }}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role picker (conditional) */}
                {targetType === 'role' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 8 }}>الدور المستهدف</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {ROLE_OPTIONS.map((r) => {
                        const active = targetValue === r.value;
                        return (
                          <button key={r.value} type="button" onClick={() => setTargetValue(r.value)}
                            style={{
                              flex: 1, padding: '9px 8px', borderRadius: 12, cursor: 'pointer',
                              fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
                              background: active ? 'rgba(59,130,246,0.08)' : '#F8F5EE',
                              border: active ? `1.5px solid ${DK.blue}` : '1.5px solid #EDE3CE',
                              color: active ? DK.blue : DK.sub, transition: 'all 0.15s',
                            }}>
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={broadcastSending || !title.trim() || !body.trim()}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: DK.goldGrad, color: '#fff', fontSize: 14, fontWeight: 800,
                    fontFamily: "'Cairo',sans-serif", boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
                    opacity: (broadcastSending || !title.trim() || !body.trim()) ? 0.6 : 1,
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {broadcastSending ? (
                    <>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 16 }}>📤</span>
                      إرسال الإشعار
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Broadcast History */}
          <div style={{ width: 340, flexShrink: 0 }}>
            <div style={card({ padding: 0, overflow: 'hidden' })}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE3CE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: 0 }}>سجل الإشعارات</p>
                  <p style={{ fontSize: 12, color: DK.sub, margin: '2px 0 0' }}>{broadcastMeta.total} إشعار مرسل</p>
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: 'rgba(197,147,65,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  📋
                </div>
              </div>

              <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                {broadcasts.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔕</div>
                    <p style={{ color: DK.sub, fontSize: 13, textAlign: 'center' }}>لا توجد إشعارات مرسلة بعد</p>
                  </div>
                ) : (
                  broadcasts.map((b) => (
                    <div key={b.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F3EDE0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: DK.text, lineHeight: 1.4 }}>{b.title}</span>
                        <TargetBadge type={b.target_type} value={b.target_value} />
                      </div>
                      <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 8px', lineHeight: 1.5 }}
                        className="line-clamp-2">
                        {b.body}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: DK.dim }}>{formatDate(b.sent_at)}</span>
                        {b.sent_by && (
                          <span style={{ fontSize: 11, color: DK.dim }}>· {b.sent_by.name}</span>
                        )}
                        <span style={{ fontSize: 11, color: DK.green, fontWeight: 700 }}>
                          👥 {b.recipients_count} مستلم
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
