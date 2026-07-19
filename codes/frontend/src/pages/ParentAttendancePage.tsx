import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import api from '../services/axios';

const C = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', border: '#EDE3CE',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', navy: '#0D1E3A',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const CHILD_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number | null;
}

export default function ParentAttendancePage() {
  const dispatch = useAppDispatch();
  const { children } = useAppSelector(s => s.parent);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [att, setAtt] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (children.length === 0) dispatch(fetchParentDashboard());
  }, [dispatch, children.length]);

  const CHILDREN = children.map((c, i) => ({
    id: c.id,
    name: c.name,
    initials: c.name.split(' ').slice(0, 2).map(w => w[0]).join(''),
    color: CHILD_COLORS[i % CHILD_COLORS.length],
  }));

  useEffect(() => {
    if (CHILDREN.length && selectedChild == null) setSelectedChild(CHILDREN[0].id);
  }, [CHILDREN, selectedChild]);

  useEffect(() => {
    if (selectedChild == null) return;
    setLoading(true);
    setError(null);
    api.get(`/parent/children/${selectedChild}/report`)
      .then(r => setAtt(r.data.data?.attendance ?? null))
      .catch(() => {
        setAtt(null);
        setError('تعذّر تحميل بيانات الحضور');
      })
      .finally(() => setLoading(false));
  }, [selectedChild]);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
            <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>الحضور والغياب</h1>
          </div>
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>ملخص حضور أبنائك من سجلات المنصة</p>
        </div>

        {CHILDREN.length === 0 ? (
          <p style={{ color: C.sub }}>لا أبناء مرتبطون بهذا الحساب</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {CHILDREN.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChild(ch.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 40, border: 'none', cursor: 'pointer',
                    background: selectedChild === ch.id ? C.goldGrad : '#fff',
                    color: selectedChild === ch.id ? '#fff' : C.text,
                    fontWeight: 700, fontSize: 13, boxShadow: C.shadow,
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: selectedChild === ch.id ? 'rgba(255,255,255,0.3)' : ch.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 11,
                  }}>{ch.initials}</div>
                  {ch.name}
                </button>
              ))}
            </div>

            {error && <p style={{ color: C.red, fontSize: 13 }}>{error}</p>}
            {loading ? (
              <p style={{ color: C.sub }}>جاري التحميل...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'إجمالي السجلات', value: att?.total ?? 0, color: C.navy, bg: C.goldBg, icon: '📅' },
                  { label: 'حاضر', value: att?.present ?? 0, color: C.green, bg: C.greenBg, icon: '✅' },
                  { label: 'غائب', value: att?.absent ?? 0, color: C.red, bg: C.redBg, icon: '❌' },
                  { label: 'متأخر', value: att?.late ?? 0, color: C.amber, bg: C.amberBg, icon: '⏰' },
                  { label: 'نسبة الحضور', value: att?.rate != null ? `${att.rate}%` : '—', color: C.blue, bg: C.blueBg, icon: '📊' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: s.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: C.sub }}>{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <p style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: 14 }}>تفاصيل اليوم بيوم</p>
              <p style={{ margin: '8px 0 0', color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
                {(att?.total ?? 0) === 0
                  ? 'لا سجلات حضور بعد لهذا الطالب.'
                  : 'الملخص أعلاه من سجلات الحضور الفعلية. التقويم اليومي التفصيلي سيُضاف عند توسيع واجهة ولي الأمر.'}
              </p>
            </div>
          </>
        )}
      </div>
    </ParentLayout>
  );
}
