import { useCallback, useEffect, useMemo, useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import { getApiError } from '../utils/apiError';

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card,
  borderRadius: 18,
  padding: 16,
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
});

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'refunded';
type StatusFilter = 'الكل' | 'مدفوعة' | 'معلقة' | 'متأخرة';

interface CountryOpt {
  id: number;
  name: string;
  code: string;
  currency: string;
}

interface InvoiceRow {
  id: number;
  invoice_no: string;
  student: string | null;
  student_phone: string | null;
  package: string | null;
  country_id: number;
  country: string | null;
  currency: string;
  payment_method: string;
  invoice_status: InvoiceStatus;
  amount: number;
  created_at: string | null;
}

interface Summary {
  currency: string | null;
  paid_total: number;
  month_paid_total: number;
  pending_total: number;
  overdue_total: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  mixed_currencies: boolean;
  by_currency: Array<{
    currency: string;
    paid_total: number;
    pending_total: number;
    overdue_total: number;
    month_total: number;
  }>;
}

const STATUS_UI: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
  paid: { label: 'مدفوعة', bg: 'rgba(22,163,74,0.12)', color: C.green },
  pending: { label: 'معلقة', bg: 'rgba(217,119,6,0.12)', color: C.orange },
  overdue: { label: 'متأخرة', bg: 'rgba(239,68,68,0.12)', color: C.red },
  refunded: { label: 'مسترجعة', bg: 'rgba(107,114,128,0.12)', color: C.sub },
};

const METHOD_LABEL: Record<string, string> = {
  manual: 'يدوي',
  online: 'إلكتروني',
};

function statusToApi(f: StatusFilter): string | undefined {
  if (f === 'مدفوعة') return 'paid';
  if (f === 'معلقة') return 'pending';
  if (f === 'متأخرة') return 'overdue';
  return undefined;
}

