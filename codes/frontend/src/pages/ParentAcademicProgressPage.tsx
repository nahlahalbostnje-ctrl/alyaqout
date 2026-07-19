import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import api from '../services/axios';

const C = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', border: '#EDE3CE',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const CHILD_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];

interface ReportData {
  attendance: { total: number; present: number; absent: number; late: number; rate: number | null };
  exams: {
    count: number;
    average: number | null;
    recent: { title: string | null; score: number; total: number; pct: number; date: string | null }[];
  };
  homework: { submitted: number; late: number; average: number | null };
  progress: { videos_completed: number };
}

export default function ParentAcademicProgressPage() {
  const dispatch = useAppDispatch();
  const { children } = useAppSelector(s => s.parent);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
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
      .then(r => setReport(r.data.data ?? null))
      .catch(() => {
        setReport(null);
        setError('تعذّر تحميل مؤشر التطور');
      })
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const exams = report?.exams.recent ?? [];
  const max = exams.length ? Math.max(...exams.map(e => e.pct)) : 0;
  const min = exams.length ? Math.min(...exams.map(e => e.pct)) : 0;

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
            <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>مؤشر التطور الأكاديمي</h1>
          </div>
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>درجات وامتحانات وواجبات أبنائك من سجلات المنصة</p>
        </div>

        {CHILDREN.length === 0 ? (
          <p style={{ color: C.sub }}>لا أبناء مرتبطون بهذا الحساب</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
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
            ) : !report ? (
              <p style={{ color: C.sub }}>لا توجد بيانات بعد</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 20 }}>
                  {[
                    { label: 'متوسط الامتحانات', value: report.exams.average != null ? `${report.exams.average}%` : '—', icon: '📊', color: C.gold, bg: C.goldBg },
                    { label: 'أعلى درجة حديثة', value: exams.length ? `${max}%` : '—', icon: '🏆', color: C.green, bg: C.greenBg },
                    { label: 'أدنى درجة حديثة', value: exams.length ? `${min}%` : '—', icon: '📉', color: C.red, bg: C.redBg },
                    { label: 'عدد الاختبارات', value: report.exams.count, icon: '📝', color: C.blue, bg: C.blueBg },
                    { label: 'متوسط الواجبات', value: report.homework.average != null ? `${report.homework.average}%` : '—', icon: '📚', color: C.amber, bg: C.amberBg },
                    { label: 'نسبة الحضور', value: report.attendance.rate != null ? `${report.attendance.rate}%` : '—', icon: '✅', color: C.green, bg: C.greenBg },
                    { label: 'فيديوهات مكتملة', value: report.progress.videos_completed, icon: '🎬', color: C.blue, bg: C.blueBg },
                  ].map((k, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', background: k.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                        }}>{k.icon}</div>
                        <div>
                          <p style={{ margin: 0, color: C.sub, fontSize: 12 }}>{k.label}</p>
                          <p style={{ margin: 0, color: k.color, fontWeight: 900, fontSize: 20 }}>{k.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                  <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: C.text }}>آخر الامتحانات</h2>
                  {exams.length === 0 ? (
                    <p style={{ color: C.dim, fontSize: 13, margin: 0 }}>لا امتحانات مُصحَّحة بعد لهذا الطالب</p>
                  ) : exams.map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: i < exams.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.text }}>{e.title || 'امتحان'}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: C.dim }}>
                          {e.date ? new Date(e.date).toLocaleDateString('ar') : ''}
                        </p>
                      </div>
                      <span style={{ fontWeight: 900, color: e.pct >= 70 ? C.green : e.pct >= 50 ? C.amber : C.red }}>
                        {e.score}/{e.total} ({e.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
