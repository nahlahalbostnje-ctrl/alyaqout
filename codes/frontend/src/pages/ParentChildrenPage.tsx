import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentChildren } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import type { ChildDetail, ParentLiveClass, ParentCourse } from '../features/parent/parentSlice';

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

function CourseCard({ course }: { course: ParentCourse }) {
  return (
    <div className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all duration-200">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
          🎬
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-slate-800 text-sm truncate">{course.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {course.category?.grade?.name} · {course.category?.name}
        </p>
        <p className="text-sm font-bold mt-1.5">
          {course.is_free
            ? <span className="text-emerald-600">مجاني</span>
            : <span className="text-purple-700">{course.price}</span>}
        </p>
      </div>
      {course.is_active
        ? <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-medium">نشطة</span>
        : <span className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-lg font-medium">معطّلة</span>}
    </div>
  );
}

function LiveClassRow({ cls }: { cls: ParentLiveClass }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
          📡
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{cls.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{cls.course?.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(cls.scheduled_at).toLocaleString('ar-EG', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
            {' · '}{cls.duration_minutes} دقيقة
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={cls.status} />
        {cls.meeting_link && cls.status === 'live' && (
          <a href={cls.meeting_link} target="_blank" rel="noreferrer"
            className="text-xs text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2">
            انضم الآن
          </a>
        )}
      </div>
    </div>
  );
}

const gradients = [
  { from: 'from-violet-500', to: 'to-purple-600', light: 'from-violet-50 to-purple-50', border: 'border-violet-200' },
  { from: 'from-indigo-500', to: 'to-blue-600',   light: 'from-indigo-50 to-blue-50',   border: 'border-indigo-200' },
  { from: 'from-fuchsia-500', to: 'to-pink-600',  light: 'from-fuchsia-50 to-pink-50',  border: 'border-fuchsia-200' },
  { from: 'from-amber-500', to: 'to-orange-500',  light: 'from-amber-50 to-orange-50',  border: 'border-amber-200' },
];

function ChildSection({ child, index }: { child: ChildDetail; index: number }) {
  const [tab, setTab] = useState<'courses' | 'classes'>('courses');
  const grad = gradients[index % gradients.length];
  const initials = child.name.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Child header */}
      <div className={`bg-gradient-to-r ${grad.from} ${grad.to} p-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/30">
            {initials}
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">{child.name}</h3>
            <p className="text-white/70 text-sm mt-0.5">{child.phone}</p>
          </div>
          <div className="mr-auto flex gap-3 items-center">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white font-bold text-lg">{child.courses.length}</p>
              <p className="text-white/70 text-xs">دورة</p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-white font-bold text-lg">{child.live_classes.length}</p>
              <p className="text-white/70 text-xs">حصة</p>
            </div>
            <Link to={`/parent/children/${child.id}/report`}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition">
              📊 التقرير
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 px-6 pt-4">
        <div className="flex gap-1 bg-slate-50 rounded-xl p-1 w-fit">
          {[
            { key: 'courses' as const, label: `الدورات (${child.courses.length})` },
            { key: 'classes' as const, label: `الحصص المباشرة (${child.live_classes.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'courses' && (
          <>
            {child.courses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {child.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mx-auto mb-3">🎓</div>
                <p className="text-slate-400 text-sm">لا توجد دورات متاحة حالياً</p>
              </div>
            )}
          </>
        )}

        {tab === 'classes' && (
          <>
            {child.live_classes.length > 0 ? (
              <div className="space-y-3">
                {child.live_classes.map((cls) => (
                  <LiveClassRow key={cls.id} cls={cls} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mx-auto mb-3">📡</div>
                <p className="text-slate-400 text-sm">لا توجد حصص مجدولة حالياً</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ParentChildrenPage() {
  const dispatch = useAppDispatch();
  const { childrenDetail, loading, error } = useAppSelector((s) => s.parent);

  useEffect(() => { dispatch(fetchParentChildren()); }, [dispatch]);

  return (
    <ParentLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">أبنائي</h2>
          <p className="text-slate-400 mt-2 text-sm">
            دوراتهم وحصصهم المباشرة في مكان واحد
          </p>
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

        {/* Children */}
        {!loading && !error && (
          <>
            {childrenDetail.length > 0 ? (
              <div className="space-y-6">
                {childrenDetail.map((child, idx) => (
                  <ChildSection key={child.id} child={child} index={idx} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-4xl mb-4">
                  👨‍👧‍👦
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">لا يوجد أبناء مرتبطون</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  تواصل مع مدير المنصة لربط حسابات أبنائك بحسابك
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