function fmtAmount(n: number, currency: string | null | undefined): string {
  const amount = (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const cur = currency && currency !== '—' ? currency : '';
  return cur ? `${amount} ${cur}` : amount;
}

export default function SABillingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('الكل');
  const [countryId, setCountryId] = useState('');
  const [currency, setCurrency] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencyOptions = useMemo(() => {
    if (countryId) {
      const c = countries.find((x) => String(x.id) === countryId);
      return c?.currency ? [c.currency.toUpperCase()] : [];
    }
    return currencies;
  }, [countryId, countries, currencies]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/billing', {
        params: {
          country_id: countryId || undefined,
          currency: currency || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          payment_status: statusToApi(statusFilter),
          q: search.trim() || undefined,
        },
      });
      const payload = data.data ?? {};
      setInvoices(payload.invoices ?? []);
      setCountries(payload.countries ?? []);
      setCurrencies((payload.currencies ?? []).map((c: string) => String(c).toUpperCase()));
      setSummary(payload.summary ?? null);
      setTotal(payload.total ?? 0);
    } catch (e: unknown) {
      setError(getApiError(e, 'تعذّر جلب البيانات المالية'));
      setInvoices([]);
      setSummary(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [countryId, currency, dateFrom, dateTo, statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    // عند اختيار دولة: ثبّت عملتها تلقائياً وامسح عملة أخرى غير مطابقة
    if (countryId) {
      const c = countries.find((x) => String(x.id) === countryId);
      const cur = c?.currency ? c.currency.toUpperCase() : '';
      if (cur && currency !== cur) setCurrency(cur);
    }
  }, [countryId, countries]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayCurrency = summary?.currency
    ?? (currency || (countryId ? countries.find((c) => String(c.id) === countryId)?.currency?.toUpperCase() : null));

  const cards = [
    {
      label: 'إجمالي الإيرادات (المدفوعة)',
      value: summary ? fmtAmount(summary.paid_total, displayCurrency) : '—',
      sub: summary ? `${summary.paid_count} فاتورة مدفوعة` : 'لا توجد بيانات',
      icon: '💰',
      color: C.green,
    },
    {
      label: 'الإيرادات هذا الشهر',
      value: summary ? fmtAmount(summary.month_paid_total, displayCurrency) : '—',
      sub: summary?.mixed_currencies && !displayCurrency ? 'فلتر حسب دولة/عملة لعرض أدق' : 'ضمن الفلاتر الحالية',
      icon: '📅',
      color: C.blue,
    },
    {
      label: 'مبالغ معلقة',
      value: summary ? fmtAmount(summary.pending_total, displayCurrency) : '—',
      sub: summary ? `${summary.pending_count} فاتورة` : 'لا توجد بيانات',
      icon: '⏳',
      color: C.orange,
    },
    {
      label: 'مبالغ متأخرة',
      value: summary ? fmtAmount(summary.overdue_total, displayCurrency) : '—',
      sub: summary ? `${summary.overdue_count} فاتورة` : 'لا توجد بيانات',
      icon: '⚠️',
      color: C.red,
    },
  ];

  const exportCsv = () => {
    if (invoices.length === 0) return;
    const header = ['invoice_no', 'student', 'country', 'currency', 'payment_method', 'date', 'amount', 'status'];
    const lines = [
      header.join(','),
      ...invoices.map((r) => [
        r.invoice_no,
        `"${(r.student || '').replace(/"/g, '""')}"`,
        `"${(r.country || '').replace(/"/g, '""')}"`,
        r.currency,
        r.payment_method,
        r.created_at ?? '',
        r.amount,
        STATUS_UI[r.invoice_status]?.label ?? r.invoice_status,
      ].join(',')),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>المالية والفواتير</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>إدارة الإيرادات حسب الدولة والعملة والتاريخ</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={invoices.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 12,
            background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 12, border: 'none',
            cursor: invoices.length === 0 ? 'not-allowed' : 'pointer', opacity: invoices.length === 0 ? 0.55 : 1,
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          📊 تصدير CSV
        </button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: C.red, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 14 }}>
        {cards.map((s, i) => (
          <div key={i} style={card({ padding: '18px' })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            </div>
            <p style={{ color: C.text, fontWeight: 900, fontSize: 20, lineHeight: 1.2 }}>{loading ? '…' : s.value}</p>
            {displayCurrency && !summary?.mixed_currencies && (
              <p style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>{displayCurrency}</p>
            )}
            {summary?.mixed_currencies && !displayCurrency && (
              <p style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>عملات متعددة</p>
            )}
            <p style={{ color: s.color, fontSize: 11, fontWeight: 600, marginTop: 6 }}>{s.sub}</p>
            <p style={{ color: C.sub, fontSize: 10.5, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {summary?.mixed_currencies && !countryId && !currency && summary.by_currency?.length > 0 && (
        <div style={card({ marginBottom: 14, padding: '12px 16px' })}>
          <p style={{ color: C.sub, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>تفصيل حسب العملة</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {summary.by_currency.map((row) => (
              <div key={row.currency} style={{ background: C.bg, borderRadius: 10, padding: '8px 12px', border: `1px solid ${C.border}`, minWidth: 120 }}>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 13 }}>{row.currency}</p>
                <p style={{ color: C.green, fontSize: 11, marginTop: 2 }}>مدفوع: {fmtAmount(row.paid_total, row.currency)}</p>
                <p style={{ color: C.orange, fontSize: 11 }}>معلق: {fmtAmount(row.pending_total, row.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={card({ marginBottom: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' })}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالطالب أو رقم الفاتورة..."
            style={{
              width: '100%', padding: '8px 38px 8px 12px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.bg, color: C.text,
              fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: "'Cairo',sans-serif",
            }}
          />
        </div>

        <select
          value={countryId}
          onChange={(e) => {
            setCountryId(e.target.value);
            if (!e.target.value) setCurrency('');
          }}
          style={{
            padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          <option value="">كل الدول</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.currency})</option>
          ))}
        </select>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          <option value="">كل العملات</option>
          {currencyOptions.map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          {(['الكل', 'مدفوعة', 'معلقة', 'متأخرة'] as const).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 12, fontWeight: 700 }}>
          من
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 12, outline: 'none',
              fontFamily: "'Cairo',sans-serif",
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 12, fontWeight: 700 }}>
          إلى
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 12, outline: 'none',
              fontFamily: "'Cairo',sans-serif",
            }}
          />
        </label>

        {(countryId || currency || dateFrom || dateTo || statusFilter !== 'الكل' || search) && (
          <button
            type="button"
            onClick={() => {
              setCountryId('');
              setCurrency('');
              setDateFrom('');
              setDateTo('');
              setStatusFilter('الكل');
              setSearch('');
            }}
            style={{
              padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.card, color: C.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            مسح الفلاتر
          </button>
        )}

        <p style={{ color: C.sub, fontSize: 12, margin: 0, flexShrink: 0 }}>
          {loading ? '...' : `${total.toLocaleString('en-US')} فاتورة`}
        </p>
      </div>

      <div style={card({ padding: 0, overflowX: 'auto' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
              {['رقم الفاتورة', 'الطالب', 'الدولة', 'العملة', 'طريقة الدفع', 'التاريخ', 'المبلغ', 'الحالة'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'right', color: C.sub, fontSize: 11, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><p style={{ textAlign: 'center', color: '#6B7280', padding: 40 }}>جارٍ التحميل...</p></td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={8}><p style={{ textAlign: 'center', color: '#6B7280', padding: 40 }}>لا توجد بيانات حالياً.</p></td></tr>
            ) : invoices.map((row) => {
              const st = STATUS_UI[row.invoice_status] ?? STATUS_UI.pending;
              return (
                <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 14px', color: C.text, fontWeight: 700, fontSize: 12, direction: 'ltr', textAlign: 'right' }}>{row.invoice_no}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0 }}>{row.student || '—'}</p>
                    {row.package && <p style={{ color: C.dim, fontSize: 11, margin: '2px 0 0' }}>{row.package}</p>}
                  </td>
                  <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12 }}>{row.country || '—'}</td>
                  <td style={{ padding: '12px 14px', color: C.text, fontSize: 12, fontWeight: 700 }}>{row.currency || '—'}</td>
                  <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12 }}>{METHOD_LABEL[row.payment_method] ?? row.payment_method}</td>
                  <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12, whiteSpace: 'nowrap' }}>{row.created_at || '—'}</td>
                  <td style={{ padding: '12px 14px', color: C.text, fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>
                    {fmtAmount(row.amount, row.currency)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
