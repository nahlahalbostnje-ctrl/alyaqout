import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyReport } from '../features/student/reportSlice';

const C = {
  bg: '#F2EDE4', card: '#FFFFFF', navy: '#0D1535', navy2: '#1B2038',
  gold: '#C9952A', goldL: '#DDAD50', goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg: 'rgba(201,149,42,0.09)', goldBdr: 'rgba(201,149,42,0.25)',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: 'rgba(0,0,0,0.07)',
  shadow: '0 2px 14px rgba(0,0,0,0.07)',
  red: '#EF4444', green: '#16A34A', blue: '#2563EB', purple: '#7C3AED',
};
const font = { fontFamily: "'Cairo', sans-serif" };

const PERIODS = ['هذا الشهر', 'الفصل الأول', 'الفصل الثاني', 'العام الكامل'] as const;
const SUBJECT_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

function CircProgress({ pct, size = 130 }: { pct: number; size?: number }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEE8D8" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.gold} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: C.navy2, fontWeight: 900, fontSize: 28, lineHeight: 1 }}>{pct}%</span>
        <span style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>المستوى العام</span>
      </div>
    </div>
  );
}

export default function StudentReportPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myReport, loading } = useAppSelector((s) => s.report);
  const [period, setPeriod] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { dispatch(fetchMyReport()); }, [dispatch]);

  const subjects = (myReport?.exams?.recent ?? []).map((e, i) => ({
    name: e.title ?? `امتحان ${i + 1}`,
    pct: e.pct ?? 0,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const overall = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + s.pct, 0) / subjects.length)
    : (myReport?.exams?.average != null ? Math.round(myReport.exams.average) : 0);

  const attendance = myReport?.attendance;
  const exams = myReport?.exams;
  const homework = myReport?.homework;

  const attRate = attendance?.rate != null ? Math.round(attendance.rate) : 0;
  const examAvg = exams?.average != null ? Math.round(exams.average) : 0;
  const hwAvg = homework?.average != null ? Math.round(homework.average) : 0;

  const cardS = {
    background: C.card, borderRadius: 18, padding: '18px',
    boxShadow: C.shadow, border: `1px solid ${C.border}`,
  } as React.CSSProperties;

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#1a3a6b 100%)',
          padding: '28px 20px 32px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14, background: C.goldGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                boxShadow: '0 4px 16px rgba(201,149,42,0.4)',
              }}>📈</div>
              <div>
                <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1, margin: 0 }}>مستوى التطور</h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '4px 0 0' }}>
                  تابع تقدمك الأكاديمي خطوة بخطوة
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: '✅', label: 'الحضور', val: `${attRate}%`, color: '#22C55E' },
                { icon: '📝', label: 'متوسط الامتحانات', val: `${examAvg}%`, color: C.goldL },
                { icon: '📚', label: 'متوسط الواجبات', val: `${hwAvg}%`, color: '#60A5FA' },
              ].map((s) => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  flex: 1, minWidth: 100,
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <div>
                    <p style={{ color: s.color, fontWeight: 900, fontSize: 16, lineHeight: 1, margin: 0 }}>{s.val}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, margin: 0 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 32px' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <button
              onClick={() => setShowPicker((p) => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12,
                background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', ...font,
                fontSize: 13, color: C.text, fontWeight: 700, boxShadow: C.shadow,
              }}
            >
              <span>📅</span>
              <span>{PERIODS[period]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 'auto' }}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showPicker && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, background: C.card, borderRadius: 14,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`,
                zIndex: 50, minWidth: 180, overflow: 'hidden',
              }}>
                {PERIODS.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(i); setShowPicker(false); }}
                    style={{
                      width: '100%', padding: '12px 16px', border: 'none',
                      background: period === i ? C.goldBg : 'none', cursor: 'pointer', ...font,
                      fontSize: 13, color: period === i ? C.gold : C.text,
                      fontWeight: period === i ? 700 : 500, textAlign: 'right',
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.goldBg}`,
                borderTopColor: C.gold, animation: 'spin 0.8s linear infinite', margin: '0 auto',
              }} />
            </div>
          )}

          <div style={{ ...cardS, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ color: C.text, fontWeight: 900, fontSize: 15, margin: 0 }}>الأداء بالمواد</p>
              <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>المستوى العام</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                {subjects.length === 0 ? (
                  <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '20px 0', margin: 0 }}>
                    لا توجد بيانات أداء بالمواد بعد
                  </p>
                ) : subjects.map((s) => (
                  <div key={s.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: s.color, fontWeight: 800 }}>{s.pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: `${s.color}18` }}>
                      <div style={{
                        height: '100%', width: `${s.pct}%`, borderRadius: 4,
                        background: s.color, transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              {subjects.length > 0 && <CircProgress pct={overall} />}
            </div>
          </div>

          <div style={{ ...cardS, marginBottom: 14 }}>
            <p style={{ color: C.text, fontWeight: 900, fontSize: 15, marginBottom: 14 }}>📅 الحضور والغياب</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
              {[
                { label: 'أيام الحضور', val: attendance?.present ?? 0, color: C.green },
                { label: 'أيام الغياب', val: attendance?.absent ?? 0, color: C.red },
                { label: 'التأخر', val: attendance?.late ?? 0, color: '#D97706' },
              ].map((s) => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '14px 10px', borderRadius: 14,
                  background: `${s.color}0D`, border: `1px solid ${s.color}22`,
                }}>
                  <p style={{ color: s.color, fontWeight: 900, fontSize: 24, margin: 0 }}>{s.val}</p>
                  <p style={{ color: C.sub, fontSize: 11, marginTop: 4, marginBottom: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: C.text, fontWeight: 600 }}>نسبة الحضور</span>
                <span style={{ color: C.green, fontWeight: 800 }}>{attRate}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.07)' }}>
                <div style={{ width: `${attRate}%`, height: '100%', borderRadius: 4, background: C.green }} />
              </div>
            </div>
          </div>

          <div style={{ ...cardS, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ color: C.text, fontWeight: 900, fontSize: 15, margin: 0 }}>📝 آخر الامتحانات</p>
              <button
                onClick={() => navigate('/student/exams')}
                style={{
                  color: C.gold, fontSize: 12, fontWeight: 700, background: 'none',
                  border: 'none', cursor: 'pointer', ...font,
                }}
              >
                عرض الكل
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!(exams?.recent && exams.recent.length > 0) ? (
                <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                  لا توجد امتحانات حديثة
                </p>
              ) : exams.recent.map((e, i) => ({
                title: e.title ?? `امتحان ${i + 1}`,
                pct: e.pct,
                date: e.submitted_at?.slice(0, 10) ?? '—',
              })).map((e) => (
                <div key={`${e.title}-${e.date}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 14, background: '#F9FAFB', border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: e.pct >= 85 ? 'rgba(22,163,74,0.1)' : e.pct >= 70 ? C.goldBg : 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{
                      fontWeight: 900, fontSize: 14,
                      color: e.pct >= 85 ? C.green : e.pct >= 70 ? C.gold : C.red,
                    }}>{e.pct}%</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0 }}>{e.title}</p>
                    <p style={{ color: C.dim, fontSize: 11, margin: '2px 0 0' }}>{e.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardS, marginBottom: 14 }}>
            <p style={{ color: C.text, fontWeight: 900, fontSize: 15, marginBottom: 14 }}>📚 الواجبات المنزلية</p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
              gap: 10, marginBottom: 14,
            }}>
              {[
                { label: 'واجبات مُسلَّمة', val: homework?.submitted ?? 0, icon: '✅', color: C.green },
                { label: 'واجبات متأخرة', val: homework?.late ?? 0, icon: '⏰', color: '#D97706' },
              ].map((s) => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '14px 10px', borderRadius: 14,
                  background: `${s.color}0D`, border: `1px solid ${s.color}22`,
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                  <p style={{ color: s.color, fontWeight: 900, fontSize: 22, margin: 0 }}>{s.val}</p>
                  <p style={{ color: C.sub, fontSize: 11, marginTop: 4, marginBottom: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: C.text, fontWeight: 600 }}>متوسط الدرجات</span>
                <span style={{ color: C.blue, fontWeight: 800 }}>{hwAvg}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.07)' }}>
                <div style={{ width: `${hwAvg}%`, height: '100%', borderRadius: 4, background: C.blue }} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg,#0D1535,#1B2038)', borderRadius: 18,
            padding: 20, boxShadow: '0 8px 24px rgba(13,21,53,0.45)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>🤖</span>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>التحليل الذكي</p>
              <span style={{
                marginRight: 'auto', padding: '3px 10px', borderRadius: 20,
                background: C.goldBg, color: C.goldL, fontSize: 11, fontWeight: 700,
                border: `1px solid ${C.goldBdr}`,
              }}>AI</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              {myReport
                ? `مستوى الحضور ${attRate}%. متوسط الامتحانات ${examAvg}%. متوسط الواجبات ${hwAvg}%.`
                : 'لا تتوفر بيانات كافية للتحليل بعد.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate('/student/points')}
                style={{
                  flex: 1, padding: 12, borderRadius: 13, background: C.goldGrad, color: '#1B2038',
                  fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', ...font,
                }}
              >
                نقاطي وإنجازاتي
              </button>
              <button
                onClick={() => navigate('/student/study-room')}
                style={{
                  flex: 1, padding: 12, borderRadius: 13, background: 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', ...font,
                }}
              >
                اسأل معلمي الذكي
              </button>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}
