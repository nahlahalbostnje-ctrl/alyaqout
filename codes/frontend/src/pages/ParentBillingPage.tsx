import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';
import { C } from '../theme/palette';

/**
 * Subscription & Invoice management for parents.
 * No Payment Gateway / card checkout — admin settles invoices offline.
 */

interface Installment {
  id: number;
  child: string;
  package: string;
  installment_no: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
}

interface SubRow {
  id: number;
  student: { id: number; name: string };
  package: { id: number; name: string; price: string };
  status: string;
  payment_status: string;
  starts_at: string;
  ends_at: string;
}

const STATUS_UI: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'مدفوعة', color: C.green, bg: C.greenBg },
  pending: { label: 'مستحقة', color: C.amber, bg: C.amberBg },
  overdue: { label: 'متأخرة', color: C.red, bg: C.redBg },
  cancelled: { label: 'ملغاة', color: C.dim, bg: 'rgba(138,154,163,0.12)' },
  active: { label: 'نشط', color: C.green, bg: C.greenBg },
  expired: { label: 'منتهٍ', color: C.red, bg: C.redBg },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_UI[status] ?? STATUS_UI.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`,
    }}>{s.label}</span>
  );
}

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / 86400000);
}

export default function ParentBillingPage() {
  const { currency } = useCurrency();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/parent/billing/installments').then(({ data }) => setInstallments(data.data ?? [])).catch(() => setInstallments([])),
      api.get('/parent/subscriptions').then(({ data }) => setSubs(data.data ?? [])).catch(() => setSubs([])),
    ]).finally(() => setLoading(false));
  }, []);

  const totalPaid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = installments.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = installments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const hasDue = totalPending + totalOverdue > 0;
  const filtered = filter === 'all' ? installments : installments.filter(i => i.status === filter);
  const activeSubs = subs.filter(s => s.status === 'active');

  const printInvoice = (inst: Installment) => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>فاتورة ${inst.id}</title>
      <style>body{font-family:Cairo,Tahoma,sans-serif;padding:32px;color:#243746}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #E2EBF0;padding:10px;text-align:right}</style>
      </head><body>
      <h1>منصة الياقوت — فاتورة / قسط</h1>
      <p>رقم المرجع: INV-${inst.id}</p>
      <table>
        <tr><th>الابن</th><td>${inst.child}</td></tr>
        <tr><th>الباقة</th><td>${inst.package}</td></tr>
        <tr><th>رقم القسط</th><td>${inst.installment_no}</td></tr>
        <tr><th>المبلغ</th><td>${Number(inst.amount).toLocaleString('ar-SA')} ${currency || ''}</td></tr>
        <tr><th>تاريخ الاستحقاق</th><td>${inst.due_date}</td></tr>
        <tr><th>الحالة</th><td>${STATUS_UI[inst.status]?.label ?? inst.status}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#5A6B75">هذه فاتورة إدارية. التسوية تتم عبر إدارة المنصة (لا يوجد دفع إلكتروني حالياً).</p>
      <script>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
            <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>الاشتراك والفواتير</h1>
          </div>
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
            متابعة الاشتراكات والمستحقات — التسوية عبر الإدارة (بدون بوابة دفع إلكتروني حالياً).
          </p>
        </div>

        {/* Active subscriptions — real data only */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: '0 0 12px' }}>الاشتراك الحالي</h2>
          {loading ? (
            <p style={{ color: C.dim, fontSize: 13 }}>جارٍ التحميل...</p>
          ) : activeSubs.length === 0 ? (
            <div style={{
              background: C.card, borderRadius: 16, padding: 18, border: `1px dashed ${C.border}`,
              color: C.sub, fontSize: 13,
            }}>
              لا يوجد اشتراك نشط حالياً. يمكنك طلب باقة من صفحة الباقات، أو التواصل مع الإدارة.
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to="/parent/packages" style={linkBtn}>الباقات والاشتراك</Link>
                <Link to="/parent/communication" style={linkBtnGhost}>تواصل مع الإدارة</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
              {activeSubs.map(s => {
                const left = daysUntil(s.ends_at);
                const tone = left <= 0 ? C.red : left <= 5 ? C.amber : C.green;
                return (
                  <div key={s.id} style={{
                    background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`,
                    boxShadow: C.shadow,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 800, color: C.text }}>{s.package.name}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: C.sub }}>الابن: {s.student.name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: C.sub }}>
                      من {s.starts_at} إلى {s.ends_at}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: C.sub }}>
                      قيمة الاشتراك: {Number(s.package.price).toLocaleString('ar-SA')} {currency || ''}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: tone }}>
                      {left > 5 && `🟢 اشتراك نشط — متبقي ${left} يوماً`}
                      {left > 0 && left <= 5 && `🟡 ينتهي خلال ${left} ${left === 1 ? 'يوم' : 'أيام'}`}
                      {left <= 0 && '🔴 انتهى الاشتراك'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasDue && (
          <div style={{
            background: C.amberBg, border: `1px solid ${C.amber}40`, borderRadius: 16,
            padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: 14 }}>لديك مستحقات</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: C.sub }}>
                راجع الفواتير أدناه وتواصل مع الإدارة لتسوية المبالغ.
              </p>
            </div>
            <Link to="/parent/communication" style={{
              ...linkBtn, background: C.navy, color: '#fff',
            }}>تواصل مع الإدارة</Link>
          </div>
        )}

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'مدفوعة', value: totalPaid, color: C.green, bg: C.greenBg },
            { label: 'مستحقة', value: totalPending, color: C.amber, bg: C.amberBg },
            { label: 'متأخرة', value: totalOverdue, color: C.red, bg: C.redBg },
          ].map(x => (
            <div key={x.label} style={{
              background: C.card, borderRadius: 14, padding: 16, border: `1px solid ${C.border}`,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: C.sub }}>{x.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: x.color }}>
                {x.value.toLocaleString('ar-SA')}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: C.dim }}>{currency || '—'}</p>
            </div>
          ))}
        </div>

        {/* Invoices / installments */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>الفواتير</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'paid', 'pending', 'overdue'] as const).map(f => {
                const labels = { all: 'الكل', paid: 'مدفوعة', pending: 'مستحقة', overdue: 'متأخرة' };
                return (
                  <button key={f} type="button" onClick={() => setFilter(f)} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
                    background: filter === f ? C.goldGrad : C.goldBg,
                    color: filter === f ? '#fff' : C.primary,
                  }}>{labels[f]}</button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <p style={{ color: C.dim, fontSize: 13, textAlign: 'center', padding: 20 }}>جارٍ التحميل...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: C.dim, fontSize: 13, textAlign: 'center', padding: 24 }}>لا توجد فواتير في هذا التصنيف</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['رقم الفاتورة', 'الابن', 'الباقة', 'القيمة', 'التاريخ', 'الحالة', ''].map(h => (
                      <th key={h || 'a'} style={{
                        color: C.sub, fontSize: 11, fontWeight: 700, padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: C.navy }}>INV-{inv.id}</td>
                      <td style={{ padding: '12px', fontSize: 13 }}>{inv.child}</td>
                      <td style={{ padding: '12px', fontSize: 13 }}>{inv.package}</td>
                      <td style={{ padding: '12px', fontWeight: 800, fontSize: 14 }}>
                        {Number(inv.amount).toLocaleString('ar-SA')}
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, color: C.sub }}>{inv.due_date}</td>
                      <td style={{ padding: '12px' }}><StatusBadge status={inv.status} /></td>
                      <td style={{ padding: '12px' }}>
                        <button type="button" onClick={() => printInvoice(inv)} style={{
                          padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                          background: C.bg, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                          fontSize: 11, fontWeight: 700, color: C.primary,
                        }}>
                          عرض / طباعة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}

const linkBtn: CSSProperties = {
  display: 'inline-block', padding: '9px 14px', borderRadius: 10, textDecoration: 'none',
  background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 12.5,
};

const linkBtnGhost: CSSProperties = {
  display: 'inline-block', padding: '9px 14px', borderRadius: 10, textDecoration: 'none',
  background: C.bg, color: C.text, fontWeight: 700, fontSize: 12.5, border: `1px solid ${C.border}`,
};
