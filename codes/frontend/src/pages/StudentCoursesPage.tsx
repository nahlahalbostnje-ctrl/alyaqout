import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchStudentCourses,
  fetchStudentDashboard,
  fetchStudentLiveClasses,
} from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';
import { useCurrency } from '../hooks/useCurrency';
import { C } from '../theme/palette';

const font = { fontFamily: "'Cairo',sans-serif" } as const;

const CATS = ['الكل', 'الرياضيات', 'العلوم', 'اللغات', 'التربية الإسلامية'] as const;
type Cat = typeof CATS[number];
type HubTab = 'enrolled' | 'schedule';

const SUBJECT_EMOJI: Record<string, string> = {
  'الرياضيات': '📐',
  'العلوم': '🧪',
  'اللغة الإنجليزية': '🌐',
  'اللغة العربية': '📜',
  'التربية الإسلامية': '🕌',
};

const SUBJ_COLORS: Record<string, string> = {
  'الرياضيات': '#4F46E5',
  'اللغة الإنجليزية': '#2563EB',
  'العلوم': '#059669',
  'اللغة العربية': '#D97706',
  'التربية الإسلامية': '#DC2626',
};

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildWeekDays(from = new Date()) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function StudentCoursesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { formatMoney } = useCurrency();
  const { courses, liveClasses, loading, subscription } = useAppSelector((s) => s.student);

  const tabParam = params.get('tab');
  const tab: HubTab = tabParam === 'schedule' ? 'schedule' : 'enrolled';

  const [cat, setCat] = useState<Cat>('الكل');
  const [search, setSearch] = useState('');
  const week = useMemo(() => buildWeekDays(), []);
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => {
    dispatch(fetchStudentCourses());
    dispatch(fetchStudentLiveClasses());
    if (!subscription) dispatch(fetchStudentDashboard());
  }, [dispatch, subscription]);

  const setTab = (next: HubTab) => {
    if (next === 'schedule') setParams({ tab: 'schedule' });
    else setParams({});
  };

  const display = courses.map((c) => ({
    ...c,
    progress: typeof c.progress === 'number' ? c.progress : 0,
    emoji: SUBJECT_EMOJI[c.category?.name ?? ''] ?? '📚',
  })).filter((c) => {
    const matchCat =
      cat === 'الكل' ||
      c.category?.name?.includes(cat) ||
      (cat === 'اللغات' && (c.category?.name?.includes('اللغة') || c.category?.name === 'اللغات'));
    const matchSearch =
      !search || c.title?.includes(search) || c.teacher?.name?.includes(search);
    return matchCat && matchSearch;
  });

  const selectedDay = week[dayIdx];
  const dayClasses = liveClasses.filter((c) => {
    if (!c.scheduled_at) return false;
    return dayKey(new Date(c.scheduled_at)) === dayKey(selectedDay);
  });

  return (
    <StudentLayout>
      <div dir="rtl" style={{ ...font }}>
        <div style={{ padding: '20px 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
            <div style={{ flex: 1 }}>
              <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>دوراتي</h1>
              <p style={{ color: C.sub, fontSize: 12, margin: '4px 0 0' }}>
                الدورات المسجّلة وجدول الحصص في مكان واحد
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            background: C.card, borderRadius: 14, padding: 6, border: `1px solid ${C.border}`,
            marginBottom: 14,
          }}>
            {([
              { id: 'enrolled' as const, label: 'المسجّل', hint: 'دوراتي وباقتي' },
              { id: 'schedule' as const, label: 'الجدول', hint: 'حصص ومواعيد' },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  border: 'none', borderRadius: 10, padding: '10px 8px', cursor: 'pointer', ...font,
                  background: tab === t.id ? C.goldGrad : 'transparent',
                  color: tab === t.id ? '#1B2038' : C.sub,
                  boxShadow: tab === t.id ? '0 3px 10px rgba(201,149,42,0.3)' : 'none',
                }}
              >
                <span style={{ display: 'block', fontWeight: 800, fontSize: 13.5 }}>{t.label}</span>
                <span style={{ display: 'block', fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>{t.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'enrolled' && (
          <div style={{ padding: '0 16px 16px' }}>
            {subscription && (
              <div style={{
                background: C.card, borderRadius: 14, padding: '12px 14px', marginBottom: 14,
                border: `1px solid ${C.goldBdr}`, boxShadow: C.shadow,
              }}>
                <p style={{ margin: 0, color: C.navy2, fontWeight: 800, fontSize: 13 }}>
                  الباقة: {subscription.package_name}
                </p>
                <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 12 }}>
                  متبقي {subscription.days_remaining} يوم · حتى {subscription.ends_at}
                </p>
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن دورة أو معلم..."
                style={{
                  width: '100%', padding: '11px 16px 11px 42px', borderRadius: 14,
                  border: `1.5px solid ${C.border}`, background: C.card, fontSize: 13, color: C.text,
                  ...font, outline: 'none', boxSizing: 'border-box', boxShadow: C.shadow,
                }}
              />
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16, paddingBottom: 2 }}>
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  style={{
                    flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    ...font, fontSize: 12.5, fontWeight: cat === c ? 700 : 500,
                    background: cat === c ? C.goldGrad : 'rgba(0,0,0,0.05)',
                    color: cat === c ? '#1B2038' : C.sub,
                    boxShadow: cat === c ? '0 3px 10px rgba(201,149,42,0.35)' : 'none',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { icon: '📚', val: display.length, label: 'مسجّلة' },
                { icon: '✅', val: display.filter((c) => c.progress >= 100).length, label: 'مكتملة' },
                { icon: '⏳', val: display.filter((c) => c.progress < 100).length, label: 'جارية' },
              ].map((s) => (
                <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
                  <p style={{ color: C.navy2, fontWeight: 900, fontSize: 18, lineHeight: 1, margin: 0 }}>{s.val}</p>
                  <p style={{ color: C.sub, fontSize: 10.5, marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {loading && courses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.goldBg}`, borderTopColor: C.gold, animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            )}

            {!loading && display.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ fontSize: 54, marginBottom: 12 }}>📚</div>
                <p style={{ color: C.sub, fontSize: 15, fontWeight: 600 }}>لا توجد دورات مسجّلة</p>
                <p style={{ color: C.dim, fontSize: 12.5, marginTop: 4 }}>جرّب تغيير الفلتر أو تصفّح الكتالوج</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {display.map((course) => {
                const pct = course.progress ?? 0;
                const done = pct >= 100;
                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/student/courses/${course.id}/content`)}
                    style={{
                      background: C.card, borderRadius: 18, padding: '16px 18px', boxShadow: C.shadow,
                      border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : C.border}`, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: done ? 'rgba(16,185,129,0.1)' : C.goldBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                        border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : C.goldBdr}`, overflow: 'hidden',
                      }}>
                        {course.thumbnail
                          ? <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (course.emoji ?? '📚')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: C.navy2, fontWeight: 800, fontSize: 14.5, margin: '0 0 4px', lineHeight: 1.3 }}>{course.title}</p>
                        <p style={{ color: C.sub, fontSize: 12, margin: '0 0 3px' }}>👨‍🏫 {course.teacher?.name ?? '—'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {course.category?.grade?.name && (
                            <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.05)', color: C.dim, fontSize: 10.5 }}>
                              {course.category.grade.name}
                            </span>
                          )}
                          {course.category?.name && (
                            <span style={{ padding: '2px 8px', borderRadius: 8, background: C.goldBg, color: C.gold, fontSize: 10.5, fontWeight: 600 }}>
                              {course.category.name}
                            </span>
                          )}
                          <span style={{
                            padding: '2px 8px', borderRadius: 8, fontSize: 10.5, fontWeight: 700,
                            background: course.is_free ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.08)',
                            color: course.is_free ? '#10B981' : '#2563EB',
                          }}>
                            {course.is_free ? 'مجاني' : formatMoney(course.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 5 }}>
                        <span style={{ color: C.sub, fontWeight: 600 }}>{done ? '✅ مكتمل' : 'التقدم'}</span>
                        <span style={{ color: done ? '#10B981' : C.gold, fontWeight: 800 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 4, background: 'rgba(0,0,0,0.06)' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 4, background: done ? '#10B981' : C.goldGrad }} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/courses/${course.id}/content`);
                      }}
                      style={{
                        marginTop: 12, width: '100%', padding: '10px', borderRadius: 12,
                        background: done ? 'rgba(16,185,129,0.1)' : C.goldGrad,
                        color: done ? '#10B981' : '#1B2038', fontWeight: 700, fontSize: 13,
                        border: done ? '1px solid rgba(16,185,129,0.25)' : 'none', cursor: 'pointer',
                        boxShadow: done ? 'none' : '0 3px 12px rgba(201,149,42,0.35)', ...font,
                      }}
                    >
                      {done ? '🔄 مراجعة الدورة' : '▶ متابعة التعلم'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div style={{ paddingBottom: 16 }}>
            <div style={{
              background: C.card, padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
            }}>
              {week.map((d, i) => (
                <button
                  key={dayKey(d)}
                  type="button"
                  onClick={() => setDayIdx(i)}
                  style={{
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', ...font,
                    background: dayIdx === i ? C.navy2 : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 11, color: dayIdx === i ? 'rgba(255,255,255,0.7)' : C.sub, fontWeight: 500 }}>
                    {d.toLocaleDateString('ar-EG', { weekday: 'short' })}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: dayIdx === i ? C.goldL : C.text, lineHeight: 1 }}>
                    {d.getDate()}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: C.navy2, fontWeight: 700, fontSize: 15, margin: 0 }}>
                {selectedDay.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <span style={{ color: C.sub, fontSize: 12 }}>{dayClasses.length} حصص</span>
            </div>

            <div style={{ padding: '0 16px' }}>
              {dayClasses.length === 0 && (
                <p style={{ color: C.dim, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
                  لا توجد حصص مجدولة لهذا اليوم
                </p>
              )}
              {dayClasses.map((cls) => {
                const subject = cls.title || cls.course?.title || '';
                const colorKey = Object.keys(SUBJ_COLORS).find((k) => subject.includes(k.split(' ')[0]));
                const color = (colorKey && SUBJ_COLORS[colorKey]) || C.blue;
                const isLive = cls.status === 'live';
                const time = cls.scheduled_at
                  ? new Date(cls.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <div
                    key={cls.id}
                    style={{
                      background: C.card, borderRadius: 18, padding: '14px 16px', marginBottom: 10,
                      boxShadow: C.shadow, border: `1px solid ${isLive ? 'rgba(22,163,74,0.3)' : C.border}`,
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}
                  >
                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 48 }}>
                      <p style={{ color: C.sub, fontSize: 12, margin: 0, fontWeight: 700 }}>{time}</p>
                      <div style={{ width: 3, height: 28, borderRadius: 2, background: color, margin: '6px auto' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                        <p style={{ color: C.navy2, fontWeight: 800, fontSize: 14, margin: 0 }}>{subject}</p>
                        {isLive && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700,
                            color: '#16A34A', background: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: 20,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                            مباشر
                          </span>
                        )}
                      </div>
                      <p style={{ color: C.sub, fontSize: 12, margin: 0 }}>{cls.teacher?.name ?? '—'}</p>
                      {cls.course?.title && cls.course.title !== subject && (
                        <p style={{ color: C.dim, fontSize: 11, margin: '2px 0 0' }}>{cls.course.title}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (cls.agora_channel || isLive) {
                          navigate(`/live/${cls.agora_channel ?? 'demo'}?classId=${cls.id}`);
                        }
                      }}
                      style={{
                        flexShrink: 0, padding: '8px 16px', borderRadius: 11, ...font,
                        background: isLive ? C.goldGrad : `${color}18`,
                        border: isLive ? 'none' : `1px solid ${color}33`,
                        color: isLive ? '#1B2038' : color, fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                        boxShadow: isLive ? '0 3px 10px rgba(201,149,42,0.35)' : 'none',
                      }}
                    >
                      دخول
                    </button>
                  </div>
                );
              })}
            </div>

            {liveClasses.length > 0 && dayClasses.length === 0 && (
              <div style={{ padding: '8px 16px 0' }}>
                <p style={{ color: C.sub, fontSize: 12, textAlign: 'center', margin: 0 }}>
                  لديك {liveClasses.length} حصة قادمة — جرّب يومًا آخر من الشريط أعلاه
                </p>
              </div>
            )}
          </div>
        )}

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}
