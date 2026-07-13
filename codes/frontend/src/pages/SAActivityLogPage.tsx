import { useCallback, useEffect, useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card,
  borderRadius: 18,
  padding: 16,
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
});

type ActionFilter = 'الكل' | 'إضافة' | 'تعديل' | 'حذف' | 'تسجيل دخول' | 'تصدير' | 'اعتماد' | 'رفض';

interface LogRow {
  id: number;
  action: string;
  target_type: string | null;
  target_label: string | null;
  ip_address: string | null;
  created_at: string;
  admin?: { id: number; name: string; role: string } | null;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'سوبر أدمن',
  admin: 'أدمن',
  teacher: 'معلم',
  supervisor: 'مشرف',
  student: 'طالب',
  parent: 'ولي أمر',
};

const ACTION_LABEL: Record<string, string> = {
  create_user: 'إنشاء مستخدم',
  delete_user: 'حذف مستخدم',
  toggle_user: 'تغيير حالة مستخدم',
  create_country: 'إضافة دولة',
  update_country: 'تعديل دولة',
  delete_country: 'حذف دولة',
  toggle_country: 'تغيير حالة دولة',
  create_branch: 'إضافة فرع',
  update_branch: 'تعديل فرع',
  delete_branch: 'حذف فرع',
  impersonate: 'دخول كمستخدم',
  approve_exam: 'اعتماد امتحان',
  reject_exam: 'رفض امتحان',
  approve_homework: 'اعتماد واجب',
  reject_homework: 'رفض واجب',
  approve: 'موافقة',
  reject: 'رفض',
  update_city: 'تعديل مدينة',
  delete_city: 'حذف مدينة',
};

const ACTION_COLOR: Record<string, { bg: string; color: string }> = {
  create: { bg: 'rgba(22,163,74,0.1)', color: C.green },
  add: { bg: 'rgba(22,163,74,0.1)', color: C.green },
  update: { bg: 'rgba(37,99,235,0.1)', color: C.blue },
  toggle: { bg: 'rgba(37,99,235,0.1)', color: C.blue },
  delete: { bg: 'rgba(239,68,68,0.1)', color: C.red },
  destroy: { bg: 'rgba(239,68,68,0.1)', color: C.red },
  approve: { bg: 'rgba(22,163,74,0.1)', color: C.green },
  reject: { bg: 'rgba(239,68,68,0.1)', color: C.red },
  impersonate: { bg: 'rgba(124,58,237,0.1)', color: C.purple },
  login: { bg: 'rgba(217,119,6,0.1)', color: C.orange },
};

function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

function actionStyle(action: string): { bg: string; color: string } {
  const key = Object.keys(ACTION_COLOR).find((k) => action.includes(k));
  return key ? ACTION_COLOR[key] : { bg: C.goldBg, color: C.gold };
}

