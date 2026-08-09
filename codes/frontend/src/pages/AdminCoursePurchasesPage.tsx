import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', text: '#1B2038', sub: '#6B7280', border: '#EDE3CE',
  green: '#10B981', red: '#EF4444', orange: '#F59E0B',
};

type Purchase = {
  id: number;
  status: string;
  amount: string | number;
  notes: string | null;
  student: { id: number; name: string; phone: string | null } | null;
  course: { id: number; title: string; price: string | number } | null;
  requester: { id: number; name: string; role: string } | null;
  created_at: string | null;
};

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminCoursePurchasesPage() {
  const { formatMoney } = useCurrency();
  const [rows, setRows] = useState<Purchase[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const load = async (status: Filter = filter) => {
    setLoading(true);
    try {
      const params = status === 'all' ? {} : { status };
      const { data } = await api.get('/admin/course-purchases', { params });
      setRows(data.data ?? []);
    } catch {
      setMsg('تعذّر تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(filter); }, [filter]);

  const act = async (id: number, action: 'approve' | 'reject') => {
    setBusyId(id);
    setMsg('');
    try {
      const { data } = await api.patch(`/admin/course-purchases/${id}/${action}`);
      setMsg(data.message ?? 'تم');
      await load(filter);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMsg(err.response?.data?.message ?? 'فشلت العملية');
    } finally {
      setBusyId(null);
    }
  };

  const statusLabel = (s: string) => {
    if (s === 'pending') return { l: 'معلّق', c: DK.orange };
    if (s === 'approved') return { l: 'معتمد', c: DK.green };
    return { l: 'مرفوض', c: DK.red };
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>
        <h1 style={{ margin: '0 0 6px', color: DK.text, fontSize: 22, fontWeight: 900 }}>طلبات شراء المساقات</h1>
        <p style={{ margin: '0 0 18px', color: DK.sub, fontSize: 13 }}>تفعيل يدوي بعد الدفع — بدون بوابة إلكترونية.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {([
            ['pending', 'معلّق'],
            ['approved', 'معتمد'],
            ['rejected', 'مرفوض'],
            ['all', 'الكل'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              style={{
                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${filter === k ? DK.gold : DK.border}`,
                background: filter === k ? DK.gold : '#fff',
                color: filter === k ? '#fff' : DK.text, fontWeight: 700, fontSize: 12,
                fontFamily: "'Cairo',sans-serif",
              }}
            >{label}</button>
          ))}
        </div>

        {msg && <p style={{ color: DK.sub, fontSize: 13, marginBottom: 12 }}>{msg}</p>}

        <div style={{
          background: '#fff', borderRadius: 16, border: `1px solid ${DK.border}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: DK.sub, padding: 40 }}>جاري التحميل...</p>
          ) : rows.length === 0 ? (
            <p style={{ textAlign: 'center', color: DK.sub, padding: 40 }}>لا طلبات في هذا التصفية.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr>
                    {['الطالب', 'المساق', 'المبلغ', 'مقدّم الطلب', 'الحالة', ''].map((h) => (
                      <th key={h || 'a'} style={{
                        textAlign: 'right', padding: '10px 14px', fontSize: 12, color: DK.sub,
                        borderBottom: `1px solid ${DK.border}`, background: '#F8F5EE',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const st = statusLabel(r.status);
                    return (
                      <tr key={r.id}>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0' }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{r.student?.name ?? '—'}</p>
                          <p style={{ margin: 0, fontSize: 11, color: DK.sub }}>{r.student?.phone ?? ''} · #{r.student?.id}</p>
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0', fontSize: 13 }}>
                          {r.course?.title ?? '—'}
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0', fontWeight: 800, fontSize: 13 }}>
                          {formatMoney(Number(r.amount))}
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0', fontSize: 12, color: DK.sub }}>
                          {r.requester?.name ?? '—'}
                          {r.requester?.role ? ` (${r.requester.role === 'parent' ? 'ولي أمر' : 'طالب'})` : ''}
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: `${st.c}18`, color: st.c,
                          }}>{st.l}</span>
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid #F3EDE0' }}>
                          {r.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => act(r.id, 'approve')}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                  background: 'rgba(16,185,129,0.12)', color: DK.green, fontWeight: 800, fontSize: 12,
                                  fontFamily: "'Cairo',sans-serif", opacity: busyId === r.id ? 0.5 : 1,
                                }}
                              >قبول</button>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => act(r.id, 'reject')}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                  background: 'rgba(239,68,68,0.1)', color: DK.red, fontWeight: 800, fontSize: 12,
                                  fontFamily: "'Cairo',sans-serif", opacity: busyId === r.id ? 0.5 : 1,
                                }}
                              >رفض</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
