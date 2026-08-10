import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import RoleHomeIconGrid from '../components/RoleHomeIconGrid';
import type { ChildSummary } from '../features/parent/parentSlice';
import { PARENT_HOME_ICONS } from '../features/nav/roleHomeIcons';
import api from '../services/axios';
import { C } from '../theme/palette';

type Insights = {
  attendance: { total: number; present: number; absent: number; late: number; rate: number | null };
  upcoming: { type: string; id: number; title: string; course?: string | null; at?: string | null }[];
  teacher_notes: { id: number; note: string; source: string; course?: string | null; at?: string | null }[];
  improvement: {
    overall: number | null;
    label: string;
    tone: string;
    exam_avg: number | null;
    hw_avg: number | null;
    attendance_rate: number | null;
    videos_completed: number;
  };
};

function Box({
  title,
  children,
  action,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: 16, boxShadow: C.shadow, minHeight: 180, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 16, borderRadius: 3, background: C.goldGrad }} />
          <span style={{ color: C.text, fontWeight: 800, fontSize: 13.5 }}>{title}</span>
        </div>
        {action && (
          <button type="button" onClick={onAction} style={{
            background: 'none', border: 'none', color: C.primary, fontSize: 11.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
          }}>
            {action}
          </button>
        )}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function AttendanceVisual({ att }: { att: Insights['attendance'] | null }) {
  if (!att || att.total === 0) {
    return <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>لا سجلات حضور بعد.</p>;
  }
  const parts = [
    { key: 'حاضر', n: att.present, color: C.green },
    { key: 'غائب', n: att.absent, color: C.red },
    { key: 'متأخر', n: att.late, color: C.orange ?? '#E8A317' },
  ];
  return (
    <div>
      <div style={{
        height: 14, borderRadius: 99, overflow: 'hidden', display: 'flex',
        background: C.bg, border: `1px solid ${C.border}`, marginBottom: 12,
      }}>
        {parts.filter((p) => p.n > 0).map((p) => (
          <div
            key={p.key}
            title={`${p.key}: ${p.n}`}
            style={{ width: `${(p.n / att.total) * 100}%`, background: p.color, height: '100%' }}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {parts.map((p) => (
          <div key={p.key} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: C.bg }}>
            <p style={{ margin: 0, color: p.color, fontWeight: 900, fontSize: 18 }}>{p.n}</p>
            <p style={{ margin: '2px 0 0', color: C.sub, fontSize: 11 }}>{p.key}</p>
          </div>
        ))}
      </div>
      <p style={{ margin: '10px 0 0', color: C.text, fontSize: 12.5, fontWeight: 700 }}>
        نسبة الحضور: {att.rate ?? 0}%
      </p>
    </div>
  );
}

export default function ParentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { parent, children, loading } = useAppSelector((s) => s.parent);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchParentDashboard()); }, [dispatch]);

  useEffect(() => {
    if (children.length === 0) {
      setSelectedChildId(null);
      return;
    }
    if (!selectedChildId || !children.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    if (!selectedChildId) {
      setInsights(null);
      return;
    }
    let cancelled = false;
    setInsightsLoading(true);
    api.get(`/parent/children/${selectedChildId}/insights`)
      .then((r) => {
        if (!cancelled) setInsights(r.data.data as Insights);
      })
      .catch(() => {
        if (!cancelled) setInsights(null);
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedChildId]);

  const childList = children.map((c: ChildSummary, i: number) => ({
    id: c.id,
    name: c.name,
    courses: c.courses_count ?? 0,
    color: [C.primary, C.teal, C.green, C.purple][i % 4],
  }));

  const firstName = parent?.name?.split(' ')[0] ?? '...';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  const toneColor = (tone: string) => {
    if (tone === 'good') return C.green;
    if (tone === 'warn') return '#E8A317';
    if (tone === 'alert') return C.red;
    return C.sub;
  };

  return (
    <ParentLayout>
      <div style={{ padding: isMobile ? 14 : 20, maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: C.shadow }}>
          <h1 style={{ color: C.text, fontSize: isMobile ? 18 : 20, fontWeight: 800, margin: 0 }}>
            {timeGreeting}، أ. {firstName}
          </h1>
          <p style={{ color: C.sub, fontSize: 13, margin: '6px 0 0' }}>
            ملخص سريع لأبنائك ثم اختصارات الخدمات
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.border}`,
              borderTopColor: C.primary, animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {!loading && (
          <>
            {childList.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {childList.map((c) => {
                  const on = c.id === selectedChildId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedChildId(c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        borderRadius: 999, border: on ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                        background: on ? C.goldBg : C.card, cursor: 'pointer',
                        fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%', background: c.color,
                        color: '#fff', fontWeight: 800, fontSize: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {c.name.charAt(0)}
                      </span>
                      <span style={{ color: C.text, fontWeight: 700, fontSize: 12.5 }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
            }}>
              <Box title="حضور وغياب الطالب" action="التفاصيل" onAction={() => navigate('/parent/attendance')}>
                {insightsLoading ? <p style={{ color: C.sub, fontSize: 13 }}>جاري التحميل…</p> : (
                  <AttendanceVisual att={insights?.attendance ?? null} />
                )}
              </Box>

              <Box title="الامتحانات والواجبات القادمة" action="التقارير" onAction={() => navigate('/parent/reports')}>
                {insightsLoading ? <p style={{ color: C.sub, fontSize: 13 }}>جاري التحميل…</p> : (
                  !insights?.upcoming?.length ? (
                    <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>لا توجد امتحانات أو واجبات قادمة.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {insights.upcoming.slice(0, 5).map((u) => (
                        <div key={`${u.type}-${u.id}`} style={{
                          padding: '8px 10px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`,
                        }}>
                          <p style={{ margin: 0, color: C.text, fontWeight: 700, fontSize: 12.5 }}>
                            {u.type === 'exam' ? 'امتحان' : 'واجب'}: {u.title}
                          </p>
                          <p style={{ margin: '3px 0 0', color: C.sub, fontSize: 11 }}>
                            {u.course ?? '—'}{u.at ? ` · ${String(u.at).slice(0, 16).replace('T', ' ')}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </Box>

              <Box title="ملاحظات المعلم" action="التواصل" onAction={() => navigate('/parent/communication')}>
                {insightsLoading ? <p style={{ color: C.sub, fontSize: 13 }}>جاري التحميل…</p> : (
                  !insights?.teacher_notes?.length ? (
                    <p style={{ color: C.sub, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                      لا توجد ملاحظات من المعلمين حالياً.
                      <br />
                      <span style={{ fontSize: 11.5 }}>تظهر هنا ملاحظات التصحيح عند توفرها.</span>
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {insights.teacher_notes.slice(0, 4).map((n) => (
                        <div key={n.id} style={{
                          padding: '8px 10px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`,
                        }}>
                          <p style={{ margin: 0, color: C.text, fontSize: 12.5, lineHeight: 1.5 }}>{n.note}</p>
                          <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 11 }}>{n.source}</p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </Box>

              <Box title="تقرير فوري بتحسن الطالب" action="مؤشر التطور" onAction={() => navigate('/parent/academic-progress')}>
                {insightsLoading ? <p style={{ color: C.sub, fontSize: 13 }}>جاري التحميل…</p> : (
                  !insights ? (
                    <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>اختر ابناً لعرض التقرير.</p>
                  ) : (
                    <div>
                      <p style={{
                        margin: '0 0 10px', fontSize: 15, fontWeight: 800,
                        color: toneColor(insights.improvement.tone),
                      }}>
                        {insights.improvement.label}
                      </p>
                      <div style={{
                        height: 10, borderRadius: 99, background: C.bg, border: `1px solid ${C.border}`,
                        overflow: 'hidden', marginBottom: 12,
                      }}>
                        <div style={{
                          height: '100%', width: `${Math.min(100, insights.improvement.overall ?? 0)}%`,
                          background: C.goldGrad, borderRadius: 99,
                        }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { l: 'معدل الامتحانات', v: insights.improvement.exam_avg != null ? `${insights.improvement.exam_avg}%` : '—' },
                          { l: 'معدل الواجبات', v: insights.improvement.hw_avg != null ? `${insights.improvement.hw_avg}%` : '—' },
                          { l: 'الحضور', v: insights.improvement.attendance_rate != null ? `${insights.improvement.attendance_rate}%` : '—' },
                          { l: 'فيديوهات مكتملة', v: String(insights.improvement.videos_completed) },
                        ].map((x) => (
                          <div key={x.l} style={{ padding: '8px 10px', borderRadius: 10, background: C.bg }}>
                            <p style={{ margin: 0, color: C.sub, fontSize: 10.5 }}>{x.l}</p>
                            <p style={{ margin: '2px 0 0', color: C.text, fontWeight: 800, fontSize: 14 }}>{x.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </Box>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: C.shadow }}>
              <RoleHomeIconGrid title="الخدمات" items={PARENT_HOME_ICONS} columns={7} variant="emoji" />
            </div>

            {childList.length === 0 && (
              <p style={{ color: C.sub, fontSize: 13, textAlign: 'center' }}>لا يوجد أبناء مسجّلون بعد.</p>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
