import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import type { ChildSummary, ParentLiveClass } from '../features/parent/parentSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

const CHILD_ACCENTS = [
  { bg: 'rgba(245,166,35,0.12)',  border: 'rgba(245,166,35,0.2)',  text: '#f5a623',  grad: 'linear-gradient(135deg, #f5a623, #ffd166)' },
  { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.2)',  text: '#60a5fa',  grad: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa',  grad: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.2)',  text: '#34d399',  grad: 'linear-gradient(135deg, #059669, #34d399)' },
];

function StatusBadge({ status }: { status: ParentLiveClass['status'] }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />جارية الآن
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />مجدولة
    </span>
  );
}

function ChildCard({ child, onClick }: { child: ChildSummary; onClick: () => void }) {
  const initials = child.name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  const acc = CHILD_ACCENTS[child.id % CHILD_ACCENTS.length];

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1"
      style={{ background: '#070e22', border: `1px solid ${acc.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: acc.grad }} />

      <div className="p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
            style={{ background: acc.grad, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{child.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{child.phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-3xl font-black text-white">{child.courses_count}</p>
            <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>دورة متاحة</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: acc.bg, border: `1px solid ${acc.border}` }}>
            <p className="text-3xl font-black" style={{ color: acc.text }}>{child.upcoming_count}</p>
            <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>حصة قادمة</p>
          </div>
        </div>

        {/* Upcoming preview */}
        {child.upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: DK.dimTxt }}>الحصص القادمة</p>
            {child.upcoming.slice(0, 2).map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[150px]">{cls.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
                    {new Date(cls.scheduled_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={cls.status} />
              </div>
            ))}
          </div>
        )}

        {child.upcoming.length === 0 && (
          <p className="text-center text-sm py-2" style={{ color: DK.dimTxt }}>لا توجد حصص قادمة</p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-sm" style={{ color: DK.dimTxt }}>عرض التفاصيل</span>
          <svg className="w-4 h-4 -scale-x-100 group-hover:translate-x-1 transition-transform" style={{ color: acc.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ParentDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { parent, children, stats, loading, error } = useAppSelector((s) => s.parent);

  useEffect(() => { dispatch(fetchParentDashboard()); }, [dispatch]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  const summaryStats = [
    { label: 'إجمالي الأبناء', value: stats.total_children, iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', accent: '#f5a623' },
    { label: 'الحصص القادمة', value: children.reduce((s, c) => s + c.upcoming_count, 0), iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', accent: '#60a5fa' },
    { label: 'الدورات المتاحة', value: children.reduce((s, c) => s + c.courses_count, 0), iconPath: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', accent: '#a78bfa' },
  ];

  return (
    <ParentLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, #f5a623, #ffd166)` }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f5a623', opacity: 0.65 }}>
                  {greeting}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.5px' }}>
                {parent ? parent.name : 'لوحة ولي الأمر'}
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: DK.dimTxt }}>
                تابع تقدم {stats.total_children > 1 ? 'أبنائك' : 'ابنك'} ومواعيد حصصهم من هنا
              </p>
            </div>
            <div
              className="flex items-center gap-2 rounded-2xl px-5 py-3 flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium" style={{ color: '#34d399' }}>
                {stats.total_children} {stats.total_children === 1 ? 'ابن' : 'أبناء'}
              </span>
            </div>
          </div>
          <div className="mt-6 h-px"
            style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.2), transparent)' }} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-5 py-4 text-sm mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {summaryStats.map((stat) => (
                <div key={stat.label}
                  className="relative rounded-2xl p-6 overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                  style={DK.card}
                >
                  <div
                    className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500"
                    style={{ background: stat.accent, filter: 'blur(20px)' }}
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: DK.dimTxt }}>{stat.label}</p>
                      <p className="text-4xl font-black text-white">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${stat.accent}20`, border: `1px solid ${stat.accent}30` }}>
                      <svg className="w-5 h-5" fill="none" stroke={stat.accent} viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.iconPath} />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Children cards */}
            {children.length > 0 ? (
              <>
                <h3 className="text-base font-bold text-white mb-5">أبنائي</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {children.map((child) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      onClick={() => navigate('/parent/children')}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}
                >
                  <svg className="w-10 h-10" fill="none" stroke="rgba(245,166,35,0.4)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">لا يوجد أبناء مرتبطون</h3>
                <p className="text-sm max-w-sm" style={{ color: DK.dimTxt }}>
                  تواصل مع المدير لربط حسابات أبنائك بحسابك
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
