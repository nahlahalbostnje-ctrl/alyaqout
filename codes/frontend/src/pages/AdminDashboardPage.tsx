import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAdminStats } from '../features/admin/adminSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  goldL:  '#DDAD50',
  navy:   '#fff',
  dimTxt: '#6B7280',
};

const STAT_DEFS: { key: string; label: string; icon: string; accent: string }[] = [
  { key: 'teachers',      label: 'المعلمون',        icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', accent: '#f59e0b' },
  { key: 'students',      label: 'الطلاب',          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', accent: '#60a5fa' },
  { key: 'parents',       label: 'أولياء الأمور',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', accent: '#a78bfa' },
  { key: 'grades',        label: 'الصفوف النشطة',   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', accent: '#34d399' },
  { key: 'courses',       label: 'الدورات النشطة',  icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: '#38bdf8' },
  { key: 'live_scheduled',label: 'حصص مجدولة',      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', accent: '#f472b6' },
  { key: 'live_active',   label: 'حصص جارية الآن',  icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', accent: '#4ade80' },
];

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, loading, error } = useAppSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  const stats = dashboard?.stats as Record<string, number> | undefined;

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }}>

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.7 }}>
              لوحة التحكم
            </span>
          </div>
          <h1 className="text-3xl font-black" style={{ letterSpacing: '-0.5px', color: '#1B2038' }}>
            {dashboard?.country?.name ?? 'منصة الياقوت'}
          </h1>
          {dashboard && (
            <p className="mt-1.5 text-sm" style={{ color: DK.dimTxt }}>
              نظرة عامة على إحصائيات المنصة
              <span className="mx-2" style={{ color: 'rgba(201,149,42,0.4)' }}>·</span>
              <span className="font-mono" style={{ color: DK.gold, opacity: 0.65 }}>{dashboard.country.code}</span>
            </p>
          )}
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: DK.gold }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl px-5 py-4 text-sm font-medium mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {dashboard && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {STAT_DEFS.map((def) => (
              <StatCard
                key={def.key}
                label={def.label}
                value={stats?.[def.key] ?? 0}
                iconPath={def.icon}
                accent={def.accent}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, iconPath, accent }: {
  label: string; value: number; iconPath: string; accent: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden group transition-transform duration-300 hover:-translate-y-1 cursor-default"
      style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500"
        style={{ background: accent, filter: 'blur(20px)' }}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
        style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
      >
        <svg className="w-5 h-5" fill="none" stroke={accent} viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>

      {/* Value */}
      <p className="text-4xl font-black mb-1" style={{ lineHeight: 1, color: '#1B2038' }}>{value}</p>

      {/* Label */}
      <p className="text-xs font-semibold mt-2" style={{ color: '#6B7280' }}>{label}</p>

      {/* Gold bottom accent */}
      <div
        className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to left, transparent, ${accent}, transparent)` }}
      />
    </div>
  );
}
