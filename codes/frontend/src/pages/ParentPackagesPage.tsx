import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';

const C = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', text: '#1B2038', sub: '#6B7280',
  border: '#EDE3CE', green: '#10B981', orange: '#D97706', red: '#EF4444',
};

type Child = { id: number; name: string };
type Pkg = {
  id: number; name: string; description: string | null;
  price: string; duration_days: number;
  subjects: { id: number; name: string }[];
  courses: { id: number; title: string }[];
};
type SubRow = {
  id: number;
  student: { id: number; name: string };
  package: { id: number; name: string; price: string };
  status: string;
  payment_status: string;
  starts_at: string;
  ends_at: string;
};

export default function ParentPackagesPage() {
  const { formatMoney } = useCurrency();
  const [children, setChildren] = useState<Child[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [studentId, setStudentId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ch, pk, su] = await Promise.all([
        api.get('/parent/children'),
        api.get('/parent/packages'),
        api.get('/parent/subscriptions'),
      ]);
      const kids = (ch.data.data ?? ch.data.children ?? []) as Child[];
      setChildren(kids.map((c: Child) => ({ id: c.id, name: c.name })));
      setPackages(pk.data.data ?? []);
      setSubs(su.data.data ?? []);
      if (kids.length && !studentId) setStudentId(String(kids[0].id));
    } catch {
      setErr('تعذّر تحميل الباقات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const requestSub = async () => {
    if (!studentId || !packageId) return;
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const { data } = await api.post('/parent/subscriptions/request', {
        student_id: Number(studentId),
        package_id: Number(packageId),
      });
      setMsg(data.message ?? 'تم إرسال الطلب');
      setPackageId('');
      await load();
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { message?: string } } };
      setErr(errObj.response?.data?.message ?? 'تعذّر إرسال الطلب');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = (s: string) => {
    if (s === 'active') return { t: 'نشط', c: C.green };
    if (s === 'pending') return { t: 'بانتظار التفعيل', c: C.orange };
    if (s === 'cancelled') return { t: 'ملغى', c: C.red };
    return { t: s, c: C.sub };
  };

  return (
    <ParentLayout>
      <div style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: C.text }}>الباقات والاشتراك</h1>
        <p style={{ margin: '0 0 20px', color: C.sub, fontSize: 13 }}>
          اختر باقة لابنك — بعد موافقة أدمن البلد يفتح المحتوى (دورات، واجبات، امتحانات، حصص)
        </p>

        {loading ? (
          <p style={{ color: C.sub }}>جارٍ التحميل...</p>
        ) : (
          <>
            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: C.text }}>طلب اشتراك جديد</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>الابن</label>
                  <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: "'Cairo',sans-serif" }}>
                    {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>الباقة</label>
                  <select value={packageId} onChange={(e) => setPackageId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: "'Cairo',sans-serif" }}>
                    <option value="">اختر باقة</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.price)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={() => void requestSub()} disabled={busy || !studentId || !packageId}
                style={{
                  padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13,
                  fontFamily: "'Cairo',sans-serif", opacity: busy || !packageId ? 0.6 : 1,
                }}>
                {busy ? 'جارٍ الإرسال...' : 'إرسال طلب الاشتراك'}
              </button>
              {msg && <p style={{ color: C.green, fontWeight: 700, fontSize: 13, marginTop: 12 }}>{msg}</p>}
              {err && <p style={{ color: C.red, fontWeight: 700, fontSize: 13, marginTop: 12 }}>{err}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 24 }}>
              {packages.map((p) => (
                <div key={p.id} style={{ background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}` }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 16, color: C.text }}>{p.name}</p>
                  <p style={{ margin: '8px 0', fontWeight: 800, color: C.gold, fontSize: 18 }}>{formatMoney(p.price)}</p>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: C.sub }}>{p.duration_days} يوم</p>
                  {p.description && <p style={{ margin: '0 0 8px', fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{p.description}</p>}
                  <p style={{ margin: 0, fontSize: 11, color: C.sub }}>
                    مواد: {p.subjects.length || 0} · دورات: {p.courses.length || 0}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: C.text }}>اشتراكات أبنائي</h2>
              {subs.length === 0 ? (
                <p style={{ color: C.sub, fontSize: 13 }}>لا توجد طلبات أو اشتراكات بعد.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subs.map((s) => {
                    const st = statusLabel(s.status);
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 14px', background: '#F8F5EE', borderRadius: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: C.text }}>{s.package.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.sub }}>{s.student.name} · {s.starts_at} → {s.ends_at}</p>
                        </div>
                        <span style={{ alignSelf: 'center', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: st.c, background: `${st.c}18` }}>
                          {st.t}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ParentLayout>
  );
}
