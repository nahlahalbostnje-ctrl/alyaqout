import { useState, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card,
  borderRadius: 16,
  padding: 16,
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
});

interface LoginAttempt {
  id: number;
  phone: string;
  ip_address: string | null;
  device_info: string | null;
  success: boolean;
  created_at: string;
  user?: { name: string; role: string } | null;
}

export default function SuperAdminSecurityPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get('/super-admin/security/login-attempts', {
        params: filter === 'all' ? undefined : { success: filter === 'success' ? 1 : 0 },
      })
      .then(({ data }) => {
        setAttempts(data.data?.data ?? data.data ?? []);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message ?? 'تعذّر جلب محاولات الدخول');
        setAttempts([]);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = attempts.filter(
    (a) =>
      !search ||
      a.phone.includes(search) ||
      (a.ip_address ?? '').includes(search) ||
      (a.user?.name ?? '').includes(search)
  );

  const total = attempts.length;
  const success = attempts.filter((a) => a.success).length;
  const failed = attempts.filter((a) => !a.success).length;
  const today = attempts.filter(
    (a) => new Date(a.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>مركز الأمان</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>مراقبة محاولات تسجيل الدخول والنشاط المشبوه</p>
        </div>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: C.red, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'إجمالي المحاولات', value: total, icon: '🔑', color: C.gold },
          { label: 'ناجحة', value: success, icon: '✅', color: C.green },
          { label: 'فاشلة', value: failed, icon: '❌', color: C.red },
          { label: 'اليوم', value: today, icon: '📅', color: C.blue },
        ].map((s) => (
          <div key={s.label} style={{ ...card(), display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: s.color, fontWeight: 900, fontSize: 22, lineHeight: 1, margin: 0 }}>{loading ? '—' : s.value}</p>
              <p style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...card(), marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { key: 'all', label: 'الكل' },
            { key: 'success', label: 'ناجحة' },
            { key: 'failed', label: 'فاشلة' },
          ] as const).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px',
                borderRadius: 9,
                border: `1px solid ${filter === f.key ? C.gold : C.border}`,
                background: filter === f.key ? C.goldBg : C.bg,
                color: filter === f.key ? C.gold : C.sub,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الهاتف أو IP أو الاسم..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: '8px 14px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            fontSize: 13,
            fontFamily: "'Cairo',sans-serif",
            outline: 'none',
            background: C.bg,
            color: C.text,
          }}
        />
      </div>

      <div style={card({ padding: 0, overflowX: 'auto' })}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 120px 1fr 140px 90px',
            minWidth: 760,
            padding: '11px 16px',
            background: C.goldBg,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {['الحالة', 'رقم الهاتف', 'IP', 'المستخدم', 'الجهاز', 'الوقت'].map((h) => (
            <span key={h} style={{ color: C.gold, fontSize: 11, fontWeight: 800 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>جارٍ التحميل...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>لا توجد محاولات حالياً.</p>
        ) : (
          filtered.map((attempt, idx) => (
            <div
              key={attempt.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 120px 1fr 140px 90px',
                minWidth: 760,
                padding: '12px 16px',
                borderBottom: idx < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 8,
                  background: attempt.success ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
                  color: attempt.success ? C.green : C.red,
                  fontSize: 11,
                  fontWeight: 700,
                  width: 'fit-content',
                }}
              >
                {attempt.success ? 'نجحت' : 'فشلت'}
              </span>
              <span style={{ color: C.text, fontSize: 13, fontWeight: 600, direction: 'ltr', display: 'block' }}>{attempt.phone}</span>
              <span style={{ color: C.sub, fontSize: 12, direction: 'ltr', display: 'block' }}>{attempt.ip_address ?? '—'}</span>
              <div>
                {attempt.user ? (
                  <span style={{ color: C.text, fontSize: 12 }}>
                    {attempt.user.name}{' '}
                    <span style={{ color: C.sub, fontSize: 11 }}>({attempt.user.role})</span>
                  </span>
                ) : (
                  <span style={{ color: C.red, fontSize: 12 }}>مجهول</span>
                )}
              </div>
              <span style={{ color: C.dim, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attempt.device_info ?? '—'}
              </span>
              <span style={{ color: C.dim, fontSize: 11 }}>
                {new Date(attempt.created_at).toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </SuperAdminShell>
  );
}
