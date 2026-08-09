import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import BrandLogo from '../components/BrandLogo';
import NearestBranchWidget from '../components/NearestBranchWidget';
import type { ChildSummary } from '../features/parent/parentSlice';
import { C } from '../theme/palette';

/**
 * Phase C — Parent home: show only real content.
 * Empty academy / achievements / invoices / fake attendance / empty recs are omitted.
 */

function Ico({ d, size = 16, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function SecHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 4, height: 18, borderRadius: 3, background: C.goldGrad }} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{title}</span>
      </div>
      {action && (
        <button type="button" onClick={onAction} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
          {action}
        </button>
      )}
    </div>
  );
}

const QUICK: { label: string; to: string; d: string }[] = [
  { label: 'أبنائي', to: '/parent/children', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'التقارير', to: '/parent/reports', d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'الحضور', to: '/parent/attendance', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { label: 'المدفوعات', to: '/parent/billing', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: 'التواصل', to: '/parent/communication', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'الباقات', to: '/parent/packages', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
];

export default function ParentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { parent, children, stats, loading } = useAppSelector((s) => s.parent);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchParentDashboard()); }, [dispatch]);

  const childList = children.map((c: ChildSummary, i: number) => ({
    id: c.id,
    name: c.name,
    courses: c.courses_count ?? 0,
    color: [C.primary, C.teal, C.green, C.purple][i % 4],
  }));

  const firstName = parent?.name?.split(' ')[0] ?? '...';
  const totalKids = stats.total_children || childList.length;
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <ParentLayout>
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        minHeight: '100%', background: C.bg,
      }}>
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: C.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h1 style={{ color: C.text, fontSize: isMobile ? 18 : 20, fontWeight: 800, margin: 0 }}>
                  {timeGreeting}، أ. {firstName}
                </h1>
                <p style={{ color: C.sub, fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>
                  متابعة أبنائك: الدورات، التقارير، والمدفوعات من مكان واحد
                </p>
              </div>
              <BrandLogo size={48} style={{ flexShrink: 0, borderRadius: 12 }} />
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {!loading && (
            <>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: C.shadow }}>
                <SecHead title="أبنائي" action="عرض الكل" onAction={() => navigate('/parent/children')} />
                {childList.length === 0 ? (
                  <p style={{ color: C.sub, fontSize: 13, textAlign: 'center', margin: '8px 0 0' }}>
                    لا يوجد أبناء مسجّلون بعد.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {childList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => navigate('/parent/children')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                          borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg,
                          cursor: 'pointer', textAlign: 'right', fontFamily: "'Cairo',sans-serif",
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: c.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0,
                        }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, color: C.text, fontWeight: 700, fontSize: 13 }}>{c.name}</p>
                          <p style={{ margin: '2px 0 0', color: C.sub, fontSize: 11.5 }}>{c.courses} دورة مرتبطة</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: C.shadow }}>
                <SecHead title="اختصارات سريعة" />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
                  gap: 10,
                }}>
                  {QUICK.map((q) => (
                    <button
                      key={q.to}
                      type="button"
                      onClick={() => navigate(q.to)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '12px 6px', borderRadius: 12, border: `1px solid ${C.border}`,
                        background: C.bg, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      <span style={{
                        width: 40, height: 40, borderRadius: 11, background: C.goldBg, color: C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Ico d={q.d} color={C.primary} size={18} />
                      </span>
                      <span style={{ color: C.text, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: '16px 18px', boxShadow: C.shadow,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: C.goldBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Ico
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    color={C.primary} size={22}
                  />
                </div>
                <div>
                  <p style={{ margin: 0, color: C.sub, fontSize: 12 }}>عدد الأبناء</p>
                  <p style={{ margin: '2px 0 0', color: C.text, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{totalKids}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          width: isMobile ? '100%' : 280, flexShrink: 0,
          padding: isMobile ? '0 18px 18px' : '18px 18px 18px 0',
          display: 'flex', flexDirection: 'column', gap: 12,
          position: isMobile ? 'static' : 'sticky', top: 0,
        }}>
          <button
            type="button"
            onClick={() => navigate('/parent/league')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'right',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px',
              boxShadow: C.shadow, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 10, background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ico d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" color={C.primary} size={16} />
            </span>
            <span>
              <span style={{ display: 'block', color: C.text, fontWeight: 700, fontSize: 13 }}>دوري أولياء الأمور</span>
              <span style={{ color: C.sub, fontSize: 11 }}>عرض الترتيب</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/parent/ai-assistant')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'right',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px',
              boxShadow: C.shadow, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 10, background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ico d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color={C.primary} size={16} />
            </span>
            <span>
              <span style={{ display: 'block', color: C.text, fontWeight: 700, fontSize: 13 }}>المساعد الذكي</span>
              <span style={{ color: C.sub, fontSize: 11 }}>اسأل عن رحلة أبنائك</span>
            </span>
          </button>

          <NearestBranchWidget />
        </div>
      </div>
    </ParentLayout>
  );
}
