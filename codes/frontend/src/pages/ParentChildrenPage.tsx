import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentChildren } from '../features/parent/parentSlice';
import ParentLayout from '../components/ParentLayout';
import type { ChildDetail, ParentLiveClass, ParentCourse } from '../features/parent/parentSlice';

const LK = {
  pageBg:     '#F5EDD8',
  cardBg:     '#FFFFFF',
  cardBorder: '#EDE3CE',
  cardShadow: '0 2px 16px rgba(0,0,0,0.06)',
  gold:       '#C9952A',
  goldL:      '#DDAD50',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  blue:       '#3B82F6',
  blueBg:     'rgba(59,130,246,0.08)',
  red:        '#EF4444',
};

const ACCENTS = ['#C9952A', '#3B82F6', '#8B5CF6', '#10B981'];

function StatusBadge({ status }: { status: ParentLiveClass['status'] }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: LK.greenBg, color: LK.green, border: `1px solid rgba(16,185,129,0.2)` }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      جارية الآن
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: LK.blueBg, color: LK.blue, border: `1px solid rgba(59,130,246,0.2)` }}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      مجدولة
    </span>
  );
}

function CourseCard({ course }: { course: ParentCourse }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: LK.pageBg, border: `1px solid ${LK.cardBorder}` }}>
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: LK.goldBg }}>🎬</div>
      )}
      <div className="flex-1 overflow-hidden">
        <p style={{ color: LK.text, fontWeight: '600', fontSize: '13px' }} className="truncate">{course.title}</p>
        <p style={{ color: LK.textSub, fontSize: '11px', marginTop: '2px' }}>
          {course.category?.grade?.name} · {course.category?.name}
        </p>
        <p style={{ fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>
          {course.is_free
            ? <span style={{ color: LK.green }}>مجاني</span>
            : <span style={{ color: LK.gold }}>{course.price}</span>}
        </p>
      </div>
      {course.is_active
        ? <span className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: LK.greenBg, color: LK.green }}>نشطة</span>
        : <span className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: '#F3F4F6', color: LK.textDim }}>معطّلة</span>}
    </div>
  );
}

function LiveClassRow({ cls }: { cls: ParentLiveClass }) {
  return (
    <div className="flex items-center justify-between rounded-2xl p-4"
      style={{ background: LK.pageBg, border: `1px solid ${LK.cardBorder}` }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: LK.blueBg }}>📡</div>
        <div>
          <p style={{ color: LK.text, fontWeight: '600', fontSize: '13px' }}>{cls.title}</p>
          <p style={{ color: LK.textSub, fontSize: '11px', marginTop: '2px' }}>{cls.course?.title}</p>
          <p style={{ color: LK.textDim, fontSize: '11px', marginTop: '1px' }}>
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
            className="text-xs font-semibold underline underline-offset-2" style={{ color: LK.gold }}>
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
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}`, boxShadow: LK.cardShadow }}>

      {/* Accent top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      {/* Child Header */}
      <div className="p-5" style={{ borderBottom: `1px solid ${LK.cardBorder}` }}>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
          >
            {initials}
          </div>
          <div>
            <h3 style={{ color: LK.text, fontWeight: '700', fontSize: '16px' }}>{child.name}</h3>
            <p style={{ color: LK.textSub, fontSize: '12px', marginTop: '2px' }}>{child.phone}</p>
          </div>
          <div className="mr-auto flex gap-3 items-center">
            <div className="text-center rounded-xl px-4 py-2.5"
              style={{ background: LK.goldBg, border: `1px solid ${LK.goldBorder}` }}>
              <p style={{ color: LK.gold, fontWeight: '800', fontSize: '18px' }}>{child.courses.length}</p>
              <p style={{ color: LK.textSub, fontSize: '11px' }}>دورة</p>
            </div>
            <div className="text-center rounded-xl px-4 py-2.5"
              style={{ background: LK.blueBg, border: '1px solid rgba(59,130,246,0.2)' }}>
              <p style={{ color: LK.blue, fontWeight: '800', fontSize: '18px' }}>{child.live_classes.length}</p>
              <p style={{ color: LK.textSub, fontSize: '11px' }}>حصة</p>
            </div>
            <Link to={`/parent/children/${child.id}/report`}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              style={{ background: LK.goldGrad, color: '#fff', boxShadow: '0 4px 12px rgba(201,149,42,0.3)' }}>
              📊 التقرير
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4" style={{ borderBottom: `1px solid ${LK.cardBorder}` }}>
        <div className="flex gap-1 rounded-xl p-1 w-fit"
          style={{ background: '#F3F4F6' }}>
          {[
            { key: 'courses' as const, label: `الدورات (${child.courses.length})` },
            { key: 'classes' as const, label: `الحصص المباشرة (${child.live_classes.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={tab === t.key
                ? { background: LK.cardBg, color: LK.gold, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: LK.textSub, background: 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === 'courses' && (
          child.courses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {child.courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: LK.goldBg }}>🎓</div>
              <p style={{ color: LK.textSub, fontSize: '13px' }}>لا توجد دورات متاحة حالياً</p>
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
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: LK.blueBg }}>📡</div>
              <p style={{ color: LK.textSub, fontSize: '13px' }}>لا توجد حصص مجدولة حالياً</p>
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
      <div className="min-h-screen p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Header */}
        <div
          className="rounded-2xl px-6 py-4 mb-6 flex items-center gap-3"
          style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}`, boxShadow: LK.cardShadow }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: LK.goldBg }}
          >
            <svg className="w-5 h-5" fill="none" stroke={LK.gold} viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 style={{ color: LK.text, fontWeight: '700', fontSize: '18px' }}>أبنائي</h2>
            <p style={{ color: LK.textSub, fontSize: '12px' }}>دوراتهم وحصصهم المباشرة في مكان واحد</p>
          </div>
          <div className="mr-auto">
            <span
              className="px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: LK.goldGrad, color: '#fff', boxShadow: '0 4px 12px rgba(201,149,42,0.3)' }}
            >
              {childrenDetail.length} أبناء
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: LK.gold }} />
          </div>
        )}

        {error && (
          <div className="text-sm mb-6 px-5 py-4 rounded-2xl"
            style={{ color: LK.red, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          childrenDetail.length > 0 ? (
            <div className="space-y-5">
              {childrenDetail.map((child, idx) => (
                <ChildSection key={child.id} child={child} index={idx} />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
              style={{ background: LK.cardBg, border: `1px solid ${LK.cardBorder}` }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: LK.goldBg }}>
                👨‍👧‍👦
              </div>
              <h3 style={{ color: LK.text, fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
                لا يوجد أبناء مرتبطون
              </h3>
              <p style={{ color: LK.textSub, fontSize: '13px', maxWidth: '320px' }}>
                تواصل مع مدير المنصة لربط حسابات أبنائك بحسابك
              </p>
            </div>
          )
        )}
      </div>
    </ParentLayout>
  );
}
