import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherCourses } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:       '#C9952A',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  greenBorder:'rgba(16,185,129,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
};

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((s) => s.teacher);

  useEffect(() => { dispatch(fetchTeacherCourses()); }, [dispatch]);

  return (
    <TeacherLayout>
      <div className="p-6 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: TH.pageBg }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <h2 className="text-xl font-bold" style={{ color: TH.text }}>دوراتي</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: TH.textSub }}>الدورات المسندة إليك</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        )}
        {error && (
          <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ color: TH.red, background: TH.redBg }}>
            {error}
          </p>
        )}

        {!loading && courses.length === 0 && (
          <p className="text-center py-12" style={{ color: TH.textDim }}>لا توجد دورات مسندة إليك حالياً</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl overflow-hidden" style={TH.card}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-5xl"
                  style={{ background: TH.goldBg }}>🎬</div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold" style={{ color: TH.text }}>{course.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={course.is_active
                      ? { background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }
                      : { background: '#F3F4F6', color: TH.textDim, border: '1px solid #E5E7EB' }}>
                    {course.is_active ? 'نشطة' : 'معطّلة'}
                  </span>
                </div>
                {course.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: TH.textSub }}>{course.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F9FAFB', color: TH.textSub, border: '1px solid #EDE3CE' }}>
                    {course.category?.grade?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F9FAFB', color: TH.textSub, border: '1px solid #EDE3CE' }}>
                    {course.category?.name}
                  </span>
                </div>
                <p className="text-base font-bold mt-2" style={{ color: course.is_free ? TH.green : TH.gold }}>
                  {course.is_free ? 'مجاني' : `${course.price}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}
