import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import type { ChildSummary, ParentLiveClass } from '../features/parent/parentSlice';

function StatusBadge({ status }: { status: ParentLiveClass['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        جارية الآن
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
      مجدولة
    </span>
  );
}

function ChildCard({ child, onClick }: { child: ChildSummary; onClick: () => void }) {
  const initials = child.name.split(' ').slice(0, 2).map((w) => w[0]).join('');

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
    'from-amber-500 to-orange-500',
  ];
  const grad = gradients[child.id % gradients.length];

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1"
    >
      {/* Top gradient bar */}
      <div className={`h-2 bg-gradient-to-r ${grad}`} />

      <div className="p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
            {initials}
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-lg leading-tight">{child.name}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{child.phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{child.courses_count}</p>
            <p className="text-xs text-slate-500 mt-1">دورة متاحة</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{child.upcoming_count}</p>
            <p className="text-xs text-slate-500 mt-1">حصة قادمة</p>
          </div>
        </div>

        {/* Upcoming classes preview */}
        {child.upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">الحصص القادمة</p>
            {child.upcoming.slice(0, 2).map((cls) => (
              <div key={cls.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{cls.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(cls.scheduled_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={cls.status} />
              </div>
            ))}
          </div>
        )}

        {child.upcoming.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-2">لا توجد حصص قادمة</p>
        )}

        {/* View details link */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-400">عرض التفاصيل</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <ParentLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-500 font-medium text-sm mb-1">{greeting} 👋</p>
              <h2 className="text-3xl font-bold text-slate-800">
                {parent ? parent.name : 'لوحة ولي الأمر'}
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                تابع تقدم {stats.total_children > 1 ? 'أبنائك' : 'ابنك'} ومواعيد حصصهم من هنا
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600 font-medium">
                {stats.total_children} {stats.total_children === 1 ? 'ابن' : 'أبناء'}
              </span>
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="mt-6 h-px bg-gradient-to-r from-purple-200 via-indigo-200 to-transparent" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Summary stats */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  label: 'إجمالي الأبناء',
                  value: stats.total_children,
                  icon: '👨‍👧‍👦',
                  color: 'from-violet-500 to-purple-600',
                  bg: 'from-violet-50 to-purple-50',
                },
                {
                  label: 'الحصص القادمة',
                  value: children.reduce((s, c) => s + c.upcoming_count, 0),
                  icon: '📅',
                  color: 'from-indigo-500 to-blue-600',
                  bg: 'from-indigo-50 to-blue-50',
                },
                {
                  label: 'الدورات المتاحة',
                  value: children.reduce((s, c) => s + c.courses_count, 0),
                  icon: '🎓',
                  color: 'from-fuchsia-500 to-pink-600',
                  bg: 'from-fuchsia-50 to-pink-50',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`relative bg-gradient-to-br ${stat.bg} rounded-3xl p-6 border border-white shadow-sm overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-4xl font-bold text-slate-800 mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-md`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Children cards */}
            {children.length > 0 ? (
              <>
                <h3 className="text-lg font-bold text-slate-700 mb-4">أبنائي</h3>
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
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-4xl mb-4">
                  👨‍👧‍👦
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">لا يوجد أبناء مرتبطون</h3>
                <p className="text-slate-400 text-sm max-w-sm">
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
