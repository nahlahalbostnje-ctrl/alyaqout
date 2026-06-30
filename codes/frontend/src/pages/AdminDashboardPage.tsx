import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAdminStats } from '../features/admin/adminSlice';
import AdminLayout from '../components/AdminLayout';
import DailyRemindersWidget from '../components/DailyRemindersWidget';

const DK = {
  gold: '#C59341',
  goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8',
  card: '#FFFFFF',
  navy: '#0D1E3A',
  text: '#1B2038',
  sub: '#6B7280',
  dim: '#9CA3AF',
  border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  pink: '#F472B6',
};

const STAT_DEFS: { key: string; label: string; icon: string; accent: string; pastel: string }[] = [
  {
    key: 'teachers',
    label: 'المعلمون',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
    accent: '#F59E0B',
    pastel: 'rgba(245,158,11,0.12)',
  },
  {
    key: 'students',
    label: 'الطلاب',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    accent: '#3B82F6',
    pastel: 'rgba(59,130,246,0.12)',
  },
  {
    key: 'parents',
    label: 'أولياء الأمور',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    accent: '#8B5CF6',
    pastel: 'rgba(139,92,246,0.12)',
  },
  {
    key: 'grades',
    label: 'الصفوف النشطة',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    accent: '#10B981',
    pastel: 'rgba(16,185,129,0.12)',
  },
  {
    key: 'courses',
    label: 'الدورات النشطة',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    accent: '#38BDF8',
    pastel: 'rgba(56,189,248,0.12)',
  },
  {
    key: 'live_scheduled',
    label: 'حصص مجدولة',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    accent: '#F472B6',
    pastel: 'rgba(244,114,182,0.12)',
  },
  {
    key: 'live_active',
    label: 'حصص جارية الآن',
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    accent: '#10B981',
    pastel: 'rgba(16,185,129,0.12)',
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
      <div style={{ fontFamily: "'Cairo',sans-serif", background: '#F5EDD8', minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 24, background:'linear-gradient(135deg,#0D1E3A,#162144)', borderRadius:20, padding:'20px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', insetInlineEnd:-20, top:'50%', transform:'translateY(-50%)', opacity:0.06, fontSize:120 }}>🏫</div>
          <div style={{ position:'absolute', insetInlineStart:-10, bottom:-10, opacity:0.04, fontSize:80 }}>⭐</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:'rgba(197,147,65,0.18)', border:'1px solid rgba(197,147,65,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎯</div>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, margin:0 }}>
                    {new Date().toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long'})}
                  </p>
                  <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, margin:0 }}>
                    {dashboard?.country?.name ?? 'لوحة التحكم'}
                  </h1>
                </div>
              </div>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:0, paddingRight:4 }}>
                نظرة عامة على إحصائيات المنصة
                {dashboard && (
                  <span style={{ color:DK.gold, fontWeight:700, marginRight:8 }}>· {dashboard.country.code}</span>
                )}
              </p>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ background:'rgba(197,147,65,0.15)', borderRadius:12, padding:'8px 14px', border:'1px solid rgba(197,147,65,0.25)' }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10, margin:0 }}>نشاط المنصة</p>
                <p style={{ color:DK.gold, fontWeight:800, fontSize:16, margin:0 }}>🟢 مباشر</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '3px solid rgba(197,147,65,0.15)',
              borderTopColor: DK.gold,
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {dashboard && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
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

        {/* مهام اليوم */}
        <div style={{ maxWidth: 480, marginTop: 8 }}>
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
      background: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      border: '1px solid #EDE3CE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      {/* Left: number + label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1B2038', lineHeight: 1, marginBottom: 6 }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isLive && (
            <span style={{
              display: 'inline-block',
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#10B981',
              marginLeft: 4,
              animation: 'pulse 1.5s infinite',
            }} />
          )}
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{label}</span>
        </div>
      </div>

      {/* Right: icon circle */}
      <div style={{
        width: 52, height: 52,
        borderRadius: '50%',
        background: pastel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={22} height={22} fill="none" stroke={accent} viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
    </div>
  );
}
