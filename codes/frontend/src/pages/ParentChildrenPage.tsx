import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentChildren } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import type { ChildDetail, ParentLiveClass, ParentCourse } from '../features/parent/parentSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

function StatusBadge({ status }: { status: ParentLiveClass['status'] }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      جارية الآن
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      مجدولة
    </span>
  );
}

function CourseCard({ course }: { course: ParentCourse }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl p-4 transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(245,166,35,0.08)' }}>🎬</div>
      )}
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-white text-sm truncate">{course.title}</p>
        <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
          {course.category?.grade?.name} · {course.category?.name}
        </p>
        <p className="text-sm font-bold mt-1.5">
          {course.is_free
            ? <span style={{ color: '#34d399' }}>مجاني</span>
            : <span style={{ color: DK.gold }}>{course.price}</span>}
        </p>
      </div>
      {course.is_active
        ? <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>نشطة</span>
        : <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>معطّلة</span>}
    </div>
  );
}

function LiveClassRow({ cls }: { cls: ParentLiveClass }) {
  return (
    <div className="flex items-center justify-between rounded-2xl p-4 transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(245,166,35,0.08)' }}>📡</div>
        <div>
          <p className="font-semibold text-white text-sm">{cls.title}</p>
          <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{cls.course?.title}</p>
          <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
            {new Date(cls.scheduled_at).toLocaleString('ar-EG', {
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
            {' · '}{cls.duration_minutes} دقيقة
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={cls.status} />
        {cls.meeting_link && cls.status === 'live' && (
          <a href={cls.meeting_link} target="_blank" rel="noreferrer"
            className="text-xs font-medium underline underline-offset-2" style={{ color: DK.gold }}>
            انضم الآن
          </a>
        )}
      </div>
    </div>
  );
}

function ChildSection({ child, index }: { child: ChildDetail; index: number }) {
  const [tab, setTab] = useState<'courses' | 'classes'>('courses');
  const initials = child.name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  const accentColors = ['#f5a623', '#60a5fa', '#34d399', '#a78bfa'];
  const accent = accentColors[index % accentColors.length];

  return (
    <div className="rounded-3xl overflow-hidden" style={DK.card}>
      {/* Child header */}
      <div className="p-6" style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(245,166,35,0.03))', borderBottom: '1px solid rgba(245,166,35,0.1)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-white text-xl">{child.name}</h3>
            <p className="text-sm mt-0.5" style={{ color: DK.dimTxt }}>{child.phone}</p>
          </div>
          <div className="mr-auto flex gap-3 items-center">
            <div className="text-center rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white font-bold text-lg">{child.courses.length}</p>
              <p className="text-xs" style={{ color: DK.dimTxt }}>دورة</p>
            </div>
            <div className="text-center rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white font-bold text-lg">{child.live_classes.length}</p>
              <p className="text-xs" style={{ color: DK.dimTxt }}>حصة</p>
            </div>
            <Link to={`/parent/children/${child.id}/report`}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition"
              style={{ background: 'rgba(245,166,35,0.1)', color: DK.gold, border: '1px solid rgba(245,166,35,0.2)' }}>
              📊 التقرير
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[
            { key: 'courses' as const, label: `الدورات (${child.courses.length})` },
            { key: 'classes' as const, label: `الحصص المباشرة (${child.live_classes.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={tab === t.key
                ? { background: 'rgba(245,166,35,0.15)', color: DK.gold, border: '1px solid rgba(245,166,35,0.2)' }
                : { color: DK.dimTxt }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'courses' && (
          child.courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {child.courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: 'rgba(245,166,35,0.06)' }}>🎓</div>
              <p className="text-sm" style={{ color: DK.dimTxt }}>لا توجد دورات متاحة حالياً</p>
            </div>
          )
        )}
        {tab === 'classes' && (
          child.live_classes.length > 0 ? (
            <div className="space-y-3">
              {child.live_classes.map((cls) => <LiveClassRow key={cls.id} cls={cls} />)}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: 'rgba(245,166,35,0.06)' }}>📡</div>
              <p className="text-sm" style={{ color: DK.dimTxt }}>لا توجد حصص مجدولة حالياً</p>
            </div>
          )
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
      <div className="min-h-screen p-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-3xl font-bold text-white">أبنائي</h2>
          </div>
          <p className="mr-4 text-sm" style={{ color: DK.dimTxt }}>دوراتهم وحصصهم المباشرة في مكان واحد</p>
          <div className="mt-6 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.3), transparent)' }} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '4px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {error && (
          <div className="text-sm mb-6 px-5 py-4 rounded-2xl" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          childrenDetail.length > 0 ? (
            <div className="space-y-6">
              {childrenDetail.map((child, idx) => (
                <ChildSection key={child.id} child={child} index={idx} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
                style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                👨‍👧‍👦
              </div>
              <h3 className="text-xl font-bold text-white mb-2">لا يوجد أبناء مرتبطون</h3>
              <p className="text-sm max-w-sm" style={{ color: DK.dimTxt }}>
                تواصل مع مدير المنصة لربط حسابات أبنائك بحسابك
              </p>
            </div>
          )
        )}
      </div>
    </ParentLayout>
  );
}