function screenLabel(targetType: string | null): string {
  if (!targetType) return '—';
  const map: Record<string, string> = {
    User: 'المستخدمون',
    Country: 'الدول',
    Branch: 'الأفرع',
    Exam: 'الامتحانات',
    Homework: 'الواجبات',
    City: 'المدن',
  };
  return map[targetType] ?? targetType;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SAActivityLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('الكل');
  const [date, setDate] = useState('');
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/activity-log', {
        params: {
          page,
          per_page: 50,
          q: search.trim() || undefined,
          action: actionFilter === 'الكل' ? undefined : actionFilter,
          date: date || undefined,
        },
      });
      const paginated = data.data;
      setLogs(paginated?.data ?? []);
      setTotal(paginated?.total ?? 0);
      setLastPage(paginated?.last_page ?? 1);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'تعذّر جلب سجل العمليات');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, date]);

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => { setPage(1); }, [search, actionFilter, date]);

  const exportCsv = () => {
    if (logs.length === 0) return;
    const header = ['#', 'المستخدم', 'الدور', 'العملية', 'الشاشة', 'التفاصيل', 'IP', 'التاريخ'];
    const rows = logs.map((l, i) => [
      String((page - 1) * 50 + i + 1),
      l.admin?.name ?? '—',
      ROLE_LABEL[l.admin?.role ?? ''] ?? (l.admin?.role ?? '—'),
      actionLabel(l.action),
      screenLabel(l.target_type),
      l.target_label ?? '—',
      l.ip_address ?? '—',
      fmtDate(l.created_at),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>سجل العمليات</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>تتبع كل عملية تجري على المنصة</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={logs.length === 0}
          title={logs.length === 0 ? 'لا توجد بيانات للتصدير' : 'تصدير الصفحة الحالية'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 18px',
            borderRadius: 12,
            background: C.goldGrad,
            color: '#1B2038',
            fontWeight: 800,
            fontSize: 13,
            border: 'none',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: logs.length === 0 ? 0.55 : 1,
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          📥 تصدير السجل
        </button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: C.red, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={card({ marginBottom: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' })}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في السجل..."
            style={{
              width: '100%',
              padding: '8px 38px 8px 12px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.bg,
              color: C.text,
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: "'Cairo',sans-serif",
            }}
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.bg,
            color: C.text,
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          {(['الكل', 'إضافة', 'تعديل', 'حذف', 'تسجيل دخول', 'تصدير', 'اعتماد', 'رفض'] as const).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.bg,
            color: C.text,
            fontSize: 12,
            outline: 'none',
            fontFamily: "'Cairo',sans-serif",
          }}
        />
        <p style={{ color: C.sub, fontSize: 12, flexShrink: 0, margin: 0 }}>
          {loading ? '...' : `${total.toLocaleString('en-US')} سجل`}
        </p>
      </div>

      <div style={card({ padding: 0, overflowX: 'auto' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
              {['#', 'المستخدم', 'الدور', 'العملية', 'الشاشة', 'التفاصيل', 'عنوان IP', 'التاريخ والوقت'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    color: C.sub,
                    fontSize: 11,
                    fontWeight: 700,
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>جارٍ التحميل...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>لا توجد بيانات حالياً.</p>
                </td>
              </tr>
            ) : (
              logs.map((l, i) => {
                const st = actionStyle(l.action);
                return (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '11px 12px', color: C.dim }}>{(page - 1) * 50 + i + 1}</td>
                    <td style={{ padding: '11px 12px', color: C.text, fontWeight: 700 }}>{l.admin?.name ?? '—'}</td>
                    <td style={{ padding: '11px 12px', color: C.sub }}>
                      {ROLE_LABEL[l.admin?.role ?? ''] ?? l.admin?.role ?? '—'}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: st.bg,
                          color: st.color,
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {actionLabel(l.action)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', color: C.sub }}>{screenLabel(l.target_type)}</td>
                    <td style={{ padding: '11px 12px', color: C.text }}>{l.target_label ?? '—'}</td>
                    <td style={{ padding: '11px 12px', color: C.dim, direction: 'ltr', textAlign: 'right' }}>
                      {l.ip_address ?? '—'}
                    </td>
                    <td style={{ padding: '11px 12px', color: C.sub, whiteSpace: 'nowrap' }}>
                      {fmtDate(l.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.card,
              cursor: page <= 1 ? 'default' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1,
              fontFamily: "'Cairo',sans-serif",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            السابق
          </button>
          <span style={{ color: C.sub, fontSize: 12, alignSelf: 'center' }}>
            {page} / {lastPage}
          </span>
          <button
            type="button"
            disabled={page >= lastPage || loading}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.card,
              cursor: page >= lastPage ? 'default' : 'pointer',
              opacity: page >= lastPage ? 0.5 : 1,
              fontFamily: "'Cairo',sans-serif",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            التالي
          </button>
        </div>
      )}
    </SuperAdminShell>
  );
}
