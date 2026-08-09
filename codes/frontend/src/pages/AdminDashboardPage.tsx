import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAdminStats } from '../features/admin/adminSlice';
import AdminLayout from '../components/AdminLayout';
import DailyRemindersWidget from '../components/DailyRemindersWidget';
import { C } from '../theme/palette';

const STAT_DEFS: { key: string; label: string; icon: string; accent: string; pastel: string }[] = [
  {
    key: 'teachers',
    label: 'المعلمون',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
    accent: C.amber,
    pastel: C.amberBg,
  },
  {
    key: 'students',
    label: 'الطلاب',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    accent: C.primary,
    pastel: C.goldBg,
  },
  {
    key: 'parents',
    label: 'أولياء الأمور',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    accent: C.purple,
    pastel: C.purpleBg,
  },
  {
    key: 'grades',
    label: 'الصفوف النشطة',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    accent: C.green,
    pastel: C.greenBg,
  },
  {
    key: 'courses',
    label: 'الدورات النشطة',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    accent: C.teal,
    pastel: C.tealBg,
  },
  {
    key: 'live_scheduled',
    label: 'حصص مجدولة',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    accent: C.orange,
    pastel: 'rgba(212,163,90,0.12)',
  },
  {
    key: 'live_active',
    label: 'حصص جارية الآن',
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    accent: C.green,
    pastel: C.greenBg,
  },
];

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, loading, error } = useAppSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  const stats = dashboard?.stats as Record<string, number> | undefined;

  return (
    <AdminLayout>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: C.bg, minHeight: '100vh', padding: 24 }}>

        <div style={{
          marginBottom: 24, background: C.card, borderRadius: 16, padding: '18px 20px',
          border: `1px solid ${C.border}`, boxShadow: C.shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ color: C.dim, fontSize: 12, margin: '0 0 4px' }}>
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 style={{ color: C.text, fontWeight: 800, fontSize: 20, margin: 0 }}>
              {dashboard?.country?.name ?? 'لوحة التحكم'}
              {dashboard && (
                <span style={{ color: C.primary, fontWeight: 700, fontSize: 14, marginRight: 8 }}>
                  · {dashboard.country.code}
                </span>
              )}
            </h1>
            <p style={{ color: C.sub, fontSize: 13, margin: '6px 0 0' }}>نظرة عامة على إحصائيات المنصة</p>
          </div>
          <div style={{
            background: C.greenBg, borderRadius: 12, padding: '8px 14px',
            border: `1px solid rgba(111,175,138,0.35)`,
          }}>
            <p style={{ color: C.sub, fontSize: 10, margin: 0 }}>نشاط المنصة</p>
            <p style={{ color: C.green, fontWeight: 800, fontSize: 14, margin: 0 }}>مباشر</p>
          </div>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `3px solid ${C.border}`,
              borderTopColor: C.primary,
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {error && (
          <div style={{
            background: C.redBg, border: `1px solid rgba(224,122,122,0.35)`,
            color: C.red, borderRadius: 12, padding: '12px 16px',
            fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {dashboard && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16 }}>
            {STAT_DEFS.map((def) => (
              <StatCard
                key={def.key}
                label={def.label}
                value={stats?.[def.key] ?? 0}
                iconPath={def.icon}
                accent={def.accent}
                pastel={def.pastel}
                isLive={def.key === 'live_active'}
              />
            ))}
          </div>
        )}

        <div style={{ maxWidth: 480, marginTop: 16 }}>
          <DailyRemindersWidget role="admin" initItems={[
            { text: 'مراجعة طلبات الموافقة', priority: 'high' },
            { text: 'متابعة تقارير المعلمين', priority: 'normal' },
            { text: 'تحديث الإشعارات اليومية', priority: 'normal' },
          ]} />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, iconPath, accent, pastel, isLive }: {
  label: string;
  value: number;
  iconPath: string;
  accent: string;
  pastel: string;
  isLive?: boolean;
}) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: 20,
      boxShadow: C.shadow, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 6 }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isLive && (
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: C.green, marginLeft: 4, animation: 'pulse 1.5s infinite',
            }} />
          )}
          <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>{label}</span>
        </div>
      </div>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', background: pastel,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width={22} height={22} fill="none" stroke={accent} viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
    </div>
  );
}
